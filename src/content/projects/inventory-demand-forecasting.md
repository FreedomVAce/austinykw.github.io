---
title: Inventory Demand Forecasting
summary: Branch-level demand forecasting from raw stock-movement logs — rebuilding stock positions, backtesting seasonal regression, Holt-Winters and SARIMA against a baseline, and turning the forecast into reorder points.
category: Forecasting
order: 5
status: complete
provenance: synthetic
provenanceNote: Built on confidential inventory data. This version runs the same methods on a simulated stock ledger for fictional products and branches; the simulation's parameters are hand-picked, not fitted to the real data.
context: Professional project · rebuilt as a demo
stack: [Python, pandas, statsmodels, NumPy, pytest]
skills: [Python, Statistics, Forecasting, Data Pipelines]
demo: inventory-forecast
metrics:
  - { value: '−16%', label: 'one-month-ahead error vs seasonal-naive baseline' }
  - { value: '50', label: 'product × branch series backtested over 12 origins' }
  - { value: '83k', label: 'raw ledger rows parsed and reconciled' }
links: { codePrivate: true }
icon: box
---

## Problem

Buyers needed to know how much of each product every branch would sell over the next few months, so they could order enough to cover the supplier's lead time without tying up cash in overstock. Ordering from recent sales alone reacts late to seasonal swings — heaters in autumn, air conditioners in spring.

## Data

The ERP does not export a sales table. It exports a **stock-movement ledger** per product: every sale, return, purchase order, receipt, transfer, shrinkage write-off and cycle count, with signed quantities, by branch and date.

For this public version, a simulator generates four years of that ledger for 10 products across 5 branches (~83,000 rows) — seasonal, steady and intermittent products, promotions, supplier lead times that vary order to order, lost sales during stock-outs, and stock losses that nobody records until a cycle count finds them. The export is deliberately as awkward as a real one: newest rows first, inconsistent branch codes, padded text and quantities written with a trailing sign (`"     2-"`).

## Approach

1. **Parse** the export and restore posting order — a cycle count must apply *after* the day's sales, not before.
2. **Rebuild stock positions**: on-hand stock resets to each cycle count and accumulates movements in between; on-order stock is a running sum. Tested against the simulator's ground truth: the rebuilt book stock and on-order quantities match exactly for all 50 series.
3. **Isolate demand**: only customer sales net of returns. Transfers, shrinkage and count corrections also reduce stock, and counting them as sales would inflate the forecast.
4. **Forecast** monthly demand with four approaches plus an ensemble:
   - seasonal naive — same month last year, the baseline to beat;
   - multiple regression with a linear trend and month dummies;
   - Holt-Winters additive smoothing with a damped trend;
   - SARIMA(1,0,0)(0,1,1)₁₂;
   - an equal-weight average of the three statistical models.
5. **Backtest** with a rolling origin: at each of the last 12 month-ends, every model is refit on the past only and forecasts 1–6 months ahead.
6. **Replenish**: forecast demand over the lead time plus safety stock sized from the model's *own* backtest error gives the reorder point; orders round up to the supplier's case pack.

## Results

Backtest error on months the models never saw, averaged over 50 product × branch series:

| Model | Mean abs. error | vs baseline | MASE | Bias | Best on |
|---|---|---|---|---|---|
| Ensemble | 10.1 units/mo | **−13%** | 1.016 | −2.3% | 6 series |
| Seasonal regression | 10.1 | −13% | 1.015 | −1.9% | 11 |
| Holt-Winters | 10.2 | −12% | 1.021 | −3.0% | 17 |
| SARIMA | 10.3 | −11% | 1.046 | −2.1% | 7 |
| Seasonal naive (baseline) | 11.6 | — | 1.160 | −4.7% | 9 |

MASE scales each series' error by the baseline's *in-sample* error, so values above 1.0 do not mean "worse than the baseline" — the baseline itself scores 1.16 out of sample. The "vs baseline" column is the direct comparison.

- Every statistical model beats the baseline at every horizon; one month ahead, seasonal regression cuts the absolute error by about 16%.
- No model wins everywhere. Holt-Winters is best on the most series, regression on average, so the demo lets you compare per series instead of declaring one winner.
- All models under-forecast slightly. Part of that is structural: lost sales never reach the ledger, so recorded demand is a little lower than true demand.
- The intermittent product (about 10 units a month) is barely forecastable at monthly level — every model lands close to the baseline, which is a signal to use a different method rather than a better-tuned one.
- **Caveat:** the simulator's seasonality is regular (the same shape every year), which suits seasonal regression. On real data, where seasons shift and promotions vary, the adaptive methods (Holt-Winters, SARIMA) or the ensemble would likely close the gap — which is why the demo keeps all of them.

## Business impact

In the original work, branch-level forecast tables supported more accurate stock planning and reduced overstock risk.

## Challenges

- **The ledger is not a sales table.** Most of the effort is in reconciliation: which movements are demand, and which only move stock.
- **Censored demand.** When a branch is out of stock, demand disappears from the data. Forecasts trained on sales inherit that bias.
- **Honest evaluation.** In-sample fit flatters every model; only the rolling-origin backtest shows which ones generalise.

## What I learned

On short monthly series, data preparation and an honest backtest matter more than model choice: four quite different models land within two points of each other, and all beat the baseline by 11–13%. A baseline is essential — "the model fits well" means little until it beats "same month last year".

## Technology

Python, pandas and NumPy for the pipeline; statsmodels for regression, Holt-Winters and SARIMA; pytest — 36 tests covering parsing, stock reconstruction against simulator ground truth, model behaviour, leakage-free backtesting and the reorder maths. The demo on this page runs on the exported JSON, with the reorder calculation reproduced in the browser.
