import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"

export default function Landing() {
  const navigate = useNavigate()

  const handleGuest = () => {
    // 🔥 FULL RESET
    localStorage.clear()

    // mark as guest
    localStorage.setItem("guest", "true")

    navigate("/home")
  }

  return (
    <div className="font-sans text-gray-800 min-h-screen bg-gradient-to-r from-indigo-100 via-white to-pink-50 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute w-96 h-96 bg-indigo-300 opacity-20 rounded-full blur-3xl top-10 left-10"></div>
        <div className="absolute w-96 h-96 bg-purple-300 opacity-20 rounded-full blur-3xl bottom-10 right-10"></div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col-reverse lg:flex-row items-center gap-12">

          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-6 text-gray-900">
              Study smarter with <br />
              <span className="text-indigo-500">AI-powered tools</span>
            </h1>

            <p className="text-gray-600 max-w-xl mx-auto lg:mx-0 mb-8 text-base sm:text-lg">
              Turn your notes into quizzes, summaries, and exam-ready insights — all in seconds.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">

              {/* Register */}
              <Link
                to="/register"
                className="px-6 py-3 bg-indigo-500 text-white rounded-md font-medium hover:bg-indigo-600 transition shadow-sm"
              >
                Get Started
              </Link>

              {/* Login */}
              <Link
                to="/login"
                className="px-6 py-3 border border-gray-300 rounded-md font-medium hover:bg-gray-100 transition"
              >
                Login
              </Link>

              {/* ✅ FIXED GUEST BUTTON */}
              <button
                onClick={handleGuest}
                className="px-6 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-md font-medium hover:bg-indigo-50 transition shadow-sm"
              >
                Start as Guest
              </button>

            </div>
          </div>

          {/* Image */}
          <div className="flex-1 flex justify-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
              alt="AI Study"
              className="w-64 md:w-80 lg:w-96 opacity-90"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">

          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-900">
            Powerful features for smarter learning
          </h2>
          <p className="text-gray-500 mb-16 max-w-2xl mx-auto">
            Everything you need to transform your study workflow using AI.
          </p>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

            <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 hover:shadow-xl transition">
              <div className="w-12 h-12 mx-auto mb-5 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 text-xl">
                💡
              </div>
              <h3 className="font-semibold text-lg mb-3">AI Code Helper</h3>
              <p className="text-gray-600 text-sm">
                Get instant explanations for complex code and concepts.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 hover:shadow-xl transition">
              <div className="w-12 h-12 mx-auto mb-5 flex items-center justify-center rounded-lg bg-purple-100 text-purple-600 text-xl">
                📊
              </div>
              <h3 className="font-semibold text-lg mb-3">Smart Dashboard</h3>
              <p className="text-gray-600 text-sm">
                Track progress, generate quizzes, and analyze performance.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 hover:shadow-xl transition">
              <div className="w-12 h-12 mx-auto mb-5 flex items-center justify-center rounded-lg bg-pink-100 text-pink-600 text-xl">
                📄
              </div>
              <h3 className="font-semibold text-lg mb-3">Cheat Sheets</h3>
              <p className="text-gray-600 text-sm">
                Focus on high-impact topics with AI-generated summaries.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How it works */}
<section className="py-24">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">

    <h2 className="text-3xl md:text-4xl font-semibold mb-16 text-gray-900">
      How it works
    </h2>

    <div className="relative grid md:grid-cols-3 gap-10 items-start">

      {/* Horizontal Line (only desktop) */}
      <div className="hidden md:block absolute top-7 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300"></div>

      {/* Step 1 */}
      <div className="relative z-10">
        <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-lg shadow-md">
          1
        </div>
        <h3 className="font-semibold text-lg mb-2">Upload your content</h3>
        <p className="text-gray-600 text-sm">
          Upload notes, PDFs, or past exam papers effortlessly.
        </p>
      </div>

      {/* Step 2 */}
      <div className="relative z-10">
        <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-lg shadow-md">
          2
        </div>
        <h3 className="font-semibold text-lg mb-2">AI analyzes it</h3>
        <p className="text-gray-600 text-sm">
          Our AI extracts key insights, topics, and patterns instantly.
        </p>
      </div>

      {/* Step 3 */}
      <div className="relative z-10">
        <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-lg shadow-md">
          3
        </div>
        <h3 className="font-semibold text-lg mb-2">Learn & improve</h3>
        <p className="text-gray-600 text-sm">
          Practice with quizzes and focus on what matters most.
        </p>
      </div>

    </div>
  </div>
</section>

      {/* CTA */}
<section className="py-24 px-4 sm:px-6">
  <div className="max-w-7xl mx-auto">

    <div className="w-full rounded-2xl bg-indigo-300 text-blue-900 px-8 py-14 md:px-16 md:py-20 shadow-2xl ">

      <div className="max-w-3xl mx-auto text-center">

        <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
          Start studying smarter today
        </h2>

        <p className="text-indigo-800 mb-10 text-base md:text-lg">
          Join thousands of students using AI to boost productivity and achieve better results.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">

          <Link
            to="/register"
            className="px-8 py-3 bg-white text-indigo-600 rounded-md font-semibold hover:bg-gray-100 transition"
          >
            Get Started Free
          </Link>

          <Link
            to="/login"
            className="px-8 py-3 border border-white rounded-md font-semibold hover:bg-white hover:text-indigo-600 transition"
          >
            Login
          </Link>

        </div>

      </div>

    </div>

  </div>
</section>
      {/* Footer */}
      <footer className="border-t border-gray-200 py-10 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-8 md:grid-cols-3 text-center md:text-left">

          <div>
            <h3 className="font-semibold text-lg mb-3">StudyStack</h3>
            <p className="text-gray-500 text-sm">
              Your AI-powered study companion.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Links</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Social</h3>
            <div className="flex justify-center md:justify-start gap-4 text-sm text-gray-600">
              <span>FB</span>
              <span>TW</span>
              <span>IG</span>
            </div>
          </div>

        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          © 2026 StudyStack. All rights reserved.
        </p>
      </footer>

    </div>
  );
}