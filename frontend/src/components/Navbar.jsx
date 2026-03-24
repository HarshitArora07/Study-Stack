import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full bg-white/70 backdrop-blur-lg border-b border-gray-200 fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <div
          className="text-xl sm:text-3xl font-bold text-gray-900 tracking-wide"
          style={{ fontFamily: "Orbitron, sans-serif" }}
        >
          Study<span className="text-indigo-500">Stack</span>
        </div>


        {/* Links */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            to="/login"
            className="text-sm sm:text-base text-gray-600 hover:text-indigo-500 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-4 py-2 text-sm sm:text-base bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition"
          >
            Sign Up
          </Link>
        </div>

      </div>
    </nav>
  );
}