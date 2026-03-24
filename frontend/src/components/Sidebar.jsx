import { NavLink, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

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
    <div className="w-64 h-[calc(100vh-32px)] 
    backdrop-blur-xl bg-white/10 border border-white/20 
    rounded-2xl shadow-2xl p-5 flex flex-col justify-between">

      {/* TOP */}
      <div>
        <h2 className="text-xl font-bold text-white mb-10 tracking-wide">
          🚀 StudyStack
        </h2>

        <div className="flex flex-col gap-2">
          {[
            { label: "Home", path: "/home", icon: "🏠" },
            { label: "Code Helper", path: "/code-helper", icon: "💻" },
            { label: "Analysis", path: "/analysis", icon: "📊" },
            { label: "Cheat Sheet", path: "/cheatsheet", icon: "⚡" },
            { label: "History", path: "/history", icon: "🕘" },
          ].map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              onClick={() => close && close()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? "bg-indigo-500 text-white shadow-lg"
                    : "text-gray-300 hover:bg-white/10"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
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
            className="block text-center bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl"
          >
            Login
          </NavLink>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  )
}