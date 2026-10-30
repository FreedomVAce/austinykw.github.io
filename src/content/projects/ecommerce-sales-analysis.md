---
title: E-Commerce Sales Analysis
summary: Showed that late delivery — not distance or price — is what drives a marketplace's one-star reviews, using a SQL model of 99,000 orders across nine tables.
category: Analytics & Statistics
order: 6
featured: true
type: independent
year: 2026
role: SQL data model, analysis, statistical testing and dashboard
data: Public dataset — Olist Brazilian marketplace, 99,441 orders, 2016 – 2018
stack: [SQL, DuckDB, Python, statsmodels]
skills: [SQL, Python, Statistics, Dashboards, Customer Analytics]
demo: ecommerce
glance:
  problem: A marketplace wanted to know what drives bad reviews and why customers do not come back — with the answers spread across nine separate tables.
  did: I modelled the nine tables in SQL into one view per order, then tested whether late delivery really drives bad reviews or just travels with distance, bigger orders or particular sellers.
  result: Late orders are 6.7% of orders but 32% of all one- and two-star reviews, and the effect holds even when comparing orders from the same seller. Fixing lateness would lift the average rating from 4.16 to 4.29.
metrics:
  - { value: '62% vs 9%', label: 'of late vs on-time orders get a 1–2★ review' }
  - { value: '32%', label: 'of all 1–2★ reviews come from the 6.7% of orders that arrive late' }
  - { value: '3%', label: 'of customers ever order a second time' }
icon: cart
---

## Why it mattered

Ratings decide which sellers and products customers trust, and a marketplace where only 3% of customers return depends on every first order going well. Knowing what actually causes bad reviews tells the business where to invest.

## What I did

- **Built a SQL model** joining orders, items, payments, reviews, customers, sellers, products, geolocation and category names into one row per order — handling duplicate reviews, missing category translations and a million-row location table.
- **Analysed** sales, delivery performance by state and month, categories, payments and repeat purchasing.
- **Tested the main finding three ways:** a rank test of review scores; a regression that holds distance, order size, number of sellers, freight cost and order value constant; and a comparison within the same seller, so seller quality cannot explain it.

## Try the demo

Switch metrics on each chart. The middle row is the main finding: how reviews change with days early or late, and what predicts a one- or two-star review.

## Results

- **Reviews fall off a cliff after the promised date:** about 4.1★ on time, 3.7★ one day late, 2.7★ three days late, below 2★ after a week.
- **It is not just bad sellers:** comparing orders from the same seller, late delivery still raises the odds of a 1–2★ review about 16-fold.
- **Delivery is usually early, which hides the problem:** the typical order arrives 12 days before its promised date, but late rates reach 14–22% in several north-eastern states and spike after Black Friday.
- **Customers rarely return:** only 3% ordered twice, and monthly revenue was flat through 2018 — retention is the untapped lever.

## Recommendations

- Set promised dates per route from observed delivery times, not one generous buffer.
- Flag at-risk orders (several sellers, several items, slow routes) and contact the customer before the promise lapses.
- Plan peak periods such as Black Friday as a logistics capacity problem, not only a sales event.

## How it works

SQL in DuckDB for staging, the order model and all descriptive tables; Python with statsmodels and SciPy for a Mann–Whitney test, logistic regression (n = 95,082) and a Mantel–Haenszel within-seller comparison. This is observational data — the evidence is strong, but it shows association, not proof of cause.

*Data: [Brazilian E-Commerce Public Dataset by Olist](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce) (Kaggle, 2018), licensed CC BY-NC-SA 4.0.*
