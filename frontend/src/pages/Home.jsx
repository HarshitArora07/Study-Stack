import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Layout from "../components/Layout"

export default function Home() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))
  const isGuest = !token

  useEffect(() => {
    if (!isGuest && token) {
      fetch("http://localhost:5000/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(resData => setData(resData))
        .catch(err => console.log(err))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  return (
    <Layout>
      {/* 🔝 Top Section */}
      <div className="mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
  {isGuest
    ? "Welcome Guest 👋"
    : `Welcome back, ${user?.name || "User"} 👋`}
</h1>

        <p className="text-gray-500 text-sm md:text-base">
          {isGuest
            ? "Explore features, but create an account to save your progress."
            : "You're making great progress. Keep learning consistently 🚀"}
        </p>
      </div>

      {/* 🔄 Loading */}
      {loading && (
        <div className="bg-white p-6 rounded-2xl shadow text-center">
          Loading dashboard...
        </div>
      )}

      {/* 🚫 Guest Mode */}
      {!loading && isGuest && (
        <>
          {/* Feature Preview */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm text-center mb-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              Start your learning journey 🚀
            </h2>

            <p className="text-gray-500 mb-6 text-sm md:text-base">
              You're using guest mode. Your progress won’t be saved.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="px-6 py-2 bg-indigo-500 text-white rounded-md text-center"
              >
                Create Account
              </Link>

              <Link
                to="/login"
                className="px-6 py-2 border rounded-md text-center"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white p-5 rounded-2xl shadow-sm mb-6">
            <h2 className="font-semibold mb-3">What you can do 🚀</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Upload notes and get summaries</li>
              <li>• Generate quizzes instantly</li>
              <li>• Track your study progress</li>
            </ul>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 p-5 rounded-2xl text-sm text-yellow-700">
            ⚠️ Your progress won’t be saved in guest mode.
          </div>
        </>
      )}

      {/* ✅ Logged-in Dashboard */}
      {!loading && !isGuest && data && (
        <>
          {/* Motivation */}
          <div className="bg-indigo-50 p-5 rounded-2xl text-sm text-indigo-700 mb-6">
            🔥 You're on a streak! Keep studying daily to build momentum.
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-2 xl:grid-cols-4 mb-8 md:mb-10">
            <div className="p-4 md:p-6 bg-white rounded-2xl shadow-sm">
              <h3 className="text-gray-500 text-xs md:text-sm">Notes Uploaded</h3>
              <p className="text-xl md:text-2xl font-semibold mt-2">
                {data.notes || 0}
              </p>
            </div>

            <div className="p-4 md:p-6 bg-white rounded-2xl shadow-sm">
              <h3 className="text-gray-500 text-xs md:text-sm">Quizzes</h3>
              <p className="text-xl md:text-2xl font-semibold mt-2">
                {data.quizzes || 0}
              </p>
            </div>

            <div className="p-4 md:p-6 bg-white rounded-2xl shadow-sm">
              <h3 className="text-gray-500 text-xs md:text-sm">Study Time</h3>
              <p className="text-xl md:text-2xl font-semibold mt-2">
                {data.studyTime || "0h"}
              </p>
            </div>

            <div className="p-4 md:p-6 bg-white rounded-2xl shadow-sm">
              <h3 className="text-gray-500 text-xs md:text-sm">Accuracy</h3>
              <p className="text-xl md:text-2xl font-semibold mt-2">
                {data.accuracy || "0%"}
              </p>
            </div>
          </div>

          {/* Activity + Insights */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8 md:mb-10">
            <div className="p-5 md:p-6 bg-white rounded-2xl shadow-sm">
              <h2 className="font-semibold mb-4">Recent Activity</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                {data.activity?.length > 0 ? (
                  data.activity.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))
                ) : (
                  <li>No recent activity</li>
                )}
              </ul>
            </div>

            <div className="p-5 md:p-6 bg-white rounded-2xl shadow-sm">
              <h2 className="font-semibold mb-4">Insights</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                {data.insights?.length > 0 ? (
                  data.insights.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))
                ) : (
                  <li>No insights yet</li>
                )}
              </ul>
            </div>
          </div>
        </>
      )}

      {/* ⚡ Quick Actions */}
      {!loading && (
        <div className="p-5 md:p-6 bg-white rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-4">Quick Actions</h2>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
            <Link
              to="/upload"
              className="px-5 py-2 bg-indigo-500 text-white rounded-md text-center"
            >
              + Upload Notes
            </Link>

            <Link
              to="/quiz"
              className="px-5 py-2 border rounded-md text-center"
            >
              Generate Quiz
            </Link>

            <Link
              to="/summary"
              className="px-5 py-2 border rounded-md text-center"
            >
              Create Summary
            </Link>
          </div>
        </div>
      )}
    </Layout>
  )
}