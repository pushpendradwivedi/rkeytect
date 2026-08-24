# Article ingestion

The ingestion layer is deterministic before an LLM is involved.

```text
AWS Blog URL
   ↓
URL validation
   ↓
HTML fetch
   ↓
Article extraction
   ├── title
   ├── headings
   ├── text
   └── images
   ↓
AWS + generic architecture component extraction
   ↓
Evidence-backed relationship candidates
   ↓
Level-1 Architecture IR
```

The current relationship extractor only accepts explicit relationship language and attaches the matching source excerpt as evidence. It does not turn co-occurrence into a relationship.

The Kiro/Bedrock/MCP benchmark demonstrates why generic components matter: architecture diagrams contain actors and non-AWS components such as Kiro and MCP servers alongside AWS services.

Architecture images are flagged as candidates using conservative metadata matching. Image pixels are not yet interpreted; that is a separate source-evidence stage.

## Safety and scope

- HTTPS only.
- AWS-hosted URLs only for V1.
- No credentials are accepted by this package.
- Article output is treated as untrusted input.
- AI-generated interpretations must remain visibly separate from confirmed source facts.
