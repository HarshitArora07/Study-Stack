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

// 2️⃣ Google OAuth callback — session: true so req.user is populated
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: true, // ✅ FIXED: was false — req.user was undefined in callback
  }),
  (req, res) => {
    // Guard: if user not attached somehow, send to login
    if (!req.user) {
      console.error("❌ req.user is undefined after Google auth")
      return res.redirect(`${process.env.FRONTEND_URL}/login`)
    }

    console.log("✅ Auth Successful. User:", req.user.email)

    // Generate JWT
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    const redirectURL = `${process.env.FRONTEND_URL}/auth/google/success?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}`

    console.log("🔀 Redirecting to:", redirectURL)

    res.redirect(redirectURL)
  }
)

module.exports = router