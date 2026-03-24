// server.js
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

const quizRoutes = require("./routes/quiz");
const cheatSheetRoutes = require("./routes/cheatsheet");
const codeRoutes = require("./routes/code");         // CodeHelper route


require("./config/passport"); // your existing passport config

const app = express();

// ✅ CORS (allow frontend)
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// ✅ JSON parser
app.use(express.json());

// ✅ Session (for Google OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// ✅ Auth Routes
app.use("/api/auth", require("./routes/auth"));

// ✅ CodeHelper Route using OpenRouter StarCoder2-3B
app.use("/api/code", codeRoutes);

// ✅ Quiz Routes
app.use("/api/quiz", quizRoutes);

// ✅ Cheat Sheet Routes
app.use("/api/cheatsheet", cheatSheetRoutes);


// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));