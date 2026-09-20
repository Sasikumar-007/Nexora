"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  Sparkles,
  Copy,
  Check,
  ListOrdered,
  AlertCircle,
  RefreshCw,
  FileText,
  BookOpen,
} from "lucide-react";
import { MOCK_DOCUMENTS } from "@/lib/demo/mock-data";
import {
  getStoredDocuments,
  getStoredDocumentById,
  ExtendedDocumentRecord,
} from "@/lib/documents/store";

interface SummaryData {
  title: string;
  format: string;
  keyPoints: string[];
  detailedSummary: string;
  coreConcepts: Array<{ name: string; description: string }>;
}

function SummariesContent() {
  const searchParams = useSearchParams();
  const urlDocId = searchParams.get("docId");

  const [documents, setDocuments] = useState<ExtendedDocumentRecord[]>(MOCK_DOCUMENTS);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [summaryFormat, setSummaryFormat] = useState<
    "chapter" | "topic" | "short" | "detailed" | "key_points" | "concepts"
  >("detailed");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [summaryData, setSummaryData] = useState<SummaryData>({
    title: "Comprehensive Study Summary: Data Structures & Algorithms",
    format: "detailed",
    keyPoints: [
      "Asymptotic analysis classifies algorithm growth rates as n → ∞; worst-case Big-O guarantees safety bounds.",
      "Balanced search trees (AVL/Red-Black) maintain O(log n) performance through local rotations upon insertion/deletion.",
      "Dynamic programming reduces exponential recursive complexity to polynomial bounds via memoization and optimal substructure.",
      "Graph shortest-path problems require non-negative weights for Dijkstra's algorithm (O((V+E)log V)); Bellman-Ford accommodates negative cycles.",
    ],
    detailedSummary:
      "This document provides a systematic review of computational complexity and fundamental data structures. Core emphasis is placed on the trade-offs between memory footprints and operation latency. In typical competitive or board examinations, algorithms must be selected according to input size constraints and edge case vulnerabilities.",
    coreConcepts: [
      {
        name: "Big-O Notation",
        description: "Upper bound asymptotic runtime behavior ignoring constant scaling factors.",
      },
      {
        name: "Memoization",
        description: "Caching intermediate subproblem solutions to prevent redundant recalculation.",
      },
      {
        name: "Min-Heap Invariant",
        description: "Every parent node is less than or equal to its child nodes, enabling O(1) minimum retrieval.",
      },
    ],
  });

  // Load documents and handle initial selection
  useEffect(() => {
    const allDocs = getStoredDocuments();
    setDocuments(allDocs);

    const targetId = urlDocId && allDocs.some((d) => d.id === urlDocId)
      ? urlDocId
      : allDocs[0]?.id || "";

    setSelectedDocId(targetId);

    // If a specific document was passed in URL and it's a custom uploaded document, auto-generate!
    if (targetId) {
      const doc = allDocs.find((d) => d.id === targetId);
      if (doc && (doc.is_custom || urlDocId)) {
        // Check cache first
        const cacheKey = `nexora_summary_${targetId}_${summaryFormat}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            setSummaryData(JSON.parse(cached));
            return;
          } catch {}
        }
        triggerGeneration(doc, summaryFormat);
      }
    }
  }, [urlDocId]);

  const triggerGeneration = async (
    doc: ExtendedDocumentRecord,
    format: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const textToUse = doc.extracted_text || doc.extracted_text_snippet || "";
      const res = await fetch("/api/summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: doc.title,
          format: format,
          text: textToUse,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate summary");
      }

      if (data.summary) {
        const newSummary: SummaryData = {
          title: data.summary.title || `${doc.title} — Summary`,
          format: format,
          keyPoints: data.summary.keyPoints || [],
          detailedSummary: data.summary.detailedSummary || "",
          coreConcepts: data.summary.coreConcepts || [],
        };
        setSummaryData(newSummary);

        // Cache result
        try {
          localStorage.setItem(
            `nexora_summary_${doc.id}_${format}`,
            JSON.stringify(newSummary)
          );
        } catch {}
      }
    } catch (err: any) {
      console.error("Summary generation error:", err);
      setError(err.message || "Failed to connect to AI summary service.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualGenerate = () => {
    const doc = documents.find((d) => d.id === selectedDocId);
    if (!doc) return;
    triggerGeneration(doc, summaryFormat);
  };

  const handleCopy = () => {
    const textToCopy = `${summaryData.title}\n\nKEY POINTS:\n${summaryData.keyPoints
      .map((p, i) => `${i + 1}. ${p}`)
      .join("\n")}\n\nDETAILED SUMMARY:\n${summaryData.detailedSummary}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentDoc = documents.find((d) => d.id === selectedDocId);

  return (
    <AppShell title="AI Study Summaries & Revision Notes">
      <div className="space-y-8">
        {/* Generator Controls Card */}
        <div className="card-weaviate p-6 sm:p-8 bg-white">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[#1D156B]">
              Generate High-Yield Revision Summaries
            </h2>
            {currentDoc?.is_custom && (
              <span className="badge-weaviate-lime font-mono">
                CURRENT UPLOADED PDF
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#4C4B84] mb-6">
            Synthesize entire chapters, extract core definitions, or generate quick bullet points before exams.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#8396B1] mb-2">
                Select Study Document
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setSelectedDocId(newId);
                  const doc = documents.find((d) => d.id === newId);
                  if (doc) triggerGeneration(doc, summaryFormat);
                }}
                className="w-full rounded-xl border border-[#DEDCEF] bg-white p-3 text-xs sm:text-sm font-medium text-[#1D156B] focus:outline-none focus:border-[#1D156B]"
              >
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.is_custom ? "📄 [Uploaded] " : "📚 "}
                    {doc.title} ({doc.page_count} pages)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#8396B1] mb-2">
                Summary Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "detailed", label: "Detailed" },
                  { id: "key_points", label: "Key Points" },
                  { id: "short", label: "Executive" },
                  { id: "chapter", label: "Chapter" },
                  { id: "concepts", label: "Concepts" },
                  { id: "topic", label: "Topic" },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => {
                      setSummaryFormat(fmt.id as any);
                      if (currentDoc) triggerGeneration(currentDoc, fmt.id);
                    }}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      summaryFormat === fmt.id
                        ? "bg-[#1D156B] text-white border-[#1D156B] shadow-glow-ink"
                        : "bg-white text-[#4C4B84] border-[#DEDCEF] hover:bg-[#F7F9FD]"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleManualGenerate}
              disabled={loading || !currentDoc}
              className="btn-weaviate-primary text-xs px-6 py-2.5 disabled:opacity-50 gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[#1D156B]" />
                  <span>Synthesizing Summary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[#1D156B]" />
                  <span>Re-Generate AI Summary</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Indicator for Document */}
        {loading && (
          <div className="card-weaviate p-8 bg-[#DCF090]/20 border-2 border-[#CFDE22] text-center space-y-3 animate-pulse">
            <div className="h-10 w-10 mx-auto rounded-xl bg-[#1D156B] text-[#CFDE22] flex items-center justify-center shadow-glow-ink">
              <RefreshCw className="h-5 w-5 animate-spin" />
            </div>
            <h3 className="font-bold font-display text-base text-[#1D156B]">
              Generating Summary for: {currentDoc?.title || "Document"}
            </h3>
            <p className="text-xs text-[#4C4B84] max-w-md mx-auto">
              Reading extracted pages, synthesizing core theorems, and formatting high-yield revision bullet points...
            </p>
          </div>
        )}

        {/* Summary Output Display */}
        <div className="card-weaviate p-6 sm:p-8 bg-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEDCEF] pb-4">
            <div>
              <span className="badge-weaviate-lime font-mono">
                {summaryData.format.toUpperCase()} SYNTHESIS
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-[#1D156B] mt-2">
                {summaryData.title}
              </h3>
              {currentDoc && (
                <p className="text-xs font-mono text-[#8396B1] mt-1 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[#CFDE22]" /> Source: {currentDoc.title}
                </p>
              )}
            </div>

            <button
              onClick={handleCopy}
              className="btn-weaviate-secondary text-xs px-4 py-2 self-start sm:self-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#1D156B]" /> Copied to Clipboard
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Summary
                </>
              )}
            </button>
          </div>

          {/* Key Points */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-[#8396B1] mb-3 flex items-center gap-1.5">
              <ListOrdered className="h-4 w-4 text-[#CFDE22]" /> High-Yield Key Points
            </h4>
            <div className="space-y-2.5">
              {summaryData.keyPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-xl border border-[#DEDCEF] bg-[#F7F9FD] p-3.5"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-[#1D156B] text-[#CFDE22] font-mono text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-sans text-[#1D156B] leading-relaxed">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Summary */}
          {summaryData.detailedSummary && (
            <div>
              <h4 className="text-xs font-mono font-bold uppercase text-[#8396B1] mb-2">
                Comprehensive Synthesis
              </h4>
              <p className="text-xs sm:text-sm font-sans text-[#4C4B84] leading-relaxed bg-[#F7F9FD] p-5 rounded-2xl border border-[#DEDCEF]">
                {summaryData.detailedSummary}
              </p>
            </div>
          )}

          {/* Core Concepts */}
          {summaryData.coreConcepts && summaryData.coreConcepts.length > 0 && (
            <div>
              <h4 className="text-xs font-mono font-bold uppercase text-[#8396B1] mb-3">
                Crucial Exam Concepts
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {summaryData.coreConcepts.map((c, i) => (
                  <div
                    key={i}
                    className="card-weaviate p-4 bg-white border border-[#DEDCEF]"
                  >
                    <div className="font-bold font-display text-sm text-[#1D156B] mb-1">
                      {c.name}
                    </div>
                    <p className="text-xs text-[#4C4B84] leading-relaxed font-sans">
                      {c.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function SummariesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center font-mono text-xs">
          Loading Summaries...
        </div>
      }
    >
      <SummariesContent />
    </Suspense>
  );
}
