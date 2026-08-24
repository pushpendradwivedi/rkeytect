# Article ingestion

The ingestion layer is intentionally deterministic before an LLM is involved.

## Pipeline

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
AWS service extraction
   ↓
Level-1 Architecture IR
```

The first implementation does **not** infer service-to-service relationships. Mentioning Lambda and DynamoDB does not prove Lambda writes to DynamoDB. Relationships will be introduced by an evidence-backed interpretation stage.

Architecture images are flagged as candidates using conservative metadata matching. Image pixels are not yet interpreted; that is a later stage.

## Safety and scope

- HTTPS only.
- AWS-hosted URLs only for V1.
- No credentials are accepted by this package.
- Article output is treated as untrusted input.
- AI-generated interpretations must remain visibly separate from confirmed source facts.
