import pdfParse from "pdf-parse";
import { ExtractedDocumentData } from "@/types/documents";

export async function extractTextFromPdfBuffer(
  buffer: Buffer
): Promise<ExtractedDocumentData> {
  try {
    const data = await pdfParse(buffer);
    const text = (data.text || "").trim();
    const pageCount = data.numpages || 1;

    // Check if the PDF has very little text (likely scanned or image-based)
    const isScanned = text.length < 50 * pageCount;

    return {
      text,
      pageCount,
      info: data.info,
      isScanned,
    };
  } catch (error: any) {
    console.error("Error parsing PDF with pdf-parse:", error);
    throw new Error(error.message || "Failed to extract text from PDF file");
  }
}
