import React, { useState } from "react";
import { interviewChat } from "../services/api.js";
import Loader from "../components/Loader.jsx";

const ChatbotPanel = ({ resumeData }) => {
  const [rolePrompt, setRolePrompt] = useState("Software Developer");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Tell me which interview you want to practice (e.g. React, Java, HR, System Design)." }
  ]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");

  const normalizedRole = rolePrompt || resumeData?.suggestedRole || "Software Developer";

  const sendQuestion = async (input, fromUser) => {
    setLoading(true);
    try {
      const res = await interviewChat({
        role: normalizedRole,
        resumeData: resumeData ? JSON.stringify(resumeData) : "",
        userQuestion: input,
        currentIndex
      });
      const next = res.response || "";
      const answer = res.answer;

      setMessages((prev) => [
        ...prev,
        fromUser ? { from: "user", text: input } : null,
        { from: "bot", text: next },
        answer ? { from: "bot", text: `Suggested strong answer: ${answer}` } : null
      ].filter(Boolean));

      if (typeof res.questionNumber === "number") {
        setCurrentIndex(res.questionNumber - 1);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "I ran into a problem generating the next question. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async () => {
    setMessages([]);
    setCurrentIndex(0);
    await sendQuestion("Start interview", false);
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const input = userInput.trim();
    setUserInput("");
    await sendQuestion(input, true);
  };

  return (
    <div className="card h-full flex flex-col min-h-[400px]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Interview chatbot</h2>
          <p className="text-[10px] text-slate-400">
            Practice technical, HR or system design interviews.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="input h-7 w-28 text-[10px]"
            value={rolePrompt}
            onChange={(e) => setRolePrompt(e.target.value)}
            placeholder="Role"
          />
          <button onClick={startInterview} className="btn-primary h-7 px-3 text-[10px]" disabled={loading}>
            Start
          </button>
        </div>
      </div>

      <div className="flex-1 mb-4 space-y-2 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/20 p-3 text-[11px] max-h-[250px] scrollbar-thin scrollbar-thumb-slate-700">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 ${
                m.from === "user"
                  ? "bg-primary-600/90 text-white"
                  : "bg-slate-800 border border-slate-700 text-slate-200"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && <Loader />}
      </div>

      <div className="mt-auto flex items-center gap-2">
        <input
          className="input text-[11px] h-9"
          placeholder="Ask me a question..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
        />
        <button onClick={handleSend} className="btn-primary h-9 px-4 text-xs font-bold" disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatbotPanel;

