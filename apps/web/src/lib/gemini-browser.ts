import type { DiagramObservation } from "../../../../packages/diagram-understanding";

const DEFAULT_MODEL = "gemini-2.5-flash";

const diagramSchema = {
  type: "OBJECT",
  properties: {
    regions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          label: { type: "STRING" },
          confidence: { type: "NUMBER" },
        },
        required: ["id", "label", "confidence"],
      },
    },
    edges: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          sourceRegionId: { type: "STRING" },
          targetRegionId: { type: "STRING" },
          label: { type: "STRING" },
          confidence: { type: "NUMBER" },
        },
        required: ["id", "sourceRegionId", "targetRegionId", "label", "confidence"],
      },
    },
    warnings: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["regions", "edges", "warnings"],
};

async function callGemini(apiKey: string, parts: unknown[], model = DEFAULT_MODEL): Promise<DiagramObservation> {
  if (!apiKey.trim()) throw new Error("A Gemini API key is required.");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseMimeType: "application/json", responseSchema: diagramSchema },
    }),
  });

  if (!response.ok) throw new Error(`Gemini request failed (${response.status}).`);
  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") throw new Error("Gemini returned no structured architecture result.");
  const parsed = JSON.parse(text);
  return {
    imageUrl: "",
    regions: Array.isArray(parsed.regions) ? parsed.regions : [],
    edges: Array.isArray(parsed.edges) ? parsed.edges : [],
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
  };
}

export async function analyzeDiagramWithGemini(apiKey: string, imageUrl: string, model = DEFAULT_MODEL): Promise<DiagramObservation> {
  const data = await imageToBase64(imageUrl);
  return callGemini(apiKey, [
    { text: "Analyze this AWS architecture diagram conservatively. Return only visible components and visible directed relationships. Do not invent hidden relationships." },
    { inline_data: { mime_type: "image/png", data } },
  ], model).then((result) => ({ ...result, imageUrl }));
}

export async function analyzeArticleWithGemini(apiKey: string, articleText: string, sourceTitle: string, model = DEFAULT_MODEL): Promise<DiagramObservation> {
  const prompt = [
    "Act as a conservative Solutions Architect reconstructing an architecture from an AWS blog.",
    "Use ONLY facts explicitly stated in the supplied article text.",
    "Extract architecture components and directed data/control flows.",
    "Do not add generic AWS components merely because they are common.",
    "If a relationship is described in prose, represent it as an edge.",
    "Give confidence between 0 and 1 based on how explicit the article is.",
    "The output is AI-generated and must remain verifiable against the source.",
    `Article title: ${sourceTitle}`,
    "Return regions as architecture components, not arbitrary visual shapes.",
  ].join("\n");
  return callGemini(apiKey, [{ text: `${prompt}\n\nARTICLE:\n${articleText.slice(0, 100000)}` }], model);
}

async function imageToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to fetch architecture image (${response.status}).`);
  const mime = response.headers.get("content-type") ?? "image/png";
  if (!mime.startsWith("image/")) throw new Error("Selected architecture candidate is not an image.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
