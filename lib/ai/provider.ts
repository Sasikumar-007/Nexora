import { ChatMessagePayload } from "@/types/ai";
import {
  generateDynamicChatResponse,
  generateDynamicQuizFromText,
  generateDynamicFlashcardsFromText,
  generateDynamicSummaryFromText,
} from "@/lib/ai/dynamic-generator";

export interface AICompletionOptions {
  messages: ChatMessagePayload[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  documentTitle?: string;
  context?: string;
}

/**
 * Determine effective AI API configuration
 */
export function getAIConfig(customKey?: string, customUrl?: string, customModel?: string) {
  const apiKey = (customKey || process.env.AI_API_KEY || "").trim();
  let apiUrl = (customUrl || process.env.AI_API_URL || "https://api.openai.com/v1").trim();
  let model = (customModel || process.env.AI_MODEL || "gpt-4o-mini").trim();

  // Auto-detect Groq keys (Free & fast)
  if (apiKey.startsWith("gsk_")) {
    if (!customUrl) apiUrl = "https://api.groq.com/openai/v1";
    if (!customModel || customModel.includes("gpt")) model = "llama-3.3-70b-versatile";
  }
  // Auto-detect Google Gemini keys (Free tier)
  else if (apiKey.startsWith("AIzaSy")) {
    if (!customUrl) apiUrl = "https://generativelanguage.googleapis.com/v1beta/openai/";
    if (!customModel || customModel.includes("gpt")) model = "gemini-1.5-flash";
  }

  const isConfigured = !!(apiKey && apiKey.length > 5 && !apiKey.includes("placeholder"));
  return { apiKey, apiUrl, model, isConfigured };
}

export function isAIConfigured(): boolean {
  return getAIConfig().isConfigured;
}

/**
 * Generate AI Chat completion with OpenAI compatible API or dynamic NLP engine
 */
export async function generateChatResponse(
  options: AICompletionOptions
): Promise<string> {
  const { apiKey, apiUrl, model, isConfigured } = getAIConfig(
    options.apiKey,
    options.apiUrl,
    options.model
  );

  if (isConfigured) {
    try {
      const messages = [];
      if (options.systemPrompt) {
        messages.push({ role: "system", content: options.systemPrompt });
      }
      messages.push(...options.messages);

      const res = await fetch(`${apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.4,
          max_tokens: options.maxTokens ?? 1500,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && content.trim().length > 0) {
          return content;
        }
      } else {
        const errText = await res.text();
        console.warn(`[AI Provider] API call returned ${res.status}:`, errText);
      }
    } catch (err: any) {
      console.error("[AI Provider] Connection error:", err.message);
    }
  }

  // Dynamic Real-Time NLP Fallback (never returns static identical text)
  const lastUserMsg = [...options.messages].reverse().find((m) => m.role === "user")?.content || "";
  return generateDynamicChatResponse({
    query: lastUserMsg,
    documentTitle: options.documentTitle,
    context: options.context || options.systemPrompt,
    conversationHistory: options.messages,
  });
}

/**
 * Generate structured JSON output with validation and dynamic fallback
 */
export async function generateStructuredJson<T>(params: {
  prompt: string;
  systemPrompt?: string;
  schemaSample: Record<string, any>;
  text?: string;
  topic?: string;
  apiKey?: string;
  apiUrl?: string;
  model?: string;
}): Promise<T> {
  const { apiKey, apiUrl, model, isConfigured } = getAIConfig(
    params.apiKey,
    params.apiUrl,
    params.model
  );

  const systemInstruction = `${params.systemPrompt || "You are an expert academic tutor."}\n` +
    `CRITICAL: Output ONLY valid JSON matching this exact structure, with no markdown code blocks or additional text:\n` +
    JSON.stringify(params.schemaSample, null, 2);

  if (isConfigured) {
    try {
      const res = await fetch(`${apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: params.prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return JSON.parse(content) as T;
        }
      } else {
        const errText = await res.text();
        console.warn(`[AI Structured JSON] API call returned ${res.status}:`, errText);
      }
    } catch (err: any) {
      console.error("[AI Structured JSON] Error:", err.message);
    }
  }

  // Extract topic & text from prompt if not explicitly passed
  let topic = params.topic || "Study Material";
  const topicMatch = params.prompt.match(/(?:for|on):\s*"([^"]+)"/i);
  if (topicMatch) topic = topicMatch[1];

  let text = params.text || "";
  if (!text) {
    const textMatch = params.prompt.match(/(?:Text excerpt|Source text excerpt):\s*([\s\S]+)$/i);
    if (textMatch) text = textMatch[1];
  }

  // Dynamic content generator based on requested schema
  if (params.schemaSample.cards) {
    const cards = generateDynamicFlashcardsFromText({ topic, text, count: 6 });
    return { cards } as unknown as T;
  }

  if (params.schemaSample.questions) {
    const questions = generateDynamicQuizFromText({ topic, text, count: 4 });
    return { questions } as unknown as T;
  }

  const summary = generateDynamicSummaryFromText({ topic, text });
  return summary as unknown as T;
}

/**
 * Generate vector embeddings (1536 dim standard)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { apiKey, apiUrl, isConfigured } = getAIConfig();

  if (isConfigured && !apiUrl.includes("groq")) {
    try {
      const res = await fetch(`${apiUrl}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text.slice(0, 4000),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.data?.[0]?.embedding || createMockEmbedding(text);
      }
    } catch (err: any) {
      console.warn("[Embedding] Error:", err.message);
    }
  }

  return createMockEmbedding(text);
}

// Generate deterministic pseudo-embedding for testing/development
function createMockEmbedding(text: string): number[] {
  const vector: number[] = new Array(1536).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  for (let i = 0; i < 1536; i++) {
    const seed = Math.sin(hash + i) * 10000;
    vector[i] = seed - Math.floor(seed) - 0.5;
  }
  const mag = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map((v) => v / (mag || 1));
}
