const express = require("express")
const router = express.Router()
const passport = require("passport")

const { register, login } = require("../controllers/authController")

// ================= NORMAL AUTH =================
router.post("/register", register)
router.post("/login", login)

// ================= GOOGLE AUTH =================
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
)

router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: true
  }),
  (req, res) => {
    // ✅ Generate JWT after Google login
    const jwt = require("jsonwebtoken")

    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    // ✅ Redirect to frontend with token
    res.redirect(
  `http://localhost:5173/auth/google/success?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}`
)
  }
)

module.exports = router