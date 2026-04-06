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

  // Quiz
  questions: [
    {
      question: String,
      options: [String],
      answer: String,
      explanation: String
    }
  ],
  score: Number,
  totalQuestions: Number,

  // Cheat Sheet
  cheatSheet: String,
  importantTopics: [String],
  repeatedTopics: [String],
  contentType: String,

}, { timestamps: true })

module.exports = mongoose.model("History", historySchema)