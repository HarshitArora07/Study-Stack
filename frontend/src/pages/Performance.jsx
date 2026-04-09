import { useEffect, useState } from "react"
import Layout from "../components/Layout"
import { API_BASE } from "../utils/api"
import {
  TrendingUp,
  Trophy,
  Code2,
  BrainCircuit,
  BookOpen,
  Calendar,
  Target,
  Award,
  Flame,
  Activity,
  BarChart3,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Lock,
  Star,
  Zap
} from "lucide-react"

// ─── Helpers ────────────────────────────────────────────────────────────────

const getCompetencyColor = (v) => {
  if (v >= 80) return "text-emerald-400"
  if (v >= 60) return "text-amber-400"
  if (v >= 40) return "text-orange-400"
  return "text-red-400"
}

const getCompetencyBarColor = (v) => {
  if (v >= 80) return "bg-emerald-500"
  if (v >= 60) return "bg-amber-500"
  if (v >= 40) return "bg-orange-500"
  return "bg-red-500"
}

const getTopicMeta = (topic) => {
  if (topic.codeAnalyses > 0) return { Icon: Code2, color: "emerald" }
  if (topic.quizzes > 0)      return { Icon: BrainCircuit, color: "violet" }
  if (topic.cheatsheets > 0)  return { Icon: BookOpen, color: "amber" }
  return { Icon: Star, color: "indigo" }
}

/**
 * Build a 35-cell calendar grid (5 weeks × 7 days) correctly aligned
 * to the day-of-week so each date lands in the right column.
 *
 * @param {Array<{date: string, count: number, dayNum: number}>} calendarData
 *   Sorted oldest → newest, covering the last 35 days.
 * @returns {Array<{date:string, count:number, dayNum:number}|null>}
 *   Array of exactly 35 cells; null = empty leading/trailing padding.
 */
const normalizeDate = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const buildCalendarGrid = (calendarData) => {
  if (!calendarData || calendarData.length === 0) return []

  const map = {}

  calendarData.forEach((d) => {
    const key = normalizeDate(d.date)
    map[key] = (map[key] || 0) + d.count
  })

  const today = new Date()
  const days = []

  for (let i = 34; i >= 0; i--) {
    const d = new Date()
    d.setDate(today.getDate() - i)

    const key = normalizeDate(d)

    days.push({
      date: key,
      count: map[key] || 0
    })
  }

  const firstDow = new Date(days[0].date).getDay()
  const leading = Array(firstDow).fill(null)

  const cells = [...leading, ...days]

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function Performance() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)
  const [tooltip, setTooltip] = useState(null) // { text, x, y }
  const [weekIndex, setWeekIndex] = useState(0)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (!storedToken) {
      setLoading(false)
      return
    }
    setToken(storedToken)

    fetch(`${API_BASE}/api/dashboard`, {
      headers: { Authorization: `Bearer ${storedToken}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        return res.json()
      })
      .then((resData) => setData(resData))
      .catch((err) => {
        console.error("Performance fetch error:", err)
        setData(null)
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading performance data…</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!token) {
    return (
      <Layout>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center backdrop-blur-sm">
          <Lock className="w-16 h-16 text-gray-500 mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="text-white text-xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please log in to view your detailed performance analytics.</p>
          <div className="flex gap-3 justify-center">
            <a href="/login" className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg font-medium transition-all">
              Login
            </a>
            <a href="/register" className="px-6 py-2.5 border border-white/20 hover:bg-white/10 text-white text-sm rounded-lg font-medium transition-all">
              Sign Up
            </a>
          </div>
        </div>
      </Layout>
    )
  }

  const totalActivities = data?.overview?.totalActivities ?? 0

  if (totalActivities === 0) {
    return (
      <Layout>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center backdrop-blur-sm">
          <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="text-white text-xl font-bold mb-2">No Activity Yet</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Your performance dashboard will appear here once you start using StudyStack's features.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/code-helper"  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg font-medium transition-all">Try Code Helper</a>
            <a href="/analysis"    className="px-4 py-2 bg-violet-500  hover:bg-violet-600  text-white text-sm rounded-lg font-medium transition-all">Generate Quiz</a>
            <a href="/cheatsheet"  className="px-4 py-2 bg-amber-500   hover:bg-amber-600   text-white text-sm rounded-lg font-medium transition-all">Make Cheat Sheet</a>
          </div>
        </div>
      </Layout>
    )
  }

  // ── Derived values ──────────────────────────────────────────────────────────
  const quizCount      = data.quizScores?.length ?? 0
  const avgScore       = data.quiz?.averageScore  ?? 0
  const bestScore      = data.quiz?.bestScore     ?? 0
  const streak         = data.streaks?.currentStreak  ?? 0
  const longestStreak  = data.streaks?.longestStreak  ?? 0
  const topics         = data.topics         || []
  const calendarData   = data.calendarData   || []
  const studyDays      = Object.keys(data.streaks?.activityByDay ?? {}).length

  // FIX: was checking `data.totalCode` (wrong) — correct field is overview.totalCode
  const hasCodeData    = (data.overview?.totalCode ?? 0) > 0

  // Build the correctly-aligned calendar grid
  const calendarGrid   = buildCalendarGrid(calendarData)
  // Split into weeks (7 days each)
const weeks = []
for (let i = 0; i < calendarGrid.length; i += 7) {
  weeks.push(calendarGrid.slice(i, i + 7))
}

// Start from latest week
const currentWeek = weeks[weeks.length - 1 - weekIndex] || []
const maxCount = Math.max(...currentWeek.map(d => d?.count || 0), 1)
  const calendarWeeks  = calendarGrid.length / 7   // number of rows

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto">

        {/* ─── Header ─── */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <BarChart3 className="w-6 h-6 text-indigo-400" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
              Performance Analyzer
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-0.5">
              Track your learning progress and identify areas for improvement
            </p>
          </div>
        </div>

        {/* ─── Key Metrics ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Activities", value: totalActivities,                      icon: Activity,    color: "text-indigo-400"  },
            { label: "Code Analyses",    value: data.overview?.totalCode          ?? 0, icon: Code2,      color: "text-emerald-400" },
            { label: "Quizzes Taken",    value: data.overview?.totalQuiz          ?? 0, icon: BrainCircuit, color: "text-violet-400" },
            { label: "Cheat Sheets",     value: data.overview?.totalCheatsheet    ?? 0, icon: BookOpen,   color: "text-amber-400"   }
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-xs">{stat.label}</p>
                  <Icon className={`w-4 h-4 ${stat.color}`} strokeWidth={1.5} />
                </div>
                <p className="text-white text-2xl font-bold">{stat.value}</p>
              </div>
            )
          })}
        </div>

        {/* ─── Quiz Performance ─── */}
        {quizCount > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
              Quiz Performance
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-xs mb-1">Average Score</p>
                <p className={`text-2xl font-bold ${getCompetencyColor(avgScore)}`}>{avgScore}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Best Score</p>
                <p className="text-emerald-400 text-2xl font-bold">{bestScore}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Questions Answered</p>
                <p className="text-white text-2xl font-bold">{data.quiz?.totalQuestions ?? 0}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Correct Answers</p>
                <p className="text-white text-2xl font-bold">{data.quiz?.totalCorrect ?? 0}</p>
              </div>
            </div>

            {/* Score Progression Bars */}
            {data.quizScores?.length > 0 && (
              <div>
                <p className="text-gray-400 text-sm mb-3">Score Progression</p>
                {/* h-32 = container; each bar grows from the bottom */}
                <div className="flex items-end gap-1.5 h-32">
                  {data.quizScores.map((quiz, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1 group relative"
                      style={{ minWidth: "12px" }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        Q{i + 1}: {quiz.percentage}%
                      </div>
                      {/* The bar — min 4px so 0% still shows a sliver */}
                      <div
                        className={`w-full rounded-t-sm transition-all ${getCompetencyBarColor(quiz.percentage)}`}
                        style={{
                          height: `${Math.max(quiz.percentage, 3)}%`,
                          maxHeight: "100%"
                        }}
                      />
                      <span className="text-gray-500 text-[10px] leading-none">Q{i + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Earliest</span>
                  <span>Most Recent</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Topic Mastery ─── */}
        {topics.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />
                Topic Mastery &amp; Competency
              </h3>
              <span className="text-gray-400 text-sm">{topics.length} topic{topics.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="space-y-4">
              {topics.map((topic, i) => {
                const { Icon, color } = getTopicMeta(topic)
                const safeTotal = topic.totalActivities || 1 // avoid div-by-zero

                return (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      {/* Left: icon + name + breakdown badges */}
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${color}-500/10 rounded-lg`}>
                          <Icon className={`w-5 h-5 text-${color}-400`} strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{topic.name}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-1">
                            {topic.quizzes > 0 && (
                              <span className="flex items-center gap-1">
                                <BrainCircuit className="w-3 h-3" />
                                {topic.quizzes} quiz{topic.quizzes !== 1 ? "zes" : ""}
                              </span>
                            )}
                            {topic.cheatsheets > 0 && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {topic.cheatsheets} sheet{topic.cheatsheets !== 1 ? "s" : ""}
                              </span>
                            )}
                            {topic.codeAnalyses > 0 && (
                              <span className="flex items-center gap-1">
                                <Code2 className="w-3 h-3" />
                                {topic.codeAnalyses} analysis{topic.codeAnalyses !== 1 ? "es" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: competency score */}
                      <div className="text-right shrink-0 ml-2">
                        <p className={`text-2xl font-bold ${getCompetencyColor(topic.competency)}`}>
                          {topic.competency}%
                        </p>
                        <p className="text-gray-500 text-xs">competency</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-700 ${getCompetencyBarColor(topic.competency)}`}
                        style={{ width: `${topic.competency}%` }}
                      />
                    </div>

                    {/* Activity breakdown percentages */}
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{topic.totalActivities} total activities</span>
                      <div className="flex items-center gap-2">
                        {topic.quizzes > 0 && (
                          <span className="text-violet-400">
                            Quiz {Math.round((topic.quizzes / safeTotal) * 100)}%
                          </span>
                        )}
                        {topic.cheatsheets > 0 && (
                          <span className="text-amber-400">
                            Sheet {Math.round((topic.cheatsheets / safeTotal) * 100)}%
                          </span>
                        )}
                        {topic.codeAnalyses > 0 && (
                          <span className="text-emerald-400">
                            Code {Math.round((topic.codeAnalyses / safeTotal) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── Code Health ─── */}
        {/* FIX: was `data.totalCode > 0` which never matched; now uses the correct field */}
        {hasCodeData && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
              Code Health Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-400 text-xs mb-1">Total Analyses</p>
                <p className="text-white text-xl font-semibold">{data.code?.totalAnalyses ?? 0}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Issues Found</p>
                <p className="text-red-400 text-xl font-semibold">{data.code?.totalIssues ?? 0}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Improvements</p>
                <p className="text-amber-400 text-xl font-semibold">{data.code?.totalImprovements ?? 0}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Perfect Code</p>
                <p className="text-emerald-400 text-xl font-semibold">{data.code?.perfectCount ?? 0}</p>
              </div>
            </div>
            {(data.code?.averageIssues ?? 0) > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Average Issues per Analysis</span>
                  <span className="text-red-400 font-medium">{data.code.averageIssues}</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((data.code.averageIssues / 10) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Scale: 0–10 issues. {data.code.averageIssues >= 5 ? "Consider reviewing your code patterns." : "Looking good!"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── Activity Calendar ─── */}
        {/*
          FIX: The original grid was a plain 35-cell array with no day-of-week offset,
          causing every date to land in the wrong column. We now compute leading
          empty cells based on the weekday of the first date so the grid aligns correctly.
          Design: compact cells with hover tooltips instead of rendering day numbers
          inside tiny squares, saving significant vertical space.
        */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
  <h3 className="text-white font-semibold flex items-center gap-2">
    <Calendar className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />
    Activity Calendar
  </h3>

  <div className="flex gap-2">
    <button
  disabled={weekIndex === weeks.length - 1}
  onClick={() => setWeekIndex((prev) => Math.min(prev + 1, weeks.length - 1))}
  className={`px-3 py-1.5 text-xs rounded-md border transition-all
    ${weekIndex === weeks.length - 1 
      ? "opacity-30 cursor-not-allowed" 
      : "text-white bg-indigo-500/20 hover:bg-indigo-500/40 border-indigo-400/30"}
  `}
>
  Prev
</button>

    <button
  disabled={weekIndex === 0}
  onClick={() => setWeekIndex((prev) => Math.max(prev - 1, 0))}
  className={`px-3 py-1.5 text-xs rounded-md border transition-all
    ${weekIndex === 0 
      ? "text-indigo-400 cursor-not-allowed" 
      : "text-white bg-indigo-500/20 hover:bg-indigo-500/40 border-indigo-400/30"}
  `}
>
  Next
</button>
  </div>
</div>

          {calendarGrid.length > 0 ? (
            <div className="overflow-x-auto">
              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 gap-1 mb-1" style={{ minWidth: 196 }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-gray-500 text-[10px] font-medium">{d}</div>
                ))}
              </div>

              {/* Calendar cells — compact rows */}
              <div
                className="grid grid-cols-7 gap-4 items-end h-32"
                style={{ minWidth: 196 }}
              >
                {currentWeek.map((day, i) => {
  if (!day) return <div key={i} />

  const height = (day.count / maxCount) * 80

  const isToday =
    day.date === new Date().toISOString().slice(0, 10)

  return (
    <div
      key={day.date}
      className="flex flex-col items-center justify-end group relative"
    >
      {/* BAR */}
      <div
        className={`
  w-6 rounded-t-md transition-all duration-500
  ${isToday ? "ring-2 ring-indigo-400" : ""}
`}
        style={{
          height: `${Math.max(height, 6)}px`,
          backgroundColor:
  day.count === 0
    ? "rgba(255,255,255,0.08)"
    : `rgba(99,102,241,${0.4 + (day.count / maxCount) * 0.6})`
        }}
      />

      {/* DAY NAME */}
      <span className="text-xs text-gray-300 mt-2 font-medium">
        {["S","M","T","W","T","F","S"][i]}
      </span>

      {/* TOOLTIP */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
bg-black/90 text-white text-[11px] px-2 py-1.5 rounded-md 
opacity-0 group-hover:opacity-100 transition-all duration-200 
whitespace-nowrap z-50 shadow-lg border border-white/10">
        <span className="text-gray-300">{day.date}</span><br/>
<span className="text-indigo-300 font-medium">
  {day.count} {day.count === 1 ? "activity" : "activities"}
</span>
      </div>
    </div>
  )
})}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-gray-500 text-xs">Less</span>
                {[0, 0.35, 0.65, 1].map((op, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor:
                        op === 0 ? "rgba(255,255,255,0.04)" : `rgba(99,102,241,${op})`,
                      border: op > 0 ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent"
                    }}
                  />
                ))}
                <span className="text-gray-500 text-xs">More</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">No activity data for the last 35 days.</p>
          )}
        </div>

        {/* ─── Insights & Streaks ─── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-sm">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
            Insights &amp; Recommendations
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Insights list */}
            <div>
              <p className="text-gray-400 text-sm mb-2">Personalized Insights</p>
              <ul className="space-y-2">
                {data.insights?.length > 0
                  ? data.insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span>{insight}</span>
                      </li>
                    ))
                  : <li className="text-gray-500 italic text-sm">No insights yet. Keep using StudyStack!</li>}
              </ul>
            </div>

            {/* Streak info */}
            <div>
              <p className="text-gray-400 text-sm mb-2">Streak &amp; Consistency</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300 text-sm">Current Streak</span>
                  <span className={`font-bold ${streak > 0 ? "text-orange-400" : "text-gray-400"}`}>
                    {streak} day{streak !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300 text-sm">Longest Streak</span>
                  <span className="font-bold text-indigo-400">
                    {longestStreak} day{longestStreak !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300 text-sm">Total Study Days</span>
                  <span className="font-bold text-gray-300">{studyDays}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Footer Quick Stats ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "First Activity",
              value: data.overview?.firstActivity
                ? new Date(data.overview.firstActivity).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "N/A",
              icon: Calendar
            },
            {
              label: "Last Activity",
              value: data.overview?.lastActivity
                ? new Date(data.overview.lastActivity).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "N/A",
              icon: Activity
            },
            {
              label: "Languages Used",
              // FIX: was falling through to 0 even when data existed because `||` coerces undefined
              value: Object.keys(data.code?.languageBreakdown ?? {}).length,
              icon: Code2
            },
            {
              label: "Total Study Days",
              value: studyDays,
              icon: Flame
            }
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm hover:border-white/20 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                  <span className="text-gray-400 text-xs">{stat.label}</span>
                </div>
                <p className="text-white font-semibold text-lg">{stat.value}</p>
              </div>
            )
          })}
        </div>

      </div>
    </Layout>
  )
}