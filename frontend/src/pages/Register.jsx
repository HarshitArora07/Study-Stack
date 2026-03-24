import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { API_BASE } from "../utils/api" // ✅ import API_BASE

function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/register`, form)

      // ✅ store in localStorage
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("guest", "false")

      navigate("/home")
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 
      bg-gradient-to-r from-indigo-200 via-white to-purple-200">

      <div className="bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-200">

        <h2 className="text-3xl font-semibold text-center text-gray-900 mb-2">
          Create Account 🚀
        </h2>

        <p className="text-center text-gray-600 mb-8">
          Start your learning journey today
        </p>

        {error && (
          <p className="text-red-500 text-center text-sm mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              onChange={handleChange}
              required
              className="w-full mt-1 p-3 rounded-lg border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              onChange={handleChange}
              required
              className="w-full mt-1 p-3 rounded-lg border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              required
              className="w-full mt-1 p-3 rounded-lg border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 text-white p-3 rounded-lg font-semibold 
            hover:bg-indigo-600 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Register"}
          </button>

          <div className="flex items-center my-4">
            <div className="grow border-t"></div>
            <span className="mx-2 text-sm text-gray-500">OR</span>
            <div className="grow border-t"></div>
          </div>

          {/* Google Signup */}
          <button
            type="button"
            onClick={() => (window.location.href = `${API_BASE}/api/auth/google`)}
            className="w-full flex items-center justify-center gap-2 border p-3 rounded-lg hover:bg-gray-100 transition"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5 h-5"
              alt="Google"
            />
            Continue with Google
          </button>

        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Login
          </Link>
        </p>

        <p className="text-center mt-2 text-sm">
          <Link to="/" className="text-gray-500 hover:underline">
            ← Back to Home
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register