import type { DiagramObservation } from "../../../../packages/diagram-understanding";

const DEFAULT_MODEL = "gemini-2.5-flash";

const diagramSchema = {
  type: "OBJECT",
  properties: {
    regions: { type: "ARRAY", items: { type: "OBJECT", properties: {
      id: { type: "STRING" }, label: { type: "STRING" }, confidence: { type: "NUMBER" }, kind: { type: "STRING" },
    }, required: ["id", "label", "confidence"] } },
    edges: { type: "ARRAY", items: { type: "OBJECT", properties: {
      id: { type: "STRING" }, sourceRegionId: { type: "STRING" }, targetRegionId: { type: "STRING" }, label: { type: "STRING" }, confidence: { type: "NUMBER" },
    }, required: ["id", "sourceRegionId", "targetRegionId", "label", "confidence"] } },
    warnings: { type: "ARRAY", items: { type: "STRING" } },
    isArchitectureRelevant: { type: "BOOLEAN" },
    architectureConfidence: { type: "NUMBER" },
    assessmentReason: { type: "STRING" },
    sourceMode: { type: "STRING" },
    sourceEvidence: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["regions", "edges", "warnings", "isArchitectureRelevant", "architectureConfidence", "assessmentReason", "sourceMode", "sourceEvidence"],
};

const imageSelectionSchema = {
  type: "OBJECT",
  properties: {
    selectedIndex: { type: "INTEGER" },
    architectureDiagram: { type: "BOOLEAN" },
    confidence: { type: "NUMBER" },
    reason: { type: "STRING" },
  },
  required: ["selectedIndex", "architectureDiagram", "confidence", "reason"],
};

async function callGemini(apiKey: string, parts: unknown[], schema: unknown, model = DEFAULT_MODEL): Promise<any> {
  if (!apiKey.trim()) throw new Error("A Gemini API key is required.");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseMimeType: "application/json", responseSchema: schema },
    }),
  });
  if (!response.ok) throw new Error(`Gemini request failed (${response.status}).`);
  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") throw new Error("Gemini returned no structured architecture result.");
  return JSON.parse(text);
}

function normalizeObservation(parsed: any, imageUrl = ""): DiagramObservation {
  return {
    imageUrl,
    regions: Array.isArray(parsed.regions) ? parsed.regions : [],
    edges: Array.isArray(parsed.edges) ? parsed.edges : [],
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
    isArchitectureRelevant: Boolean(parsed.isArchitectureRelevant),
    architectureConfidence: Number(parsed.architectureConfidence ?? 0),
    assessmentReason: typeof parsed.assessmentReason === "string" ? parsed.assessmentReason : "",
    sourceMode: parsed.sourceMode === "diagram" || parsed.sourceMode === "prose" ? parsed.sourceMode : "none",
    sourceEvidence: Array.isArray(parsed.sourceEvidence) ? parsed.sourceEvidence : [],
  };
}

export async function selectArchitectureImageWithGemini(
  apiKey: string,
  candidates: Array<{ url: string; alt?: string }>,
  model = DEFAULT_MODEL,
): Promise<{ selectedIndex: number; architectureDiagram: boolean; confidence: number; reason: string }> {
  const selected = candidates.slice(0, 5);
  const parts: unknown[] = [{ text: [
    "You are the diagram gatekeeper for rkeytect.",
    "Inspect all candidate images and decide whether any is a real software/cloud/system architecture diagram.",
    "A valid architecture diagram shows components, services, systems, actors, containers, networks, data stores, or directional flows.",
    "Reject logos, hero art, decorative illustrations, screenshots of products, portraits, generic charts, and unrelated images.",
    "Choose exactly one best architecture diagram if one exists; otherwise selectedIndex must be -1.",
    "Do not infer architecture from the surrounding article when judging the images.",
    ...selected.map((candidate, index) => `Candidate ${index}: alt=${candidate.alt ?? ""} url=${candidate.url}`),
  ].join("\n") }];

  for (const [index, candidate] of selected.entries()) {
    try {
      const image = await imageToBase64(candidate.url);
      parts.push({ text: `Candidate ${index} image:` });
      parts.push({ inline_data: { mime_type: image.mime, data: image.data } });
    } catch {
      parts.push({ text: `Candidate ${index} could not be fetched; ignore it.` });
    }
  }

  return callGemini(apiKey, parts, imageSelectionSchema, model);
}

export async function analyzeDiagramWithGemini(apiKey: string, imageUrl: string, model = DEFAULT_MODEL): Promise<DiagramObservation> {
  const image = await imageToBase64(imageUrl);
  const parsed = await callGemini(apiKey, [
    { text: [
      "You are a conservative architecture-diagram analyst.",
      "First decide whether this image is actually a software, cloud, infrastructure, deployment, system, data-flow, or architecture diagram.",
      "If it is NOT, return isArchitectureRelevant=false, sourceMode=none, empty regions and edges, and explain why.",
      "If it IS, extract only components visibly represented or explicitly labeled in the image and only relationships visibly represented by arrows/connectors.",
      "Never invent a service because it is likely to exist.",
      "Do not treat decorative shapes, AWS navigation artwork, screenshots, logos, or people as architecture components.",
      "Use canonical AWS service names when the icon/label makes the service identifiable.",
      "Confidence means confidence in the observation, not confidence that the architecture is correct.",
    ].join("\n") },
    { inline_data: { mime_type: image.mime, data: image.data } },
  ], diagramSchema, model);
  return normalizeObservation(parsed, imageUrl);
}

export async function analyzeArticleWithGemini(apiKey: string, articleText: string, sourceTitle: string, model = DEFAULT_MODEL): Promise<DiagramObservation> {
  const prompt = [
    "Act as a conservative Solutions Architect reviewing a public web article.",
    "First determine whether the article is meaningfully about software/system/cloud/infrastructure architecture, deployment topology, system design, data flow, or a technical solution architecture.",
    "If it is not architecture-related, return isArchitectureRelevant=false, sourceMode=none, empty regions and edges, and clearly explain the mismatch.",
    "If it is architecture-related but no trustworthy diagram is available, reconstruct only from explicit prose statements.",
    "Use ONLY facts explicitly stated in the supplied article text for prose reconstruction.",
    "Do not add generic components merely because they are common.",
    "Every edge must represent a relationship explicitly described in the source text.",
    "Prefer canonical product/service names.",
    "Keep the output AI-generated and verifiable against the source.",
    `Source title: ${sourceTitle}`,
  ].join("\n");
  const parsed = await callGemini(apiKey, [{ text: `${prompt}\n\nSOURCE TEXT:\n${articleText.slice(0, 100000)}` }], diagramSchema, model);
  return normalizeObservation(parsed);
}

async function imageToBase64(url: string): Promise<{ mime: string; data: string }> {
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`Unable to fetch architecture image (${response.status}).`);
  const mime = (response.headers.get("content-type") ?? "image/png").split(";")[0];
  if (!mime.startsWith("image/")) throw new Error("Selected architecture candidate is not an image.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return { mime, data: btoa(binary) };
}
