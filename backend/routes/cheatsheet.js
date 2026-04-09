 const express = require("express");
 const router = express.Router();
  const multer = require("multer");
  const fs = require("fs");
  const mammoth = require("mammoth");
  const Tesseract = require("tesseract.js");
  const axios = require("axios");

  function maybeAuth(req) {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) return null
    try {
      const jwt = require("jsonwebtoken")
      return jwt.verify(token, process.env.JWT_SECRET).id
    } catch {
      return null
    }
  }

  // =========================
  // MULTER SETUP
  // =========================
  const upload = multer({ dest: "uploads/" });

  // =========================
  // PDF PARSER (Node 20 SAFE)
  // =========================
  let pdfParse;
  try {
    pdfParse = require("pdf-parse");
  } catch (err) {
    console.error("Failed to require pdf-parse:", err);
  }

  async function parsePDF(filePath) {
    if (!pdfParse) return "";
    try {
      const buffer = fs.readFileSync(filePath);
      const parserFn = pdfParse.default || pdfParse;
      const data = await parserFn(buffer);
      return data.text || "";
    } catch (err) {
      console.error("PDF PARSE ERROR:", err);
      return "";
    }
  }

  // =========================
  // IMAGE OCR
  // =========================
  async function parseImage(filePath) {
    try {
      const { data: { text } } = await Tesseract.recognize(filePath, "eng", {
        logger: (m) => console.log("OCR:", m.status),
      });
      return text || "";
    } catch (err) {
      console.error("OCR ERROR:", err);
      return "";
    }
  }

  // =========================
  // DOCX PARSER
  // =========================
  async function parseDocx(filePath) {
    try {
      const data = await mammoth.extractRawText({ path: filePath });
      return data.value || "";
    } catch (err) {
      console.error("DOCX ERROR:", err);
      return "";
    }
  }

  // =========================
  // TXT PARSER
  // =========================
  function parseTxt(filePath) {
    try {
      return fs.readFileSync(filePath, "utf-8");
    } catch (err) {
      console.error("TXT ERROR:", err);
      return "";
    }
  }

  // =========================
  // Helper: Split cheat sheet into numbered sections
  // =========================
  function formatCheatSheet(text) {
    const lines = text.split("\n").filter((l) => l.trim() !== "");

    const sectionSize = 10;
    let sections = [];
    for (let i = 0; i < lines.length; i += sectionSize) {
      const sectionLines = lines.slice(i, i + sectionSize);
      sections.push(sectionLines);
    }

    let formatted = "";
    sections.forEach((sec, idx) => {
      formatted += `${idx + 1}. ${sec[0]}\n`;
      for (let j = 1; j < sec.length; j++) {
        formatted += `   - ${sec[j]}\n`;
      }
      formatted += "\n";
    });

    return formatted.trim();
  }

  // =========================
  // MAIN ROUTE
  // =========================
  router.post("/generate", upload.single("file"), async (req, res) => {
    let filePath = null;

    try {
      let content = "";

      // 1) Read file content if uploaded
      if (req.file) {
        filePath = req.file.path;
        const type = req.file.mimetype;
        console.log("Uploaded file type:", type);

        if (type === "application/pdf") content = await parsePDF(filePath);
        else if (
          type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) content = await parseDocx(filePath);
        else if (type.startsWith("image/")) content = await parseImage(filePath);
        else content = parseTxt(filePath);
      }

      // 2) Append pasted text
      if (req.body.text) content += "\n" + req.body.text;

      if (!content || !content.trim())
        return res.status(400).json({ error: "No content found" });

      // 3) Backend prompt for Qwen2.5-72B-Instruct
      const prompt = `
  You are an expert exam preparation assistant.

  Analyze the content provided.

  STEP 1: Identify content type:
  - syllabus
  - previous year questions (PYQs)
  - notes

  STEP 2: Extract:

  If syllabus:
  - Most important topics (concise array)

  If PYQs:
  - Most repeated topics (concise array)

  If notes:
  - Generate a professional, structured cheat sheet
  - Use bullets, sub-bullets, headers if needed
  - Include memory tricks, mnemonics, and exam tips
  - Split long content into numbered sections automatically
  - Keep it short, focused, and easy to read

  STRICT JSON OUTPUT:

  {
    "type": "syllabus | pyqs | notes",
    "importantTopics": ["..."],
    "repeatedTopics": ["..."],
    "cheatSheet": "... (structured bullets, tips, mnemonics, numbered sections)"
  }

  Rules:
  - Always return arrays
  - No explanation outside JSON

  Content:
  ${content}
  `;

      // 4) Call Hugging Face Router API
      const response = await axios.post(
        "https://router.huggingface.co/v1/chat/completions",
        {
          model: "Qwen/Qwen2.5-72B-Instruct",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const textResponse = response?.data?.choices?.[0]?.message?.content || "";

      // 5) Parse JSON safely
      let parsed;
      try {
        const cleaned = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleaned);
        parsed.importantTopics = Array.isArray(parsed.importantTopics)
          ? parsed.importantTopics
          : [];
        parsed.repeatedTopics = Array.isArray(parsed.repeatedTopics)
          ? parsed.repeatedTopics
          : [];

        // 6) Format cheat sheet with numbered sections
        parsed.cheatSheet = formatCheatSheet(parsed.cheatSheet || "");
      } catch (err) {
        console.warn("JSON PARSE FAILED, FALLBACK USED");
        parsed = {
          type: "unknown",
          importantTopics: [],
          repeatedTopics: [],
          cheatSheet: formatCheatSheet(textResponse),
        };
      }

      // Save to history if logged in
      const userId = maybeAuth(req);
      if (userId) {
        const History = require("../models/History");
        // Combine and deduplicate topics
        const extractedTopics = [...new Set([
          ...(parsed.importantTopics || []),
          ...(parsed.repeatedTopics || [])
        ])];
        await History.create({
          userId,
          type: "cheatsheet",
          cheatSheet: parsed.cheatSheet || "",
          importantTopics: parsed.importantTopics || [],
          repeatedTopics: parsed.repeatedTopics || [],
          contentType: parsed.type || "unknown",
          extractedTopics,
        });
      }

      res.json(parsed);
    } catch (err) {
      console.error("CHEATSHEET ERROR:", err?.response?.data || err.message);
      res.status(500).json({
        error: "Server error",
        details: err?.response?.data || err.message,
      });
    } finally {
      // 7) Cleanup uploaded file
      if (filePath && fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error("File cleanup error:", err);
        });
      }
    }
  });

  module.exports = router;