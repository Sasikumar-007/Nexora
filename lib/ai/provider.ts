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
  isVoice?: boolean;
}

/**
 * Get Google Gemini API key if configured
 */
export function getGeminiKey(customKey?: string): string {
  return (
    customKey ||
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    (process.env.AI_API_KEY?.startsWith("AQ.") || process.env.AI_API_KEY?.startsWith("AIzaSy") ? process.env.AI_API_KEY : "") ||
    ""
  ).trim();
}

/**
 * Direct native Google Gemini API caller for real-time natural language answers
 */
export async function callGoogleGemini(params: {
  apiKey: string;
  messages: ChatMessagePayload[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  isVoice?: boolean;
}): Promise<string | null> {
  const models = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.6-flash"];

  let systemText = params.systemPrompt || "You are an expert academic tutor.";
  if (params.isVoice) {
    systemText += " IMPORTANT FOR VOICE AGENT: Provide a comprehensive, engaging spoken explanation (4 to 6 natural sentences). Clearly explain the core intuition, an example, and key exam insights. Speak naturally in conversational sentences without any markdown symbols, asterisks, bullet points, or headers.";
  }

  // Format message history natively for Gemini with role alternation
  const sanitizedContents: Array<{ role: "user" | "model"; parts: [{ text: string }] }> = [];
  for (const m of params.messages) {
    if (!m.content || !m.content.trim()) continue;
    const role = m.role === "assistant" ? "model" : "user";
    if (sanitizedContents.length > 0 && sanitizedContents[sanitizedContents.length - 1].role === role) {
      // Merge consecutive same-role messages
      sanitizedContents[sanitizedContents.length - 1].parts[0].text += "\n\n" + m.content.trim();
    } else {
      sanitizedContents.push({
        role,
        parts: [{ text: m.content.trim() }],
      });
    }
  }

  // Ensure there is at least one user message
  if (sanitizedContents.length === 0) {
    sanitizedContents.push({ role: "user", parts: [{ text: "Hello" }] });
  }

  const contents = sanitizedContents;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${params.apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemText }],
          },
          contents,
          generationConfig: {
            temperature: params.temperature ?? (params.isVoice ? 0.35 : 0.4),
            maxOutputTokens: params.isVoice ? 1200 : (params.maxTokens ?? 2000),
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } else {
        const errText = await res.text();
        console.warn(`[Gemini API ${model}] Notice (${res.status}):`, errText);
      }
    } catch (err: any) {
      console.warn(`[Gemini API ${model}] Connection warning:`, err.message);
    }
  }
  return null;
}

/**
 * Direct native Google Gemini API caller for JSON responses (Quizzes, Flashcards, Summaries)
 */
export async function callGoogleGeminiJson<T>(params: {
  apiKey: string;
  prompt: string;
  systemPrompt?: string;
  schemaSample?: Record<string, any>;
}): Promise<T | null> {
  const models = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.6-flash"];
  let schemaInstruction = "";
  if (params.schemaSample) {
    schemaInstruction = `\n\nREQUIRED JSON SCHEMA STRUCTURE:\n${JSON.stringify(params.schemaSample, null, 2)}\n\n`;
  }
  const fullPrompt = `${params.systemPrompt || "You are an expert academic tutor."}\n\n` +
    `CRITICAL: Return ONLY a valid, raw JSON object matching the requested schema structure. Do not wrap in markdown or backticks.\n` +
    schemaInstruction +
    `Prompt:\n${params.prompt}`;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${params.apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: fullPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          let cleaned = rawText.trim();
          const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            cleaned = jsonMatch[1].trim();
          } else {
            const firstBrace = cleaned.indexOf("{");
            const lastBrace = cleaned.lastIndexOf("}");
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              cleaned = cleaned.slice(firstBrace, lastBrace + 1);
            }
          }
          return JSON.parse(cleaned) as T;
        }
      } else {
        const errText = await res.text();
        console.warn(`[Gemini JSON ${model}] Notice (${res.status}):`, errText);
      }
    } catch (err: any) {
      console.warn(`[Gemini JSON ${model}] Warning:`, err.message);
    }
  }
  return null;
}

/**
 * Determine effective AI API configuration
 */
export function getAIConfig(customKey?: string, customUrl?: string, customModel?: string) {
  const geminiKey = getGeminiKey(customKey);
  const apiKey = (customKey || geminiKey || process.env.AI_API_KEY || "").trim();
  let apiUrl = (customUrl || process.env.AI_API_URL || "https://generativelanguage.googleapis.com/v1beta/openai/").trim();
  let model = (customModel || process.env.AI_MODEL || "gemini-3.5-flash").trim();

  // Auto-detect Groq keys
  if (apiKey.startsWith("gsk_")) {
    if (!customUrl) apiUrl = "https://api.groq.com/openai/v1";
    if (!customModel || customModel.includes("gemini")) model = "llama-3.3-70b-versatile";
  }
  // Auto-detect Google Gemini keys
  else if (apiKey.startsWith("AIzaSy") || geminiKey) {
    if (!customUrl) apiUrl = "https://generativelanguage.googleapis.com/v1beta/openai/";
    if (!customModel) model = "gemini-3.5-flash";
  }

  const isConfigured = !!(apiKey && apiKey.length > 5 && !apiKey.includes("placeholder"));
  return { apiKey, apiUrl, model, isConfigured, geminiKey };
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
  const { apiKey, apiUrl, model, isConfigured, geminiKey } = getAIConfig(
    options.apiKey,
    options.apiUrl,
    options.model
  );

  // 1. Prioritize Google Gemini API if Gemini Key is available
  if (geminiKey) {
    try {
      const geminiReply = await callGoogleGemini({
        apiKey: geminiKey,
        messages: options.messages,
        systemPrompt: options.systemPrompt,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        isVoice: options.isVoice,
      });
      if (geminiReply && geminiReply.trim().length > 0) {
        return geminiReply;
      }
    } catch (err: any) {
      console.warn("[Gemini API Router] Falling back:", err.message);
    }
  }

  // 2. Try OpenAI / Groq Compatible endpoint if configured
  if (isConfigured && apiKey !== geminiKey) {
    try {
      const messages = [];
      let sys = options.systemPrompt || "You are an expert academic tutor.";
      if (options.isVoice) {
        sys += " IMPORTANT FOR VOICE AGENT: Provide a direct, natural, conversational spoken answer in 2 to 3 concise sentences. Do NOT use markdown symbols, asterisks, headers, or bullet lists.";
      }
      messages.push({ role: "system", content: sys });
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
          max_tokens: options.isVoice ? 250 : (options.maxTokens ?? 1500),
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

  // 3. Dynamic Real-Time NLP Fallback (never returns static identical text)
  const lastUserMsg = [...options.messages].reverse().find((m) => m.role === "user")?.content || "";
  return generateDynamicChatResponse({
    query: lastUserMsg,
    documentTitle: options.documentTitle,
    context: options.context || options.systemPrompt,
    conversationHistory: options.messages,
    isVoice: options.isVoice,
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
  const { apiKey, apiUrl, model, isConfigured, geminiKey } = getAIConfig(
    params.apiKey,
    params.apiUrl,
    params.model
  );

  // 1. Prioritize Google Gemini API if Gemini Key is available
  if (geminiKey) {
    try {
      const geminiJson = await callGoogleGeminiJson<T>({
        apiKey: geminiKey,
        prompt: params.prompt,
        systemPrompt: params.systemPrompt,
        schemaSample: params.schemaSample,
      });
      if (geminiJson) {
        return geminiJson;
      }
    } catch (err: any) {
      console.warn("[Gemini JSON Router] Falling back:", err.message);
    }
  }

  const systemInstruction = `${params.systemPrompt || "You are an expert academic tutor."}\n` +
    `CRITICAL: Output ONLY valid JSON matching this exact structure, with no markdown code blocks or additional text:\n` +
    JSON.stringify(params.schemaSample, null, 2);

  if (isConfigured && apiKey !== geminiKey) {
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
