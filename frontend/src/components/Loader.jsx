import React from "react";

const Loader = ({ label = "Processing with AI..." }) => {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <span className="h-2 w-2 animate-ping rounded-full bg-primary-400" />
      <span>{label}</span>
    </div>
  );
};

export default Loader;

