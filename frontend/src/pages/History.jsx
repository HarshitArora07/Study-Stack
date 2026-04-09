import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { API_BASE } from "../utils/api";
import {
  Code2,
  BrainCircuit,
  Zap,
  Lock,
  FileCheck,
  Lightbulb
} from "lucide-react";

  const typeConfig = {
    code: {
      icon: Code2,
      label: "Code Helper",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      accent: "bg-emerald-500",
    },
    quiz: {
      icon: BrainCircuit,
      label: "Quiz Generator",
      color: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      accent: "bg-violet-500",
    },
    cheatsheet: {
      icon: Zap,
      label: "Cheat Sheet",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      accent: "bg-amber-500",
    },
  };

  function Chevron({ open }) {
    return (
      <svg
        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    );
  }

  function HistoryIcon() {
    return (
      <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12.75 4.5a7.5 7.5 0 00-7.5 7.5c0 2.75 2.25 5 5.25 5.5-.38 1.13-.63 2.38-.63 3.75 0 4.68 3.82 8.5 8.5 8.5s8.5-3.82 8.5-8.5c0-1.37-.25-2.62-.63-3.75 2-2.5 5.25-2.75 5.25-5.5a7.5 7.5 0 00-7.5-7.5z"
        />
      </svg>
    );
  }

  export default function History() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [filter, setFilter] = useState("All");
    const [deleting, setDeleting] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
      const hasToken = !!token;
      const isGuestMode = localStorage.getItem("guest") === "true";
      setIsGuest(!hasToken || isGuestMode);
    }, [token]);

    useEffect(() => {
      if (isGuest) {
        setLoading(false);
        return;
      }

      const fetchHistory = async () => {
        try {
          setLoading(true);
          const res = await fetch(`${API_BASE}/api/history`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setHistory(data);
          } else if (res.status === 401) {
            setIsGuest(true);
          }
        } catch (err) {
          console.error("Failed to fetch history:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchHistory();
    }, [isGuest, token]);

    const toggleExpand = (id) => {
      setExpandedId((prev) => (prev === id ? null : id));
    };

    const handleDelete = async (id) => {
      setDeleting(id);
      try {
        await fetch(`${API_BASE}/api/history/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory((prev) => prev.filter((item) => item._id !== id));
        if (expandedId === id) setExpandedId(null);
      } catch (err) {
        console.error("Failed to delete:", err);
      } finally {
        setDeleting(null);
      }
    };

    // ── GUEST STATE ──
    if (isGuest && !loading) {
      return (
        <Layout>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center backdrop-blur-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-indigo-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">
              Login to View History
            </h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
              Your history saves every quiz, cheat sheet, and code analysis you
              create. Create an account or login to keep your progress.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg font-medium transition-all active:scale-95"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-2.5 border border-white/20 hover:bg-white/10 hover:border-white/20 text-white text-sm rounded-lg font-medium transition-all active:scale-95"
              >
                Sign Up
              </button>
            </div>
          </div>
        </Layout>
      );
    }

    // ── LOADING ──
    if (loading) {
      return (
        <Layout>
          <div className="text-gray-400">Loading history...</div>
        </Layout>
      );
    }

    // ── FILTER ──
    const filtered =
      filter === "All"
        ? history
        : history.filter((item) => item.type === filter);

    const activeTypes = Object.keys(typeConfig).filter((t) =>
      history.some((item) => item.type === t)
    );

    return (
      <Layout>
        <div className="min-h-[calc(100vh-theme(spacing.24))]">
          {/* ── HEADER ── */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <HistoryIcon />
              <h1 className="text-2xl font-semibold text-white tracking-tight">History</h1>
            </div>
            <p className="text-gray-400 text-sm">
              {filtered.length === 0 && !loading
                ? "No history entries yet."
                : `${filtered.length} entr${filtered.length === 1 ? "y" : "ies"} found`}
            </p>
          </div>

          {/* ── FILTER TABS ── */}
          {activeTypes.length > 0 && (
            <div className="mb-6">
              <div className="inline-flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                {["All", ...activeTypes].map((t) => {
                  const cfg = typeConfig[t];
                  const isActive = filter === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setFilter(t)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? t === "All"
                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                            : `${cfg.color} shadow-sm`
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {cfg && <cfg.icon className="w-4 h-4" strokeWidth={1.5} />}
                      <span>{cfg ? cfg.label : t}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── LOADING STATE ── */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading history...</p>
              </div>
            </div>
          )}

          {/* ── EMPTY STATE ── */}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a2 2 0 00-.707.293l-2.414 2.414a2 2 0 01-.707.293h-2.172a2 2 0 01-1.999 2.002c0 .236.018.464.053.686a2.003 2.003 0 01-1.999 2.002h-2.172a2 2 0 01-1.999-2.002c0 .236.018.464.053.686A2.003 2.003 0 01-1.999 2.002H6a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-white text-lg font-medium mb-2">No history yet</h3>
              <p className="text-gray-500 text-sm text-center max-w-sm">
                {filter === "All"
                  ? "Your activity will appear here. Start using Code Helper, Quiz Generator, or Cheat Sheet to build your history."
                  : `No ${typeConfig[filter]?.label.toLowerCase() || filter} entries in your history yet.`}
              </p>
            </div>
          )}

          {/* ── HISTORY LIST ── */}
          {!loading && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((item) => {
                const cfg = typeConfig[item.type] || {
                  icon: FileCheck,
                  label: item.type,
                  color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
                  accent: "bg-gray-500",
                };
                const isExpanded = expandedId === item._id;

                return (
                  <div
                    key={item._id}
                    className={`group rounded-xl border transition-all duration-200 ${
                      isExpanded
                        ? "bg-white/[0.03] border-white/10 shadow-lg"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                    }`}
                  >
                    {/* ── COLLAPSIBLE HEADER ── */}
                    <div
                      className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
                      onClick={() => toggleExpand(item._id)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Type badge */}
                        <span
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0 ${
                            isExpanded ? cfg.color : "bg-white/5 text-gray-300 border-white/5 hover:bg-white/10"
                          }`}
                        >
                          <cfg.icon className="w-4 h-4" strokeWidth={1.5} />
                          <span>{cfg.label}</span>
                        </span>

                        {/* Summary */}
                        <div className="min-w-0 flex-1">
                          {item.type === "code" && (
                            <p className="text-gray-300 text-sm truncate">
                              {item.issues?.length > 0
                                ? `${item.issues.length} issue${item.issues.length > 1 ? "s" : ""} found`
                                : item.explanation
                                  ? item.explanation.split("\n")[0]
                                  : "Code analysis"}
                            </p>
                          )}
                          {item.type === "quiz" && (
                            <p className="text-gray-300 text-sm truncate">
                              Score: {item.score ?? "?"}/{item.totalQuestions ?? "?"} · {item.questions?.length ?? 0} questions
                            </p>
                          )}
                          {item.type === "cheatsheet" && (
                            <p className="text-gray-300 text-sm truncate">
                              {item.importantTopics?.length > 0
                                ? `${item.importantTopics.length} important topics`
                                : item.contentType
                                  ? `${item.contentType} content`
                                  : "Cheat sheet"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {/* Date */}
                        <span className="text-gray-500 text-xs whitespace-nowrap hidden sm:block">
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {/* Delete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item._id);
                          }}
                          disabled={deleting === item._id}
                          className="text-gray-500 hover:text-red-400 transition-all disabled:opacity-30 p-1"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        <Chevron open={isExpanded} />
                      </div>
                    </div>

                    {/* ── EXPANDABLE BODY ── */}
                    {isExpanded && (
                      <div className="border-t border-white/10 px-5 py-5 space-y-5 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                        {/* ── CODE HELPER ── */}
                        {item.type === "code" && (
                          <>
                            {item.issues?.length > 0 && (
                              <div>
                                <h4 className="flex items-center gap-2 text-red-400 font-medium mb-2 text-sm">
                                  <span className="w-1 h-4 bg-red-500 rounded-full"></span>
                                  Issues ({item.issues.length})
                                </h4>
                                <ul className="space-y-1.5">
                                  {item.issues.map((iss, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-300">
                                      <span className="text-red-400/70 mt-1">•</span>
                                      <span className="text-sm">{iss}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {item.improvements?.length > 0 && (
                              <div>
                                <h4 className="flex items-center gap-2 text-emerald-400 font-medium mb-2 text-sm">
                                  <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                                  Improvements ({item.improvements.length})
                                </h4>
                                <ul className="space-y-1.5">
                                  {item.improvements.map((imp, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-300">
                                      <span className="text-emerald-400/70 mt-1">•</span>
                                      <span className="text-sm">{imp}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {item.refactoredCode && (
                              <div>
                                <h4 className="flex items-center gap-2 text-emerald-400 font-medium mb-2 text-sm">
                                  <Code2 className="w-4 h-4" strokeWidth={1.5} />
                                  Refactored Code
                                </h4>
                                <pre className="bg-gradient-to-br from-gray-900/50 to-black/50 p-4 rounded-lg text-green-300 overflow-x-auto text-xs border border-white/5">
                                  <code>{item.refactoredCode}</code>
                                </pre>
                              </div>
                            )}
                            {item.explanation && (
                              <div>
                                <h4 className="flex items-center gap-2 text-emerald-400 font-medium mb-2 text-sm">
                                  <Lightbulb className="w-4 h-4" strokeWidth={1.5} />
                                  Explanation
                                </h4>
                                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                  {item.explanation}
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* ── QUIZ ── */}
                        {item.type === "quiz" && (
                          <>
                            {item.score !== undefined && (
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                <span className="text-gray-400 text-sm">Score</span>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-2xl font-bold text-white">{item.score}</span>
                                  <span className="text-gray-500">/</span>
                                  <span className="text-xl font-medium text-gray-300">{item.totalQuestions}</span>
                                </div>
                                <span className="text-gray-500 text-xs ml-auto">Total: {item.questions?.length || 0} questions</span>
                              </div>
                            )}
                            {item.questions?.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="text-violet-400 font-medium flex items-center gap-2 text-sm">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Questions
                                </h4>
                                {item.questions.map((q, i) => (
                                  <div
                                    key={i}
                                    className="bg-gradient-to-br from-white/[0.02] to-white/[0.04] rounded-lg p-4 space-y-2.5 border border-white/5"
                                  >
                                    <p className="text-gray-200 font-medium text-sm">
                                      {i + 1}. {q.question}
                                    </p>
                                    {q.options?.map((opt, j) => (
                                      <p
                                        key={j}
                                        className={`pl-3 text-sm flex items-center gap-2 ${
                                          opt === q.answer
                                            ? "text-emerald-300 font-medium"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                                          opt === q.answer
                                            ? "bg-emerald-500/20 border-emerald-500/50"
                                            : "border-gray-600"
                                        }`}>
                                          {opt === q.answer ? "✓" : String.fromCharCode(97 + j)}
                                        </span>
                                        {opt}
                                      </p>
                                    ))}
                                    {q.explanation && (
                                      <p className="text-gray-500 text-xs italic pt-1 pl-1">
                                        {q.explanation}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}

                        {/* ── CHEATSHEET ── */}
                        {item.type === "cheatsheet" && (
                          <>
                            {item.contentType && (
                              <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-md text-xs font-medium">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {item.contentType}
                              </span>
                            )}
                            {item.importantTopics?.length > 0 && (
                              <div>
                                <h4 className="flex items-center gap-2 text-amber-400 font-medium mb-2 text-sm">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                  </svg>
                                  Important Topics ({item.importantTopics.length})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {item.importantTopics.map((t, i) => (
                                    <span
                                      key={i}
                                      className="bg-white/5 border border-white/10 text-gray-300 px-3 py-1 rounded-full text-xs"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {item.repeatedTopics?.length > 0 && (
                              <div>
                                <h4 className="flex items-center gap-2 text-orange-400 font-medium mb-2 text-sm">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Repeated Topics ({item.repeatedTopics.length})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {item.repeatedTopics.map((t, i) => (
                                    <span
                                      key={i}
                                      className="bg-white/5 border border-white/10 text-gray-300 px-3 py-1 rounded-full text-xs"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {item.cheatSheet && (
                              <div>
                                <h4 className="flex items-center gap-2 text-amber-400 font-medium mb-2 text-sm">
                                  <FileCheck className="w-4 h-4" strokeWidth={1.5} />
                                  Cheat Sheet
                                </h4>
                                <pre className="bg-gradient-to-br from-gray-900/50 to-black/50 p-4 rounded-lg text-gray-300 overflow-x-auto whitespace-pre-wrap text-xs border border-white/5">
                                  {item.cheatSheet}
                                </pre>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Layout>
    );
  }