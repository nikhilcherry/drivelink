'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { LogoMark } from './ui/Logo';

interface Message {
  role: 'user' | 'model';
  content: string;
}

// Simple formatter to parse **bold** and `code` inline elements safely
function formatMessage(text: string) {
  if (!text) return '';
  
  // Replace HTML tag brackets to prevent raw injection
  let formatted = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Replace line breaks
  formatted = formatted.replace(/\n/g, '<br />');

  // Replace bold syntax **text** with strong tags
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Replace inline code syntax `text` with code tags
  formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-black/5 text-[#0f4c81] px-1 py-0.5 rounded text-xs font-mono">$1</code>');

  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Hello! I am your DriveLink assistant. How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Whether the last attempt to reach the AI backend succeeded; starts true so
  // we try it first and drop to the local rule engine only after it fails.
  const [aiAvailable, setAiAvailable] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Define scrollToBottom before calling it in useEffect
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Show tooltip callout 3 seconds after mounting
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Dismiss tooltip if user opens the chat
  useEffect(() => {
    if (isOpen) {
      setShowTooltip(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const getLocalResponse = (message: string): string => {
    const query = message.toLowerCase().trim();

    if (
      query.includes("what is drivelink") ||
      query.includes("about drivelink") ||
      query.includes("what does it do") ||
      query.includes("explain drivelink") ||
      query.includes("product") ||
      query.includes("v2v")
    ) {
      return "DriveLink is a decentralized Vehicle-to-Vehicle (V2V) communication protocol for Automotive AI. It acts as a speaking layer that lets cars broadcast intent and predicted motion in under 50ms, helping traffic react before danger appears.";
    }

    if (
      query.includes("team") ||
      query.includes("who is") ||
      query.includes("founder") ||
      query.includes("ceo") ||
      query.includes("cto") ||
      query.includes("hruday") ||
      query.includes("nikhil") ||
      query.includes("krishna") ||
      query.includes("shreyas")
    ) {
      return "DriveLink was founded by Hruday (CEO & Chief Systems Architect), Nikhil (CTO), and Krishna (CPO), with Shreyas as Chief Development Officer. We are mentored by Harish.";
    }

    if (
      query.includes("contact") ||
      query.includes("email") ||
      query.includes("reach") ||
      query.includes("support") ||
      query.includes("talk to") ||
      query.includes("address") ||
      query.includes("get in touch")
    ) {
      return "You can reach the DriveLink team directly at **tech.drivelink@gmail.com**. We'd love to chat!";
    }

    if (
      query.includes("roadmap") ||
      query.includes("milestone") ||
      query.includes("future") ||
      query.includes("next step") ||
      query.includes("progress") ||
      query.includes("plans")
    ) {
      return "Our milestones: Alpha Pilot Program in **Q3 2026**, Decentralized Data Node v1 in **Q4 2026**, DRV Token Protocol Audit in **Q1 2027**, and Cross-OEM Standardization in **November 2027**.";
    }

    if (
      query.includes("traction") ||
      query.includes("award") ||
      query.includes("pitch") ||
      query.includes("win") ||
      query.includes("patent") ||
      query.includes("achievement")
    ) {
      return "DriveLink secured **All India Rank 5** at the IIT Delhi Pitch Arena National Finals, received a **Patent Grant Option** at a national hackathon, and collaborated with NMIT on a working hardware implementation.";
    }

    return "For this technical/complex query, please contact our team directly at tech.drivelink@gmail.com for a perfect response.";
  };

  // Calls our own /api/chat serverless function, which holds the LLM API key
  // server-side. Never call a third-party LLM API directly from the browser —
  // any key passed via NEXT_PUBLIC_* ships in plaintext in the client bundle.
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
        setMessages(prev => [...prev, { role: 'model', content: reply }]);
      } else {
        // Fallback to local rule engine directly
        const reply = getLocalResponse(text);
        // Small delay to simulate thinking
        await new Promise((resolve) => setTimeout(resolve, 600));
        setMessages(prev => [...prev, { role: 'model', content: reply }]);
      }
    } catch (error) {
      console.error("Chatbot query failed, using local matcher:", error);
      setAiAvailable(false);
      const reply = getLocalResponse(text);
      setMessages(prev => [...prev, { role: 'model', content: reply }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickReplies = [
    { text: "What is DriveLink?", query: "What is DriveLink?" },
    { text: "Who is the team?", query: "Who is the team?" },
    { text: "Contact Info", query: "How to contact the team?" },
    { text: "Future Roadmap", query: "What is on the roadmap?" }
  ];

  return (
    <>
      {/* Floating Action Button Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Subtle, non-interruptive tooltip callout notification */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute bottom-16 right-0 mb-2 mr-1 w-56 p-3 rounded-xl border border-zinc-200/80 bg-white text-zinc-800 shadow-xl text-xs leading-snug flex items-start gap-2 pointer-events-auto"
              style={{ filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.05))" }}
            >
              <div className="absolute right-6 -bottom-1.5 w-3 h-3 bg-white border-r border-b border-zinc-200/80 rotate-45" />
              <div className="flex-1">
                Hey! Feel free to ask any questions about DriveLink. 👋
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="text-zinc-400 hover:text-zinc-600 transition-colors p-0.5 rounded cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer text-white shadow-xl focus:outline-none transition-all duration-300",
            isOpen ? "bg-red-500 hover:bg-red-600 shadow-red-500/30" : "bg-[#0f4c81] hover:bg-[#1e60a3] shadow-[#0f4c81]/40"
          )}
          aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
        >
          {/* Pulsing ring matching hero style */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full border-2 border-[#0f4c81] animate-ping opacity-60" style={{ animationDuration: '2s' }} />
          )}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
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
                <LogoMark size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Chat Drawer/Window - Clean White/Light Design */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[540px] z-50 rounded-2xl flex flex-col overflow-hidden border border-zinc-200/80 shadow-2xl bg-white text-zinc-800"
          >
            {/* Blueprint Grid Background inside Chatbox */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.03]" 
              style={{
                backgroundImage: `
                  linear-gradient(to right, #0f4c81 1px, transparent 1px),
                  linear-gradient(to bottom, #0f4c81 1px, transparent 1px)
                `,
                backgroundSize: '24px 24px'
              }}
            />

            {/* Glowing Accent Gradient */}
            <div 
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-2xl pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(15, 76, 129, 0.05) 0%, transparent 70%)'
              }}
            />

            {/* Header */}
            <div className="relative z-10 px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-zinc-50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0F4C81] to-[#2563EB] flex items-center justify-center text-white shadow-md">
                  <LogoMark size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold tracking-tight text-zinc-800">DriveLink Assistant</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                    <span className="text-[10px] text-zinc-500 font-mono">ONLINE</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-500 border border-zinc-200/50 font-mono">
                  {aiAvailable ? 'AI' : 'LOCAL_RULES'}
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="relative z-10 flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col max-w-[80%] space-y-1",
                    message.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className="text-[9px] font-mono text-zinc-400 uppercase px-1">
                    {message.role === 'user' ? 'USER' : 'DRIVELINK_AGENT'}
                  </div>
                  <div
                    className={cn(
                      "px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm",
                      message.role === 'user'
                        ? "bg-[#0f4c81] text-white rounded-tr-none border border-[#3b82f6]/10"
                        : "bg-zinc-100 text-zinc-800 border border-zinc-200/50 rounded-tl-none"
                    )}
                  >
                    {formatMessage(message.content)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex flex-col max-w-[80%] space-y-1 mr-auto items-start">
                  <div className="text-[9px] font-mono text-zinc-400 uppercase px-1">DRIVELINK_AGENT</div>
                  <div className="px-3.5 py-2.5 rounded-2xl text-xs bg-zinc-100 border border-zinc-200/50 rounded-tl-none flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#0f4c81] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#0f4c81] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#0f4c81] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions Suggestions */}
            {messages.length === 1 && (
              <div className="relative z-10 px-5 pb-3">
                <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider mb-2">Suggested Queries:</div>
                <div className="grid grid-cols-2 gap-2">
                  {quickReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(reply.query)}
                      className="px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-[11px] text-zinc-600 hover:text-zinc-800 text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shadow-sm"
                    >
                      {reply.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Footer */}
            <div className="relative z-10 p-4 border-t border-zinc-100 bg-zinc-50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#0f4c81]/40 focus:ring-1 focus:ring-[#0f4c81]/20 transition-all font-sans"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all focus:outline-none",
                    inputValue.trim() && !isLoading
                      ? "bg-[#0f4c81] text-white hover:bg-[#1e60a3] shadow-[#0f4c81]/30 hover:shadow-[#0f4c81]/50 cursor-pointer"
                      : "bg-zinc-100 text-zinc-400 border border-zinc-200/50 cursor-not-allowed"
                  )}
                >
                  <Send size={15} />
                </button>
              </form>
              <div className="text-[9px] text-zinc-400 mt-2 text-center font-mono">
                Powered by DriveLink V2V Infrastructure Portal
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
