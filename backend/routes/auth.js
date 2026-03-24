// backend/routes/auth.js
const express = require("express")
const router = express.Router()
const passport = require("passport")
const jwt = require("jsonwebtoken")
const { register, login } = require("../controllers/authController")

// ================= NORMAL AUTH =================
router.post("/register", register)
router.post("/login", login)

// ================= GOOGLE AUTH =================
// 1️⃣ Start Google OAuth login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
)

// 2️⃣ Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login`, // redirect to frontend login if failed
    session: false, // we use JWT, no need for session
  }),
  (req, res) => {
    // Generate JWT for the authenticated user
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    // Redirect to frontend with token and user info
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/google/success?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}`
    )
  }
)

module.exports = router