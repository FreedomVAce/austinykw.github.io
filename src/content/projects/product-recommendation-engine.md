---
title: Product Recommendation Engine
summary: '"Often bought with" and cart recommendations for a B2B supplier, designed to increase basket size by blending four signals tuned for each customer segment.'
category: Machine Learning
order: 3
featured: true
type: work
year: 2026
role: End-to-end design, modelling, evaluation and API
data: Order history and the product catalogue. The interactive demo runs on a simulated catalogue and order history.
stack: [Python, SciPy, FastAPI, Docker, pytest]
skills: [Python, Machine Learning, Recommender Systems, Data Pipelines]
demo: recommender
glance:
  problem: Customers buying a faucet also need the matching drain, valves and supply lines, but in a catalogue of tens of thousands of parts they often miss them. The business needed recommendations that increase basket size and help customers find the right parts.
  did: 'Built a recommendation engine that combines four signals: products bought together, products bought by similar customers, product attributes and expert-curated pairings. The blend is tuned for each customer segment and served through an API.'
  result: Tested on later orders it had never seen, the tuned blend ranked the correct product about 3× better than recommending best sellers, and drew on far more of the catalogue than any single method.
metrics:
  - { value: '3.2×', label: 'better ranking than best sellers', note: 'offline test, demo data' }
  - { value: '77%', label: 'of the catalogue recommended, vs 57% for the best single method', note: 'demo data' }
  - { value: '4 signals', label: 'blended and tuned for each customer segment' }
icon: sparkles
---

## Why it mattered

Cross-selling directly increases basket size. B2B recommendations, however, face challenges that a generic "customers also bought" approach misses: most products have little purchase history, trade and retail customers behave very differently, and the catalogue contains many near duplicates, such as the same faucet in four finishes, which should never be recommended together.

## What I built

- **Four complementary signals:** products bought on the same order; products bought by the same customers; matching brand, series or finish, excluding the same category, since a second faucet is a substitute rather than an add-on; and compatibility rules from product experts.
- **A blend tuned for each customer segment,** so high-volume trade accounts and occasional retail buyers each receive the mix that performs best for them.
- **A FastAPI service** that serves product page and cart recommendations from a prebuilt model.

## Try the demo

Select a product or build a cart, choose a customer type, and adjust the weights to see how each signal changes the list. Each recommendation shows why it was suggested.

## Results

The blend was tuned on one period and evaluated on a later period it had never seen. Each test order hides one product, and the engine is scored on how highly it ranks that product.

| Method | Ranking quality (NDCG@10) | Catalogue coverage |
|---|---|---|
| Best sellers | 0.112 | 3% |
| Best single signal (bought together) | 0.342 | 57% |
| Blend with hand-picked weights | 0.320 | 61% |
| **Blend tuned per segment** | **0.362** | **77%** |

- Hand-picked weights performed *worse* than the best single signal; a blend only adds value once it is tuned against held-out data.
- The tuned blend ranks the correct product higher (+0.020, 95% CI +0.015 to +0.025) rather than finding it more often in the top ten.
- On simulated data, the data generator influences which method wins. What transfers to production is the method: tune on one period, report on another and compare against baselines. The next production step is an A/B test on add-to-cart rate and basket value.

## How it works

Signals are built with sparse matrices (SciPy) and stored as product-to-product score tables, and the blend weights are grid-searched for each segment. Finish variants of any product on the page or in the cart are excluded. A suite of 18 automated tests covers the signals, the ranking calculations, the time split and the API.
