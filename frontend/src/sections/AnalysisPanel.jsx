import React from "react";

const AnalysisPanel = ({ resumeData }) => {
  if (!resumeData) {
    return (
      <div className="card h-full flex flex-col justify-center items-center text-center p-8 bg-slate-900/50 border-dashed border-2 border-slate-700">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </div>
        <h3 className="text-slate-200 font-semibold mb-2">Ready for analysis</h3>
        <p className="text-sm text-slate-400 max-w-xs">
          Upload a resume to see advanced AI insights, ATS score and tailored suggestions.
        </p>
      </div>
    );
  }

  const {
    ats_score = 0,
    skills = [],
    name = "Not detected",
    email = "Not detected",
    phone = "Not detected",
    job_role_match = [],
    strengths = [],
    weaknesses = [],
    improvement_suggestions = []
  } = resumeData;

  const suggestedRole = job_role_match[0]?.role || "Software Developer";

  return (
    <div className="card h-full flex flex-col space-y-6 overflow-y-auto max-h-[85vh] scrollbar-thin scrollbar-thumb-slate-700 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">AI resume analysis</h2>
          <p className="text-xs text-slate-400">Summary of your profile, ATS friendliness and improvement ideas.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">ATS SCORE</p>
          <p className="text-2xl font-black text-white">{ats_score}/100</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 pt-2">
        {/* Candidate Info */}
        <div className="space-y-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">CANDIDATE</p>
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-bold text-slate-100">{name}</p>
              <p className="text-slate-400">{email}</p>
              <p className="text-slate-400">{phone}</p>
            </div>
          </div>
        </div>

        {/* Suggested Role */}
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">AI SUGGESTED ROLE</p>
          <p className="text-xs font-bold text-slate-200">{suggestedRole}</p>
        </div>
      </div>

      {/* Skills */}
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider">SKILLS DETECTED</p>
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 10).map((skill, i) => (
            <span key={i} className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300 border border-slate-700">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Analysis Sections */}
      <div className="space-y-5">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div>
            <p className="text-[10px] uppercase font-bold text-emerald-500 mb-2 tracking-wider">STRENGTHS</p>
            <ul className="space-y-1.5">
              {strengths.map((s, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <div>
            <p className="text-[10px] uppercase font-bold text-orange-500 mb-2 tracking-wider">WEAKNESSES</p>
            <ul className="space-y-1.5">
              {weaknesses.map((w, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested Improvements */}
        {improvement_suggestions.length > 0 && (
          <div>
            <p className="text-[10px] uppercase font-bold text-blue-500 mb-2 tracking-wider">SUGGESTED IMPROVEMENTS</p>
            <ul className="space-y-1.5">
              {improvement_suggestions.map((imp, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;
