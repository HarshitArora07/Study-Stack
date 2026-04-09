import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { API_BASE } from "../utils/api"
import {
  Code2,
  BrainCircuit,
  BookOpen,
  Activity,
  Target,
  Clock,
  Trophy,
  TrendingUp,
  Calendar,
  Lightbulb,
  Zap,
  AlertCircle
} from "lucide-react"

export default function Home() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [isGuest, setIsGuest] = useState(true)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const guestFlag = localStorage.getItem("guest")
    const storedUser = localStorage.getItem("user")

    const isLoggedIn = !!storedToken
    const isGuestMode = guestFlag === "true"

    if (!isLoggedIn && !isGuestMode) {
      navigate("/", { replace: true })
      return
    }

    setToken(storedToken)
    setIsGuest(isGuestMode)

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("User parse error:", e)
      }
    }

    if (isLoggedIn && !isGuestMode) {
      fetch(`${API_BASE}/api/dashboard`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      })
        .then(res => res.json())
        .then(resData => setData(resData))
        .catch(err => {
          console.error("Dashboard fetch error:", err)
          setData(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [navigate])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const features = [
    {
      icon: Code2,
      title: "AI Code Assistant",
      desc: "Paste any code and get instant analysis, bug fixes, and refactored output.",
      link: "/code-helper",
      label: "Try Code Helper",
      color: "emerald"
    },
    {
      icon: BrainCircuit,
      title: "Quiz Generator",
      desc: "Turn your notes into smart multiple-choice quizzes in seconds.",
      link: "/analysis",
      label: "Generate Quiz",
      color: "violet"
    },
    {
      icon: BookOpen,
      title: "Cheat Sheet Generator",
      desc: "Upload syllabus, PYQs or notes and get a structured cheat sheet instantly.",
      link: "/cheatsheet",
      label: "Make Cheat Sheet",
      color: "amber"
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      emerald: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        text: "text-emerald-400",
        hover: "hover:border-emerald-400/50",
        button: "bg-emerald-500 hover:bg-emerald-600"
      },
      violet: {
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
        text: "text-violet-400",
        hover: "hover:border-violet-400/50",
        button: "bg-violet-500 hover:bg-violet-600"
      },
      amber: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        text: "text-amber-400",
        hover: "hover:border-amber-400/50",
        button: "bg-amber-500 hover:bg-amber-600"
      },
      red: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        text: "text-red-400",
        hover: "hover:border-red-400/50",
        button: "bg-red-500 hover:bg-red-600"
      },
      gray: {
        bg: "bg-gray-500/10",
        border: "border-gray-500/20",
        text: "text-gray-400",
        hover: "hover:border-gray-400/50",
        button: "bg-gray-500 hover:bg-gray-600"
      },
      indigo: {
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20",
        text: "text-indigo-400",
        hover: "hover:border-indigo-400/50",
        button: "bg-indigo-500 hover:bg-indigo-600"
      }
    }
    return colors[color] || colors.indigo
  }

  return (
    <Layout>
      <div className="space-y-8 max-w-6xl mx-auto">

        {/* ─── HERO ─── */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent border border-white/10 p-6 md:p-8 backdrop-blur-sm">
          <p className="text-indigo-300 text-sm font-medium mb-1 tracking-wide uppercase">
            {isGuest ? "Guest Mode" : "Dashboard"}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {isGuest
              ? "Welcome to StudyStack"
              : `Welcome back, ${user?.name?.split(" ")[0] || "User"}`
            }
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
                className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg font-medium transition-all active:scale-95"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="px-6 py-2.5 border border-white/20 hover:bg-white/10 hover:border-white/20 text-white text-sm rounded-lg font-medium transition-all active:scale-95"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {/* ─── STATS ─── */}
        {!isGuest && !loading && data && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Activities",
                  value: data.overview?.totalActivities || 0,
                  icon: Activity,
                  color: "indigo"
                },
                {
                  label: "Code Analyses",
                  value: data.overview?.totalCode || 0,
                  icon: Code2,
                  color: "emerald"
                },
                {
                  label: "Quizzes Taken",
                  value: data.overview?.totalQuiz || 0,
                  icon: BrainCircuit,
                  color: "violet"
                },
                {
                  label: "Cheat Sheets",
                  value: data.overview?.totalCheatsheet || 0,
                  icon: BookOpen,
                  color: "amber"
                }
              ].map((stat, i) => {
                const Icon = stat.icon
                const colors = getColorClasses(stat.color)
                return (
                  <div
                    key={i}
                    className={`${colors.bg} ${colors.border} border rounded-2xl p-4 md:p-5 backdrop-blur-sm transition-all hover:scale-[1.02]`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-400 text-xs">{stat.label}</p>
                      <Icon className={`w-4 h-4 ${colors.text}`} strokeWidth={1.5} />
                    </div>
                    <p className="text-white text-2xl md:text-3xl font-bold">
                      {stat.value}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Quick Stats Row 2 */}
            {data.quiz && data.quiz.totalQuizzes > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Avg Quiz Score",
                    value: `${data.quiz.averageScore}%`,
                    icon: Target,
                    color: data.quiz.averageScore >= 80 ? "emerald" : data.quiz.averageScore >= 60 ? "amber" : "red"
                  },
                  {
                    label: "Best Score",
                    value: data.quiz.bestScore ? `${data.quiz.bestScore}%` : "N/A",
                    icon: Trophy,
                    color: "amber"
                  },
                  {
                    label: "Questions Answered",
                    value: data.quiz.totalQuestions || 0,
                    icon: Activity,
                    color: "violet"
                  },
                  {
                    label: "Study Streak",
                    value: `${data.streaks?.currentStreak || 0} days`,
                    icon: Calendar,
                    color: data.streaks?.currentStreak > 0 ? "emerald" : "gray"
                  }
                ].map((stat, i) => {
                  const Icon = stat.icon
                  const colors = getColorClasses(stat.color)
                  return (
                    <div
                      key={i}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-sm transition-all hover:border-white/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 text-xs">{stat.label}</p>
                        <Icon className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                      </div>
                      <p className="text-white text-2xl md:text-3xl font-bold">
                        {stat.value}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Code Stats */}
            {data.code && data.code.totalAnalyses > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Code2 className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
                  <h3 className="text-white font-semibold">Code Analysis Summary</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Total Analyses</p>
                    <p className="text-white text-xl font-semibold">{data.code.totalAnalyses}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Issues Found</p>
                    <p className="text-red-400 text-xl font-semibold">{data.code.totalIssues}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Improvements</p>
                    <p className="text-amber-400 text-xl font-semibold">{data.code.totalImprovements}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Perfect Code</p>
                    <p className="text-emerald-400 text-xl font-semibold">{data.code.perfectCount}</p>
                  </div>
                </div>
                {data.code.averageIssues > 0 && (
                  <p className="text-gray-400 text-sm mt-3">
                    Average issues per analysis: <span className="text-white font-medium">{data.code.averageIssues}</span>
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* ─── FEATURES ─── */}
        <div>
          <h2 className="text-white font-semibold text-lg mb-4">
            {isGuest ? "✨ What You Can Do" : "⚡ Quick Actions"}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon
              const colors = getColorClasses(f.color)
              return (
                <div
                  key={i}
                  className={`bg-white/5 border ${colors.border} rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between gap-4 hover:border-white/20 transition-all group`}
                >
                  <div>
                    <div className={`p-2 ${colors.bg} rounded-lg w-fit mb-3`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-white font-semibold text-base mb-1">{f.title}</h3>
                    <p className="text-gray-400 text-sm">{f.desc}</p>
                  </div>
                  <Link
                    to={f.link}
                    className={`block text-center px-4 py-2.5 ${colors.button} text-white text-sm rounded-lg font-medium transition-all active:scale-95`}
                  >
                    {f.label} <Zap className="w-3 h-3 inline ml-1" strokeWidth={1.5} />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── ACTIVITY + INSIGHTS ─── */}
        {!isGuest && !loading && data && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-sm">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />
                Recent Activity
              </h2>
              <ul className="space-y-3">
                {data.recentActivity?.length > 0
                  ? data.recentActivity.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full mt-1.5 shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-gray-200">{item.summary}</p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {new Date(item.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </li>
                    ))
                  : <li className="text-gray-500 italic">No recent activity yet. Start using the tools above!</li>}
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-sm">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
                Insights
              </h2>
              <ul className="space-y-3">
                {data.insights?.length > 0
                  ? data.insights.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                        <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span>{item}</span>
                      </li>
                    ))
                  : <li className="text-gray-500 italic">Keep using StudyStack to unlock personalized insights.</li>}
              </ul>
            </div>
          </div>
        )}

        {/* ─── QUICK STATS ─── */}
        {!isGuest && !loading && data && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-sm">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-400" strokeWidth={1.5} />
              Quick Stats
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Activities",
                  value: data.overview?.totalActivities || 0,
                  icon: Activity,
                  color: "indigo"
                },
                {
                  label: "Avg Score",
                  value: data.quiz?.averageScore ? `${data.quiz.averageScore}%` : "N/A",
                  icon: Target,
                  color: data.quiz?.averageScore >= 80 ? "emerald" : data.quiz?.averageScore >= 60 ? "amber" : "red"
                },
                {
                  label: "Code Issues",
                  value: data.code?.totalIssues || 0,
                  icon: AlertCircle,
                  color: "red"
                },
                {
                  label: "Study Days",
                  value: Object.keys(data.streaks?.activityByDay || {}).length,
                  icon: Calendar,
                  color: "amber"
                }
              ].map((stat, i) => {
                const Icon = stat.icon
                const colors = getColorClasses(stat.color)
                return (
                  <div
                    key={i}
                    className={`${colors.bg} ${colors.border} border rounded-2xl p-4 md:p-5 backdrop-blur-sm transition-all hover:scale-[1.02]`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-400 text-xs">{stat.label}</p>
                      <Icon className={`w-4 h-4 ${colors.text}`} strokeWidth={1.5} />
                    </div>
                    <p className="text-white text-2xl md:text-3xl font-bold">
                      {stat.value}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── GUEST WARNING ─── */}
        {isGuest && (
          <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-400/30 rounded-2xl p-4 text-sm text-yellow-300">
            <Zap className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={1.5} />
            <p>
              You're in guest mode. Your work won't be saved.{" "}
              <Link to="/register" className="underline font-medium hover:text-yellow-200">
                Create a free account
              </Link>{" "}
              to save everything and track your progress.
            </p>
          </div>
        )}

      </div>
    </Layout>
  )
}
