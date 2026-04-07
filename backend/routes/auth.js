// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { register, login } = require("../controllers/authController");

// ================= NORMAL AUTH =================
router.post("/register", register);
router.post("/login", login);

// ================= GOOGLE AUTH =================

// 1️⃣ Start Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
);

// 2️⃣ Google Callback
router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    try {
      if (err || !user) {
        console.error("❌ Auth Failed:", err || "No user found");
        // Redirect to frontend login with an error flag
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
      }

      // 🔑 Generate JWT
      const token = jwt.sign(
        { id: user._id }, 
        process.env.JWT_SECRET, 
        { expiresIn: "7d" }
      );

      // 🌐 Secure Redirection
      // Note: Passing the token in the fragment (#) is slightly safer than (?) 
      // because fragments aren't usually sent to the server in HTTP requests.
      const redirectURL = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
      redirectURL.searchParams.append("token", token);
      redirectURL.searchParams.append("name", user.name);
      
      console.log("✅ Auth Successful. Redirecting...");
      return res.redirect(redirectURL.toString());
      
    } catch (error) {
      console.error("❌ Catch Block Error:", error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  })(req, res, next);
});

module.exports = router;