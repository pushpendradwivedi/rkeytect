import type { DiagramObservation, DiagramVisionProvider } from "../index";

/**
 * Provider adapter contract for a multimodal model.
 *
 * The model implementation is intentionally supplied by the application.
 * This package never stores API keys and never assumes a vendor SDK.
 */
export interface MultimodalClient {
  analyzeImage(input: {
    imageUrl: string;
    systemPrompt: string;
    outputSchema: unknown;
  }): Promise<unknown>;
}

export function createMultimodalDiagramProvider(client: MultimodalClient): DiagramVisionProvider {
  return {
    id: "generic-multimodal",
    async analyze(imageUrl: string): Promise<DiagramObservation> {
      const raw = await client.analyzeImage({
        imageUrl,
        systemPrompt: [
          "Analyze this architecture diagram conservatively.",
          "Return only visible candidate regions and visible candidate directed edges.",
          "Do not infer hidden architecture relationships.",
          "Each region and edge must have confidence from 0 to 1.",
          "The result is evidence, not architectural truth.",
        ].join(" "),
        outputSchema: {
          type: "object",
          required: ["regions", "edges", "warnings"],
          properties: {
            regions: { type: "array" },
            edges: { type: "array" },
            warnings: { type: "array" },
          },
        },
      });

      const result = raw as Partial<DiagramObservation>;
      return {
        imageUrl,
        regions: Array.isArray(result.regions) ? result.regions : [],
        edges: Array.isArray(result.edges) ? result.edges : [],
        warnings: Array.isArray(result.warnings) ? result.warnings : ["Multimodal output requires validation before promotion to Architecture IR."],
      };
    },
  };
}
