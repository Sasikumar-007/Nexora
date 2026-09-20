import { ChunkResult } from "@/types/documents";

export interface ChunkerOptions {
  maxWordsPerChunk?: number;
  overlapWords?: number;
}

export function chunkDocumentText(
  text: string,
  options: ChunkerOptions = {}
): ChunkResult[] {
  const maxWords = options.maxWordsPerChunk || 400;
  const overlap = options.overlapWords || 50;

  if (!text || text.trim().length === 0) {
    return [];
  }

  // Clean and normalize whitespace
  const cleaned = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  const paragraphs = cleaned.split(/\n\n+/);

  const chunks: ChunkResult[] = [];
  let currentWords: string[] = [];
  let pageCounter = 1;

  for (const para of paragraphs) {
    // Detect page markers if present (e.g. Page 2 or form feeds)
    if (para.includes("\f") || /---\s*Page\s*\d+\s*---/i.test(para)) {
      pageCounter++;
    }

    const paraWords = para.split(/\s+/).filter(Boolean);
    if (paraWords.length === 0) continue;

    if (currentWords.length + paraWords.length <= maxWords) {
      currentWords.push(...paraWords);
    } else {
      if (currentWords.length > 0) {
        const chunkText = currentWords.join(" ");
        chunks.push({
          index: chunks.length,
          content: chunkText,
          pageNumber: pageCounter,
          tokenCount: Math.round(currentWords.length * 1.3),
        });

        // Retain overlap for context continuity
        const overlapSlice = currentWords.slice(Math.max(0, currentWords.length - overlap));
        currentWords = [...overlapSlice, ...paraWords];
      } else {
        currentWords.push(...paraWords);
      }
    }
  }

  // Push remainder
  if (currentWords.length > 0) {
    chunks.push({
      index: chunks.length,
      content: currentWords.join(" "),
      pageNumber: pageCounter,
      tokenCount: Math.round(currentWords.length * 1.3),
    });
  }

  return chunks;
}
