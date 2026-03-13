import React, { useState } from "react";
import ResumeUpload from "../sections/ResumeUpload.jsx";
import AnalysisPanel from "../sections/AnalysisPanel.jsx";

const DashboardPage = () => {
  const [resumeData, setResumeData] = useState(null);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex w-full flex-col gap-6 md:flex-row">
        {/* Left Side: Upload Section */}
        <div className="w-full md:w-[35%]">
          <ResumeUpload onAnalyzed={setResumeData} />
        </div>

        {/* Right Side: Detailed Analysis Results */}
        <div className="w-full md:w-[65%]">
          <AnalysisPanel resumeData={resumeData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

