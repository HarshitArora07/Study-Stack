const express = require("express")
const router = express.Router()
const History = require("../models/History")
const jwt = require("jsonwebtoken")

// ─── Auth Middleware ───
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ message: "Unauthorized" })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch {
    res.status(401).json({ message: "Invalid token" })
  }
}

// GET /api/history — fetch all history for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const history = await History.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
    res.json(history)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// POST /api/history — save a history entry
router.post("/", protect, async (req, res) => {
  try {
    const entry = await History.create({
      userId: req.userId,
      ...req.body
    })
    res.status(201).json(entry)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// DELETE /api/history/:id — delete one entry
router.delete("/:id", protect, async (req, res) => {
  try {
    await History.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    })
    res.json({ message: "Deleted" })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router