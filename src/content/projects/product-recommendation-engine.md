---
title: Product Recommendation Engine
summary: A hybrid recommender for a B2B trade supplier that blends co-purchase behaviour, basket analysis, style matching and expert-curated pairings — tuned per customer segment, evaluated out of time, and served through an API.
category: Machine Learning
order: 4
status: complete
provenance: synthetic
provenanceNote: Built on confidential transaction and catalogue data. This version runs the same methods on a synthetic catalogue of fictional brands and a simulated purchase history; no real data, metrics or business rules are reproduced.
context: Professional project · rebuilt as a demo
stack: [Python, NumPy, SciPy, pandas, FastAPI, pytest]
skills: [Python, Machine Learning, Recommender Systems, Data Pipelines]
demo: recommender
metrics:
  - { value: '3.2×', label: 'ranking quality (NDCG@10) vs recommending best-sellers' }
  - { value: '+6%', label: 'NDCG@10 over the best single signal, with 77% vs 57% catalogue coverage' }
  - { value: '209k', label: 'synthetic order lines across 6,300 customers and 803 products' }
links: { codePrivate: true }
icon: sparkles
---

## Problem

A distributor with a large catalogue wanted "often bought with" and cart recommendations that help customers find the parts they need and raise basket size. Purchase history is sparse for most products, trade customers buy very differently from retail customers, and the catalogue is full of near-duplicates: the same faucet in four finishes.

## Data

The public version uses a synthetic catalogue of 803 products in 23 categories from six fictional brands, with the structure that makes B2B recommendation hard:

- **finish variants** — substitutes, which must never be recommended alongside each other;
- **matched sets** — a faucet and a drain in the same brand and finish;
- **required parts** — a shower trim needs its valve; a water heater needs an expansion tank.

6,300 customers in three segments buy for *jobs* — remodels, rough-ins, water-heater swaps — over two years: 209,000 order lines on 72,600 invoices. A third of jobs are split across two invoices; repairs add single-item noise.

## Approach

Four signals, each covering the others' blind spots:

| Signal | Captures |
|---|---|
| Collaborative filtering | products the same customers buy — recency-weighted cosine similarity, shrunk when few customers overlap |
| Market basket | products bought on the same invoice — confidence, kept only when lift > 1 and the pair repeats |
| Content (style match) | same brand, series or finish — but **never the same category**, because a second faucet is a substitute, not a complement |
| Curated rules | compatible-with (both ways) and requires (one way) pairs from product experts |

The hybrid score is a weighted sum per customer segment, plus a small popularity term for ties and products with no history. Variants of anything already on the page or in the cart are excluded.

## Technical implementation

- Signals are built with sparse matrices (SciPy) and stored as anchor × candidate score tables.
- An offline pipeline generates data, tunes, evaluates, and writes the serving model.
- A **FastAPI** service loads the model once and serves product-page and cart recommendations from memory.
- 17 tests cover signal invariants, ranking maths, leakage-free time splits, out-of-time performance, the API contract, and that the data behind the demo on this page reproduces the full model's top-5 for more than 95% of products.

## Evaluation

Weights are grid-searched per segment (286 combinations) on a validation window and reported on a later test window the tuning never saw. Each test invoice with two or more products hides one; the rest is the cart; the question is where the hidden product ranks.

| Method | Hit rate @10 | NDCG@10 | Catalogue coverage |
|---|---|---|---|
| Popularity | 0.205 | 0.112 | 3% |
| Collaborative filtering | 0.298 | 0.205 | 47% |
| Curated rules | 0.341 | 0.218 | 36% |
| Market basket | 0.545 | 0.342 | 57% |
| Hybrid — hand-set weights | 0.474 | 0.320 | 61% |
| **Hybrid — tuned per segment** | **0.547** | **0.362** | **77%** |

## Results

- The tuned hybrid ranks best in every segment and recommends from far more of the catalogue than any single signal.
- **Hand-picked blend weights did worse than the best single signal.** A hybrid only helps once it is tuned against held-out data.
- Tuning sets collaborative filtering to zero for basket completion: within an invoice it adds nothing market-basket analysis does not already capture. Retail customers, with the least history, lean most on curated rules.
- Predicting a customer's *next* order is a different problem: every method lands near popularity, because a trade account's next invoice is usually a new job. That calls for personalisation from each customer's own history — the next step, not a tuning problem.

## Business impact

In the original work, the system was designed to improve cross-sell opportunities and increase basket size.

## Challenges

- **Substitutes vs complements.** Similarity-based methods naturally recommend the same product in another finish; the design has to exclude variants and keep content similarity out of the anchor's own category.
- **Sparse history.** Most products and most retail customers have little data, which is where curated rules and content matching earn their place.
- **Honest evaluation.** Blending looks better than it is when weights are judged on the data they were chosen on; separate validation and test windows keep the reported numbers honest.

## Technology

Python, NumPy, SciPy (sparse matrices) and pandas for the signals and evaluation; FastAPI for serving; pytest. The explorer on this page re-implements the hybrid scoring in the browser over exported candidate lists, so changing weights or the cart re-ranks instantly.
