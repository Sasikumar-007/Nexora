import { DocumentRecord } from "@/types/database";
import { MOCK_DOCUMENTS } from "@/lib/demo/mock-data";

const STORAGE_KEY = "nexora_uploaded_documents";

export interface ExtendedDocumentRecord extends DocumentRecord {
  extracted_text?: string;
  is_custom?: boolean;
}

export function getStoredDocuments(): ExtendedDocumentRecord[] {
  if (typeof window === "undefined") {
    return MOCK_DOCUMENTS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const customDocs: ExtendedDocumentRecord[] = raw ? JSON.parse(raw) : [];

    // Deduplicate with mock documents
    const customIds = new Set(customDocs.map((d) => d.id));
    const mocks = MOCK_DOCUMENTS.filter((d) => !customIds.has(d.id));

    return [...customDocs, ...mocks];
  } catch (err) {
    console.error("Failed to load documents from storage:", err);
    return MOCK_DOCUMENTS;
  }
}

export function getStoredDocumentById(id: string): ExtendedDocumentRecord | undefined {
  const docs = getStoredDocuments();
  return docs.find((d) => d.id === id);
}

export function saveUploadedDocument(doc: ExtendedDocumentRecord): ExtendedDocumentRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: ExtendedDocumentRecord[] = raw ? JSON.parse(raw) : [];

    // Filter out if already exists, then prepend
    const updated = [{ ...doc, is_custom: true }, ...existing.filter((d) => d.id !== doc.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch event so other components or tabs can react
    window.dispatchEvent(new Event("nexora_documents_updated"));
    return updated;
  } catch (err) {
    console.error("Failed to save document to storage:", err);
    return [];
  }
}

export function deleteStoredDocument(id: string): ExtendedDocumentRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: ExtendedDocumentRecord[] = raw ? JSON.parse(raw) : [];
    const updated = existing.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    window.dispatchEvent(new Event("nexora_documents_updated"));
    return updated;
  } catch (err) {
    console.error("Failed to delete document from storage:", err);
    return [];
  }
}
