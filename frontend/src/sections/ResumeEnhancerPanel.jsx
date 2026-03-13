import React, { useState, useRef } from "react";
import { rewriteResume } from "../services/api.js";
import Loader from "../components/Loader.jsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ResumeEnhancerPanel = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultHTML, setResultHTML] = useState("");
  const [fullResult, setFullResult] = useState(null);
  const resumeRef = useRef(null);

  const handleEnhance = async () => {
    if (!text.trim()) {
      setError("Please paste some resume text first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await rewriteResume(text);
      setResultHTML(data.html || "");
      setFullResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enhance resume.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!resumeRef.current) return;
    
    setLoading(true);
    try {
      const element = resumeRef.current;
      
      // A4 dimensions at 96 DPI: ~794px x 1123px
      // For high quality 2x: 1588px x 2246px
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794, // Standard A4 width in pixels
        width: 794
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image height based on fixed A4 width to maintain aspect ratio
      const imgProps = pdf.getImageProperties(imgData);
      const renderHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, renderHeight);
      pdf.save("professional-resume-a4.pdf");
    } catch (err) {
      console.error("PDF generation error:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full flex flex-col gap-4 md:flex-row">
      <div className="flex-1 flex flex-col gap-3">
        <div>
          <h2 className="mb-1 text-sm font-semibold text-slate-100">Raw Resume Text</h2>
          <p className="text-xs text-slate-400">
            Paste your plain text here. The AI will parse it and create a professionally formatted layout.
          </p>
        </div>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setError(""); }}
          placeholder="Paste plain text resume here..."
          className="input-field min-h-[400px] flex-1 resize-none bg-white text-black placeholder:text-gray-400"
        />
        {error && <p className="text-xs text-red-300">{error}</p>}
        <div className="flex items-center justify-between mt-auto">
          <button onClick={handleEnhance} className="btn-primary" disabled={loading}>
            {loading ? "Enhancing..." : "Enhance Resume"}
          </button>
          {loading && <Loader />}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-sm font-semibold text-slate-100">Enhanced Resume</h2>
            <p className="text-xs text-slate-400">
              Your professionally formatted resume will appear here.
            </p>
          </div>
          {resultHTML && (
            <button 
              onClick={handleDownloadPdf} 
              className="btn-primary py-1 px-3 text-xs"
              disabled={loading}
            >
              {loading ? "Generating..." : "Download PDF"}
            </button>
          )}
        </div>
        <div className="flex-1 overflow-auto rounded-lg border border-slate-700 bg-white min-h-[400px]">
          {resultHTML ? (
             <div 
               ref={resumeRef}
               className="text-black p-10 bg-white"
               style={{ 
                 width: "210mm", 
                 minHeight: "297mm", 
                 margin: "0 auto",
                 fontFamily: "'Times New Roman', Times, serif",
                 color: "#000"
               }}
               dangerouslySetInnerHTML={{ __html: resultHTML }}
             />
          ) : (
             <div className="h-full flex items-center justify-center text-sm text-gray-500 min-h-[400px]">
                Enhance your text to see the output.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeEnhancerPanel;
