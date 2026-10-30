---
title: Product Recommendation Engine
summary: '"Often bought with" and cart recommendations for a B2B supplier, built to raise basket size — blending four signals and tuned separately for each type of customer.'
category: Machine Learning
order: 2
featured: true
type: work
year: 2026
role: Design, modelling, evaluation and API — end to end
data: Order history and the product catalogue. The interactive demo runs on a simulated catalogue and order history.
stack: [Python, SciPy, FastAPI, Docker, pytest]
skills: [Python, Machine Learning, Recommender Systems, Data Pipelines]
demo: recommender
glance:
  problem: Customers buying a faucet also need the matching drain, valves and supply lines — but in a catalogue of tens of thousands of parts, they often miss them. The business wanted recommendations that raise basket size and help customers find the right parts.
  did: I built a recommendation engine that combines four signals — what customers buy together, what similar customers buy, product attributes, and expert-curated pairings — tuned per customer segment and served through an API.
  result: In testing on later orders it had never seen, the tuned blend ranked the right product about 3× better than recommending best-sellers, and recommended from far more of the catalogue than any single method.
metrics:
  - { value: '3.2×', label: 'better ranking than best-sellers', note: 'offline test, demo data' }
  - { value: '77%', label: 'of the catalogue recommended, vs 57% for the best single method', note: 'demo data' }
  - { value: '4 signals', label: 'blended and tuned per customer segment' }
icon: sparkles
---

## Why it mattered

Cross-sell is a direct lever on basket size. But B2B recommendation has traps that a generic "customers also bought" misses: most products have little purchase history, trade and retail customers behave very differently, and the catalogue is full of near-duplicates — the same faucet in four finishes, which must never be recommended alongside each other.

## What I built

- **Four signals, each covering the others' blind spots:** products bought on the same order; products bought by the same customers; matching brand, series or finish (but never the same category — a second faucet is a substitute, not an add-on); and compatibility rules from product experts.
- **A blend tuned per customer segment,** so high-volume trade accounts and occasional retail buyers each get the mix that works for them.
- **A FastAPI service** that serves product-page and cart recommendations from a pre-built model.

## Try the demo

Pick a product or build a cart, choose a customer type, and drag the weights to see how each signal changes the list. Each recommendation shows why it was suggested.

## Results

Tested honestly: the blend was tuned on one period and scored on a later period it never saw. Each test order hides one product; the question is how highly the engine ranks it.

| Method | Ranking quality (NDCG@10) | Catalogue coverage |
|---|---|---|
| Best-sellers | 0.112 | 3% |
| Best single signal (bought together) | 0.342 | 57% |
| Blend with hand-picked weights | 0.320 | 61% |
| **Blend tuned per segment** | **0.362** | **77%** |

- Hand-picked weights did *worse* than the best single signal — a blend only helps once it is tuned against held-out data.
- The tuned blend ranks the right product higher (+0.020, 95% CI +0.015 to +0.025) rather than finding it more often in the top ten.
- On simulated data the generator shapes the winner; the method — tune on one period, report on another, compare with baselines — is what transfers. The production next step is an A/B test on add-to-cart rate and basket value.

## How it works

Signals are built with sparse matrices (SciPy) and stored as product-to-product score tables; the blend weights are grid-searched per segment. Finish variants of anything on the page or in the cart are excluded. 18 automated tests cover the signals, the ranking maths, the time split and the API.
