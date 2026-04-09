import Layout from "../components/Layout";
import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../utils/api";
import { Code2, Sparkles, AlertCircle, Lightbulb, CheckCircle, Copy, Check } from "lucide-react";

export default function CodeHelper() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError("Please enter some code.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await axios.post(
        `${API_BASE}/api/code/analyze`,
        { code },
        { headers }
      );

      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Analysis failed");
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Code2 className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
            AI Code Assistant
          </h1>
        </div>

        <p className="text-gray-400 text-sm md:text-base">
          Paste your code to get instant feedback on issues, improvements, and
          optimized refactored versions powered by DeepSeek-V3.
        </p>

        {/* INPUT */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-sm transition-all hover:border-white/20">
          <textarea
            rows="10"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            className="w-full p-4 bg-black/40 text-green-300 font-mono rounded-xl text-sm md:text-base border border-white/5 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all resize-y"
          />

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`mt-4 px-6 py-2.5 md:px-8 md:py-3 rounded-xl text-white flex items-center justify-center gap-2 transition-all duration-200 font-medium text-sm md:text-base w-full md:w-auto
              ${
                loading
                  ? "bg-emerald-400 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95"
              }`}
          >
            {loading ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                Analyze Code
              </>
            )}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/50 text-red-300 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={1.5} />
            <span className="text-sm md:text-base">{error}</span>
          </div>
        )}

        {/* LOADING SKELETON */}
        {loading && (
          <div className="space-y-4 animate-pulse">

            {/* Skeleton Card */}
            <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl">
              <div className="h-4 bg-gray-400/30 rounded w-1/4 mb-3"></div>
              <div className="h-3 bg-gray-400/20 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-400/20 rounded w-5/6 mb-2"></div>
              <div className="h-3 bg-gray-400/20 rounded w-3/4"></div>
            </div>

            {/* Skeleton Card */}
            <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl">
              <div className="h-4 bg-gray-400/30 rounded w-1/3 mb-3"></div>
              <div className="h-3 bg-gray-400/20 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-400/20 rounded w-4/5"></div>
            </div>

            {/* Code Block Skeleton */}
            <div className="bg-black/40 border border-white/10 p-4 rounded-xl">
              <div className="h-3 bg-gray-400/20 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-400/20 rounded w-11/12 mb-2"></div>
              <div className="h-3 bg-gray-400/20 rounded w-10/12 mb-2"></div>
              <div className="h-3 bg-gray-400/20 rounded w-9/12"></div>
            </div>

          </div>
        )}

        {/* RESULT */}
        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ✅ PERFECT CODE STATE */}
            {result.issues?.length === 0 &&
             result.improvements?.length === 0 && (
              <div className="bg-emerald-500/10 border border-emerald-400/50 p-4 md:p-6 rounded-xl flex items-start gap-3">
                <div className="p-1 bg-emerald-500/20 rounded-full shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-emerald-400 font-semibold mb-1">Perfect Code</h3>
                  <p className="text-gray-300 text-sm md:text-base">
                    Your code is clean and production-ready. No issues found.
                  </p>
                </div>
              </div>
            )}

            {/* ❌ ISSUES */}
            {result.issues?.length > 0 && (
              <div className="bg-red-500/10 border border-red-400/50 p-4 md:p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-red-500/20 rounded shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-400" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-red-400 font-semibold">Issues</h2>
                  <span className="text-red-400/70 text-sm">({result.issues.length})</span>
                </div>
                <ul className="space-y-2 text-gray-200">
                  {result.issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm md:text-base">
                      <span className="text-red-400/70 mt-1">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ⚡ IMPROVEMENTS */}
            {result.improvements?.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-400/50 p-4 md:p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-amber-500/20 rounded shrink-0">
                    <Lightbulb className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-amber-400 font-semibold">Improvements</h2>
                  <span className="text-amber-400/70 text-sm">({result.improvements.length})</span>
                </div>
                <ul className="space-y-2 text-gray-200">
                  {result.improvements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm md:text-base">
                      <span className="text-amber-400/70 mt-1">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ✅ REFACTORED CODE (ONLY IF DIFFERENT) */}
            {result.refactoredCode &&
             result.refactoredCode.trim() !== code.trim() && (
              <div className="relative bg-black/60 border border-white/10 p-4 md:p-6 rounded-xl">

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-green-500/20 rounded">
                      <CheckCircle className="w-5 h-5 text-green-400" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-green-400 font-semibold">Refactored Code</h2>
                  </div>

                  <button
                    onClick={() => handleCopy(result.refactoredCode)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border transition-all duration-200
                    ${
                      copied
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-transparent text-gray-300 border-gray-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <pre className="text-green-300 text-sm overflow-x-auto pt-2 font-mono leading-relaxed">
                  <code>{result.refactoredCode}</code>
                </pre>
              </div>
            )}

            {/* 💡 EXPLANATION */}
            {result.explanation && (
              <div className="bg-blue-500/10 border border-blue-400/50 p-4 md:p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-blue-500/20 rounded">
                    <Lightbulb className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-blue-400 font-semibold">Explanation</h2>
                </div>
                <ul className="space-y-2 text-gray-200">
                  {(Array.isArray(result.explanation)
                    ? result.explanation
                    : typeof result.explanation === "string"
                    ? result.explanation.split("\n")
                    : []
                  ).map((line, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm md:text-base">
                      <span className="text-blue-400/70 mt-1">•</span>
                      <span className="leading-relaxed">
                        {line.includes("→") ? (
                          <>
                            <span className="text-green-300 font-mono">
                              {line.split("→")[0]}
                            </span>
                            <span className="text-gray-400"> → </span>
                            <span>{line.split("→")[1]}</span>
                          </>
                        ) : (
                          line
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}
      </div>
    </Layout>
  );
}
