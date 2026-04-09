const express = require("express");
  const axios = require("axios");
  const router = express.Router();

  const HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";

  function maybeAuth(req) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;
    try {
      const jwt = require("jsonwebtoken");
      return jwt.verify(token, process.env.JWT_SECRET).id;
    } catch {
      return null;
    }
  }

  // POST /api/code/analyze
  router.post("/analyze", async (req, res) => {
    try {
      const { code } = req.body;

      // Validation
      if (!code || code.trim() === "") {
        return res.status(400).json({
          msg: "Please provide code to analyze."
        });
      }

      // AI Payload (STRICT JSON OUTPUT)
      const payload = {
        model: "deepseek-ai/DeepSeek-V3",
        messages: [
          {
            role: "system",
            content: `
  You are an expert senior software engineer.

  You MUST return ONLY valid JSON in this format:

  {
    "issues": [],
    "improvements": [],
    "refactoredCode": "",
    "explanation": ""
  }

  STRICT RULES:
  - Output MUST be strictly valid JSON
  - No markdown, no backticks, no extra text

  LOGIC RULES:

  1. IF code has issues or improvements:
     - "issues": list real problems
     - "improvements": list meaningful improvements
     - "refactoredCode":
       → MUST contain corrected and improved version of the code
       → Fix all issues
       → Apply improvements
       → Return complete working code
     - "explanation":
       → Explain WHY changes are needed
       → Use bullet points (-)
       → Keep it simple
       → DO NOT explain full code

  2. IF code is clean and optimal:
     - "issues": []
     - "improvements": []
     - "refactoredCode": same as input
     - "explanation":
       → Explain code line-by-line
       → Each bullet MUST follow:
         "code line → explanation"
       → Beginner-friendly

  IMPORTANT:
  - NEVER skip refactoredCode
  - ALWAYS return refactoredCode in both cases
  - DO NOT invent issues
  - DO NOT skip explanation
  - ALWAYS use bullet format (-)

  Return ONLY JSON.
  `
          },
          {
            role: "user",
            content: code
          }
        ],
        temperature: 0.1,
        max_tokens: 1500
      };

      console.log("[INFO] Sending request to HF Router...");

      const response = await axios.post(HF_ROUTER_URL, payload, {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 60000
      });

      const raw = response.data?.choices?.[0]?.message?.content;

      if (!raw) {
        throw new Error("Empty response from AI");
      }

      // CLEAN + PARSE JSON SAFELY
      let parsed;

      try {
        const cleaned = raw.trim().replace(/```json|```/g, "");
        parsed = JSON.parse(cleaned);
      } catch (err) {
        console.error("[PARSE ERROR RAW]:", raw);

        // Fallback response instead of breaking UI
        return res.json({
          issues: [],
          improvements: [],
          refactoredCode: "",
          explanation: "AI response formatting failed. Please try again."
        });
      }

      // Ensure all fields exist (fallback safety)
      const safeResponse = {
        issues: parsed.issues || [],
        improvements: parsed.improvements || [],
        refactoredCode: parsed.refactoredCode || "",
        explanation: Array.isArray(parsed.explanation)
          ? parsed.explanation.join("\n")
          : typeof parsed.explanation === "string"
          ? parsed.explanation
          : ""
      };

      // Detect programming language
      const detectLanguage = (codeSnippet) => {
        const patterns = {
          javascript: /function|const|let|var|=>|document\.|window\.|\.js/,
          python: /def |import |from |print\(|:(\s*#|$)|#/,
          java: /public class|private|public|static void|System\.out\.|import java\./,
          cpp: /#include|using namespace|int main\(|std::|cout|cin/,
          csharp: /using System|namespace|public class|Console\.WriteLine/,
          typescript: /interface|type |: string|: number|axios|React/,
          go: /package main|func |import \("|fmt\.Print/,
          rust: /fn |println!|let mut|use std/,
          php: /<\?php|\$[a-zA-Z_]+|echo |function /,
          ruby: /def |class |module |end$|\.rb/,
          swift: /import Swift|var |let |func |print\(/,
          kotlin: /fun |val |var |import kotlin/,
        };

        for (const [lang, pattern] of Object.entries(patterns)) {
          if (pattern.test(codeSnippet)) {
            return lang;
          }
        }
        return "unknown";
      };

      const detectedLanguage = detectLanguage(code);

      // Save to history if logged in
      const userId = maybeAuth(req);
      if (userId) {
        const History = require("../models/History");
        await History.create({
          userId,
          type: "code",
          code: code,
          issues: safeResponse.issues,
          improvements: safeResponse.improvements,
          refactoredCode: safeResponse.refactoredCode,
          explanation: safeResponse.explanation,
          detectedLanguage,
        });
      }

      res.json(safeResponse);

    } catch (err) {
      const errorMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        err.message;

      console.error("[CODE ANALYSIS ERROR]:", errorMsg);

      // Specific handling
      if (err.response?.status === 503) {
        return res.status(503).json({
          msg: "AI model is busy. Try again in a few seconds."
        });
      }

      if (err.code === "ECONNABORTED") {
        return res.status(504).json({
          msg: "Request timed out. Please try again."
        });
      }

      res.status(500).json({
        msg: errorMsg || "Internal Server Error"
      });
    }
  });

  module.exports = router;