const express = require("express")
  const router = express.Router()
  const axios = require("axios")

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

  router.post("/generate", async (req, res) => {
    try {
      const { text } = req.body

      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Text is required" })
      }

      // First, extract topics from the text
      const topicsResponse = await axios.post(
        "https://router.huggingface.co/v1/chat/completions",
        {
          model: "Qwen/Qwen2.5-72B-Instruct",
          messages: [
            {
              role: "system",
              content: "You are a subject expert. Extract key topics from study material."
            },
            {
              role: "user",
              content: `
  Extract 3-5 key topics/subjects from this study material.
  Return ONLY valid JSON:

  {
    "topics": ["topic1", "topic2", "topic3"]
  }

  Material:
  ${text.substring(0, 1000)} // limit length
  `
            }
          ],
          temperature: 0.3
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      )

      let topics = []
      try {
        const topicsText = topicsResponse.data.choices[0].message.content.trim()
          .replace(/```json|```/g, "").trim();
        const topicsParsed = JSON.parse(topicsText);
        topics = Array.isArray(topicsParsed.topics) ? topicsParsed.topics : [];
      } catch (e) {
        console.warn("Failed to parse topics, continuing without them");
      }

      // Now generate quiz with topics embedded
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

  Return EXACTLY this format:

  [
    {
      "question": "string",
      "options": ["option1", "option2", "option3", "option4"],
      "answer": "must match one option exactly",
      "explanation": "short explanation",
      "topic": "topic name from the provided topics"
    }
  ]

  Generate 5 questions from this text:

  ${text}

  Topics to cover: ${topics.join(", ") || "general"}
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

      // CLEAN RESPONSE SAFELY
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
        // Ensure each question has a topic
        quiz = quiz.map((q, idx) => ({
          ...q,
          topic: q.topic || topics[idx % topics.length] || "General"
        }))
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