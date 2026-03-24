import { useState } from "react"
import Sidebar from "./Sidebar"
import { Menu } from "lucide-react"

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 overflow-hidden">

      {/* DESKTOP SIDEBAR (FIXED) */}
      <div className="hidden md:flex p-4">
        <div className="sticky top-4 h-[calc(100vh-32px)]">
          <Sidebar />
        </div>
      </div>

      {/* MOBILE SIDEBAR */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="p-4">
            <Sidebar close={() => setOpen(false)} />
          </div>
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        </div>
      )}

      {/* RIGHT SIDE (ONLY THIS SCROLLS) */}
      <div className="flex-1 h-full overflow-y-auto p-4 md:p-8 scroll-smooth">

        {/* Mobile Topbar */}
        <div className="md:hidden flex items-center mb-6 text-white">
          <button onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <h1 className="ml-4 font-semibold text-lg">StudyStack</h1>
        </div>

        {children}
      </div>
    </div>
  )
}