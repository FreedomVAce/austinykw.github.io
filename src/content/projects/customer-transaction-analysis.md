---
title: Customer Transaction Analysis
summary: Customer segmentation and cohort retention on transaction data — RFM features, K-Means clustering and an out-of-time test showing the segments predict who buys again and how much they spend.
category: Segmentation
order: 3
status: complete
provenance: public
provenanceNote: The original analysis was done on confidential customer data. This case study uses the public UCI Online Retail dataset (CC BY 4.0), which has the same invoice-line structure.
context: Professional project · public-data case study
stack: [SQL, DuckDB, Python, pandas, scikit-learn, pytest]
skills: [SQL, Python, Machine Learning, Customer Analytics, Statistics]
demo: segmentation
metrics:
  - { value: '64%', label: 'of net revenue from the 16% of customers in the top segment' }
  - { value: '93% vs 39%', label: 'bought again in the next 3 months: top vs lapsed segment' }
  - { value: '17×', label: 'revenue per customer, top vs lapsed segment, out of time' }
links: { codePrivate: true }
icon: users
---

## Problem

Marketing and commercial teams treated every customer the same. They needed to know who the high-value customers are, who is at risk of lapsing, and how retention changes over time — so campaigns and account management could be targeted. And they needed to know the segments would hold up: a segmentation that only describes the past is not worth acting on.

## Data

The public [UCI Online Retail dataset](https://doi.org/10.24432/C5BW33) (Chen, 2015; CC BY 4.0): 541,909 invoice lines from a UK online gift retailer, December 2010 to December 2011.

Cleaning is done in SQL, rule by rule, with a data-quality report:

| Rule | Lines removed |
|---|---|
| No customer ID — cannot be segmented | 135,080 |
| Not merchandise: postage, fees, manual adjustments, write-offs, vouchers | 1,920 |
| Zero or negative price | 33 |
| Exact duplicates | 5,220 |

Cancellations stay in as negative values, so spend is **net** of returns; customers whose purchases were all cancelled are excluded. 399,656 lines and 4,320 customers remain.

## Approach

1. **Features as of a date** — recency, frequency (orders, not lines) and net monetary value, computed in SQL using only purchases before the as-of date.
2. **Transform** — log scaling to tame heavy tails (a few customers spend 100× the median), then standardisation.
3. **Choose k** — silhouette (separation) and bootstrap stability for k = 2–8. Separation is flat at k = 3–4; k = 4 is chosen because it splits *new* customers from *lapsed* ones, which need opposite actions, while staying stable.
4. **Name segments by rule** — from cluster medians, so names survive re-fits instead of being assigned by eye.
5. **Out-of-time test** — segment using data up to 31 August 2011, then measure what each segment did over the next three months.
6. **Cohort retention** — monthly acquisition cohorts and the share who buy again each month after.

## Results

| Segment | Customers | Revenue | Median recency | Median orders | Bought again (out of time) |
|---|---|---|---|---|---|
| Champions | 16% | **64%** | 9 days | 10 | **93%** |
| Loyal regulars | 27% | 24% | 52 days | 4 | 68% |
| New or occasional | 20% | 5% | 20 days | 2 | 61% |
| Lapsed | 36% | 7% | 186 days | 1 | 39% |

- The top 20% of customers produce 74% of net revenue.
- Segmented on past data only, Champions were worth £3,355 each over the following three months against £198 for lapsed customers — the segments **predict** behaviour, not just describe it.
- Month-1 retention for 2011 cohorts runs 15–24%: the second order is where most customers are lost, which is why the "New or occasional" segment gets a conversion offer rather than a discount.
- Retention is not a simple decay curve: every cohort peaks in November, the pre-Christmas season — so a cohort's summer dip is not churn.

## Business impact

In the original work, insights were delivered through an interactive dashboard to support marketing and commercial decision-making.

## Challenges

- **Reproducibility.** Floating-point sums let fully-returned customers flip in and out of the data, and unstable row ids changed which duplicate was kept. Exact decimal money and file row numbers fixed both; a test now checks that every customer's features are identical run to run.
- **Censored cohorts.** The first month's cohort includes long-standing customers seen for the first time and must not be compared with the others; and the data ends nine days into its last month, which made every cohort look like it collapsed until incomplete months were excluded.

## Technology

SQL (DuckDB) for cleaning, customer features and cohorts; Python, pandas and scikit-learn for segmentation and validation; pytest — 12 tests, including one that no information after the as-of date leaks into the features.
