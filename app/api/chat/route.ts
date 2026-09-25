import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/ai/provider";
import { retrieveRelevantChunks, buildRagPrompt } from "@/lib/rag/retriever";
import { ChatMessagePayload } from "@/types/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, documentId, documentTitle, documentText, mode, isVoice } = body as {
      messages: ChatMessagePayload[];
      documentId?: string;
      documentTitle?: string;
      documentText?: string;
      mode?: "general" | "rag";
      isVoice?: boolean;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    let citations: any[] = [];
    let systemPrompt = isVoice
      ? "You are an expert, encouraging AI academic voice tutor powered by Google Gemini. The student has spoken their question to you. Answer their question directly, thoroughly, and correctly with deep academic clarity. Explain the foundational concept step by step, provide an intuitive real-world example, and highlight the key takeaways. IMPORTANT FOR AUDIO SYNTHESIS: Format your answer in clean, natural conversational spoken sentences without any markdown symbols, asterisks (**), hashtags (###), bullet points, or code blocks, so your explanation sounds engaging, fluid, and lifelike when spoken aloud."
      : "You are an encouraging, highly knowledgeable AI academic tutor. Explain concepts step-by-step with clear definitions, analogies, and practical examples.";
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

        retrievedContext = retrieved.map((r) => r.content).join("\n\n");
        if (isVoice) {
          systemPrompt = `You are an expert AI academic voice tutor powered by Google Gemini. Use the following course material excerpts to accurately and thoroughly answer the student's spoken question:

Course Material Excerpts from "${documentTitle || "Study Material"}":
${retrievedContext}

Instructions:
1. Answer the student's question accurately and completely using facts and explanations from the excerpts.
2. Speak directly to the student in a clear, friendly, and structured spoken style.
3. Keep the language natural and conversational for audio text-to-speech. Never use markdown asterisks (**), headers, or bullet symbols.`;
        } else {
          systemPrompt = buildRagPrompt(lastMessage.content, retrieved);
        }
      }
    }

    const aiResponse = await generateChatResponse({
      messages,
      systemPrompt,
      documentTitle,
      context: retrievedContext,
      temperature: 0.4,
      isVoice,
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
