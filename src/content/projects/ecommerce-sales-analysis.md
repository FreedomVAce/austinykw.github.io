---
title: E-Commerce Sales Analysis
summary: End-to-end analysis of the public Olist marketplace dataset — a SQL model over nine raw tables, and statistical tests showing late delivery is by far the strongest predictor of one-star reviews, even within the same seller.
category: End-to-End Analysis
order: 1
status: complete
provenance: public
provenanceNote: Public dataset — "Brazilian E-Commerce Public Dataset by Olist" (Kaggle, 2018), CC BY-NC-SA 4.0. Figures on this page are derived from it under the same licence.
context: Personal project · public dataset
stack: [SQL, DuckDB, Python, pandas, statsmodels, SciPy]
skills: [SQL, Python, Statistics, Dashboards, Customer Analytics]
demo: ecommerce
metrics:
  - { value: '62% vs 9%', label: 'of late vs on-time orders get a 1–2★ review' }
  - { value: '32%', label: 'of all 1–2★ reviews come from the 6.7% of orders that arrive late' }
  - { value: '3%', label: 'of customers ever order a second time' }
links: { codePrivate: true }
icon: cart
---

## Problem

An online marketplace wants to know where revenue comes from, why some customers leave bad reviews, and whether customers come back. The answers sit across nine separate tables — orders, items, payments, reviews, customers, sellers, products, geolocation and category names — that have to be modelled together before any question can be answered.

## Data

The public [Olist dataset](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce): 99,441 orders and 112,650 order items from a Brazilian marketplace, September 2016 to October 2018. The analysis uses the 20 complete months from January 2017 to August 2018; the months before and after hold only a handful of orders.

Data issues handled in the model:

- some orders have several reviews — the latest answer is kept;
- two Portuguese category names are missing from the official translation table;
- the geolocation table has a million rows, several per zip prefix and some outside Brazil — one cleaned coordinate per prefix is used for customer–seller distance;
- "late" is judged by calendar day, because promised dates carry no time of day.

## Approach

1. **SQL model (DuckDB)** — staging, then one row per order with delivery against promise, items, sellers, value, freight, payment, review and distance.
2. **Descriptive analysis** — monthly trend, categories, states, payment mix and repeat purchasing, all in SQL.
3. **Statistical testing** — is lateness really what drives bad reviews, or does it just travel with distance, bigger orders and pricier products?
   - Mann–Whitney test of review scores, late vs on time;
   - logistic regression of 1–2★ reviews on lateness, distance, number of items and sellers, freight share, order value and same-state shipping;
   - a within-seller comparison (Mantel–Haenszel), so seller quality cannot explain the effect;
   - a counterfactual: the average rating if late orders were reviewed like on-time ones.

## Results

- **Growth, then a plateau:** 97,910 sold orders and R$13.4M of product revenue. Monthly revenue rose from about R$340k in the first half of 2017 to about R$920k in 2018 — and then stayed flat all year.
- **Delivery is usually early — which hides the problem.** The median order arrives 12 days before its promised date, yet 6.8% arrive late. Lateness concentrates in the north-east (14–22% in several states, despite 30+ day promises) and spikes after Black Friday 2017 and in early 2018.
- **Reviews fall off a cliff after the promised date:** about 4.1★ on time, 3.7★ one day late, 2.7★ three days late, below 2★ after a week.
- **Late orders are 6.7× as likely to get a 1–2★ review** — 62% of them do, against 9% of on-time orders.
- **The effect survives controls.** Holding distance, items, sellers, freight share, order value and same-state shipping constant, a late order has 18× the *odds* of a 1–2★ review (95% CI 17–19). Orders from several sellers (3.5×) or with several items (2.9×) are the next biggest risks; distance has no effect once lateness is accounted for.
- **It is not just "bad sellers".** Comparing late and on-time orders *from the same seller* (1,203 sellers), the odds ratio is still 15.6 (95% CI 14.7–16.6); within the same product category, 16.1.
- **Late orders are 6.7% of orders but 32% of 1–2★ reviews.** Reviewed like on-time orders, the average rating would rise from 4.16 to 4.29.
- **Customers rarely return:** only 3% ordered twice. Growth is acquisition-led — and with revenue flat through 2018, retention is the untapped lever. Better delivery should help ratings; whether it lifts repeat purchases would need an experiment.

## Recommendations

- Set promised dates per route from observed delivery times rather than one generous buffer — the north-east is both over-promised and still late.
- Flag at-risk orders (multi-seller, multi-item, slow routes) and contact the customer before the promise lapses.
- Treat peak periods (Black Friday) as a logistics capacity problem, not only a sales event.

## Technology

SQL (DuckDB) for staging, the order model and all descriptive tables; Python with statsmodels and SciPy for the tests; pytest — 12 tests, including one checking the regression recovers a known effect on simulated data. The dashboard on this page was originally planned in Tableau and is rebuilt for the web.
