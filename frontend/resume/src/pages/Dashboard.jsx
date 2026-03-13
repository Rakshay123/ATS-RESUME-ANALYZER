d the resume let it show the aploaimport { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

export default function Dashboard() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [scanning, setScanning] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [role, setRole] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [rewrite, setRewrite] = useState("");
  const [rewriteHtml, setRewriteHtml] = useState("");
  const [questionsList, setQuestionsList] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [resumeText, setResumeText] = useState("");
  const [interviewRole, setInterviewRole] = useState("");

  const uploadResume = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setScanning(true);
    try {
      const res = await axios.post(
        "http://localhost:5001/api/resume/analyze",
        formData,
        { timeout: 60000 }
      );
      setResult(JSON.stringify(res.data, null, 2));
      setScanning(false);
    } catch (error) {
      setScanning(false);
      const msg = error.response?.data?.message || error.message || "Error analyzing resume. Please try again.";
      alert(msg);
    }
  };

  const matchJob = async () => {
    if (!jobDescription) {
      alert("Please enter job description");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5001/api/resume/jobmatch", {
        jobDescription,
      }, { timeout: 90000 });
      setRole(JSON.stringify(res.data, null, 2));
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Error analyzing job. Please try again.";
      alert(msg);
    }
  };

  const parseJobData = (json) => {
    try {
      const obj = JSON.parse(json);
      return {
        role: obj.role || "",
        skills: Array.isArray(obj.skills) ? obj.skills : [],
        requirements: obj.requirements || ""
      };
    } catch {
      return { role: json, skills: [], requirements: "" };
    }
  };

  const initializeChatRoom = async () => {
    if (!role && !result) {
      alert("Please find a role or upload resume first");
      return;
    }

    try {
      const roleData = role ? JSON.parse(role).role : "General Role";
      let resumeData = "";
      try {
        const parsed = JSON.parse(result);
        resumeData = parsed.rawText || result || JSON.stringify(parsed);
      } catch {
        resumeData = result;
      }

      // Call backend to get starting question list
      const res = await axios.post("http://localhost:5001/api/resume/interview", {
        role: roleData,
        resumeData: resumeData
      });

      const firstQuestion = res.data.response || "Let's start.";
      const questionsArr = Array.isArray(res.data.questions) ? res.data.questions : [];

      setQuestionsList(questionsArr);
      setCurrentQuestionIndex(questionsArr.length > 0 ? 0 : -1);

      // Initialize chat with greeting + first question
      const initialMessages = [];
      initialMessages.push({
        id: 0,
        type: "assistant",
        text: `Great! I'm ready to conduct an interview for the role of ${roleData}. ${resumeData ? 'I\'ve reviewed your resume.' : ''}`
      });
      if (firstQuestion) {
        initialMessages.push({ id: 1, type: "assistant", text: firstQuestion });
      }
      setChatMessages(initialMessages);
      setInterviewRole(roleData);
      setChatInput("");
    } catch (error) {
      alert("Error initializing interview: " + error.message);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    const newMessages = [...chatMessages, {
      id: chatMessages.length,
      type: "user",
      text: userMessage
    }];
    setChatMessages(newMessages);
    setChatInput("");

    // if we have an interview question list and still have next question,
    // only auto-advance when user input appears to be an answer (i.e. not a follow-up question)
    const textTrim = userMessage.trim().toLowerCase();
    const isQuestion = textTrim.endsWith("?") ||
      /^(wh|what|why|how|when|where|who|which|can|should|would|could)\b/.test(textTrim);

    if (questionsList.length > 0 && currentQuestionIndex + 1 < questionsList.length && !isQuestion) {
      const nextIdx = currentQuestionIndex + 1;
      const nextQ = questionsList[nextIdx];
      newMessages.push({
        id: newMessages.length,
        type: "assistant",
        text: nextQ.question
      });
      setChatMessages(newMessages);
      setCurrentQuestionIndex(nextIdx);
      return;
    }

    // otherwise fall back to backend for generic responses
    try {
      const resumeData = result ? JSON.parse(result).rawText || result || JSON.stringify(JSON.parse(result)) : "";
      
      const res = await axios.post("http://localhost:5001/api/resume/interview", {
        role: interviewRole || "General Role",
        resumeData: resumeData,
        userQuestion: userMessage,
        currentIndex: currentQuestionIndex
      }, { timeout: 60000 });

      const aiResponse = res.data.response || res.data.answer || "I'm here to help. Feel free to ask any interview-related questions.";
      newMessages.push({
        id: newMessages.length,
        type: "assistant",
        text: aiResponse
      });
      setChatMessages(newMessages);

      // if the API returns a next question (questionNumber/totalQuestions)
      if (res.data.questionNumber !== undefined && res.data.questions) {
        setQuestionsList(res.data.questions);
        setCurrentQuestionIndex(res.data.questionNumber - 1);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Unable to get response. Please try again.";
      newMessages.push({
        id: newMessages.length,
        type: "assistant",
        text: errorMsg
      });
      setChatMessages(newMessages);
    }
  };

  const generateQuestions = async () => {
    if (!role && !result) {
      alert("Please find a role or upload resume first");
      return;
    }

    try {
      const roleData = role ? JSON.parse(role).role : "General Role";
      // extract rawText if available from result JSON
      let resumeData = "";
      try {
        const parsed = JSON.parse(result);
        resumeData = parsed.rawText || result;
      } catch {
        resumeData = result;
      }
      const res = await axios.post("http://localhost:5001/api/resume/interview", {
        role: roleData,
        resumeData: resumeData,
      }, { timeout: 90000 });
      setQuestions(JSON.stringify(res.data, null, 2));
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Error generating questions. Please try again.";
      alert(msg);
    }
  };

  const rewriteResume = async () => {
    if (!result && !resumeText) {
      alert("Please analyze a resume or enter resume text");
      return;
    }

    let textToSend = resumeText;
    if (!textToSend && result) {
      try {
        const p = JSON.parse(result);
        textToSend = p.rawText || result;
      } catch {
        textToSend = result;
      }
    }

    try {
      const res = await axios.post("http://localhost:5001/api/resume/rewrite", {
        resumeText: textToSend,
      }, { timeout: 60000 });
      setRewrite(res.data.rewritten);
      if (res.data.html) setRewriteHtml(res.data.html);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Error rewriting resume. Please try again.";
      alert(msg);
    }
  };

  const downloadPDF = () => {
    if (!rewrite) return;

    // always generate manually so we can control colors
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const maxWidth = pageWidth - 2 * margin;
    let y = margin;

    // parse content lines
    const lines = rewrite.split("\n").map(l => l.trim()).filter(l => l);
    let i = 0;
    while (i < lines.length) {
      let line = lines[i];

      // determine color: headers (all-caps) blue, others black
      const isHeader = /^[A-Z][A-Z\s]+$/.test(line) && line.length > 2;
      if (isHeader) {
        doc.setTextColor(29, 78, 216); // #1d4ed8
      } else {
        doc.setTextColor(0, 0, 0);
      }

      if (line.startsWith("•") || /^[-•*]\s*/.test(line)) {
        doc.setFontSize(10);
        doc.setFont(undefined, "normal");
        const bulletText = line.replace(/^[-•*]\s*/, "");
        const bulletLines = doc.splitTextToSize("• " + bulletText, maxWidth - 5);
        doc.text(bulletLines, margin + 3, y);
        y += bulletLines.length * 5;
      } else {
        const isBold = /^[A-Z][\w\s&-]*$/.test(line) && line.length < 60 && !line.match(/^\d/);
        doc.setFontSize(12);
        doc.setFont(undefined, isBold ? "bold" : "normal");
        const textLines = doc.splitTextToSize(line, maxWidth);
        doc.text(textLines, margin, y);
        y += textLines.length * 5;
      }

      if (y > pageHeight - margin - 10) {
        doc.addPage();
        y = margin;
      }
      i++;
    }
    doc.save("Professional_Resume.pdf");
  };

  const parseResumeData = (data) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      let name = parsed.name || parsed.candidateInfo?.name || "Not detected";
      let email = parsed.email || parsed.candidateInfo?.email || "Not detected";
      let phone = parsed.phone || parsed.candidateInfo?.phone || "Not detected";

      const text = parsed.rawText || "";
      
      // Enhanced fallbacks only if still "Not detected"
      if (name === "Not detected" && text) {
        const namePatterns = [
          /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/m,
          /(?:Name|John Doe|Candidate):\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/i
        ];
        for (const pat of namePatterns) {
          const match = text.match(pat);
          if (match) {
            name = match[1].trim();
            break;
          }
        }
      }
      if (email === "Not detected" && text) {
        const em = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
        if (em) email = em[1];
      }
      if (phone === "Not detected" && text) {
        const ph = text.match(/(\+?[\d\s\-\(\)]{10,})/);
        if (ph) phone = ph[1].trim();
      }

      // Source confidence
      const source = name !== "Not detected" ? 
        (parsed.name ? "AI" : parsed.candidateInfo ? "Extracted" : "Regex") : "Failed";

      return {
        name,
        email,
        phone,
        source,
        skills: parsed.skills || [],
        suggestedRole: parsed.suggestedRole || parsed.job_role_match?.[0]?.role || "Unknown",
        atsScore: parsed.ats_score || parsed.atsScore,
        improvements: parsed.improvement_suggestions || parsed.improvements || [],
        rawText: text
      };
    } catch {
      return {
        name: "Not detected",
        email: "Not detected",
        phone: "Not detected",
        source: "Parse failed",
        skills: [],
        suggestedRole: "Unknown",
        atsScore: undefined,
        improvements: [],
        rawText: ""
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("loggedIn");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h1 className="sidebar-title">ResumeAI</h1>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Dashboard Overview
          </button>
          <button
            className={`nav-item ${activeTab === "jobmatch" ? "active" : ""}`}
            onClick={() => setActiveTab("jobmatch")}
          >
            💼 Job Description
          </button>
          <button
            className={`nav-item ${activeTab === "rewrite" ? "active" : ""}`}
            onClick={() => setActiveTab("rewrite")}
          >
            ✏️ Rewrite Resume
          </button>
          <button
            className={`nav-item ${activeTab === "interview" ? "active" : ""}`}
            onClick={() => setActiveTab("interview")}
          >
            🎤 Interview Q&A
          </button>
        </nav>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        {/* Dashboard Overview Tab */}
        {activeTab === "overview" && (
          <div className="tab-content">
            <h2>Dashboard Overview - Upload & Analyze Resume</h2>
            <div className="upload-section">
              <div className="upload-box">
                <input
                  type="file"
                  id="file-input"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx"
                  style={{ display: "none" }}
                />
                <label htmlFor="file-input" className="file-label">
                  📁 Choose Resume File
                </label>
                {file && <p className="file-name">{file.name}</p>}
              </div>

              <button className="btn-primary" onClick={uploadResume}>
                Upload & Analyze
              </button>

              {scanning && (
                <div className="scanning-animation">
                  <div className="scanner"></div>
                  <p>Scanning your resume...</p>
                </div>
              )}

              {result && (
                <div className="resume-details">
                  <h3>Resume Analysis Results</h3>
                  {(() => {
                    const data = parseResumeData(result);
                    return (
                      <div className="details-box">
                        <p>
                          <strong>Name:</strong> <span className={data.source === 'AI' ? 'ai-source' : data.source === 'Extracted' ? 'extracted-source' : ''}>
                            {data.name} <small>({data.source})</small>
                          </span>
                        </p>
                        <p>
                          <strong>Email:</strong> {data.email}
                        </p>
                        <p>
                          <strong>Phone:</strong> {data.phone}
                        </p>
                        {data.atsScore !== undefined && (
                          <p>
                            <strong>ATS Score:</strong> {data.atsScore}%
                          </p>
                        )}
                        {data.improvements.length > 0 ? (
                          <div className="improvements-box">
                            <strong>Suggestions:</strong>
                            <ul>
                              {data.improvements.map((imp, idx) => (
                                <li key={idx}>{imp}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="improvements-box">
                            <strong>Suggestions:</strong> None (your resume looks good!)
                          </div>
                        )}
                        {data.skills.length > 0 && (
                          <div className="skills-box">
                            <strong>Skills:</strong>
                            <div className="skills-list">
                              {data.skills.slice(0, 8).map((skill, i) => (
                                <span key={i} className="skill-badge">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <p>
                          <strong>Suggested Role:</strong> {data.suggestedRole}
                        </p>
                      </div>
                    );
                  })()}
                  <details className="raw-data">
                    <summary>View Full Analysis</summary>
                    <pre>{result}</pre>
                  </details>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Job Description Tab */}
        {activeTab === "jobmatch" && (
          <div className="tab-content">
            <h2>Job Description - Find Your Specific Role</h2>
            <div className="job-section">
              <textarea
                className="textarea-field"
                rows="8"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <button className="btn-primary" onClick={matchJob}>
                Analyze Job & Find Role
              </button>

              {role && (
                <div className="result-box">
                  <h3>Specific Role for This Job</h3>
                  {(() => {
                    try {
                      const parsed = JSON.parse(role);
                      return (
                        <div>
                          <p><strong>Role:</strong> {parsed.role}</p>
                          {parsed.skills && parsed.skills.length > 0 && (
                            <div className="skills-box">
                              <strong>Required Skills:</strong>
                              <div className="skills-list">
                                {parsed.skills.map((s, idx) => (
                                  <span key={idx} className="skill-badge">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {parsed.requirements && (
                            <p><strong>Notes:</strong> {parsed.requirements}</p>
                          )}
                        </div>
                      );
                    } catch {
                      return <pre>{role}</pre>;
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interview Tab */}
        {activeTab === "interview" && (
          <div className="tab-content">
            <h2>🎤 Interview Practice - Chat with AI</h2>
            <div className="interview-section">
              {!role && !result ? (
                <div className="info-box">
                  <p>
                    📝 Please use the <strong>Dashboard Overview</strong> or <strong>Job Description</strong> features first to provide context.
                  </p>
                </div>
              ) : (
                <>
                  {chatMessages.length === 0 ? (
                    <button className="btn-primary" onClick={initializeChatRoom}>
                      Start Interview
                    </button>
                  ) : (
                    <>
                      {/* Chat Display */}
                      <div className="chat-display" style={{
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        height: "400px",
                        overflowY: "auto",
                        padding: "16px",
                        marginBottom: "16px",
                        backgroundColor: "#f9f9f9"
                      }}>
                        {chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            style={{
                              marginBottom: "12px",
                              display: "flex",
                              justifyContent: msg.type === "user" ? "flex-end" : "flex-start"
                            }}
                          >
                            <div
                              style={{
                                maxWidth: "70%",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                backgroundColor: msg.type === "user" ? "#007bff" : "#e9ecef",
                                color: msg.type === "user" ? "white" : "#333",
                                wordWrap: "break-word"
                              }}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Chat Input */}
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          placeholder="Type your answer or ask a question..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") sendChatMessage();
                          }}
                          className="input-field"
                          style={{ flex: 1 }}
                        />
                        <button className="btn-primary" onClick={sendChatMessage}>
                          Send
                        </button>
                      </div>

                      <button
                        className="logout-btn"
                        onClick={() => {
                          setChatMessages([]);
                          setInterviewRole("");
                          setChatInput("");
                          setQuestionsList([]);
                          setCurrentQuestionIndex(0);
                        }}
                        style={{ marginTop: "12px" }}
                      >
                        Reset Chat
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Rewrite Tab */}
        {activeTab === "rewrite" && (
          <div className="tab-content">
            <h2>Enhance Your Resume</h2>
            <div className="rewrite-section">
              {result && (
                <p className="info-text">Resume loaded from analysis</p>
              )}
              <textarea
                className="textarea-field"
                rows="8"
                placeholder="Paste your resume text here, or it will use the analyzed resume..."
                value={resumeText || (() => {
                  try {
                    const p = JSON.parse(result);
                    return p.rawText || "";
                  } catch { return result; }
                })()}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <button className="btn-primary" onClick={rewriteResume}>
                Enhance Resume with AI
              </button>

              {rewrite && (
                <div className="result-box">
                  <h3>Enhanced Resume</h3>
                  {rewriteHtml ? (
                    <div className="html-output" dangerouslySetInnerHTML={{ __html: rewriteHtml }} />
                  ) : (
                    <pre className="resume-output">{rewrite}</pre>
                  )}
                  <div className="button-group">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(rewrite);
                        alert("Copied to clipboard!");
                      }}
                    >
                      Copy to Clipboard
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={downloadPDF}
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}