"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  Scan,
  Eye,
  Trash2,
  Binary,
  Database,
  CheckCircle2,
  BookOpen,
  Sparkles,
  HelpCircle,
  Layers,
  MessageSquare,
} from "lucide-react";
import { MOCK_DOCUMENTS } from "@/lib/demo/mock-data";
import { DocumentRecord } from "@/types/database";
import { formatFileSize } from "@/lib/utils";
import {
  getStoredDocuments,
  saveUploadedDocument,
  deleteStoredDocument,
  ExtendedDocumentRecord,
} from "@/lib/documents/store";

export default function MaterialsPage() {
  const [documents, setDocuments] = useState<ExtendedDocumentRecord[]>(MOCK_DOCUMENTS);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [justUploadedDoc, setJustUploadedDoc] = useState<ExtendedDocumentRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDocuments(getStoredDocuments());
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Only PDF files are supported.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage("File size exceeds 20MB limit.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setJustUploadedDoc(null);
    setUploadStatus("Ingesting study PDF...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadStatus("Extracting text and running OCR on scanned pages...");

      const res = await fetch("/api/documents/process", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to process document");
      }

      setUploadStatus("Extracting chapters and indexing pages for AI learning...");

      const newDoc: ExtendedDocumentRecord = {
        id: data.document.id,
        user_id: "user-demo-123",
        title: data.document.title,
        storage_path: `materials/${data.document.title}`,
        file_size: data.document.file_size,
        mime_type: "application/pdf",
        page_count: data.document.page_count,
        processing_status: "completed",
        extracted_text_snippet: data.document.extracted_text_snippet,
        extracted_text: data.document.extracted_text,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_custom: true,
      };

      const updated = saveUploadedDocument(newDoc);
      setDocuments(updated);
      setJustUploadedDoc(newDoc);
      setUploadStatus("Study PDF ready for learning!");
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus(null);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "Upload failed");
      setIsUploading(false);
      setUploadStatus(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = (id: string) => {
    const updated = deleteStoredDocument(id);
    setDocuments(updated.length > 0 ? updated : MOCK_DOCUMENTS.filter((d) => d.id !== id));
    if (justUploadedDoc?.id === id) setJustUploadedDoc(null);
  };

  return (
    <AppShell title="Course Materials & PDF Upload">
      <div className="space-y-8">
        {/* Top Header Information */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-display text-[#1D156B] tracking-tight">
              Uploaded Textbooks & Study Materials
            </h2>
            <p className="text-xs sm:text-sm text-[#4C4B84] mt-1">
              Upload your course syllabus, lecture slides, or scanned notes (up to 20MB). AI extracts the text and generates instant Q&A, summaries, and flashcards.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DEDCEF] bg-white px-3.5 py-1.5 text-xs font-mono text-[#1D156B]">
            <Scan className="h-4 w-4 text-[#CFDE22]" /> Max 20 MB / Document
          </div>
        </div>

        {/* Upload Success Quick Action Banner */}
        {justUploadedDoc && (
          <div className="card-weaviate p-6 bg-[#DCF090]/30 border-2 border-[#CFDE22] animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#1D156B] text-[#CFDE22] flex items-center justify-center shrink-0 shadow-glow-ink">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge-weaviate-ink font-mono">JUST UPLOADED</span>
                    <h3 className="font-bold font-display text-base text-[#1D156B]">
                      {justUploadedDoc.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#4C4B84] mt-0.5">
                    Text extracted ({justUploadedDoc.page_count} pages). What would you like to do with this document?
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/summaries?docId=${justUploadedDoc.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1D156B] text-white text-xs font-bold shadow-glow-ink hover:bg-[#2A237E] transition-all"
                >
                  <FileText className="h-3.5 w-3.5 text-[#CFDE22]" /> Generate Summary
                </Link>
                <Link
                  href={`/quizzes?docId=${justUploadedDoc.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CFDE22] text-[#1D156B] text-xs font-bold border border-[#B8C816] shadow-glow-lime-sm hover:bg-[#D8E633] transition-all"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-[#1D156B]" /> Practice Quiz
                </Link>
                <Link
                  href={`/chat?docId=${justUploadedDoc.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#1D156B] text-xs font-bold border border-[#DEDCEF] hover:bg-[#F7F9FD] transition-all"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-[#CFDE22]" /> AI Tutor Chat
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Drag and Drop PDF Uploader */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`card-weaviate p-8 sm:p-12 text-center border-dashed cursor-pointer transition-all ${
            dragOver ? "bg-[#DCF090]/20 border-[#CFDE22]" : "bg-white hover:bg-[#F7F9FD]"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept=".pdf,application/pdf"
            className="hidden"
          />

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1D156B] text-[#CFDE22] shadow-glow-ink mb-4">
            <UploadCloud className="h-7 w-7" />
          </div>

          <h3 className="text-base sm:text-lg font-bold font-display text-[#1D156B] mb-1">
            Drag and drop syllabus PDF here, or click to browse
          </h3>
          <p className="text-xs text-[#4C4B84] max-w-md mx-auto">
            Supports chapters, lecture slides, and scanned research notes. Up to 20MB per document.
          </p>

          {isUploading && (
            <div className="mt-6 max-w-md mx-auto space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#1D156B]">
                <span>{uploadStatus}</span>
                <span className="animate-pulse">Processing PDF...</span>
              </div>
              <div className="h-2 w-full bg-[#DEDCEF] rounded-full overflow-hidden">
                <div className="h-full bg-[#CFDE22] animate-pulse w-3/4 rounded-full shadow-glow-lime-sm" />
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMessage}
            </div>
          )}
        </div>

        {/* Documents Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-display text-[#1D156B] flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#CFDE22]" /> Your Study Library ({documents.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="card-weaviate p-6 flex flex-col justify-between bg-white hover:border-[#1D156B]/30 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="h-9 w-9 rounded-xl bg-[#F7F9FD] border border-[#DEDCEF] flex items-center justify-center shrink-0 text-[#1D156B]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="badge-weaviate-lime font-mono">
                      {doc.is_custom ? "UPLOADED PDF" : "READY TO LEARN"}
                    </span>
                  </div>

                  <h4 className="font-bold font-display text-sm sm:text-base text-[#1D156B] line-clamp-2 leading-snug">
                    {doc.title}
                  </h4>

                  <div className="flex items-center gap-2 text-xs font-mono text-[#8396B1] mt-2">
                    <span>{doc.page_count} Pages</span>
                    <span>•</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                  </div>

                  <p className="text-xs font-mono text-[#4C4B84] line-clamp-3 mt-3 bg-[#F7F9FD] p-2.5 rounded-xl border border-[#DEDCEF]">
                    {doc.extracted_text_snippet || "Text extracted and indexed for AI Q&A and flashcards."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#DEDCEF] flex flex-col gap-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      href={`/chat?docId=${doc.id}`}
                      className="text-center py-1.5 rounded-full bg-[#CFDE22] text-xs font-bold text-[#1D156B] border border-[#B8C816] shadow-glow-lime-sm hover:bg-[#D8E633]"
                    >
                      Chat
                    </Link>
                    <Link
                      href={`/summaries?docId=${doc.id}`}
                      className="text-center py-1.5 rounded-full bg-[#1D156B] text-xs font-bold text-white shadow-glow-ink hover:bg-[#2A237E]"
                    >
                      Summary
                    </Link>
                    <Link
                      href={`/quizzes?docId=${doc.id}`}
                      className="text-center py-1.5 rounded-full bg-white text-xs font-semibold text-[#1D156B] border border-[#DEDCEF] hover:bg-[#F7F9FD]"
                    >
                      Quiz
                    </Link>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-xs">
                    <Link
                      href={`/materials/${doc.id}`}
                      className="font-mono text-xs text-[#1D156B] hover:text-[#4C4B84] flex items-center gap-1 font-semibold"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Extracted Passages
                    </Link>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-500 hover:text-red-700 p-1 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
