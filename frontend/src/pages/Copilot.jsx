import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Sparkles, RefreshCw } from "lucide-react";
import { generateAiChatCompletion, getOpenAiKey } from "../lib/openai";

const AI_AVATAR =
  "https://static.prod-images.emergentagent.com/jobs/bacfb64e-ff2d-4fa1-90e9-6e28912ba76e/images/3a495445b560363815d16ecaae7dd1be5cff8c811ab98aefbbc75f0b863c9532.png";

const SUGGESTED = [
  "Why did our ROAS decline over the last 6 months?",
  "Which channel has the best return on investment?",
  "Where should I invest more budget next quarter?",
  "What is hurting our overall ROI right now?",
  "Give me an executive summary of our marketing performance",
];

function getSessionId() {
  let id = localStorage.getItem("copilot_session");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("copilot_session", id);
  }
  return id;
}

export default function Copilot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(getSessionId);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Load chat history
    const history = localStorage.getItem(`chat_history_${sessionId}`);
    if (history) {
      try {
        setMessages(JSON.parse(history));
      } catch {}
    }
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    localStorage.setItem(`chat_history_${sessionId}`, JSON.stringify(newMessages));
    setLoading(true);

    try {
      const responseText = await generateAiChatCompletion(newMessages);
      const finalMessages = [...newMessages, { role: "assistant", content: responseText }];
      setMessages(finalMessages);
      localStorage.setItem(`chat_history_${sessionId}`, JSON.stringify(finalMessages));
    } catch (err) {
      const errorText = err.message === "API_KEY_MISSING"
        ? "Please make sure your OpenAI API Key is correctly configured in your frontend's .env file (REACT_APP_OPENAI_API_KEY) and that you have restarted your development server."
        : "I encountered an issue processing your request. Please check your API key and network connection and try again.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorText,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    localStorage.removeItem(`chat_history_${sessionId}`);
    localStorage.removeItem("copilot_session");
    window.location.reload();
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Background texture */}
      <img
        src="https://static.prod-images.emergentagent.com/jobs/bacfb64e-ff2d-4fa1-90e9-6e28912ba76e/images/60df393b1b9a324472a4032f9a5b346497b6e9ccfe80db09a2676b2c93b07503.png"
        alt=""
        className="absolute inset-0 opacity-5 object-cover w-full h-full pointer-events-none mix-blend-screen"
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#050505]/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img src={AI_AVATAR} alt="AI" className="w-9 h-9 rounded-full border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.05)]" />
          <div>
            <h2 className="text-base font-heading font-semibold text-white">
              AI Marketing Copilot
            </h2>
            <p className="text-xs text-neutral-400 font-body">
              Powered by GPT-4o · Analyzing your marketing data
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white font-body">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Online
          </div>
          {hasMessages && (
            <button
              onClick={clearChat}
              className="text-neutral-500 hover:text-neutral-300 transition-colors"
              data-testid="copilot-clear-chat"
              title="New conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        data-testid="copilot-messages-list"
        className="relative z-10 flex-1 overflow-y-auto px-6 py-5 space-y-5"
      >
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <img src={AI_AVATAR} alt="AI" className="w-16 h-16 rounded-full border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] mb-5" />
            <h3 className="text-xl font-heading font-semibold text-white mb-2">
              Ask me anything about your marketing
            </h3>
            <p className="text-sm text-neutral-400 font-body max-w-md mb-8">
              I have full context on your channels, spend, ROAS, CAC, and trends. Ask me to diagnose issues, recommend actions, or explain what the numbers mean.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  data-testid={`suggested-question-${q.slice(0, 20).replace(/\s/g, "-").toLowerCase()}`}
                  className="text-left px-4 py-3 text-xs text-neutral-400 bg-[#0A0A0A] border border-white/5 rounded-xl hover:border-white/20 hover:text-white hover:bg-white/5 transition-all duration-200 font-body"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}
          >
            {msg.role === "assistant" && (
              <img src={AI_AVATAR} alt="AI" className="w-8 h-8 rounded-full border border-white/10 flex-shrink-0 mt-1" />
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm font-body leading-relaxed ${
                msg.role === "user"
                  ? "bg-white/10 text-white border border-white/20 rounded-tr-sm"
                  : "bg-[#0A0A0A] text-[#FAFAFA] border border-white/5 rounded-tl-sm"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-xs font-bold text-white font-heading">RS</span>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start animate-in fade-in duration-300">
            <img src={AI_AVATAR} alt="AI" className="w-8 h-8 rounded-full border border-white/10 flex-shrink-0 mt-1" />
            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips (when chatting) */}
      {hasMessages && !loading && (
        <div className="relative z-10 px-6 pb-2 flex flex-wrap gap-2">
          {SUGGESTED.slice(0, 3).map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-xs px-3 py-1.5 text-neutral-400 bg-[#0A0A0A] border border-white/5 rounded-full hover:border-white/20 hover:text-white transition-all duration-200 font-body"
            >
              {q.length > 40 ? q.slice(0, 40) + "…" : q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative z-10 px-6 pb-6 pt-2 bg-[#050505]/90 backdrop-blur-sm border-t border-white/5">
        <div className="flex items-center gap-3 bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition-colors">
          <Sparkles className="w-4 h-4 text-neutral-600 flex-shrink-0" />
          <input
            ref={inputRef}
            data-testid="copilot-chat-input"
            className="flex-1 bg-transparent text-sm text-white placeholder-neutral-600 outline-none font-body"
            placeholder="Ask about your marketing performance..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={loading}
          />
          <button
            data-testid="copilot-send-button"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-black hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
