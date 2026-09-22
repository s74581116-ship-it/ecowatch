import { useState } from 'react';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import { EnvironmentalReport } from '../types';
import { queryAdminAssistant } from '../services/aiService';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AdminAssistantViewProps {
  reports: EnvironmentalReport[];
}

export default function AdminAssistantView({ reports }: AdminAssistantViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello Officer, I am your **EcoWatch AI Environmental Assistant**.\n\nI have real-time access to the active database of **${reports.length}** logged incident reports.\n\nYou can ask me to filter critical hazards, summarize daily activity, identify geographic clusters, or report status tallies.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    'Show all critical issues',
    "Summarize today's reports",
    'How many reports are pending?',
    'Which categories have the most reports?',
    'List all unresolved water pollution cases',
  ];

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const answer = await queryAdminAssistant(q, reports);

      const botMsg: Message = {
        id: 'msg-bot-' + Date.now(),
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: Message = {
        id: 'msg-err-' + Date.now(),
        sender: 'assistant',
        text: 'Network communication error with AI engine. Please verify connectivity.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="admin-assistant-view" className="w-full max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE5DE]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2F7D4A]">
            INTELLIGENT REGISTRY QUERY
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17201B] tracking-tight mt-1 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#2F7D4A]" />
            AI Environmental Assistant
          </h1>
          <p className="text-xs sm:text-sm text-[#65736A] mt-1">
            Grounded in your live database of {reports.length} citizen incident reports.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-[#EAF4EC] border border-[#DCE5DE] text-xs font-bold text-[#174A35]">
          Gemini AI Powered
        </div>
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#65736A] block">
          SUGGESTED QUERIES:
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="text-xs font-medium px-3.5 py-1.5 rounded-xl border border-[#DCE5DE] bg-white hover:bg-[#EAF4EC] hover:border-[#2F7D4A] text-[#17201B] transition-all cursor-pointer text-left shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread */}
      <div className="bg-white rounded-2xl border border-[#DCE5DE] shadow-xs flex flex-col h-[520px] overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs sm:text-sm ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-[#EAF4EC] text-[#174A35] flex items-center justify-center shrink-0 mt-0.5 border border-[#DCE5DE]">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#174A35] text-white font-medium shadow-2xs'
                    : 'bg-[#F7F9F5] text-[#17201B] border border-[#DCE5DE] shadow-2xs'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-[#DCE5DE]/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF4EC] text-[#174A35]">
                      AI Response
                    </span>
                  </div>
                )}
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                <span
                  className={`block text-[10px] mt-2 font-mono ${
                    msg.sender === 'user' ? 'text-white/70 text-right' : 'text-[#65736A]'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-[#2F7D4A] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-[#65736A] italic">
              <div className="w-8 h-8 rounded-xl bg-[#EAF4EC] text-[#174A35] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F7F9F5] border border-[#DCE5DE] flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#174A35]" />
                <span>Consulting live environmental incident records...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#DCE5DE] bg-[#F7F9F5]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="admin-assistant-query-input"
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about reports, categories, locations, or unresolved emergency hazards..."
              className="flex-1 px-4 py-3 text-xs sm:text-sm bg-white border border-[#DCE5DE] rounded-xl text-[#17201B] placeholder-[#65736A]/50 focus:border-[#174A35] focus:ring-2 focus:ring-[#65B86E]/20 focus:outline-none transition-all"
            />
            <button
              id="btn-admin-assistant-send"
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-5 py-3 rounded-xl bg-[#174A35] hover:bg-[#236448] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
