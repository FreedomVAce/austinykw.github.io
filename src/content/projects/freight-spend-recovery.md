---
title: Freight Spend & Recovery
summary: Found where freight costs were leaking out of margin — and gave finance and logistics one view of what freight cost and how much was recovered from customers.
category: BI & Cost Analytics
order: 2
featured: true
type: work
year: 2022 – present
role: Analysis, data model and reporting — end to end
data: Carrier and customer invoice exports. The interactive demo runs on a simulated dataset with the same structure.
stack: [SQL, Python, Power BI, Dundas BI, DuckDB]
skills: [SQL, Dashboards, Data Pipelines, Python]
demo: freight-dashboard
glance:
  problem: Freight is one of a distributor's biggest costs, but carrier bills and the freight charged to customers lived in separate systems. Nobody could say how much was being recovered, or where it was slipping away.
  did: I matched every carrier charge to a shipment and to what the customer was billed, split the unrecovered amount into causes, and built monthly and yearly reporting for finance and logistics.
  result: Freight cost fell by 5% and freight recovered from customers rose by 10%. The reporting also surfaced billing errors and under-charged shipments for follow-up.
metrics:
  - { value: '−5%', label: 'freight cost' }
  - { value: '+10%', label: 'freight recovered from customers' }
  - { value: '5 leak types', label: 'detected automatically in the demo', note: 'demo data' }
icon: truck
---

## Why it mattered

For a multi-branch distributor, every freight dollar that is not recovered comes straight out of margin. The useful questions were specific: which branches waive freight they should charge, which carrier rate increases never reached customer pricing, and which charges were billed twice.

## What I built

- **One reconciled view.** Every carrier invoice line matched to a shipment and to the customer's freight charge — including lines with messy or missing shipment references.
- **A breakdown of the gap.** Each unrecovered dollar is assigned to one cause: free-freight thresholds, discretionary waivers, credits, under-charging, or delivered pricing that does not cover the cost.
- **Findings with a dollar value.** One check per leak type — waivers far above peers, stale branch freight tables, carrier increases not passed on, duplicate billing, credit spikes — each sized against comparable branches or carriers.
- **Reporting** that finance and logistics review monthly and yearly.

## Try the demo

The dashboard above lets you filter by year, region and carrier, and the panel below it runs real SQL in your browser. On the demo data it finds five leak patterns — for example, one branch waiving freight on 31% of chargeable orders against a peer median of about 6%, and 526 carrier lines billed twice. Waiver sizing is an upper bound, since some waived freight wins orders; duplicate billing is recoverable in full.

## How it works

The model is plain SQL (run here in DuckDB, originally delivered through Power BI and Dundas BI):

1. **Staging** — every carrier-reference format normalised to one key.
2. **Reconciliation** — match by reference, or by branch + carrier + date + weight when exactly one shipment fits; a shipment billed twice for the same amount is flagged.
3. **One row per shipment** — cost, charged, credited, included in price, recovered, and a status.
4. **Attribution** — an identity checked on every row: cost − recovered = threshold + waivers + credits + under-charging + pricing gap − over-recovery.
5. **Findings** — each detected by the data, with no branch or carrier hard-coded; automated tests check that every pattern is still found on a different random dataset.

## What I learned

A single recovery rate hides the story. Splitting the gap into causes turns one number into actions with owners: branch managers for waivers, procurement for carrier rates, accounts payable for duplicate billing.
