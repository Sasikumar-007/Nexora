import { createWorker } from "tesseract.js";

export async function performOcrOnImageBuffer(
  imageBuffer: Buffer,
  language: string = "eng"
): Promise<{ text: string; confidence: number }> {
  try {
    const worker = await createWorker(language);
    const ret = await worker.recognize(imageBuffer);
    const text = (ret.data.text || "").trim();
    const confidence = ret.data.confidence || 0;
    await worker.terminate();

    return {
      text,
      confidence,
    };
  } catch (error: any) {
    console.error("Error running Tesseract OCR:", error);
    throw new Error(error.message || "Failed to perform OCR on image buffer");
  }
}
