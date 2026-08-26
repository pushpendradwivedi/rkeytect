# Architecture views

rkeytect separates relationships by architectural role instead of putting every arrow on one canvas.

- **Runtime** — request/call/response execution paths.
- **Data** — ingestion, storage, embeddings, retrieval and document movement.
- **Provisioning** — infrastructure-as-code and deployment relationships.
- **Control** — triggers, configuration and management relationships.
- **Security** — authentication, authorization, IAM and encryption relationships.
- **Other** — relationships that could not be safely classified.

This is a presentation layer over the same evidence-backed Architecture IR. Filtering must never create new relationships or change their evidence/state.
