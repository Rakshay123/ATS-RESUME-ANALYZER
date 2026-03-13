import React, { useState } from "react";
import { matchJob } from "../services/api.js";
import Loader from "../components/Loader.jsx";

const JobMatchPanel = ({ resumeText }) => {
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleMatch = async () => {
    if (!jd.trim()) {
      setError("Please paste a job description first.");
      return;
    }
    if (!resumeText) {
      setError("Please upload and analyze a resume first.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await matchJob(jd, resumeText);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze match.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-full flex flex-col">
      <h2 className="mb-1 text-sm font-semibold text-slate-100">Job description matching</h2>
      <p className="mb-4 text-xs text-slate-400">
        Paste any JD to see match score, missing skills and how to tailor your resume.
      </p>
      
      <div className="flex-1 flex flex-col gap-3">
        <textarea
          className="input flex-1 text-xs resize-none min-h-[120px]"
          placeholder="Paste job description here..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />
        
        {error && <p className="text-xs text-red-300">{error}</p>}
        
        {result && (
          <div className="mt-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-slate-200">Match Score:</span>
              <span className="text-primary-400 font-black text-sm">{result.match_score}%</span>
            </div>
            {result.missing_skills?.length > 0 && (
              <div className="mb-2">
                <p className="font-bold text-slate-400 mb-1">Missing Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {result.missing_skills.map((s, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-red-900/30 text-red-200 text-[10px] border border-red-500/20">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button 
            onClick={handleMatch} 
            className="btn-primary" 
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze match"}
          </button>
          {loading && <Loader />}
        </div>
      </div>
    </div>
  );
};

export default JobMatchPanel;
