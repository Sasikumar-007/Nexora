export interface ExtractedDocumentData {
  text: string;
  pageCount: number;
  info?: Record<string, any>;
  isScanned?: boolean;
}

export interface ChunkResult {
  index: number;
  content: string;
  pageNumber: number;
  tokenCount: number;
}

export interface UploadProgressEvent {
  status: "uploading" | "parsing" | "ocr" | "chunking" | "indexing" | "completed" | "error";
  progress: number;
  message: string;
}
