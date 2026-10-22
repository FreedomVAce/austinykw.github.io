---
title: Freight Spend & Recovery
summary: Reconciling what a distributor pays carriers with what it recovers from customers — a SQL model that matches every carrier charge to a shipment, attributes every unrecovered dollar to a cause, and sizes the leaks.
category: BI & Cost Analytics
order: 2
status: complete
provenance: synthetic
provenanceNote: Built on confidential company data and originally delivered in Power BI. This version rebuilds the analysis in SQL on synthetic carrier and customer invoices for fictional branches, carriers and customers; no real figures are reproduced.
context: Professional project · rebuilt as a demo
stack: [SQL, DuckDB, Python, pandas, Power BI, pytest]
skills: [SQL, Dashboards, Data Pipelines]
demo: freight-dashboard
metrics:
  - { value: '105k', label: 'shipments reconciled to carrier and customer invoices' }
  - { value: '99.99%', label: 'carrier lines matched, including 3% with missing references' }
  - { value: '$185k', label: 'leakage found and sized across five findings (synthetic)' }
links: { codePrivate: true }
icon: truck
---

## Problem

Freight is a large, fragmented cost. Carriers invoice each branch weekly, while recovery from customers happens separately — as a freight line on the invoice, as freight built into delivered pricing, or not at all. Finance and logistics had no single view of how much freight was being recovered, or where it was not.

## Business context

For a multi-branch distributor, every unrecovered freight dollar comes straight out of margin. The useful questions are specific: which branches waive freight they should charge, which carrier rate changes never reached customer pricing, and which charges were billed twice.

## Data

Three exports that do not share a clean key:

| Export | Rows | What makes it hard |
|---|---|---|
| Dispatch log | 105k | Outbound customer shipments mixed with inbound supplier freight and inter-branch transfers, which are not billable |
| Carrier invoice lines | 106k | References arrive as `SH-0001234`, `1234`, `SH 0001234` or blank; some lines are billed twice |
| Customer freight lines | 67k | Charges, later credits, and freight included in delivered pricing |

The synthetic data has the same structure as the original exports and four years of activity across 10 branches and 6 carriers, with annual rate increases, a monthly fuel surcharge, and branch freight tables re-priced each January.

## Approach

The model is plain SQL, run in DuckDB:

1. **Staging** — explicit types; every carrier-reference format normalised to the dispatch key.
2. **Reconciliation** — carrier lines matched by reference, else by branch + carrier + date + weight when exactly one shipment fits. A shipment billed twice for the same amount is flagged as a duplicate.
3. **One fact row per shipment** — cost, charged, credited, included in price, recovered, and a recovery status.
4. **Attribution** — every unrecovered dollar on a billable shipment is assigned to one cause, as an identity tested on every row:
   `cost − recovered = free-freight threshold + discretionary waivers + credits + under-charging + delivered-pricing gap − over-recovery`
5. **Findings and sizing** — one query per leakage pattern, each sized against peer branches or carriers rather than an arbitrary target.

## Results

105,168 shipments, $9.2M of freight spend, **62.4%** of billable freight recovered (synthetic data).

| Finding | Detected by | Sized at |
|---|---|---|
| One branch waives freight on 31% of chargeable orders vs a ~6% peer median | waiver rate by branch | $101.6k |
| 526 carrier lines billed twice | same shipment, same amount, two invoices | $44.6k incl. tax |
| One branch's freight table never refreshed after year one | charge-to-cost ratio by branch and year | $19.0k |
| A carrier's mid-year rate increase not passed on until January | charge-to-cost ratio vs same-service peers | $16.2k |
| One quarter where a quarter of charged shipments were credited | credit rate by branch and quarter | $3.7k |

These are upper bounds: some waived freight wins orders that would otherwise go elsewhere, so the recoverable share of the waiver finding depends on price sensitivity — a pilot at the outlier branch would measure it. Duplicate billing, by contrast, is recoverable in full.

The largest cost on the page is not a leak at all: free freight above the order threshold costs about $0.6M a year, 7–12% of order value. Whether the threshold pays for itself is a pricing decision that this data can frame but not settle.

## Business impact

In the original work, the reporting gave finance and logistics a shared, repeatable view of freight cost recovery and surfaced billing discrepancies and under-charged shipments for follow-up.

## Challenges

- **No common key.** A tenth of carrier lines need normalisation or a fallback match; the fallback only accepts a match when it is unambiguous.
- **Not every shipment is billable.** Supplier freight and transfers are real cost but cannot be recovered from customers, so the recovery rate must exclude them.
- **Avoiding circular analysis.** The findings queries know nothing about which branch or carrier is "bad". The tests run on a different random dataset and still have to find every pattern.

## What I learned

Recovery rate on its own hides the story. Splitting the gap into causes turns one number into actions with owners: branch managers for waivers, procurement for carrier rates, accounts payable for duplicate billing.

## Technology

SQL (DuckDB) for staging, reconciliation, the fact model, KPIs and findings; Python and pandas for the synthetic data and export; pytest — 22 tests check the reconciliation against ground truth to the cent, the attribution identity on every shipment, and that every planted pattern is found. The original reporting was built in Power BI with DAX; the dashboard on this page is rebuilt for the web and runs DuckDB-WASM for live queries.
