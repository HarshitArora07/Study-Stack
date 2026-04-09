import Layout from "../components/Layout";
import { useState } from "react";
import { API_BASE } from "../utils/api";
import { BarChart3, Sparkles, CheckCircle, XCircle, Lightbulb, Trophy } from "lucide-react";

export default function Analysis() {
  const [text, setText] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  // Skeleton Card
  const SkeletonCard = () => {
    return (
      <div className="animate-pulse bg-white/5 border border-white/10 p-6 rounded-2xl">
        <div className="h-4 bg-gray-400/30 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-10 bg-gray-400/20 rounded-xl"></div>
          <div className="h-10 bg-gray-400/20 rounded-xl"></div>
          <div className="h-10 bg-gray-400/20 rounded-xl"></div>
          <div className="h-10 bg-gray-400/20 rounded-xl"></div>
        </div>
      </div>
    );
  };

  const generateQuiz = async () => {
    if (!text.trim()) {
      alert("Please enter some notes first!");
      return;
    }

    try {
      setLoading(true);
      setQuiz([]);
      setScore(null);
      setAnswers({});

      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/quiz/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setQuiz(data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qIndex, option) => {
    if (score !== null) return;
    setAnswers({ ...answers, [qIndex]: option });
  };

  const submitQuiz = async () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });
    setScore(correct);

    // Save quiz result to history
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const quizTopics = [...new Set(quiz.map(q => q.topic).filter(Boolean))];
        await fetch(`${API_BASE}/api/history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            type: "quiz",
            questions: quiz,
            score: correct,
            totalQuestions: quiz.length,
            quizTopics
          })
        });
      }
    } catch (err) {
      console.error("Failed to save quiz to history:", err);
    }
  };

  const getOptionStyle = (qIndex, option, correctAnswer) => {
    if (score === null) {
      return answers[qIndex] === option
        ? "bg-violet-500 text-white border-violet-500"
        : "bg-white/5 text-gray-200 border-white/10 hover:bg-white/10 hover:border-white/20";
    }

    if (option === correctAnswer) {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
    }

    if (answers[qIndex] === option && option !== correctAnswer) {
      return "bg-red-500/20 text-red-300 border-red-500/50";
    }

    return "bg-white/5 text-gray-400 border-white/10";
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
            <BarChart3 className="w-6 h-6 text-violet-400" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
              AI Analysis Dashboard
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-1">
              Generate smart quizzes from your notes instantly
            </p>
          </div>
        </div>

        {/* INPUT */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-sm transition-all hover:border-white/20">
          <textarea
            value={text}
            placeholder="Paste your notes, study material, or syllabus here..."
            className="w-full p-4 bg-black/40 text-gray-200 placeholder-gray-500 rounded-xl text-sm md:text-base border border-white/5 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all resize-y min-h-[150px]"
            rows={5}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            onClick={generateQuiz}
            disabled={loading}
            className={`mt-4 px-6 py-2.5 md:px-8 md:py-3 rounded-xl text-white flex items-center justify-center gap-2 transition-all duration-200 font-medium text-sm md:text-base w-full md:w-auto
              ${loading
                ? "bg-violet-400 cursor-not-allowed"
                : "bg-violet-500 hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-500/25 active:scale-95"
              }`}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                Generate Quiz
              </>
            )}
          </button>
        </div>

        {/* QUIZ / LOADING */}
        <div className="space-y-6 mt-6">

          {/* Skeleton */}
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}

          {/* Quiz Questions */}
          {!loading && quiz.map((q, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 transition-all hover:border-white/20"
            >
              <p className="text-base md:text-lg font-medium text-white leading-relaxed">
                {i + 1}. {q.question}
              </p>

              <div className="mt-4 grid gap-2.5">
                {q.options.map((opt, j) => (
                  <button
                    key={j}
                    onClick={() => handleSelect(i, opt)}
                    disabled={score !== null}
                    className={`px-4 py-3 rounded-xl border transition-all duration-200 text-left text-sm md:text-base flex items-center gap-3 ${getOptionStyle(
                      i,
                      opt,
                      q.answer
                    )}`}
                  >
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs shrink-0 ${score === null && answers[i] === opt
                        ? "border-violet-400 bg-violet-500/20"
                        : score !== null && opt === q.answer
                        ? "border-emerald-400 bg-emerald-500/20"
                        : score !== null && answers[i] === opt && opt !== q.answer
                        ? "border-red-400 bg-red-500/20"
                        : "border-gray-600"
                      }`}>
                      {score !== null && opt === q.answer ? "✓" : score !== null && answers[i] === opt && opt !== q.answer ? "✕" : String.fromCharCode(97 + j)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                ))}
              </div>

              {/* RESULT */}
              {score !== null && (
                <div className="mt-4 flex items-start gap-3">
                  <div className="flex flex-col gap-2">
                    <div className={`p-2 rounded-lg ${q.answer && answers[i] === q.answer ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                      {q.answer && answers[i] === q.answer ? (
                        <CheckCircle className="w-5 h-5" strokeWidth={1.5} />
                      ) : (
                        <XCircle className="w-5 h-5" strokeWidth={1.5} />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    {q.answer && answers[i] === q.answer ? (
                      <p className="text-emerald-300 font-medium text-sm">
                        Correct! Well done.
                      </p>
                    ) : (
                      <div>
                        <p className="text-red-300 font-medium text-sm mb-1">
                          Incorrect. The correct answer is: <span className="font-bold">{q.answer}</span>
                        </p>
                        {q.explanation && (
                          <div className="flex items-start gap-2 mt-2 text-gray-400 text-sm">
                            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
                            <span>{q.explanation}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SUBMIT BUTTON */}
        {quiz.length > 0 && score === null && (
          <div className="flex justify-center mt-6">
            <button
              onClick={submitQuiz}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all font-medium text-sm md:text-base active:scale-95"
            >
              Submit Quiz
            </button>
          </div>
        )}

        {/* FINAL SCORE */}
        {score !== null && (
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 text-center backdrop-blur-sm">
            <div className="inline-flex items-center justify-center p-3 bg-violet-500/10 rounded-full mb-4">
              <Trophy className="w-8 h-8 text-violet-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
              Quiz Complete!
            </h2>
            <p className="text-4xl md:text-5xl font-bold text-violet-400 mb-2">
              {score} <span className="text-2xl md:text-3xl text-gray-400">/ {quiz.length}</span>
            </p>
            <p className="text-gray-300 text-sm md:text-base">
              You got <span className="text-emerald-400 font-semibold">{score}</span> out of{' '}
              <span className="text-gray-200 font-semibold">{quiz.length}</span> correct{' '}
              <span className="text-gray-400">({Math.round((score / quiz.length) * 100)}%)</span>
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
