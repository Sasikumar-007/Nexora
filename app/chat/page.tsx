"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  Send,
  Sparkles,
  Bot,
  User,
  BookOpen,
  RotateCcw,
  Mic,
  MicOff,
  Copy,
  Check,
  Binary,
  Database,
  ExternalLink,
} from "lucide-react";
import { MOCK_DOCUMENTS } from "@/lib/demo/mock-data";
import { ChatMessagePayload } from "@/types/ai";
import {
  getStoredDocuments,
  ExtendedDocumentRecord,
} from "@/lib/documents/store";

interface ExtendedMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Array<{
    documentId: string;
    pageNumber: number;
    snippet: string;
  }>;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get("docId") || "";

  const [documents, setDocuments] = useState<ExtendedDocumentRecord[]>(MOCK_DOCUMENTS);
  const [mode, setMode] = useState<"general" | "rag">(
    initialDocId ? "rag" : "general"
  );
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const allDocs = getStoredDocuments();
    setDocuments(allDocs);
    if (initialDocId) {
      setSelectedDocId(initialDocId);
      setMode("rag");
      const found = allDocs.find((d) => d.id === initialDocId);
      if (found) {
        setMessages([
          {
            id: "m-init-doc",
            role: "assistant",
            content: `Hello! I have loaded your study document **"${found.title}"** (${found.page_count} pages). You can ask me any question, ask for step-by-step problem derivations, or request exam review on this topic!`,
          },
        ]);
      }
    }
  }, [initialDocId]);

  const [messages, setMessages] = useState<ExtendedMessage[]>([
    {
      id: "m-1",
      role: "assistant",
      content:
        "Hello! I am your **AI Learning Companion**. You can ask me to explain any difficult concept, break down a problem step-by-step, or query your uploaded course PDFs to get exact page citations from your syllabus. What topic would you like to master today?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");

    const newMsg: ExtendedMessage = {
      id: "u-" + Date.now(),
      role: "user",
      content: userText,
    };

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const payloadMessages: ChatMessagePayload[] = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userText },
      ];

      const selectedDoc = documents.find((d) => d.id === selectedDocId);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          mode,
          documentId: mode === "rag" ? selectedDocId : undefined,
          documentTitle: mode === "rag" ? selectedDoc?.title : undefined,
          documentText: mode === "rag" ? (selectedDoc?.extracted_text || selectedDoc?.extracted_text_snippet) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate reply");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: "a-" + Date.now(),
          role: "assistant",
          content: data.content,
          citations: data.citations,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: `⚠️ System Note: ${err.message || "Could not connect to AI service. Simulation active."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Voice speech-to-text integration
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? prev + " " + transcript : transcript));
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  return (
    <AppShell title="AI Study Tutor & Document Q&A">
      <div className="flex flex-col h-[calc(100vh-10rem)] card-weaviate overflow-hidden bg-white">
        {/* Tutor Topbar & Mode Switcher */}
        <div className="border-b border-[#DEDCEF] bg-[#F7F9FD] px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode("general")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                mode === "general"
                  ? "bg-[#1D156B] text-white shadow-glow-ink"
                  : "bg-white text-[#4C4B84] border border-[#DEDCEF] hover:bg-[#F7F9FD]"
              }`}
            >
              General AI Tutor
            </button>
            <button
              onClick={() => setMode("rag")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === "rag"
                  ? "bg-[#CFDE22] text-[#1D156B] border border-[#B8C816] shadow-glow-lime-sm"
                  : "bg-white text-[#4C4B84] border border-[#DEDCEF] hover:bg-[#F7F9FD]"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              PDF Study Q&A Mode
            </button>
          </div>

          {mode === "rag" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#8396B1]">Syllabus:</span>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="rounded-xl border border-[#DEDCEF] bg-white px-3 py-1 text-xs font-medium text-[#1D156B] focus:outline-none"
              >
                <option value="">All Uploaded Documents</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.is_custom ? "📄 [Uploaded] " : "📚 "}
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() =>
              setMessages([
                {
                  id: "m-reset",
                  role: "assistant",
                  content: "New session started. What concept or problem are we exploring?",
                },
              ])
            }
            className="text-xs font-mono text-[#8396B1] hover:text-[#1D156B] flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F7F9FD]/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.role === "user" ? "ml-auto justify-end" : ""
              }`}
            >
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-xl bg-[#1D156B] text-[#CFDE22] flex items-center justify-center shrink-0 shadow-glow-ink">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`rounded-2xl p-4 sm:p-5 border ${
                  msg.role === "user"
                    ? "bg-[#1D156B] text-white border-[#1D156B] shadow-glow-ink"
                    : "bg-white text-[#1D156B] border-[#DEDCEF] shadow-card-weaviate"
                }`}
              >
                <div className="text-sm font-sans leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* Citations / Sources Drawer */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#DEDCEF] space-y-2">
                    <div className="text-xs font-mono font-bold text-[#8396B1] uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-[#CFDE22]" /> Grounded Ingested Sources:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((c, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-[#DEDCEF] bg-[#F7F9FD] p-2.5 text-xs font-mono"
                        >
                          <div className="font-bold text-[#1D156B] mb-1 flex items-center justify-between">
                            <span>📄 Page {c.pageNumber}</span>
                            <span className="text-[10px] bg-[#DCF090] text-[#1D156B] px-1.5 py-0.2 rounded font-bold">
                              COSINE MATCH
                            </span>
                          </div>
                          <p className="text-[#4C4B84] text-[11px] leading-tight line-clamp-2">
                            &ldquo;{c.snippet}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {msg.role === "assistant" && (
                  <div className="mt-3 flex items-center justify-end gap-2 text-xs">
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="p-1 rounded text-[#8396B1] hover:text-[#1D156B] transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3.5 w-3.5 text-[#1D156B]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="h-8 w-8 rounded-xl bg-white border border-[#DEDCEF] flex items-center justify-center shrink-0 text-[#1D156B]">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-2xl">
              <div className="h-8 w-8 rounded-xl bg-[#DCF090] text-[#1D156B] flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-[#1D156B] animate-spin" />
              </div>
              <div className="card-weaviate p-4 bg-white flex items-center gap-2">
                <span className="text-xs font-mono text-[#8396B1]">
                  Retrieving embeddings & synthesizing answer...
                </span>
                <span className="text-xs font-mono text-[#1D156B] animate-pulse">● ● ●</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-[#DEDCEF] bg-white p-4">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all ${
                isListening
                  ? "bg-red-500 text-white animate-pulse border-red-600"
                  : "bg-[#F7F9FD] border-[#DEDCEF] text-[#1D156B] hover:bg-[#DCF090]/40"
              }`}
              title={isListening ? "Listening... click to stop" : "Voice question"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-[#1D156B]" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "rag"
                  ? "Ask any question from your uploaded study PDFs..."
                  : "Ask AI tutor to explain any theorem, solve an equation..."
              }
              className="flex-1 rounded-full border border-[#DEDCEF] bg-[#F7F9FD] px-5 py-3 text-xs font-sans text-[#1D156B] focus:outline-none focus:border-[#1D156B]"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-[#CFDE22] text-[#1D156B] border border-[#B8C816] shadow-glow-lime-sm hover:bg-[#D8E633] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="h-4 w-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center font-mono text-xs">
          Loading AI Study Tutor...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
