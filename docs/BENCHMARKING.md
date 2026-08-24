# Architecture Benchmarking

rkeytect should be evaluated against hand-authored golden architectures, not only subjective visual quality.

For each benchmark article we record:

1. Components explicitly supported by the source.
2. Explicit relationships and flow direction.
3. Evidence references for each claim.
4. Expected omissions that must remain unknown.
5. Recommendations that must never be promoted to source architecture.

The Kiro + Bedrock Knowledge Bases + MCP article is the first benchmark. It deliberately contains AWS and non-AWS components and a multi-step retrieval flow.

## Safety metric

A false positive relationship is more damaging than an omitted relationship. The system should prefer `unknown` or `inferred` over an unsupported `confirmed` relationship.
