---
title: Customer Transaction Analysis
summary: Segmented an online retailer's customers by how recently, how often and how much they buy — and showed the segments predict who comes back, so marketing can target spend.
category: Customer Analytics
order: 5
featured: false
type: independent
year: 2025
role: Data cleaning, segmentation, validation and write-up
data: Public dataset — UCI Online Retail, 541,909 invoice lines, Dec 2010 – Dec 2011
stack: [SQL, DuckDB, Python, scikit-learn]
skills: [SQL, Python, Machine Learning, Customer Analytics, Statistics]
links:
  repo: https://github.com/FreedomVAce/customer-segmentation-demo
demo: segmentation
glance:
  problem: A retailer treated every customer the same. It needed to know who its most valuable customers are, who is drifting away, and whether a segmentation would hold up in practice.
  did: I cleaned half a million invoice lines in SQL, grouped 4,320 customers into four segments with clear actions, and tested the segments against what customers actually did in the following three months.
  result: The top 16% of customers produce 64% of revenue, and 93% of them bought again versus 39% of lapsed customers — the segments are actionable and hold up on future data.
metrics:
  - { value: '64%', label: 'of revenue from the 16% of customers in the top segment' }
  - { value: '93% vs 39%', label: 'bought again in the next 3 months: top vs lapsed' }
  - { value: '541k', label: 'invoice lines cleaned in SQL' }
icon: users
---

## Why it mattered

Marketing budget spent equally on every customer is mostly wasted. Knowing who to protect, who to grow and who to win back — and trusting that the groups mean something — lets campaigns and account management focus where they pay off.

## What I did

- **Cleaned the data in SQL, rule by rule:** removed lines with no customer, postage and fee codes, zero prices and duplicates; kept cancellations as negative values so spend is net of returns. 399,656 lines and 4,320 customers remain.
- **Built four segments** from recency, frequency and spend, chose the number of segments with separation and stability checks, and named them by a fixed rule.
- **Tested them on the future:** segmented using only data up to 31 August 2011, then measured what each group did over the next three months.
- **Measured retention** by the month customers first bought.

## Try the demo

Select a segment to highlight its customers, and explore the retention heatmap and the out-of-time test.

## Results

| Segment | Customers | Revenue | Bought again (next 3 months) | Action |
|---|---|---|---|---|
| Champions | 16% | 64% | 93% | Protect — account management, no blanket discounts |
| Loyal regulars | 27% | 24% | 68% | Grow — cross-sell and volume tiers |
| New or occasional | 20% | 5% | 61% | Convert — a second-order offer |
| Lapsed | 36% | 7% | 39% | Win back selectively |

- The second order is where most customers are lost: only 15–24% of each month's new customers buy again the following month.
- Retention is seasonal, not a simple decline — every cohort peaks in November, before Christmas.
- As a pure predictor, the segments match order count alone (AUC 0.71 vs 0.72) and a simple model does slightly better (0.74). Their value is that they are easy to act on and explain.

## How it works

SQL in DuckDB for cleaning, features and cohorts (with exact decimal money and stable row ids so results are identical every run); scikit-learn for K-Means with bootstrap stability checks; 13 automated tests, including one that no information from after the cut-off date leaks into the segments.

*Data: [Online Retail](https://doi.org/10.24432/C5BW33) by D. Chen (UCI Machine Learning Repository, 2015), licensed CC BY 4.0.*
