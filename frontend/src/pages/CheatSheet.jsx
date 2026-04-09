import Layout from "../components/Layout";
import { useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { API_BASE } from "../utils/api";
import { Zap, FileUp, FileText, Download, Copy, Check, FileCheck, AlertCircle } from "lucide-react";

export default function CheatSheet() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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

      const token = localStorage.getItem("token");
      const config = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(
        `${API_BASE}/api/cheatsheet/generate`,
        formData,
        config
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
    });
    doc.save("cheat_sheet.pdf");
  };

  const renderCheatSheet = (text) => {
    const lines = text.split("\n").filter((l) => l.trim() !== "");
    return (
      <ul className="space-y-2">
        {lines.map((line, i) => {
          const trimmed = line.replace(/^\*+\s*/, "");
          return (
            <li key={i} className="flex items-start gap-2">
              <span className="text-amber-400 mt-1">•</span>
              <span className="text-gray-200 leading-relaxed">{trimmed}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Zap className="w-6 h-6 text-amber-400" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
              Cheat Sheet Generator
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-1">
              Upload files or paste text to generate comprehensive study materials
            </p>
          </div>
        </div>

        {/* INPUT SECTION */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">

          {/* FILE UPLOAD */}
          <div className="md:w-[35%] min-w-[200px]">
            <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-sm transition-all hover:border-white/20 flex flex-col items-center justify-center">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600/50 hover:border-amber-500/50 rounded-xl p-6 cursor-pointer transition-all w-full h-full group">
                <div className="p-3 bg-amber-500/10 rounded-full mb-3 group-hover:bg-amber-500/20 transition-all">
                  <FileUp className="w-8 h-8 text-amber-400" strokeWidth={1.5} />
                </div>
                <p className="text-gray-300 font-medium text-sm mb-1">Upload File</p>
                <p className="text-gray-500 text-xs text-center">
                  PDF, DOCX, TXT, or images
                </p>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
              {file && (
                <div className="mt-4 w-full p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.5} />
                  <span className="text-emerald-300 text-xs md:text-sm break-words">
                    {file.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* OR DIVIDER */}
          <div className="flex md:items-center px-4">
            <div className="flex md:flex-row flex-col items-center gap-2 md:gap-4">
              <div className="w-px md:h-12 h-8 bg-gray-600/50 md:flex hidden"></div>
              <span className="text-gray-400 text-sm font-medium px-2">OR</span>
              <div className="w-px md:h-12 h-8 bg-gray-600/50 md:flex hidden"></div>
            </div>
          </div>

          {/* TEXT INPUT */}
          <div className="flex-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-sm transition-all hover:border-white/20 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
                <span className="text-gray-300 text-sm font-medium">Paste Text</span>
              </div>
              <textarea
                rows="8"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your syllabus, notes, or previous year questions here..."
                className="w-full flex-1 p-4 bg-black/40 text-gray-200 placeholder-gray-600 rounded-xl text-sm md:text-base border border-white/5 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all resize-y"
              />
            </div>
          </div>
        </div>

        {/* GENERATE BUTTON */}
        <div className="flex justify-center mt-4">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`px-8 py-3 rounded-xl text-white flex items-center justify-center gap-2 transition-all duration-200 font-medium text-sm md:text-base w-full md:w-auto
              ${
                loading
                  ? "bg-amber-400 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/25 active:scale-95"
              }`}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" strokeWidth={1.5} />
                Generate Summary & Analysis
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

        {/* CHEAT SHEET RESULT */}
        {result?.cheatSheet && (
          <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-700 rounded-2xl p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all duration-200
                  ${copied
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-transparent text-gray-300 border-gray-600 hover:bg-amber-500 hover:text-white hover:border-amber-500"
                  }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-white transition-all"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <FileCheck className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                Cheat Sheet Summary
              </h2>
            </div>

            {/* Content */}
            <div className="text-gray-200 text-sm md:text-base leading-relaxed max-h-[600px] overflow-y-auto pr-2">
              {renderCheatSheet(result.cheatSheet)}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
