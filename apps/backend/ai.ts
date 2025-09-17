const MODEL_NAME = "models/gemini-2.5-pro";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

interface GeminiPart {
  text?: string;
}

interface GeminiContent {
  role?: string;
  parts?: GeminiPart[];
}

interface GeminiResponse {
  candidates?: Array<{
    content?: GeminiContent;
  }>;
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not configured");
  }

  const response = await fetch(`${API_BASE}/${MODEL_NAME}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${errorText}`);
  }

  const json = (await response.json()) as GeminiResponse;
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }
  return text.trim();
}

export async function generateText(options: {
  prompt: string;
  tone?: string;
  length?: "short" | "medium" | "long";
  existingText?: string;
}): Promise<string> {
  const { prompt, tone, length, existingText } = options;
  const instructions = [
    "You are an expert portfolio copywriter.",
    `Write in a ${tone || "professional"} tone.`,
    length === "short"
      ? "Keep the response concise (under 80 words)."
      : length === "long"
        ? "Provide a detailed response (around 200 words)."
        : "Aim for 120 words on average.",
  ];

  if (existingText) {
    instructions.push(
      "Improve the existing text. Keep the original meaning while improving clarity, flow, and impact.",
      `Existing text: ${existingText}`,
    );
  }

  instructions.push(`Task: ${prompt}`);

  return await callGemini(instructions.join("\n"));
}

export async function generateTemplateIdeas(requirements: {
  industry: string;
  goals?: string;
  tone?: string;
  mustHaveSections?: string[];
}): Promise<string> {
  const { industry, goals, tone, mustHaveSections } = requirements;
  const prompt = [
    "You are helping a user plan a portfolio layout.",
    `Industry: ${industry}.`,
    tone ? `Preferred tone: ${tone}.` : "",
    goals ? `Goals: ${goals}.` : "",
    mustHaveSections && mustHaveSections.length
      ? `Required sections: ${mustHaveSections.join(", ")}.`
      : "",
    "Suggest an ordered list of sections, recommended color accents, and unique interactive ideas.",
    "Return clear markdown with headings for sections, color palette, and interactive ideas.",
  ]
    .filter(Boolean)
    .join(" ");

  return await callGemini(prompt);
}

export async function translateText(options: {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}): Promise<string> {
  const { text, targetLanguage, sourceLanguage } = options;
  const prompt = [
    "You are a professional translator for portfolio content.",
    sourceLanguage
      ? `Translate the following ${sourceLanguage} text into ${targetLanguage} while preserving tone and intent.`
      : `Translate the following text into ${targetLanguage} while preserving tone and intent.`,
    "Return only the translated text without additional commentary.",
    `Text: ${text}`,
  ].join("\n");

  return await callGemini(prompt);
}

export async function suggestContentImprovements(content: string): Promise<string> {
  const prompt = [
    "Review the portfolio content below and suggest improvements.",
    "Provide a short summary, a list of strengths, and actionable recommendations.",
    "Keep the response concise and formatted as markdown.",
    `Content: ${content}`,
  ].join("\n");

  return await callGemini(prompt);
}

export async function generatePerformanceSuggestions(data: {
  projectCount: number;
  averageDescriptionLength: number;
  hasLargeImages: boolean;
  customScripts: number;
}): Promise<string> {
  const prompt = [
    "You are optimizing a web portfolio for performance.",
    `Projects: ${data.projectCount} projects with average description length ${data.averageDescriptionLength} words.`,
    data.hasLargeImages ? "Images exceed the recommended size." : "Images are within recommended sizes.",
    data.customScripts
      ? `There are ${data.customScripts} custom script blocks that may affect performance.`
      : "There are no custom script blocks.",
    "Suggest concrete steps to improve loading speed in bullet points.",
  ].join("\n");

  return await callGemini(prompt);
}

export async function generateAccessibilitySuggestions(checks: {
  missingAltTags: number;
  lowContrastPairs: number;
  headingIssues: number;
}): Promise<string> {
  const prompt = [
    "You are an accessibility auditor for digital portfolios.",
    `Found ${checks.missingAltTags} images missing alt text, ${checks.lowContrastPairs} color combinations with insufficient contrast, and ${checks.headingIssues} heading structure issues.`,
    "Provide prioritized recommendations using markdown bullet lists.",
  ].join(" ");

  return await callGemini(prompt);
}
