# Vision evaluation

rkeytect should benchmark multimodal providers without making any provider the source of truth.

## Required output

A vision adapter must return:

- candidate diagram regions
- labels when visible
- candidate directed edges when visually supported
- confidence for every observation
- warnings for ambiguous or unreadable areas

## Evaluation

For each golden diagram, measure:

- component precision / recall
- relationship precision / recall
- label accuracy
- unsupported-edge rate
- evidence retention

The most important safety metric is **unsupported-edge rate**. A model that invents relationships can produce a plausible but incorrect architecture and should score worse than a model that omits an ambiguous edge.

## Human verification

A benchmark result is not a production certification. Reviewers should inspect low-confidence observations and all relationships promoted to `confirmed`.

## Provider neutrality

The benchmark runner should accept any implementation of `DiagramVisionProvider`. API keys and vendor SDKs stay outside the core package.
