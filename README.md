# rkeytect

> Turn AWS architecture blogs into evidence-backed architecture.

**AWS Blog → Architecture Understanding → Diagram → Solution Architect Review**

rkeytect is an open-source architecture reasoning tool that turns AWS architecture articles into a first-pass, editable AWS-style architecture representation grounded in source evidence.

## Why rkeytect?

AWS blogs contain valuable architecture knowledge, but the architecture is often distributed across prose, diagrams, code snippets, and assumptions.

rkeytect turns that knowledge into a structured architecture model instead of asking an LLM to draw a picture directly.

```text
AWS Blog URL
     ↓
Evidence extraction
     ↓
Architecture IR
     ↓
Validation
     ↓
AWS-style diagram
     ↓
Solution Architect review
```

The **Architecture IR (Intermediate Representation)** is the source of truth. The diagram is only one projection of it.

## The trust model

> ⚠️ **AI-generated architecture — verify before use**
>
> rkeytect output can contain omissions, inaccuracies, or incorrect inferences. It does not certify or establish an authoritative AWS architecture. Always verify generated output against the original source and official AWS documentation before making production, security, reliability, or financial decisions.

Every architecture fact should be classified as:

| State | Meaning |
|---|---|
| 🟢 **Confirmed** | Explicitly stated or shown by the source |
| 🟡 **Inferred** | Reasonably inferred from the source |
| 🔵 **Recommended** | Suggested by rkeytect; not necessarily present in the source |
| 🔴 **Conflict** | Source text, diagrams, or evidence appear inconsistent |

A core design principle is **provenance**: components and relationships should be traceable back to source evidence whenever possible.

## Architecture levels

### Level 1 — Source architecture

What the author explicitly described or showed.

### Level 2 — Architecture-aware model

AWS-aware relationships, data flows, boundaries, actors, and dependencies derived from the source.

### Level 3 — Production review

A Solution Architect-style review that identifies gaps, risks, and recommendations. Recommendations remain clearly separated from the author's architecture.

## Current scope

### P0

- AWS Blog URL ingestion
- Article content extraction
- Existing architecture diagram detection
- AWS service identification
- Actors, components, relationships, and data flows
- Evidence/provenance model
- Confirmed / Inferred / Recommended / Conflict states
- Architecture IR
- AWS-style diagram rendering
- Three architecture levels
- Solution Architect review foundation
- Model/provider abstraction
- Local-first / bring-your-own-key operation

### Deliberately out of scope for the first version

- Terraform/CDK generation
- Deployment to AWS
- Cost calculator
- Interview-question generation
- Multi-cloud support
- Accounts and team collaboration
- Billing/subscriptions

## Architecture

```text
apps/web
   │
   ├── UI / Architecture workspace
   └── API routes
          │
          ├── Blog ingestion
          ├── Evidence extraction
          ├── Architecture parsing
          └── LLM provider adapter
                     │
                     ├── OpenAI
                     ├── Anthropic
                     ├── Gemini
                     ├── Amazon Bedrock
                     └── Ollama / local model

packages/core
   ├── Architecture IR
   ├── Evidence model
   ├── AWS service catalog
   ├── Review engine
   └── Diagram model
```

The repository is intentionally **provider-agnostic**. No single model is part of the product definition.

## Repository structure

```text
rkeytect/
├── apps/
│   └── web/
├── packages/
│   ├── architecture-core/
│   ├── architecture-parser/
│   ├── architecture-ir/
│   ├── aws-catalog/
│   ├── diagram-engine/
│   ├── evidence-engine/
│   └── review-engine/
├── providers/
├── docs/
├── examples/
├── tests/
└── .github/
```

## Local-first philosophy

The open-source project should remain usable at zero platform cost:

- Run with a local model where practical.
- Bring your own API key for hosted models.
- Keep the hosted demo intentionally limited rather than pretending inference is unlimited and free.
- Avoid a database in the first iteration unless persistence becomes necessary.

## Evaluation matters more than model branding

rkeytect should be benchmarked against a curated set of real AWS architecture articles.

Key metrics:

- service extraction accuracy
- relationship accuracy
- evidence attribution accuracy
- false inference rate
- architecture completeness
- diagram fidelity

The target question:

> **Can an experienced Solution Architect look at rkeytect's output and agree that it represents what the source actually describes?**

## Roadmap

1. **Proof of intelligence** — source → Architecture IR → basic diagram
2. **Architecture workspace** — evidence, AWS icons, editing, levels 1–3
3. **Solution Architect review** — security, reliability, scalability, operational gaps
4. **Open-source platform** — provider plugins, pattern library, benchmark, sharing

## Disclaimer

rkeytect is an AI-assisted architecture analysis project. Generated content is not authoritative AWS guidance and may be wrong. Verify against the original source and official AWS documentation before use, especially for production systems.
