import Layout from "../components/Layout";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const filterOptions = ["All", "Cheat Sheet", "Notes", "Quiz"];

export default function History({ userId: propUserId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const userId = propUserId || localStorage.getItem("userId"); // ✅ fallback

  // Fetch history
  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const params = { userId };
      if (filter !== "All") params.filter = filter;
      if (search) params.search = search;

      const res = await axios.get("http://localhost:5000/api/history", { params });
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, filter, search]);

  // Initial fetch + filter/search change
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Listen for history updates from CodeHelper
  useEffect(() => {
    const handleHistoryUpdate = () => fetchHistory();
    window.addEventListener("historyUpdated", handleHistoryUpdate);
    return () => window.removeEventListener("historyUpdated", handleHistoryUpdate);
  }, [fetchHistory]);

  // Copy code snippet
  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <Layout>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-indigo-400 text-4xl">📜</span>
          <span>History Dashboard</span>
        </h1>

        {/* FILTER + SEARCH */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white/10 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            {filterOptions.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history..."
            className="bg-white/10 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
      </div>

      {/* EMPTY STATE */}
      {!loading && history.length === 0 && (
        <div className="bg-white/10 border border-white/20 p-8 rounded-2xl text-center text-gray-300">
          <p className="text-lg">No history found</p>
          <p className="text-sm mt-1 text-gray-400">Your previous work will appear here</p>
        </div>
      )}

      {/* HISTORY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <p className="text-gray-300 col-span-full">Loading...</p>}

        {history.map((item) => (
          <div
            key={item._id}
            className="bg-white/10 border border-white/20 p-4 rounded-2xl shadow hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between"
          >
            {/* TYPE BADGE */}
            <span className="self-start bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold mb-2">
              {item.type}
            </span>

            {/* DESCRIPTION */}
            <p className="text-gray-200 mb-2">{item.description}</p>

            {/* ORIGINAL CODE */}
            {item.codeSnippet && (
              <div className="relative mb-2">
                <pre className="bg-black/20 p-2 rounded text-sm text-green-300 overflow-x-auto">
                  <code>{item.codeSnippet}</code>
                </pre>
                <button
                  onClick={() => handleCopy(item.codeSnippet, `${item._id}-original`)}
                  className={`absolute top-2 right-2 px-2 py-1 text-xs rounded border transition
                    ${copiedId === `${item._id}-original`
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-transparent text-gray-300 border-gray-500 hover:bg-indigo-500 hover:text-white hover:border-indigo-500"
                    }`}
                >
                  {copiedId === `${item._id}-original` ? "Copied" : "Copy"}
                </button>
              </div>
            )}

            {/* REFACTORED CODE */}
            {item.refactoredCode && (
              <div className="relative mb-2">
                <pre className="bg-black/30 p-2 rounded text-sm text-blue-300 overflow-x-auto">
                  <code>{item.refactoredCode}</code>
                </pre>
                <button
                  onClick={() => handleCopy(item.refactoredCode, `${item._id}-refactored`)}
                  className={`absolute top-2 right-2 px-2 py-1 text-xs rounded border transition
                    ${copiedId === `${item._id}-refactored`
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-transparent text-gray-300 border-gray-500 hover:bg-indigo-500 hover:text-white hover:border-indigo-500"
                    }`}
                >
                  {copiedId === `${item._id}-refactored` ? "Copied" : "Copy"}
                </button>
              </div>
            )}

            {/* DATE */}
            <span className="text-gray-400 text-sm">{new Date(item.date).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </Layout>
  );
}