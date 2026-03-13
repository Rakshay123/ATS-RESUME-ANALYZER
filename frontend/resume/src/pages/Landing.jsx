import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 500);

    const redirectTimer = setTimeout(() => {
      navigate("/register");
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className={`landing-title ${showText ? "show" : ""}`}>
          ResumeAI
        </h1>
        <p className={`landing-subtitle ${showText ? "show" : ""}`}>
          Analyze, Optimize & Master Your Resume
        </p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
