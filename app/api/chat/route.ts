import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/ai/provider";
import { retrieveRelevantChunks, buildRagPrompt } from "@/lib/rag/retriever";
import { ChatMessagePayload } from "@/types/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, documentId, mode } = body as {
      messages: ChatMessagePayload[];
      documentId?: string;
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

    // If RAG mode or document specified, retrieve context
    if (mode === "rag" || documentId) {
      const retrieved = await retrieveRelevantChunks({
        query: lastMessage.content,
        documentId: documentId,
        limit: 3,
      });

      if (retrieved.length > 0) {
        citations = retrieved.map((r) => ({
          documentId: r.documentId,
          pageNumber: r.pageNumber,
          snippet: r.content.slice(0, 180) + "...",
        }));

        systemPrompt = buildRagPrompt(lastMessage.content, retrieved);
      }
    }

    const aiResponse = await generateChatResponse({
      messages,
      systemPrompt,
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
