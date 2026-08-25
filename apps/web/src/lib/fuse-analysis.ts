import { fuseEvidence, type FusionInput } from "../../../packages/evidence-fusion";
import { validate } from "../../../packages/architecture-core";
import { buildTextEvidence } from "./text-evidence";
import type { ArticlePayload } from "./article-client";
import type { DiagramObservation } from "../../../packages/diagram-understanding";

export function buildArchitectureIR(article: ArticlePayload, diagram?: DiagramObservation) {
  const input: FusionInput = {
    source: { url: article.source.url, title: article.source.title },
    textEvidence: buildTextEvidence(article),
    diagram,
  };
  const ir = fuseEvidence(input);
  return { ir, validation: validate(ir) };
}
