const express = require("express");
const axios = require("axios");
const router = express.Router();

const HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";

// POST /api/code/analyze
router.post("/analyze", async (req, res) => {
  try {
    const { code } = req.body;

    // ✅ Validation
    if (!code || code.trim() === "") {
      return res.status(400).json({
        msg: "Please provide code to analyze."
      });
    }

    // ✅ AI Payload (STRICT JSON OUTPUT)
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

    // ✅ CLEAN + PARSE JSON SAFELY
    let parsed;

try {
  const cleaned = raw.trim().replace(/```json|```/g, "");
  parsed = JSON.parse(cleaned);
} catch (err) {
  console.error("[PARSE ERROR RAW]:", raw);

  // ✅ Fallback response instead of breaking UI
  return res.json({
    issues: [],
    improvements: [],
    refactoredCode: "",
    explanation: "AI response formatting failed. Please try again."
  });
}

    // ✅ Ensure all fields exist (fallback safety)
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

    res.json(safeResponse);

  } catch (err) {
    const errorMsg =
      err.response?.data?.error?.message ||
      err.response?.data?.error ||
      err.message;

    console.error("[CODE ANALYSIS ERROR]:", errorMsg);

    // ✅ Specific handling
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