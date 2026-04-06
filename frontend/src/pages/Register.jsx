import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { API_BASE } from "../utils/api"

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

      <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl w-full max-w-sm border border-gray-200">

        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-1">
          Create Your Account
        </h2>

        <p className="text-center text-gray-600 text-sm mb-5">
          Start your learning journey today
        </p>

        {error && (
          <p className="text-red-500 text-center text-xs mb-3">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          <div>
            <label className="text-xs text-gray-600">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              onChange={handleChange}
              required
              className="w-full mt-1 p-2.5 rounded-lg border border-gray-300 text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              onChange={handleChange}
              required
              className="w-full mt-1 p-2.5 rounded-lg border border-gray-300 text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              required
              className="w-full mt-1 p-2.5 rounded-lg border border-gray-300 text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 text-white p-2.5 rounded-lg text-sm font-semibold 
            hover:bg-indigo-600 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Register"}
          </button>

          <div className="flex items-center my-2">
            <div className="grow border-t"></div>
            <span className="mx-2 text-xs text-gray-500">OR</span>
            <div className="grow border-t"></div>
          </div>

          <button
            type="button"
            onClick={() => (window.location.href = `${API_BASE}/api/auth/google`)}
            className="w-full flex items-center justify-center gap-2 border p-2.5 rounded-lg text-sm hover:bg-gray-100 transition"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-4 h-4"
              alt="Google"
            />
            Continue with Google
          </button>

        </form>

        <p className="text-center mt-4 text-xs text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Login
          </Link>
        </p>

        <p className="text-center mt-1.5 text-xs">
          <Link to="/" className="text-gray-500 hover:underline">
            ← Back to Home
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register