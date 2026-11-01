---
title: E-Commerce Sales Analysis
summary: Identified late delivery, rather than distance or price, as the main driver of a marketplace's one-star reviews, using a SQL model of 99,000 orders across nine tables.
category: Analytics & Statistics
order: 6
featured: true
type: independent
year: 2026
role: SQL data model, analysis, statistical testing and dashboard
data: Public dataset, Olist Brazilian marketplace, 99,441 orders, 2016 – 2018
stack: [SQL, DuckDB, Python, statsmodels]
skills: [SQL, Python, Statistics, Dashboards, Customer Analytics]
demo: ecommerce
glance:
  problem: A marketplace needed to understand what drives negative reviews and why customers do not return, with the relevant data spread across nine separate tables.
  did: Modelled the nine tables in SQL into a single view per order, then tested whether late delivery truly drives negative reviews or simply coincides with distance, larger orders or specific sellers.
  result: Late orders account for 6.7% of orders but 32% of all one- and two-star reviews, and the effect holds when comparing orders from the same seller. Eliminating late deliveries would raise the average rating from 4.16 to 4.29.
metrics:
  - { value: '62% vs 9%', label: 'of late vs on-time orders receive a 1–2★ review' }
  - { value: '32%', label: 'of all 1–2★ reviews come from the 6.7% of orders that arrive late' }
  - { value: '3%', label: 'of customers place a second order' }
icon: cart
---

## Why it mattered

Ratings determine which sellers and products customers trust, and a marketplace where only 3% of customers return depends on every first order going well. Understanding what causes negative reviews shows the business where to invest.

## What I did

- **Built a SQL model** joining orders, items, payments, reviews, customers, sellers, products, geolocation and category names into one row per order, resolving duplicate reviews, missing category translations and a million-row location table.
- **Analysed** sales, delivery performance by state and month, categories, payments and repeat purchasing.
- **Tested the main finding three ways:** a rank test of review scores; a regression that holds distance, order size, number of sellers, freight cost and order value constant; and a comparison within the same seller, so seller quality cannot explain the result.

## Try the demo

Switch metrics on each chart. The middle row presents the main finding: how reviews change with days early or late, and what predicts a one- or two-star review.

## Results

- **Reviews drop sharply after the promised date:** about 4.1★ on time, 3.7★ one day late, 2.7★ three days late and below 2★ after a week.
- **The effect is not limited to poor sellers:** comparing orders from the same seller, late delivery still increases the odds of a 1–2★ review about 16-fold.
- **Early delivery is the norm, which masks the problem:** the typical order arrives 12 days before its promised date, but late rates reach 14 to 22% in several north-eastern states and spike after Black Friday.
- **Few customers return:** only 3% ordered twice, and monthly revenue was flat through 2018, making retention the largest untapped opportunity.

## Recommendations

- Set promised delivery dates for each route based on observed delivery times, rather than one generous buffer.
- Flag at-risk orders (multiple sellers, multiple items or slow routes) and contact the customer before the promised date passes.
- Plan peak periods such as Black Friday as a logistics capacity challenge, not only a sales event.

## How it works

SQL in DuckDB handles staging, the order model and all descriptive tables; Python with statsmodels and SciPy runs a Mann–Whitney test, logistic regression (n = 95,082) and a Mantel–Haenszel within-seller comparison. Because this is observational data, the evidence is strong but shows association rather than proof of cause.

*Data: [Brazilian E-Commerce Public Dataset by Olist](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce) (Kaggle, 2018), licensed CC BY-NC-SA 4.0.*
