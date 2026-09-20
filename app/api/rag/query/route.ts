import { NextRequest, NextResponse } from "next/server";
import { retrieveRelevantChunks } from "@/lib/rag/retriever";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, documentId, limit } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const chunks = await retrieveRelevantChunks({
      query,
      documentId,
      limit: limit || 4,
    });

    return NextResponse.json({ chunks });
  } catch (err: any) {
    console.error("RAG Query Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to query RAG chunks" },
      { status: 500 }
    );
  }
}
