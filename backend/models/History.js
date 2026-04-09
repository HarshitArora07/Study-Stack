const mongoose = require("mongoose")

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["code", "quiz", "cheatsheet"],
    required: true
  },

  // Code Helper
  code: String,
  issues: [String],
  improvements: [String],
  refactoredCode: String,
  explanation: String,
  detectedLanguage: String, // e.g., "javascript", "python"

  // Quiz
  questions: [
    {
      question: String,
      options: [String],
      answer: String,
      explanation: String,
      topic: String // extracted topic from question
    }
  ],
  score: Number,
  totalQuestions: Number,
  quizTopics: [String], // aggregated topics from all questions

  // Cheat Sheet
  cheatSheet: String,
  importantTopics: [String],
  repeatedTopics: [String],
  contentType: String,
  extractedTopics: [String], // normalized/cleaned topics

  // General
  metadata: {
    language: String,
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"] },
    source: String // e.g., "uploaded file", "pasted text"
  }

}, { timestamps: true })

module.exports = mongoose.model("History", historySchema)