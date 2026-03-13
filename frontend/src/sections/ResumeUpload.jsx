import React, { useState } from "react";
import { analyzeResume } from "../services/api.js";
import Loader from "../components/Loader.jsx";

const ResumeUpload = ({ onAnalyzed }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setError("");
    if (f && !["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(f.type)) {
      setError("Please upload a PDF or DOCX file.");
      setFile(null);
      return;
    }
    setFile(f || null);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Select a resume file first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await analyzeResume(file);
      onAnalyzed?.(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-full">
      <h2 className="mb-1 text-sm font-semibold text-slate-100">Upload resume</h2>
      <p className="mb-6 text-xs text-slate-400">
        Upload your PDF or DOCX resume. The AI will extract skills, compute an ATS score and highlight improvements.
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer bg-primary-700/80 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all inline-block">
            Choose File
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <span className="text-xs text-slate-300 truncate max-w-[200px]">
            {file ? file.name : "Nandana umesh Resume.pdf"}
          </span>
        </div>

        {file && (
          <p className="text-xs text-slate-400">
            Selected: <span className="font-medium text-slate-100">{file.name}</span>
          </p>
        )}
        
        {error && (
          <p className="text-xs text-red-400 bg-red-900/10 p-2 rounded border border-red-900/20">
            {error}
          </p>
        )}
        
        <div className="pt-2">
          <button 
            onClick={handleAnalyze} 
            className="btn-primary w-fit px-6 py-2.5" 
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze resume"}
          </button>
        </div>
        
        {loading && (
          <div className="flex items-center gap-2 mt-2">
            <Loader />
            <span className="text-[10px] text-slate-500 animate-pulse">Processing document...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;

