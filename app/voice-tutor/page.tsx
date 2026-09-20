"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  Radio,
  Binary,
  BookOpen,
  Send,
  RotateCcw,
} from "lucide-react";
import {
  getStoredDocuments,
  ExtendedDocumentRecord,
} from "@/lib/documents/store";

function VoiceTutorContent() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get("docId") || "";

  const [documents, setDocuments] = useState<ExtendedDocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [response, setResponse] = useState(
    "Hello! I am your AI Voice Tutor. Click the button below and speak your question aloud, or select an uploaded study document and type your question. I will formulate a clear explanation and speak the solution to you step-by-step."
  );
  const [history, setHistory] = useState<
    Array<{ speaker: "user" | "tutor"; text: string }>
  >([]);

  const recognitionRef = useRef<any>(null);

  // Load documents
  useEffect(() => {
    const docs = getStoredDocuments();
    setDocuments(docs);
    if (initialDocId) {
      setSelectedDocId(initialDocId);
      const found = docs.find((d) => d.id === initialDocId);
      if (found) {
        setResponse(
          `Voice agent loaded with "${found.title}". Ask me any question aloud or type below to hear an explanation from your notes.`
        );
      }
    }
  }, [initialDocId]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join("");
        setTranscript(text);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        "Web Speech recognition is not supported in this browser or mic permissions were denied. You can also type your question directly below to hear the voice tutor speak!"
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript("");
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Start recognition error:", err);
      }
    }
  };

  const cleanTextForSpeech = (raw: string) => {
    return raw
      .replace(/#{1,6}\s*/g, "") // headings
      .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
      .replace(/\*([^*]+)\*/g, "$1") // italic
      .replace(/`([^`]+)`/g, "$1") // code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
      .replace(/[-*•]\s+/g, "") // bullets
      .replace(/\n+/g, ". ") // line breaks as pauses
      .trim();
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const readableText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(readableText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const submitQuestion = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isLoading) return;

    setHistory((prev) => [...prev, { speaker: "user", text: q }]);
    setTranscript("");
    setTextInput("");
    setIsLoading(true);

    try {
      const selectedDoc = documents.find((d) => d.id === selectedDocId);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: q }],
          mode: selectedDoc ? "rag" : "general",
          documentId: selectedDoc?.id,
          documentTitle: selectedDoc?.title,
          documentText: selectedDoc?.extracted_text || selectedDoc?.extracted_text_snippet,
        }),
      });

      const data = await res.json();
      const reply = data.content || "I have formulated an academic explanation for your query.";
      setResponse(reply);
      setHistory((prev) => [...prev, { speaker: "tutor", text: reply }]);

      speakText(reply);
    } catch (err: any) {
      const errReply = "I encountered an error formulating the answer. Please try again.";
      setResponse(errReply);
      speakText(errReply);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = () => {
    if (transcript.trim()) {
      submitQuestion(transcript);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      submitQuestion(textInput);
    }
  };

  return (
    <AppShell title="AI Voice Tutor & Audio Learning">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Document Context Selector */}
        {documents.length > 0 && (
          <div className="card-weaviate p-3.5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#CFDE22] shrink-0" />
              <span className="text-xs font-mono font-bold text-[#1D156B]">
                Study Material Focus:
              </span>
            </div>
            <select
              value={selectedDocId}
              onChange={(e) => {
                setSelectedDocId(e.target.value);
                const doc = documents.find((d) => d.id === e.target.value);
                if (doc) {
                  setResponse(`Voice tutor connected to "${doc.title}". Ask any question to listen to answers from this document.`);
                } else {
                  setResponse("Voice tutor active on all general syllabus topics. Click Push to Speak or type below.");
                }
              }}
              className="w-full sm:w-auto rounded-xl border border-[#DEDCEF] bg-white px-3 py-1.5 text-xs font-mono text-[#1D156B] focus:outline-none focus:border-[#1D156B]"
            >
              <option value="">General Academic Syllabus (All Topics)</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  📄 {d.title} ({d.page_count}p)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tutor Visualizer Sphere */}
        <div className="card-weaviate p-8 sm:p-12 text-center bg-white">
          <div className="mx-auto flex flex-col items-center justify-center">
            {/* Visualizer Orb */}
            <div
              className={`relative flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center rounded-full transition-all duration-300 border ${
                isListening
                  ? "bg-red-500 text-white animate-pulse scale-105 border-red-600 shadow-lg"
                  : isSpeaking
                  ? "bg-[#1D156B] text-[#CFDE22] animate-bounce border-[#372E8A] shadow-glow-lime"
                  : "bg-[#F7F9FD] text-[#1D156B] border-[#DEDCEF] shadow-card-weaviate"
              }`}
            >
              {isListening ? (
                <Radio className="h-14 w-14 text-white animate-spin" />
              ) : isSpeaking ? (
                <Volume2 className="h-14 w-14 text-[#CFDE22]" />
              ) : (
                <Mic className="h-14 w-14 text-[#1D156B]" />
              )}
            </div>

            <div className="mt-6">
              <span className="badge-weaviate-lime font-mono">
                {isListening
                  ? "LISTENING TO YOUR SPEECH..."
                  : isSpeaking
                  ? "AUDIO VERBALIZING..."
                  : isLoading
                  ? "SYNTHESIZING ANSWER..."
                  : "STANDBY // READY TO SPEAK"}
              </span>
            </div>

            {/* Transcript Preview */}
            {transcript && (
              <div className="mt-4 p-3 bg-[#F7F9FD] rounded-xl border border-[#DEDCEF] max-w-lg text-xs sm:text-sm font-mono text-[#1D156B]">
                &ldquo;{transcript}&rdquo;
              </div>
            )}

            {/* Voice Controls */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={toggleListening}
                className={`btn-weaviate-primary px-7 py-3 text-sm flex items-center gap-2 ${
                  isListening ? "!bg-red-500 !border-red-600 !text-white hover:!bg-red-600" : ""
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4" /> Stop & Speak
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" /> Push to Speak
                  </>
                )}
              </button>

              {transcript && (
                <button
                  onClick={handleAskQuestion}
                  disabled={isLoading}
                  className="btn-weaviate-dark px-6 py-3 text-xs sm:text-sm gap-1.5"
                >
                  <Sparkles className="h-4 w-4 text-[#CFDE22]" /> Send Query
                </button>
              )}

              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="btn-weaviate-secondary px-5 py-3 text-xs"
                >
                  <VolumeX className="h-4 w-4" /> Stop Audio
                </button>
              )}
            </div>

            {/* Text Input Fallback (Works in any browser or quiet room) */}
            <form
              onSubmit={handleTextSubmit}
              className="mt-8 w-full max-w-lg flex items-center gap-2 bg-[#F7F9FD] p-2 rounded-2xl border border-[#DEDCEF]"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Or type a question to hear audio answer..."
                className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-[#1D156B] placeholder-[#8396B1] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !textInput.trim()}
                className="btn-weaviate-primary text-xs px-4 py-2 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ask & Listen</span>
              </button>
            </form>
          </div>
        </div>

        {/* Current Voice Answer Display */}
        <div className="card-weaviate p-6 sm:p-8 bg-[#F7F9FD]">
          <div className="flex items-center justify-between border-b border-[#DEDCEF] pb-3 mb-4">
            <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase text-[#8396B1]">
              <Bot className="h-4 w-4 text-[#1D156B]" /> AI Tutor Verbal Answer
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => speakText(response)}
                disabled={isSpeaking}
                className="text-xs font-mono text-[#1D156B] hover:underline flex items-center gap-1 font-bold disabled:opacity-50"
              >
                <Volume2 className="h-3.5 w-3.5" /> Replay Voice
              </button>
            </div>
          </div>
          <p className="text-xs sm:text-sm font-sans text-[#1D156B] leading-relaxed whitespace-pre-wrap">
            {response}
          </p>
        </div>

        {/* Conversation History */}
        {history.length > 0 && (
          <div className="card-weaviate p-6 bg-white space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#8396B1]">
              Voice Session History
            </h4>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs sm:text-sm ${
                    h.speaker === "user"
                      ? "bg-[#1D156B] text-white ml-6"
                      : "bg-[#F7F9FD] border border-[#DEDCEF] text-[#1D156B] mr-6"
                  }`}
                >
                  <span className="font-bold block mb-1 font-mono text-[10px] opacity-75">
                    {h.speaker === "user" ? "YOU" : "AI TUTOR"}
                  </span>
                  <p className="whitespace-pre-wrap">{h.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function VoiceTutorPage() {
  return (
    <Suspense
      fallback={
        <AppShell title="AI Voice Tutor & Audio Learning">
          <div className="p-8 text-center text-sm font-mono text-[#8396B1]">
            Connecting voice tutor...
          </div>
        </AppShell>
      }
    >
      <VoiceTutorContent />
    </Suspense>
  );
}
