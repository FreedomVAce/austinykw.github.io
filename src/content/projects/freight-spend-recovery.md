---
title: Freight Spend & Recovery
summary: Identified where freight costs were eroding margin and gave finance and logistics a single view of freight spend and the amount recovered from customers.
category: BI & Cost Analytics
order: 2
featured: true
type: work
year: 2022 – present
role: End-to-end analysis, data model and reporting
data: Carrier and customer invoice exports. The interactive demo runs on a simulated dataset with the same structure.
stack: [SQL, Python, Power BI, Dundas BI, DuckDB]
skills: [SQL, Dashboards, Data Pipelines, Python]
demo: freight-dashboard
glance:
  problem: Freight is one of a distributor's largest costs, but carrier bills and the freight charged to customers sat in separate systems. There was no reliable way to measure how much was being recovered or where it was being lost.
  did: Matched every carrier charge to a shipment and to the amount billed to the customer, broke the unrecovered amount down by cause, and built monthly and yearly reporting for finance and logistics.
  result: Freight cost fell by 5% and freight recovered from customers rose by 10%. The reporting also surfaced billing errors and undercharged shipments for follow-up.
metrics:
  - { value: '−5%', label: 'freight cost' }
  - { value: '+10%', label: 'freight recovered from customers' }
  - { value: '5 leak types', label: 'detected automatically in the demo', note: 'demo data' }
icon: truck
---

## Why it mattered

For a multi-branch distributor, every freight dollar that is not recovered reduces margin directly. The key questions were specific: which branches waive freight they should charge, which carrier rate increases never reached customer pricing, and which charges were billed twice.

## What I built

- **A single reconciled view.** Matched every carrier invoice line to a shipment and to the customer's freight charge, including lines with incomplete or missing shipment references.
- **A breakdown of the gap.** Assigned each unrecovered dollar to one cause: free-freight thresholds, discretionary waivers, credits, undercharging, or delivered pricing that does not cover the cost.
- **Findings with a dollar value.** Built one check per leak type (waivers well above peers, outdated branch freight tables, carrier increases not passed on, duplicate billing and credit spikes), each sized against comparable branches or carriers.
- **Reporting** that finance and logistics review monthly and yearly.

## Try the demo

The dashboard above filters by year, region and carrier, and the panel below it runs real SQL in your browser. On the demo data it detects five leak patterns. For example, one branch waives freight on 31% of chargeable orders against a peer median of about 6%, and 526 carrier lines were billed twice. Waiver sizing is an upper bound, since some waived freight helps win orders; duplicate billing is fully recoverable.

## How it works

The model is written in plain SQL, run here in DuckDB and originally delivered through Power BI and Dundas BI:

1. **Staging:** every carrier reference format is normalised to one key.
2. **Reconciliation:** lines are matched by reference, or by branch, carrier, date and weight when exactly one shipment fits. A shipment billed twice for the same amount is flagged.
3. **One row per shipment:** cost, amount charged, credited, included in price, recovered, and a status.
4. **Attribution:** an identity is checked on every row: cost − recovered = threshold + waivers + credits + undercharging + pricing gap − over-recovery.
5. **Findings:** each pattern is detected from the data, with no branch or carrier hard-coded. Automated tests confirm every pattern is still detected on a different random dataset.

## What I learned

A single recovery rate hides the full picture. Breaking the gap down by cause turns one number into actions with clear owners: branch managers for waivers, procurement for carrier rates and accounts payable for duplicate billing.
