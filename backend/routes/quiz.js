const express = require("express")
const router = express.Router()
const axios = require("axios")

router.post("/generate", async (req, res) => {
  try {
    const { text } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text is required" })
    }

    const response = await axios.post(
      "https://router.huggingface.co/v1/chat/completions",
      {
        model: "Qwen/Qwen2.5-72B-Instruct",
        messages: [
          {
            role: "system",
            content: "You are a quiz generator that ONLY returns valid JSON."
          },
          {
            role: "user",
            content: `
You MUST return ONLY valid JSON.

Do NOT return text.
Do NOT explain outside JSON.

Return EXACTLY this format:

[
  {
    "question": "string",
    "options": ["option1", "option2", "option3", "option4"],
    "answer": "must match one option exactly",
    "explanation": "short explanation of the correct answer"
  }
]

Generate 5 multiple choice questions from this text:

${text}
`
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    )

    let output = response.data.choices[0].message.content.trim()

    // 🔥 CLEAN RESPONSE SAFELY
    if (output.startsWith("```")) {
      output = output.replace(/```json|```/g, "").trim()
    }

    // Extract only JSON array
    const firstBracket = output.indexOf("[")
    const lastBracket = output.lastIndexOf("]")

    if (firstBracket !== -1 && lastBracket !== -1) {
      output = output.slice(firstBracket, lastBracket + 1)
    }

    let quiz
    try {
      quiz = JSON.parse(output)
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", output)
      return res.status(500).json({ error: "Invalid AI response format" })
    }

    res.json(quiz)

  } catch (err) {
    console.error("❌ Quiz API Error:", err.response?.data || err.message)
    res.status(500).json({ error: "Failed to generate quiz" })
  }
})

module.exports = router