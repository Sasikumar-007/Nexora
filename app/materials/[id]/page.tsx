"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import {
  FileText,
  ArrowLeft,
  Sparkles,
  Layers3,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { MOCK_DOCUMENTS } from "@/lib/demo/mock-data";
import { formatFileSize, formatDate } from "@/lib/utils";
import { getStoredDocuments, ExtendedDocumentRecord } from "@/lib/documents/store";

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [doc, setDoc] = useState<ExtendedDocumentRecord>(MOCK_DOCUMENTS[0]);

  useEffect(() => {
    const all = getStoredDocuments();
    const found = all.find((d) => d.id === resolvedParams.id);
    if (found) {
      setDoc(found);
    }
  }, [resolvedParams.id]);

  const extractedSnippet =
    doc.extracted_text ||
    doc.extracted_text_snippet ||
    "Text has been extracted and indexed for AI Q&A, chapter summaries, and practice quizzes.";

  // Split text into representative chunks
  const passages = extractedSnippet
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 30)
    .slice(0, 6);

  const displayPassages =
    passages.length > 0
      ? passages.map((p, idx) => ({
          index: idx + 1,
          pageNumber: Math.min(doc.page_count, idx + 1),
          content: p,
          tokenCount: Math.round(p.length / 4),
          cosineScore: +(0.95 - idx * 0.03).toFixed(3),
        }))
      : [
          {
            index: 1,
            pageNumber: 1,
            content: extractedSnippet,
            tokenCount: Math.round(extractedSnippet.length / 4),
            cosineScore: 0.95,
          },
        ];

  return (
    <AppShell title="Study Material & Passage Analysis">
      <div className="space-y-8">
        <Link
          href="/materials"
          className="inline-flex items-center gap-2 font-mono text-xs text-[#1D156B] hover:text-[#4C4B84] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Study Library
        </Link>

        {/* Document Overview Card */}
        <div className="card-weaviate p-6 sm:p-8 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEDCEF] pb-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#F7F9FD] border border-[#DEDCEF] flex items-center justify-center shrink-0 text-[#1D156B]">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <span className="badge-weaviate-lime font-mono">
                  {doc.is_custom ? "UPLOADED STUDY PDF" : "INDEXED & READY FOR LEARNING"}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[#1D156B] mt-1.5">
                  {doc.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#8396B1] mt-1">
                  <span>{doc.page_count} Pages</span>
                  <span>•</span>
                  <span>{formatFileSize(doc.file_size)}</span>
                  <span>•</span>
                  <span>Ingested {formatDate(doc.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/summaries?docId=${doc.id}`}
                className="btn-weaviate-primary text-xs px-4 py-2 gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#1D156B]" /> Generate Summary
              </Link>
              <Link
                href={`/quizzes?docId=${doc.id}`}
                className="btn-weaviate-secondary text-xs px-4 py-2 gap-1.5"
              >
                <HelpCircle className="h-3.5 w-3.5 text-[#1D156B]" /> Practice Quiz
              </Link>
              <Link
                href={`/chat?docId=${doc.id}`}
                className="btn-weaviate-secondary text-xs px-4 py-2 gap-1.5"
              >
                <MessageSquare className="h-3.5 w-3.5 text-[#1D156B]" /> AI Tutor
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xs font-mono uppercase text-[#8396B1] tracking-wider mb-2 font-semibold">
              Extracted Document Overview
            </h3>
            <p className="text-xs sm:text-sm font-sans text-[#4C4B84] leading-relaxed bg-[#F7F9FD] p-4 rounded-xl border border-[#DEDCEF]">
              {doc.extracted_text_snippet || extractedSnippet.slice(0, 500)}
            </p>
          </div>
        </div>

        {/* Chunks Inspector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-[#1D156B] flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-[#CFDE22]" /> Extracted Study Sections ({displayPassages.length})
            </h2>
            <span className="text-xs font-mono text-[#8396B1]">
              Indexed for AI Tutor & Quizzes
            </span>
          </div>

          <div className="space-y-3">
            {displayPassages.map((chunk) => (
              <div
                key={chunk.index}
                className="card-weaviate p-5 bg-white border border-[#DEDCEF]"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#8396B1] mb-2 pb-2 border-b border-[#DEDCEF]">
                  <span className="font-bold text-[#1D156B]">
                    Section #{chunk.index} — Page {chunk.pageNumber}
                  </span>
                  <span>~{chunk.tokenCount} Tokens</span>
                </div>
                <p className="text-xs sm:text-sm font-sans text-[#4C4B84] leading-relaxed">
                  {chunk.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
