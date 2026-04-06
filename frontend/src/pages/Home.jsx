import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import { API_BASE } from "../utils/api"

export default function Home() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))
  const isGuest = !token

  useEffect(() => {
    if (!isGuest && token) {
      fetch(`${API_BASE}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(resData => setData(resData))
        .catch(err => console.log(err))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const features = [
    {
      icon: "💻",
      title: "AI Code Assistant",
      desc: "Paste any code and get instant analysis, bug fixes, and refactored output.",
      link: "/code-helper",
      label: "Try Code Helper"
    },
    {
      icon: "🧠",
      title: "Quiz Generator",
      desc: "Turn your notes into smart multiple-choice quizzes in seconds.",
      link: "/analysis",
      label: "Generate Quiz"
    },
    {
      icon: "📚",
      title: "Cheat Sheet Generator",
      desc: "Upload syllabus, PYQs or notes and get a structured cheat sheet instantly.",
      link: "/cheatsheet",
      label: "Make Cheat Sheet"
    }
  ]

  return (
    <Layout>
      <div className="space-y-8">

        {/* ─── HERO ─── */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-transparent border border-white/10 p-6 md:p-8">
          <p className="text-indigo-300 text-sm font-medium mb-1 tracking-wide uppercase">
            {isGuest ? "Guest Mode" : "Dashboard"}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {isGuest
              ? "Welcome to StudyStack "
              : `Welcome back, ${user?.name?.split(" ")[0] || "User"} `}
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl">
            {isGuest
              ? "Explore all AI-powered features below. Create a free account to save your progress and unlock your full potential."
              : "You're all set. Use the tools below to study smarter, not harder."}
          </p>

          {isGuest && (
            <div className="flex gap-3 mt-5">
              <Link
                to="/register"
                className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg font-medium transition"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="px-5 py-2 border border-white/20 hover:bg-white/10 text-white text-sm rounded-lg font-medium transition"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {/* ─── STATS (logged in only) ─── */}
        {!isGuest && (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Notes Uploaded", value: data?.notes || 0, icon: "📄" },
              { label: "Quizzes Taken", value: data?.quizzes || 0, icon: "🧠" },
              { label: "Study Time", value: data?.studyTime || "0h", icon: "⏱️" },
              { label: "Accuracy", value: data?.accuracy || "0%", icon: "🎯" }
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/10 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-sm"
              >
                <p className="text-xl mb-1">{stat.icon}</p>
                <p className="text-gray-400 text-xs">{stat.label}</p>
                <p className="text-white text-2xl font-bold mt-1">{loading ? "—" : stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ─── FEATURE CARDS ─── */}
        <div>
          <h2 className="text-white font-semibold text-lg mb-4">
            {isGuest ? "✨ What You Can Do" : "⚡ Quick Actions"}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white/10 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between gap-4 hover:border-indigo-400/50 transition"
              >
                <div>
                  <p className="text-3xl mb-3">{f.icon}</p>
                  <h3 className="text-white font-semibold text-base mb-1">{f.title}</h3>
                  <p className="text-gray-400 text-sm">{f.desc}</p>
                </div>
                <Link
                  to={f.link}
                  className="inline-block text-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg font-medium transition"
                >
                  {f.label} →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ─── ACTIVITY + INSIGHTS (logged in only) ─── */}
        {!isGuest && !loading && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <h2 className="text-white font-semibold mb-4">📋 Recent Activity</h2>
              <ul className="space-y-2 text-sm text-gray-400">
                {data?.activity?.length > 0
                  ? data.activity.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">•</span> {item}
                      </li>
                    ))
                  : <li className="text-gray-500 italic">No recent activity yet. Start using the tools above!</li>}
              </ul>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <h2 className="text-white font-semibold mb-4">💡 Insights</h2>
              <ul className="space-y-2 text-sm text-gray-400">
                {data?.insights?.length > 0
                  ? data.insights.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">•</span> {item}
                      </li>
                    ))
                  : <li className="text-gray-500 italic">Keep using StudyStack to unlock personalized insights.</li>}
              </ul>
            </div>
          </div>
        )}

        {/* ─── GUEST WARNING ─── */}
        {isGuest && (
          <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-400/30 rounded-2xl p-4 text-sm text-yellow-300">
            <span className="text-lg">⚠️</span>
            <p>You're in guest mode. Your work won't be saved. <Link to="/register" className="underline font-medium hover:text-yellow-200">Create a free account</Link> to save everything.</p>
          </div>
        )}

      </div>
    </Layout>
  )
}