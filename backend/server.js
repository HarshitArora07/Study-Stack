 require("dotenv").config();

  const express = require("express");
  const mongoose = require("mongoose");
  const cors = require("cors");
  const session = require("express-session");
  const passport = require("passport");

  const quizRoutes = require("./routes/quiz");
  const cheatSheetRoutes = require("./routes/cheatsheet");
  const codeRoutes = require("./routes/code");
  const dashboardRoutes = require("./routes/dashboard");


  require("./config/passport");

  const app = express();

  const allowedOrigins = [
    "http://localhost:5173",
    "https://study-stack-one.vercel.app"
  ];

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  }));

  app.use(express.json());

  app.use(session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // ✅ Auth Routes
  app.use("/api/auth", require("./routes/auth"));

  // ✅ Code Helper Route
  app.use("/api/code", codeRoutes);

  // ✅ Quiz Routes
  app.use("/api/quiz", quizRoutes);

  // ✅ Cheat Sheet Routes
  app.use("/api/cheatsheet", cheatSheetRoutes);

  // ✅ History Routes
  app.use("/api/history", require("./routes/history"));

  // ✅ Dashboard Routes
  app.use("/api/dashboard", dashboardRoutes);

  // ✅ Test route
  app.get("/", (req, res) => {
    res.send("Backend is running successfully 🚀");
  });

  // ✅ MongoDB Connection
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected ✅"))
    .catch(err => console.error("MongoDB Connection Error:", err));

  // ✅ Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));