import { useState, useEffect } from "react"
import Sidebar from "./Sidebar"
import { Menu, X } from "lucide-react"

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 overflow-hidden">

      {/* DESKTOP SIDEBAR (FIXED) */}
      <div className="hidden md:flex p-4">
        <div className="sticky top-4 h-[calc(100vh-2rem)]">
          <Sidebar />
        </div>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop - subtle and frosted */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setOpen(false)}
          />

          {/* Sidebar Container - slide in from left */}
          <div className="absolute left-0 top-0 h-full w-[85vw] max-w-sm p-4 animate-in slide-in-from-left-6 duration-300">
            <Sidebar close={() => setOpen(false)} />
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* RIGHT SIDE (ONLY THIS SCROLLS) */}
      <div className="flex-1 h-full overflow-y-auto p-4 md:p-8 scroll-smooth">

        {/* Mobile Topbar */}
        <div className="md:hidden flex items-center justify-between mb-6 text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-semibold text-lg">StudyStack</h1>
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}