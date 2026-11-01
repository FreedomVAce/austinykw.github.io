---
title: Inventory Demand Forecasting
summary: Branch-level demand forecasts built from raw stock movements, helping buyers order enough to cover supplier lead time without tying up cash in overstock.
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
  problem: Buyers ordered based on recent sales, which responds late to seasonal swings, such as heaters in autumn and air conditioners in spring, and creates a risk of either stockouts or overstock.
  did: Converted the ERP stock-movement log into clean sales history for each branch, compared four forecasting methods against a simple baseline, and translated the forecasts into reorder points.
  result: Delivered branch-level forecast tables that support more accurate stock planning and reduce overstock risk for the buying team. In the demo backtest, every model outperforms the baseline, reducing forecast error by 11 to 13%.
metrics:
  - { value: '−13%', label: 'forecast error vs "same month last year"', note: 'backtest, demo data' }
  - { value: '50', label: 'product × branch series forecast and backtested', note: 'demo data' }
  - { value: '4 models', label: 'compared fairly on months they had not seen' }
icon: box
---

## Why it mattered

Ordering too little loses sales during the season, while ordering too much ties up cash in stock that sits until the following year. Buyers needed forecasts for each branch, early enough to order within the supplier's lead time.

## What I built

- **Clean demand history from a complex source.** The ERP records every stock movement (sales, returns, transfers, write-offs and stock counts) rather than a sales table. I rebuilt stock positions and kept only genuine customer demand, because transfers and write-offs also reduce stock and would inflate the forecast.
- **A fair comparison of forecasting methods:** seasonal regression, Holt-Winters, SARIMA and an average of the three, each tested on months it had not seen and compared against "same month last year".
- **Reorder points** calculated from the forecast and the model's own past error, rounded to the supplier's case pack.

## Try the demo

Select a product and branch to compare models on four years of sales, and adjust lead time and service level to see how the reorder point changes.

## Results

| Model | Error vs baseline (backtest) |
|---|---|
| Average of three models | −13% |
| Seasonal regression | −13% |
| Holt-Winters | −12% |
| SARIMA | −11% |

- Every model outperforms the baseline at every horizon; one month ahead, the best model reduces error by about 16%.
- No single model performs best everywhere, so the demo compares models for each series instead of declaring one winner.
- A low-volume product (about 10 units a month) is difficult to forecast monthly, which indicates the need for a different method rather than further tuning.
- The simulated seasonality is regular, which favours seasonal regression; on real data, the adaptive models would likely close the gap.

## How it works

Python and pandas rebuild stock positions (a stock count resets the on-hand balance, and movements accumulate in between), statsmodels fits the models, and a rolling-origin backtest refits every model at each of 12 month-ends. A suite of 36 automated tests checks parsing, stock reconstruction, the models and the reorder calculations.
