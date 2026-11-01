---
title: Customer Transaction Analysis
summary: Segmented an online retailer's customers by how recently, how often and how much they buy, and demonstrated that the segments predict which customers return, so marketing can target its spend.
category: Customer Analytics
order: 5
featured: false
type: independent
year: 2025
role: Data cleaning, segmentation, validation and reporting
data: Public dataset, UCI Online Retail, 541,909 invoice lines, December 2010 – December 2011
stack: [SQL, DuckDB, Python, scikit-learn]
skills: [SQL, Python, Machine Learning, Customer Analytics, Statistics]
demo: segmentation
glance:
  problem: A retailer treated every customer the same way. It needed to identify its most valuable customers, recognize those drifting away, and confirm that a segmentation would hold up in practice.
  did: Cleaned half a million invoice lines in SQL, grouped 4,320 customers into four segments with clear actions, and validated the segments against actual customer behaviour over the following three months.
  result: The top 16% of customers generate 64% of revenue, and 93% of them purchased again compared with 39% of lapsed customers. The segments are actionable and hold up on future data.
metrics:
  - { value: '64%', label: 'of revenue from the 16% of customers in the top segment' }
  - { value: '93% vs 39%', label: 'purchased again in the next 3 months: top vs lapsed' }
  - { value: '541k', label: 'invoice lines cleaned in SQL' }
icon: users
---

## Why it mattered

A marketing budget spread equally across every customer is largely wasted. Knowing which customers to protect, grow or win back, and trusting that each group is meaningful, lets campaigns and account management focus where they deliver results.

## What I did

- **Cleaned the data in SQL, rule by rule:** removed lines with no customer, postage and fee codes, zero prices and duplicates, and kept cancellations as negative values so spend is net of returns. 399,656 lines and 4,320 customers remain.
- **Built four segments** from recency, frequency and spend, selected the number of segments using separation and stability checks, and named them with a fixed rule.
- **Validated them on future data:** segmented using only data up to 31 August 2011, then measured what each group did over the next three months.
- **Measured retention** by the month customers made their first purchase.

## Try the demo

Select a segment to highlight its customers, and explore the retention heatmap and the out-of-time test.

## Results

| Segment | Customers | Revenue | Purchased again (next 3 months) | Action |
|---|---|---|---|---|
| Champions | 16% | 64% | 93% | Protect: account management, no blanket discounts |
| Loyal regulars | 27% | 24% | 68% | Grow: cross-selling and volume tiers |
| New or occasional | 20% | 5% | 61% | Convert: a second-order offer |
| Lapsed | 36% | 7% | 39% | Win back selectively |

- Most customers are lost at the second order: only 15 to 24% of each month's new customers purchase again the following month.
- Retention is seasonal rather than a steady decline, and every cohort peaks in November, before Christmas.
- As a pure predictor, the segments match order count alone (AUC 0.71 vs 0.72), and a simple model performs slightly better (0.74). Their value is that they are easy to act on and explain.

## How it works

SQL in DuckDB handles cleaning, features and cohorts, using exact decimal values and stable row IDs so results are identical on every run; scikit-learn runs K-Means with bootstrap stability checks. A suite of 13 automated tests includes one confirming that no information from after the cut-off date leaks into the segments.

*Data: [Online Retail](https://doi.org/10.24432/C5BW33) by D. Chen (UCI Machine Learning Repository, 2015), licensed CC BY 4.0.*
