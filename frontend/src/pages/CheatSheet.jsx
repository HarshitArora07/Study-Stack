import Layout from "../components/Layout";
import { useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { API_BASE } from "../api";

export default function CheatSheet() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!file && !text.trim()) {
      setError("Please upload a file or paste text.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (text) formData.append("text", text);

      const res = await axios.post(
  `${API_BASE}/api/cheatsheet/generate`,
  formData
);

      setResult(res.data);
    } catch (err) {
      setError("Failed to generate cheat sheet");
    }

    setLoading(false);
  };

  const handleCopy = () => {
    if (!result?.cheatSheet) return;
    navigator.clipboard.writeText(result.cheatSheet);
    alert("Cheat sheet copied to clipboard!");
  };

  const handleDownloadPDF = () => {
    if (!result?.cheatSheet) return;
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Cheat Sheet", 10, 10);
    let y = 20;
    result.cheatSheet.split("\n").forEach((line) => {
      if (line.trim() === "") return;
      doc.text(line, 10, y);
      y += 7;
      if (y > 280) { doc.addPage(); y = 10; }
    });
    doc.save("cheat_sheet.pdf");
  };

  const renderCheatSheet = (text) => {
    // Convert bullet-like lines into proper <ul> structure
    const lines = text.split("\n").filter((l) => l.trim() !== "");
    return (
      <ul className="list-disc list-inside space-y-1">
        {lines.map((line, i) => {
          const trimmed = line.replace(/^\*+\s*/, "");
          return <li key={i}>{trimmed}</li>;
        })}
      </ul>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-white">📚 Cheat Sheet Generator</h1>
        </div>

        {/* INPUT SECTION */}
        <div className="flex gap-3 sm:gap-4">
          {/* FILE UPLOAD */}
          <div className="w-[35%] min-w-[110px] max-w-[200px]">
            <div className="h-full bg-white/10 border border-white/20 p-3 sm:p-4 rounded-2xl backdrop-blur-lg flex flex-col items-center justify-center">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400/40 rounded-xl p-3 sm:p-4 cursor-pointer hover:border-indigo-400 transition-all w-full h-full">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 15a4 4 0 004 4h10a4 4 0 000-8 5 5 0 00-9.9-1" />
                  <path d="M12 12v6m0-6l-3 3m3-3l3 3" />
                </svg>
                <p className="text-[10px] sm:text-xs text-gray-400 text-center">Upload</p>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
              {file && (
                <p className="text-green-400 text-[10px] mt-2 text-center break-words">
                  {file.name}
                </p>
              )}
            </div>
          </div>

          {/* OR */}
          <div className="flex items-center justify-center px-1">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-[1px] flex-1 bg-gray-500/30"></div>
              <span className="text-[10px] sm:text-xs text-gray-400 px-2">OR</span>
              <div className="w-px flex-1 bg-gray-500/30"></div>
            </div>
          </div>

          {/* TEXT INPUT */}
          <div className="flex-1">
            <div className="bg-white/10 border border-white/20 p-3 sm:p-4 rounded-2xl backdrop-blur-lg h-full flex flex-col">
              <textarea
                rows="6"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste syllabus / notes / PYQs here..."
                className="w-full h-full p-3 sm:p-4 bg-black/40 text-green-300 font-mono rounded-xl resize-none text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        {/* GENERATE BUTTON */}
        <div className="w-full mt-4 flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-72 px-6 py-3 text-base rounded-xl text-white flex items-center justify-center gap-2 transition-all duration-200 ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-600 active:scale-95"
            }`}
          >
            {loading ? "Generating..." : "⚡ Generate Summary & Analysis"}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-xl">{error}</div>
        )}

        {/* CHEAT SHEET */}
        {result?.cheatSheet && (
          <div className="relative bg-gray-900/80 border border-gray-700 p-6 rounded-2xl shadow-lg space-y-4">
            
            {/* Copy & Download Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1 text-sm rounded-lg bg-green-500 hover:bg-green-600 text-white"
              >
                📋 Copy
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-3 py-1 text-sm rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                📥 Download
              </button>
            </div>

            <h2 className="text-xl text-indigo-400 font-bold">📄 Cheat Sheet Summary</h2>
            <div className="text-gray-200 font-mono text-sm sm:text-base">
              {renderCheatSheet(result.cheatSheet)}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}