'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { LogoMark } from './ui/Logo';
import { formatMessageHtml } from '../lib/chatFormat';

interface Message {
  role: 'user' | 'model';
  content: string;
}

function formatMessage(text: string) {
  if (!text) return '';
  return <span dangerouslySetInnerHTML={{ __html: formatMessageHtml(text) }} />;
}

import { getChatbotResponse } from '../lib/chatbotKnowledge';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Hello! I'm **Lyra**, DriveLink's AI assistant. I can answer questions about our V2V protocol, the 4-layer ecosystem, our team, roadmap, or open engineering roles. How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setIsOpen(false);
      launcherRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowTooltip(false); // eslint-disable-line react-hooks/set-state-in-effect -- dismiss tooltip on open
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const getSmartLocalResponse = (message: string): string => {
    return getChatbotResponse(message).reply;
  };

  const callChatAPI = async (userMessage: string, history: Message[]) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        history: history.slice(-6),
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.reply) {
      throw new Error('No reply returned from chat API');
    }
    return data.reply;
  };

  const handleSendMessage = async (textToSend?: string) => {
    if (isLoading) return;
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    if (!textToSend) {
      setInputValue('');
    }

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      if (aiAvailable) {
        const reply = await callChatAPI(text, newMessages.slice(0, -1));
        setMessages((prev) => [...prev, { role: 'model', content: reply }]);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 350));
        const reply = getSmartLocalResponse(text);
        setMessages((prev) => [...prev, { role: 'model', content: reply }]);
      }
    } catch {
      // Gracefully switch to smart local knowledge base without disruptive error notices
      setAiAvailable(false);
      const reply = getSmartLocalResponse(text);
      setMessages((prev) => [...prev, { role: 'model', content: reply }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActionChips = [
    { label: "⚡ What is DriveLink?", query: "What is DriveLink?" },
    { label: "🌐 Ecosystem Suite", query: "What is the DriveLink ecosystem?" },
    { label: "💼 Careers & Hiring", query: "Are you hiring?" },
    { label: "👥 Founders & Team", query: "Who are the founders?" },
    { label: "🗺️ 2026-2027 Roadmap", query: "What is on the roadmap?" },
    { label: "✉️ Contact Team", query: "How to contact the team?" },
  ];

  return (
    <>
      {/* Floating Action Button Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Subtle, non-interruptive tooltip notification */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute bottom-16 right-0 mb-2 mr-1 w-56 p-3 rounded-xl border border-zinc-200/90 bg-white text-zinc-800 shadow-xl text-xs leading-snug flex items-start gap-2 pointer-events-auto"
              style={{ filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.06))" }}
            >
              <div className="absolute right-6 -bottom-1.5 w-3 h-3 bg-white border-r border-b border-zinc-200/90 rotate-45" />
              <div className="flex-1 font-medium">
                Hey! I&apos;m Lyra. Feel free to ask me anything about DriveLink. 👋
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="text-zinc-400 hover:text-zinc-600 transition-colors p-0.5 rounded cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X size={13} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          ref={launcherRef}
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer text-white shadow-xl focus:outline-none transition-all duration-300",
            // Keep cohesive brand blue theme instead of jarring red
            "bg-[#0f4c81] hover:bg-[#1e60a3] shadow-[#0f4c81]/35 hover:shadow-[#0f4c81]/50 border border-white/20"
          )}
          aria-label={isOpen ? "Close Lyra chat" : "Open Lyra chat"}
        >
          {/* Subtle pulsing beacon matching hero style */}
          {!isOpen && (
            <span
              className="absolute inset-0 rounded-full border-2 border-[#0f4c81] animate-ping opacity-50"
              style={{ animationDuration: '2.5s' }}
            />
          )}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <X size={22} />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <LogoMark size={20} variant="white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Chat Drawer/Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[560px] max-h-[85vh] z-50 rounded-2xl flex flex-col overflow-hidden border border-zinc-200/90 shadow-2xl bg-white text-zinc-800"
            role="dialog"
            aria-labelledby="dlw-chat-title"
            ref={panelRef}
          >
            {/* Header */}
            <div className="relative z-10 px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-zinc-50 via-white to-zinc-50">
              <div className="flex items-center gap-3">
                <LogoMark size={32} className="rounded-lg shadow-sm" />
                <div>
                  <h2 id="dlw-chat-title" className="text-sm font-semibold tracking-tight text-zinc-900 flex items-center gap-1.5">
                    Lyra
                    <Sparkles size={13} className="text-[#0f4c81]" />
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      aria-hidden="true"
                      className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]"
                    />
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {aiAvailable ? 'LYRA AI' : 'KNOWLEDGE ENGINE'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  launcherRef.current?.focus();
                }}
                className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div
              className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent bg-slate-50/30"
              role="log"
              aria-live="polite"
              aria-label="Conversation"
            >
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col max-w-[85%] space-y-1",
                    message.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className="text-[9px] font-mono text-zinc-400 uppercase px-1">
                    {message.role === 'user' ? 'YOU' : 'LYRA'}
                  </div>
                  <div
                    className={cn(
                      "px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs",
                      message.role === 'user'
                        ? "bg-[#0f4c81] text-white rounded-tr-none border border-[#0f4c81]/20 font-normal"
                        : "bg-white text-zinc-800 border border-zinc-200/80 rounded-tl-none font-normal"
                    )}
                  >
                    {formatMessage(message.content)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex flex-col max-w-[85%] space-y-1 mr-auto items-start">
                  <div className="text-[9px] font-mono text-zinc-400 uppercase px-1">LYRA</div>
                  <div className="px-3.5 py-2.5 rounded-2xl text-xs bg-white border border-zinc-200/80 rounded-tl-none flex items-center gap-2">
                    <span className="flex gap-1.5 py-0.5">
                      <span className="w-1.5 h-1.5 bg-[#0f4c81] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#0f4c81] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#0f4c81] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestion Chips */}
            <div className="relative z-10 px-4 py-2 border-t border-zinc-100 bg-white/80 overflow-x-auto flex gap-1.5 no-scrollbar">
              {quickActionChips.map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(chip.query)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-[10.5px] text-zinc-600 hover:text-[#0f4c81] hover:border-[#0f4c81]/30 transition-all cursor-pointer flex-shrink-0"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className="relative z-10 p-3.5 border-t border-zinc-100 bg-zinc-50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  ref={inputRef}
                  maxLength={1000}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Lyra about V2V, Ecosystem, Hiring..."
                  aria-label="Ask Lyra a question"
                  className="flex-1 bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#0f4c81] focus:ring-1 focus:ring-[#0f4c81]/20 transition-all font-sans"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  disabled={isLoading || !inputValue.trim()}
                  className={cn(
                    "w-8.5 h-8.5 rounded-xl flex items-center justify-center transition-all focus:outline-none",
                    inputValue.trim() && !isLoading
                      ? "bg-[#0f4c81] text-white hover:bg-[#1e60a3] shadow-[#0f4c81]/30 cursor-pointer"
                      : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                  )}
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
