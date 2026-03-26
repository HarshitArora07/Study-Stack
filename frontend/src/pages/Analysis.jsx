import Layout from "../components/Layout"
import { useState } from "react"
import { API_BASE } from "../utils/api";

export default function Analysis() {
  const [text, setText] = useState("")
  const [quiz, setQuiz] = useState([])
  const [answers, setAnswers] = useState({})
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(false)

  // 🧊 Skeleton Card
  const SkeletonCard = () => {
    return (
      <div className="animate-pulse backdrop-blur-lg bg-white/10 border border-white/20 p-6 rounded-2xl shadow-xl">
        <div className="h-4 bg-gradient-to-r from-white/10 via-white/30 to-white/10 rounded w-3/4 mb-4"></div>

        <div className="space-y-2">
          <div className="h-10 bg-gradient-to-r from-white/10 via-white/30 to-white/10 rounded-xl"></div>
          <div className="h-10 bg-gradient-to-r from-white/10 via-white/30 to-white/10 rounded-xl"></div>
          <div className="h-10 bg-gradient-to-r from-white/10 via-white/30 to-white/10 rounded-xl"></div>
          <div className="h-10 bg-gradient-to-r from-white/10 via-white/30 to-white/10 rounded-xl"></div>
        </div>
      </div>
    )
  }

  const generateQuiz = async () => {
    if (!text.trim()) {
      alert("Please enter some notes first!")
      return
    }

    try {
      setLoading(true)
      setQuiz([])
      setScore(null)
      setAnswers({})

      const res = await fetch(`${API_BASE}/api/quiz/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setQuiz(data)
    } catch (err) {
      console.error(err)
      alert("Failed to generate quiz")
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (qIndex, option) => {
    if (score !== null) return
    setAnswers({ ...answers, [qIndex]: option })
  }

  const submitQuiz = () => {
    let correct = 0
    quiz.forEach((q, i) => {
      if (answers[i] === q.answer) correct++
    })
    setScore(correct)
  }

  const getOptionStyle = (qIndex, option, correctAnswer) => {
    if (score === null) {
      return answers[qIndex] === option
        ? "bg-indigo-500 text-white"
        : "bg-white/70 hover:bg-white"
    }

    if (option === correctAnswer) {
      return "bg-green-500 text-white"
    }

    if (answers[qIndex] === option && option !== correctAnswer) {
      return "bg-red-500 text-white"
    }

    return "bg-white/50"
  }

  return (
    <Layout>
      <div className="space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-white">
            🧠 AI Analysis Dashboard
          </h1>
          <p className="text-gray-300 mt-2">
            Generate smart quizzes from your notes instantly
          </p>
        </div>

        {/* INPUT */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 p-6 rounded-2xl shadow-xl">
          <textarea
            value={text}
            placeholder="Paste your notes here..."
            className="w-full p-4 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            rows={5}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            onClick={generateQuiz}
            className="mt-4 px-6 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition text-white font-medium shadow-lg flex items-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {loading ? "Generating..." : "🚀 Generate Quiz"}
          </button>
        </div>

        {/* QUIZ / LOADING */}
        <div className="mt-4 space-y-6">

          {/* Skeleton */}
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          }

          {/* Quiz */}
          {!loading && quiz.map((q, i) => (
            <div
              key={i}
              className="backdrop-blur-lg bg-white/10 border border-white/20 p-6 rounded-2xl shadow-xl"
            >
              <p className="text-lg font-semibold text-white">
                {i + 1}. {q.question}
              </p>

              <div className="mt-4 grid gap-2">
                {q.options.map((opt, j) => (
                  <button
                    key={j}
                    onClick={() => handleSelect(i, opt)}
                    className={`px-4 py-2 rounded-xl transition text-left ${getOptionStyle(
                      i,
                      opt,
                      q.answer
                    )}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* RESULT */}
              {score !== null && (
                <div className="mt-4">
                  <p className="text-green-400 font-medium">
                    ✔ Correct: {q.answer}
                  </p>
                  {q.explanation && (
                    <p className="text-gray-300 mt-1">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SUBMIT */}
        {quiz.length > 0 && score === null && (
          <button
            onClick={submitQuiz}
            className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg"
          >
            ✅ Submit Quiz
          </button>
        )}

        {/* RESULT */}
        {score !== null && (
          <div className="mt-6 backdrop-blur-lg bg-white/10 border border-white/20 p-6 rounded-2xl text-center shadow-xl">
            <h2 className="text-xl font-semibold text-white">
              🎯 Your Score
            </h2>
            <p className="text-3xl font-bold text-indigo-400 mt-2">
              {score} / {quiz.length}
            </p>
            <p className="text-gray-300 mt-2">
              Accuracy: {Math.round((score / quiz.length) * 100)}%
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}