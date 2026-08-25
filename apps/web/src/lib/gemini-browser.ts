import type { DiagramObservation } from "../../../../packages/diagram-understanding";

const DEFAULT_MODEL = "gemini-2.5-flash";

export async function analyzeDiagramWithGemini(
  apiKey: string,
  imageUrl: string,
  model = DEFAULT_MODEL,
): Promise<DiagramObservation> {
  if (!apiKey.trim()) throw new Error("A Gemini API key is required.");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: [
                  "Analyze this architecture diagram conservatively.",
                  "Return visible candidate regions and visible candidate directed edges only.",
                  "Do not invent hidden relationships.",
                  "Return JSON with regions, edges and warnings.",
                ].join(" "),
              },
              { inline_data: { mime_type: "image/png", data: await imageToBase64(imageUrl) } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              regions: { type: "ARRAY", items: { type: "OBJECT" } },
              edges: { type: "ARRAY", items: { type: "OBJECT" } },
              warnings: { type: "ARRAY", items: { type: "STRING" } },
            },
          },
        },
      }),
    },
  );

  if (!response.ok) throw new Error(`Gemini request failed (${response.status}).`);

  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") throw new Error("Gemini returned no structured diagram result.");

  const parsed = JSON.parse(text);
  return {
    imageUrl,
    regions: Array.isArray(parsed.regions) ? parsed.regions : [],
    edges: Array.isArray(parsed.edges) ? parsed.edges : [],
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
  };
}

async function imageToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to fetch diagram (${response.status}).`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
