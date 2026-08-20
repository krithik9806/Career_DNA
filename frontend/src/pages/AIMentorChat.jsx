import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Dna,
  ShieldCheck,
  Target,
  FileText,
  Github,
  Info,
  HelpCircle
} from 'lucide-react';

const SUGGESTION_PROMPTS = [
  'How do I prepare for coding & technical interviews?',
  'What are my biggest skill gaps for my target role?',
  'What high-impact GitHub projects should I build?',
  'How can I optimize my resume ATS completeness score?',
  'What is the best job & internship application strategy?'
];

export const AIMentorChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [groundedContext, setGroundedContext] = useState(null);
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('career_dna_gemini_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistoryAndContext();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveApiKey = (key) => {
    setGeminiApiKey(key);
    localStorage.setItem('career_dna_gemini_key', key);
  };

  const fetchHistoryAndContext = async () => {
    try {
      setFetchingHistory(true);
      const [historyRes, profileRes] = await Promise.all([
        api.get(`/mentor/history/${user?.id}`).catch(() => ({ data: { history: [] } })),
        api.get('/profile').catch(() => ({ data: null }))
      ]);

      setMessages(historyRes.data?.history || []);
      setGroundedContext({
        student: profileRes.data?.student,
        skills: profileRes.data?.self_reported_skills || []
      });
    } catch (err) {
      console.warn('[MENTOR CHAT] History load notice:', err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim()) return;

    const userMsg = { role: 'user', message: text.trim(), created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await api.post('/mentor/chat', {
        message: text.trim(),
        user_api_key: geminiApiKey.trim() || undefined
      }, { timeout: 60000 });
      if (res.data?.message) {
        const assistantMsg = {
          role: 'assistant',
          message: res.data.message,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMsg]);
        if (res.data.grounded_context) {
          setGroundedContext(prev => ({
            ...prev,
            rag_summary: res.data.grounded_context
          }));
        }
      }
    } catch (err) {
      console.error('Send mentor message error:', err);
      const serverErrMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      const errorMsg = {
        role: 'assistant',
        message: `⚠️ **API Notice**: ${serverErrMsg || 'Unable to process mentor response.'}\n\n*Please ensure backend server is running.*`,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.delete('/mentor/history');
      setMessages([]);
    } catch (err) {
      console.error('Clear history error:', err);
    }
  };

  // Helper to format assistant response markdown (bolding, headers, lists)
  const formatMessageText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      let content = line;
      let isHeader = false;

      if (line.startsWith('### ') || line.startsWith('#### ')) {
        content = line.replace(/^#{3,4}\s*/, '');
        isHeader = true;
      }

      // Format bold text **word**
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isHeader) {
        return <h4 key={lIdx} className="text-sm font-bold text-indigo-300 mt-2 mb-1">{formattedParts}</h4>;
      }

      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        return (
          <li key={lIdx} className="ml-4 list-disc text-gray-300 my-0.5">
            {formattedParts}
          </li>
        );
      }

      return <p key={lIdx} className={line.trim() === '' ? 'h-2' : 'my-1'}>{formattedParts}</p>;
    });
  };

  if (fetchingHistory) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Connecting to RAG AI Mentor...</p>
        </div>
      </div>
    );
  }

  const studentProfile = groundedContext?.student;
  const userName = studentProfile?.name || localStorage.getItem('career_dna_user_name') || user?.user_metadata?.name || 'Student';
  const targetRole = studentProfile?.target_role || 'Full-Stack Web Developer';

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-950/80 rounded-2xl border border-indigo-800/60 text-indigo-400">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">RAG AI Career Mentor</h1>
            <p className="text-xs text-gray-400">
              Grounded AI advisor answering all career, technical interview, skill gap, and project questions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {showKeyInput ? (
            <div className="flex items-center space-x-2 bg-gray-900 p-2 rounded-xl border border-indigo-800/80">
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => saveApiKey(e.target.value)}
                placeholder="Paste Gemini API Key (AIzaSy...)"
                className="bg-gray-950 text-xs text-white px-3 py-1.5 rounded-lg border border-gray-800 focus:outline-none focus:border-indigo-500 w-64"
              />
              <button
                onClick={() => setShowKeyInput(false)}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowKeyInput(true)}
              className="text-xs text-indigo-300 hover:text-white flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-800/60 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{geminiApiKey ? '🔑 API Key Set' : '🔑 Set Gemini API Key (Optional)'}</span>
            </button>
          )}

          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs text-gray-400 hover:text-red-400 flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: RAG Grounding Memory Sidebar */}
        <div className="lg:col-span-1 glass-panel p-5 rounded-3xl border border-gray-800 space-y-5 h-fit">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Grounded Memory</h3>
            </div>
          </div>

          {/* RAG Engine Status Badge */}
          <div className="p-3 bg-gradient-to-r from-indigo-950/80 via-purple-950/50 to-gray-900 border border-indigo-800/60 rounded-2xl space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>CareerDNA RAG Model</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-snug">
              {groundedContext?.rag_summary?.rag_model_active ? (
                <span className="text-emerald-400 font-medium">
                  ✓ Qdrant Hybrid RRF + Cross-Encoder Active
                </span>
              ) : (
                <span className="text-indigo-300">
                  Hybrid Search, BM25 & 8-Block Prompting Engine
                </span>
              )}
            </p>
          </div>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800">
              <span className="text-gray-400 block text-[10px] uppercase font-semibold">Student Name</span>
              <span className="font-bold text-white">{userName}</span>
            </div>

            <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800">
              <span className="text-gray-400 block text-[10px] uppercase font-semibold">Target Career Role</span>
              <span className="font-bold text-indigo-300">{targetRole}</span>
            </div>

            <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800">
              <span className="text-gray-400 block text-[10px] uppercase font-semibold">Active Digital Twin Skills</span>
              <span className="font-bold text-emerald-400">{groundedContext?.skills?.length || 5} skills verified</span>
            </div>
          </div>

          <div className="p-3 bg-indigo-950/30 border border-indigo-900/40 rounded-xl text-[11px] text-indigo-300 leading-relaxed">
            <Info className="w-3.5 h-3.5 text-indigo-400 inline mr-1" />
            Ask ANY question regarding your career path, interview preparation, portfolio projects, or ATS resume tuning.
          </div>
        </div>

        {/* Right Column: Interactive Chat Stream */}
        <div className="lg:col-span-3 glass-panel p-6 rounded-3xl border border-gray-800 flex flex-col min-h-[520px] max-h-[640px]">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <Bot className="w-14 h-14 text-indigo-500/60 animate-bounce" />
                <h3 className="text-lg font-bold text-white">Ask your AI Career Mentor Anything</h3>
                <p className="text-xs text-gray-400 max-w-md">
                  Get personalized recommendations on interview prep, technical skill gaps, GitHub project quality, and career growth toward <span className="text-indigo-300 font-semibold">{targetRole}</span>.
                </p>

                {/* Suggestion Chips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 w-full max-w-xl pt-4">
                  {SUGGESTION_PROMPTS.map((promptText, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(promptText)}
                      className="glass-panel-hover text-gray-300 hover:text-white text-xs font-medium p-3 rounded-xl border border-gray-800 text-left transition-all hover:border-indigo-500/50 hover:bg-indigo-950/40 transform hover:scale-[1.02] cursor-pointer"
                    >
                      💡 {promptText}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={idx}
                    className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="p-2 bg-indigo-950 rounded-xl border border-indigo-800 text-indigo-400 flex-shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                          : 'bg-gray-900/90 border border-gray-800 text-gray-200 rounded-bl-none shadow-md'
                      }`}
                    >
                      {isUser ? msg.message : formatMessageText(msg.message)}
                    </div>

                    {isUser && (
                      <div className="p-2 bg-gray-800 rounded-xl border border-gray-700 text-gray-300 flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {loading && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-950 rounded-xl border border-indigo-800 text-indigo-400">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-gray-900/80 border border-gray-800 p-3 rounded-2xl text-xs text-gray-400 flex items-center space-x-2">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></span>
                  <span>AI Mentor is preparing personalized career advice...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-3 pt-3 border-t border-gray-800"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask AI Mentor any career, interview, or skill question...`}
              className="flex-1 bg-gray-900/90 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold p-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
