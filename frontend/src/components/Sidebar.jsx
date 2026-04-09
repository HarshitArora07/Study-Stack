import { NavLink, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  Home,
  Code2,
  BarChart3,
  Zap,
  History as HistoryIcon,
  LogOut,
  Rocket,
  TrendingUp
} from "lucide-react"

export default function Sidebar({ close }) {
  const navigate = useNavigate()
  const [isGuest, setIsGuest] = useState(!localStorage.getItem("token"))

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsGuest(!token)
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    setIsGuest(true)
    navigate("/")
  }

  return (
    <div className="w-full md:w-64 h-full
    bg-gradient-to-b from-white/15 to-white/5
    backdrop-blur-xl md:backdrop-blur-2xl border border-white/20
    rounded-2xl shadow-2xl p-4 md:p-5 flex flex-col justify-between
    overflow-y-auto">

      {/* TOP */}
      <div>
        <h2 className="text-lg md:text-xl font-bold text-white mb-6 md:mb-10 tracking-wide flex items-center gap-2">
          <Rocket className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" strokeWidth={1.5} />
          <span style={{ fontFamily: "Orbitron, sans-serif" }}>Study<span className="text-indigo-300">Stack</span></span>
        </h2>

        <div className="flex flex-col gap-1.5">
          {[
            { label: "Home", path: "/home", icon: Home },
            { label: "Code Helper", path: "/code-helper", icon: Code2 },
            { label: "Quiz Generator", path: "/analysis", icon: BarChart3 },
            { label: "Cheat Sheet", path: "/cheatsheet", icon: Zap },
            { label: "Performance", path: "/performance", icon: TrendingUp },
            { label: "History", path: "/history", icon: HistoryIcon },
          ].map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              onClick={() => close && close()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group
                ${
                  isActive
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* BOTTOM */}
      <div className="border-t border-white/20 pt-4">
        {isGuest ? (
          <NavLink
            to="/login"
            onClick={() => close && close()}
            className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Login</span>
          </NavLink>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/90 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            <span className="font-medium">Logout</span>
          </button>
        )}
      </div>
    </div>
  )
}