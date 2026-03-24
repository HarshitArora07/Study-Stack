const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// 🔐 JWT generator
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  })
}

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    })

    // ✅ AUTO LOGIN RESPONSE
    res.status(201).json({
      token: generateToken(user._id),
      user: {
        name: user.name,
        email: user.email
      }
    })

  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    res.json({
      token: generateToken(user._id),
      user: {
        name: user.name,
        email: user.email
      }
    })

  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}