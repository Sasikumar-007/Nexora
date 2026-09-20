import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/ai/provider";
import { retrieveRelevantChunks, buildRagPrompt } from "@/lib/rag/retriever";
import { ChatMessagePayload } from "@/types/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, documentId, documentTitle, documentText, mode } = body as {
      messages: ChatMessagePayload[];
      documentId?: string;
      documentTitle?: string;
      documentText?: string;
      mode?: "general" | "rag";
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    let citations: any[] = [];
    let systemPrompt =
      "You are an encouraging, highly knowledgeable AI academic tutor. Explain concepts step-by-step with clear definitions, analogies, and practical examples.";
    let retrievedContext = "";

    // If RAG mode or document specified, retrieve context
    if (mode === "rag" || documentId || documentText) {
      const retrieved = await retrieveRelevantChunks({
        query: lastMessage.content,
        documentId: documentId,
        documentTitle: documentTitle,
        documentText: documentText,
        limit: 3,
      });

      if (retrieved.length > 0) {
        citations = retrieved.map((r) => ({
          documentId: r.documentId,
          documentTitle: r.documentTitle,
          pageNumber: r.pageNumber,
          snippet: r.content.slice(0, 200) + (r.content.length > 200 ? "..." : ""),
        }));

        systemPrompt = buildRagPrompt(lastMessage.content, retrieved);
        retrievedContext = retrieved.map((r) => r.content).join("\n\n");
      }
    }

    const aiResponse = await generateChatResponse({
      messages,
      systemPrompt,
      documentTitle,
      context: retrievedContext,
      temperature: 0.4,
    });

    return NextResponse.json({
      role: "assistant",
      content: aiResponse,
      citations,
      created_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("API Chat Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat request" },
      { status: 500 }
    );
  }
}
