# rkeytect Architecture

## Core principle

rkeytect does not ask an LLM to draw a diagram directly. It extracts evidence, builds a structured Architecture IR, validates it, and renders that model.

```text
AWS Blog
  |
  +--> source text / images / code
  |
  v
Evidence extraction
  |
  v
Architecture IR
  |
  +--> validation
  |
  +--> AWS-style renderer
  |
  +--> Solution Architect review
```

## Trust boundaries

The source article is evidence. The model is an interpreter. The Architecture IR is our structured representation. The renderer is a projection of the IR.

AI-generated output must be labeled and must never be represented as authoritative AWS guidance.

## Evidence states

- `confirmed`: explicitly stated or shown by the source
- `inferred`: interpretation supported by source context
- `recommended`: rkeytect recommendation, not source architecture
- `conflict`: source evidence appears inconsistent

## Architecture levels

### Level 1
Source-faithful architecture only.

### Level 2
AWS-aware relationships, actors, boundaries and flows inferred from the source.

### Level 3
Solution Architect review and recommended production considerations. These recommendations remain separate from source architecture.

## Provider abstraction

The core packages must not import a specific model SDK. Provider adapters implement the `LLMProvider` contract. This keeps local models, BYOK APIs and hosted providers interchangeable.

## Future pipeline

1. Retrieve and sanitize AWS article.
2. Detect source architecture diagrams.
3. Extract evidence spans.
4. Extract candidate components and relationships.
5. Ask an LLM for structured interpretation where deterministic extraction is insufficient.
6. Validate references, confidence and evidence linkage.
7. Render architecture.
8. Run architecture review.
9. Display provenance and the AI-generated warning.
