---
title: Inventory Demand Forecasting
summary: Branch-level demand forecasts built from raw stock movements, so buyers can order enough to cover supplier lead time without tying up cash in overstock.
category: Forecasting
order: 4
featured: false
type: work
year: 2025
role: Data preparation, forecasting models and backtesting
data: ERP stock-movement exports. The interactive demo runs on a simulated stock ledger for 10 products across 5 branches.
stack: [Python, pandas, statsmodels, Excel]
skills: [Python, Statistics, Forecasting, Data Pipelines]
demo: inventory-forecast
glance:
  problem: Buyers ordered from recent sales, which reacts late to seasonal swings — heaters in autumn, air conditioners in spring — and risks either stock-outs or overstock.
  did: I turned the ERP's stock-movement log into clean sales history per branch, compared four forecasting methods against a simple baseline, and turned the forecast into reorder points.
  result: Branch-level forecast tables for the buying team that support more accurate stock planning and reduce overstock risk. In the demo backtest every model beats the baseline, cutting forecast error by 11–13%.
metrics:
  - { value: '−13%', label: 'forecast error vs "same month last year"', note: 'backtest, demo data' }
  - { value: '50', label: 'product × branch series forecast and backtested', note: 'demo data' }
  - { value: '4 models', label: 'compared fairly on months they never saw' }
icon: box
---

## Why it mattered

Ordering too little loses sales during the season; ordering too much ties up cash in stock that sits until next year. Buyers needed forecasts per branch, early enough to order against the supplier's lead time.

## What I built

- **Clean demand history from a messy source.** The ERP exports every stock movement — sales, returns, transfers, write-offs, stock counts — not a sales table. I rebuilt stock positions and kept only genuine customer demand, because transfers and write-offs also reduce stock and would inflate the forecast.
- **A fair comparison of forecasting methods:** seasonal regression, Holt-Winters, SARIMA and an average of the three, each tested on months it had not seen, against "same month last year".
- **Reorder points** from the forecast and the model's own past error, rounded to the supplier's case pack.

## Try the demo

Pick a product and branch to compare models on four years of sales, and adjust lead time and service level to see the reorder point change.

## Results

| Model | Error vs baseline (backtest) |
|---|---|
| Average of three models | −13% |
| Seasonal regression | −13% |
| Holt-Winters | −12% |
| SARIMA | −11% |

- Every model beats the baseline at every horizon; one month ahead, the best cuts error by about 16%.
- No model wins everywhere, so the demo lets you compare per series instead of declaring one winner.
- A low-volume product (about 10 units a month) is barely forecastable monthly — a signal to use a different method, not a better-tuned one.
- The simulated seasonality is regular, which suits seasonal regression; on real data the adaptive models would likely close the gap.

## How it works

Python and pandas rebuild positions (a stock count resets the on-hand balance; movements accumulate in between), statsmodels fits the models, and a rolling-origin backtest refits every model at each of 12 month-ends. 36 automated tests check parsing, stock reconstruction, the models and the reorder maths.
