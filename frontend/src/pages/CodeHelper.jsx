import Layout from "../components/Layout";
import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";

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
      const res = await axios.post(
  `${API_BASE}/api/code/analyze`,
  { code, userId: localStorage.getItem("userId") }
);

      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Analysis failed");
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-white">
            💻 AI Code Assistant
          </h1>
        </div>

        {/* INPUT */}
        <div className="bg-white/10 border border-white/20 p-6 rounded-2xl backdrop-blur-lg">
          <textarea
            rows="10"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            className="w-full p-4 bg-black/40 text-green-300 font-mono rounded-xl"
          />

          <button
  onClick={handleAnalyze}
  disabled={loading}
  className={`mt-4 px-6 py-2 rounded-xl text-white flex items-center justify-center gap-2 transition-all duration-200
    ${
      loading
        ? "bg-indigo-400 cursor-not-allowed"
        : "bg-indigo-500 hover:bg-indigo-600 active:scale-95"
    }`}
>
  {loading ? (
    <>
      {/* Spinner */}
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
      🚀 Analyze Code
    </>
  )}
</button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-xl">
            {error}
          </div>
        )}
{loading && (
  <div className="space-y-4 animate-pulse">

    {/* Skeleton Card */}
    <div className="bg-white/10 border border-white/20 p-4 rounded-xl">
      <div className="h-4 bg-gray-400/30 rounded w-1/4 mb-3"></div>
      <div className="h-3 bg-gray-400/20 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-400/20 rounded w-5/6 mb-2"></div>
      <div className="h-3 bg-gray-400/20 rounded w-3/4"></div>
    </div>

    {/* Skeleton Card */}
    <div className="bg-white/10 border border-white/20 p-4 rounded-xl">
      <div className="h-4 bg-gray-400/30 rounded w-1/3 mb-3"></div>
      <div className="h-3 bg-gray-400/20 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-400/20 rounded w-4/5"></div>
    </div>

    {/* Code Block Skeleton */}
    <div className="bg-black/40 border border-white/20 p-4 rounded-xl">
      <div className="h-3 bg-gray-400/20 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-400/20 rounded w-11/12 mb-2"></div>
      <div className="h-3 bg-gray-400/20 rounded w-10/12 mb-2"></div>
      <div className="h-3 bg-gray-400/20 rounded w-9/12"></div>
    </div>

  </div>
)}
        {/* RESULT */}
{result && (
  <div className="space-y-4">

    {/* ✅ PERFECT CODE STATE */}
    {result.issues?.length === 0 &&
     result.improvements?.length === 0 && (
      <div className="bg-green-500/10 border border-green-400 p-4 rounded-xl text-green-300">
        ✅ Your code is clean and production-ready. No issues found.
      </div>
    )}

    {/* ❌ ISSUES */}
    {result.issues?.length > 0 && (
      <div className="bg-red-500/10 border border-red-400 p-4 rounded-xl">
        <h2 className="text-red-400 font-semibold mb-2">❌ Issues</h2>
        <ul className="list-disc ml-5 text-gray-200">
          {result.issues.map((i, idx) => (
            <li key={idx}>{i}</li>
          ))}
        </ul>
      </div>
    )}

    {/* ⚡ IMPROVEMENTS */}
    {result.improvements?.length > 0 && (
      <div className="bg-yellow-500/10 border border-yellow-400 p-4 rounded-xl">
        <h2 className="text-yellow-400 font-semibold mb-2">⚡ Improvements</h2>
        <ul className="list-disc ml-5 text-gray-200">
          {result.improvements.map((i, idx) => (
            <li key={idx}>{i}</li>
          ))}
        </ul>
      </div>
    )}

    {/* ✅ REFACTORED CODE (ONLY IF DIFFERENT) */}
    {result.refactoredCode &&
     result.refactoredCode.trim() !== code.trim() && (
      <div className="relative bg-black/60 border border-white/20 p-4 rounded-xl">

        <h2 className="text-green-400 font-semibold mb-2">
          ✅ Refactored Code
        </h2>

        <button
          onClick={() => handleCopy(result.refactoredCode)}
          className={`absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border transition-all duration-200
          ${
            copied
              ? "bg-green-500 text-white border-green-500"
              : "bg-transparent text-gray-300 border-gray-500 hover:bg-indigo-500 hover:text-white hover:border-indigo-500"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>

          {copied ? "Copied" : "Copy"}
        </button>

        <pre className="text-green-300 text-sm overflow-x-auto pt-6">
          <code>{result.refactoredCode}</code>
        </pre>
      </div>
    )}

    {/* 💡 EXPLANATION */}
    {result.explanation && (
      <div className="bg-blue-500/10 border border-blue-400 p-4 rounded-xl">
        <h2 className="text-blue-400 font-semibold mb-2">💡 Explanation</h2>
        <ul className="list-disc ml-5 text-gray-200 space-y-2">
  {(Array.isArray(result.explanation)
    ? result.explanation
    : typeof result.explanation === "string"
    ? result.explanation.split("\n")
    : []
  ).map((line, idx) => (
    <li key={idx}>
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