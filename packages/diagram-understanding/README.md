# Diagram understanding

This package defines the contract for converting an architecture image into **candidate evidence**. It deliberately does not declare that a detected box or arrow is architectural truth.

## Pipeline

```text
image
  ↓
regions / OCR / vision model
  ↓
candidate components + candidate edges
  ↓
evidence-fusion
  ↓
Architecture IR
```

Every candidate must retain:

- source image URL
- image locator or region
- extracted label
- evidence kind = `diagram`
- confidence

A future vision adapter can use a hosted multimodal model or a local model. The core package must remain provider-agnostic.

## Safety rule

Diagram interpretation is AI-assisted. The UI must label the resulting architecture as AI-generated and distinguish source evidence from inference/recommendation.
