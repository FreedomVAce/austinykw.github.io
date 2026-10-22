import { barChart, el, fmtNum, fmtPct, lineChart } from './charts';

type Row = Record<string, number | string>;
type Data = {
  meta: { window: [string, string] };
  kpi: Record<string, number>;
  monthly: Row[];
  categories: Row[];
  states: Row[];
  review_by_timing: { days_vs_promise: number; orders: number; avg_review: number; low_share: number }[];
  stats: {
    logistic: { term: string; odds_ratio: number; ci_low: number; ci_high: number; p_value: number }[];
    fit: { n: number; pseudo_r2: number };
    counterfactual: { actual_avg: number; if_on_time_avg: number; late_share_of_orders: number; late_share_of_low_reviews: number };
    rank_test: { late_mean: number; ontime_mean: number };
    within_seller: { odds_ratio: number; ci_low: number; ci_high: number; strata: number };
  };
};

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ym = (s: string) => `${MON[Number(s.slice(5, 7)) - 1]} ${s.slice(0, 4)}`;
const brl = (v: number) => (v >= 1e6 ? `R$${(v / 1e6).toFixed(1)}M` : v >= 1e4 ? `R$${(v / 1e3).toFixed(0)}k` : `R$${fmtNum(v)}`);
const nice = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/, (c) => c.toUpperCase());

const MONTHLY: Record<string, { label: string; fmt: (v: number) => string; min?: number; max?: number }> = {
  gmv: { label: 'Revenue', fmt: brl },
  orders: { label: 'Orders', fmt: (v) => fmtNum(v) },
  late_rate: { label: 'Late rate', fmt: (v) => fmtPct(v, 0) },
  avg_review: { label: 'Avg review', fmt: (v) => v.toFixed(2), min: 3, max: 5 },
};
const STATE: Record<string, { fmt: (v: number) => string; asc?: boolean; max?: number }> = {
  late_rate: { fmt: (v) => fmtPct(v, 1) },
  median_delivery_days: { fmt: (v) => `${fmtNum(v)} d` },
  avg_review: { fmt: (v) => v.toFixed(2), asc: true, max: 5 },
};
const CAT: Record<string, { fmt: (v: number) => string; asc?: boolean; max?: number; note: string }> = {
  revenue: { fmt: brl, note: 'Top 15 categories by product revenue.' },
  avg_review: { fmt: (v) => v.toFixed(2), asc: true, max: 5, note: 'Lowest-rated 15 categories with at least 300 orders.' },
  freight_ratio: { fmt: (v) => fmtPct(v, 0), note: 'Freight as a share of product value — highest 15 categories with at least 300 orders.' },
};

export async function mountEcommerceDemo(root: HTMLElement) {
  const $ = <T extends Element>(s: string) => root.querySelector(s) as T;
  const status = $<HTMLElement>('.status');
  let data: Data;
  try {
    const res = await fetch(root.dataset.src!);
    if (!res.ok) throw new Error(String(res.status));
    data = await res.json();
  } catch {
    status.textContent = 'The dashboard data could not be loaded. Please refresh to try again.';
    return;
  }
  status.textContent = '';
  $<HTMLElement>('.ec-body').hidden = false;
  const set = (k: string, v: string) => { const n = $<HTMLElement>(`[data-k="${k}"]`); if (n) n.textContent = v; };
  const k = data.kpi, cf = data.stats.counterfactual;

  set('gmv', brl(k.gmv)); set('gmvNote', `${fmtNum(k.orders)} orders · ${ym(data.meta.window[0])} – ${ym(data.meta.window[1])}`);
  set('late', fmtPct(k.late_rate)); set('lateNote', `median order arrives ${fmtNum(k.median_days_early)} days early`);
  set('rev', k.avg_review.toFixed(2)); set('revNote', `late orders ${data.stats.rank_test.late_mean.toFixed(1)}★ vs on time ${data.stats.rank_test.ontime_mean.toFixed(1)}★`);
  set('rep', fmtPct(k.repeat_rate)); set('repNote', `of ${fmtNum(k.customers)} customers`);

  const state: Record<string, string> = { monthly: 'gmv', states: 'late_rate', categories: 'revenue' };
  root.querySelectorAll<HTMLElement>('[data-toggle]').forEach((g) => g.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b) return;
    state[g.dataset.toggle!] = b.dataset.v!;
    g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    draw();
  }));

  function drawMonthly() {
    const m = MONTHLY[state.monthly];
    lineChart($<HTMLElement>('[data-chart="monthly"]'), $<HTMLElement>('[data-chart="monthly"] + .tooltip'), {
      labels: data.monthly.map((r) => String(r.month)),
      tick: (s) => (s.endsWith('-01') || s.endsWith('-07') ? `${MON[Number(s.slice(5, 7)) - 1]} ${s.slice(2, 4)}` : null),
      title: ym,
      series: [{ label: m.label, color: 'var(--series-1)', values: data.monthly.map((r) => Number(r[state.monthly])) }],
      yFormat: m.fmt, yMin: m.min, yMax: m.max,
      extraRows: (i) => [['Orders', fmtNum(Number(data.monthly[i].orders))], ['Late rate', fmtPct(Number(data.monthly[i].late_rate))]],
    });
  }

  function drawCliff() {
    const t = data.review_by_timing;
    const label = (d: number) => (d <= -30 ? '≤ −30' : d >= 20 ? '≥ +20' : d > 0 ? `+${d}` : String(d));
    lineChart($<HTMLElement>('[data-chart="cliff"]'), $<HTMLElement>('[data-chart="cliff"] + .tooltip'), {
      labels: t.map((r) => String(r.days_vs_promise)),
      tick: (s) => (Number(s) % 10 === 0 ? label(Number(s)) : null),
      title: (s) => { const d = Number(s); return d === 0 ? 'On the promised day' : d < 0 ? `${label(d).replace('−', '')} days early` : `${label(d).replace('+', '')} days late`; },
      series: [{ label: 'Avg review', color: 'var(--series-2)', values: t.map((r) => r.avg_review) }],
      yFormat: (v) => v.toFixed(1), yMin: 1, yMax: 5, yStep: 1,
      xMark: { index: t.findIndex((r) => r.days_vs_promise === 0), label: 'promised date' },
      extraRows: (i) => [['1–2★ reviews', fmtPct(t[i].low_share, 0)], ['Orders', fmtNum(t[i].orders)]],
    });
    set('cliffNote', `Late orders are ${fmtPct(cf.late_share_of_orders)} of orders but ${fmtPct(cf.late_share_of_low_reviews, 0)} of all 1–2★ reviews. Reviewed like on-time orders, the average rating would rise from ${cf.actual_avg.toFixed(2)} to ${cf.if_on_time_avg.toFixed(2)}.`);
  }

  function drawForest() {
    const box = $<HTMLElement>('[data-chart="forest"]');
    const rows = [...data.stats.logistic].sort((a, b) => b.odds_ratio - a.odds_ratio);
    const W = Math.max(box.clientWidth, 280), rowH = 30, pad = { l: 190, r: 70, t: 20, b: 22 };
    const H = pad.t + pad.b + rows.length * rowH;
    const lo = Math.log10(0.5), hi = Math.log10(Math.max(...rows.map((r) => r.ci_high)) * 1.3);
    const x = (v: number) => pad.l + ((Math.log10(v) - lo) / (hi - lo)) * (W - pad.l - pad.r);
    box.replaceChildren();
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img' });
    el('title', {}, svg).textContent = rows.map((r) => `${r.term}: odds ratio ${r.odds_ratio.toFixed(2)} (95% CI ${r.ci_low.toFixed(2)}–${r.ci_high.toFixed(2)})`).join('; ');
    box.appendChild(svg);
    const grid = el('g', { class: 'grid' }, svg);
    for (const t of [0.5, 1, 2, 5, 10, 20].filter((t) => Math.log10(t) <= hi)) {
      el('line', { x1: x(t), x2: x(t), y1: pad.t, y2: H - pad.b }, grid);
      el('text', { x: x(t), y: H - 6, 'text-anchor': 'middle' }, svg).textContent = `${t}×`;
    }
    el('line', { x1: x(1), x2: x(1), y1: pad.t - 6, y2: H - pad.b, class: 'ref' }, svg);
    el('text', { x: x(1), y: pad.t - 8, 'text-anchor': 'middle' }, svg).textContent = 'no effect';
    rows.forEach((r, i) => {
      const yy = pad.t + i * rowH + rowH / 2;
      const strong = r.ci_low > 1 || r.ci_high < 1;
      const g = el('g', { class: 'forest-row' }, svg);
      el('text', { x: pad.l - 8, y: yy + 4, 'text-anchor': 'end', class: strong && r.odds_ratio > 2 ? 'direct-label' : '' }, g).textContent = r.term;
      el('line', { x1: x(r.ci_low), x2: x(r.ci_high), y1: yy, y2: yy, stroke: 'var(--series-1)', 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
      el('circle', { cx: x(r.odds_ratio), cy: yy, r: 5, fill: strong ? 'var(--series-1)' : 'var(--surface-1)', stroke: 'var(--series-1)', 'stroke-width': 2 }, g);
      el('text', { x: Math.min(x(r.ci_high) + 8, W - pad.r + 8), y: yy + 4 }, g).textContent = `${r.odds_ratio.toFixed(r.odds_ratio < 10 ? 2 : 1)}×`;
    });
    const ws = data.stats.within_seller;
    set('forestNote', `n = ${fmtNum(data.stats.fit.n)} delivered, reviewed orders. Each odds ratio holds the other factors constant; hollow dots are not distinguishable from no effect. Comparing only orders from the same seller (${fmtNum(ws.strata)} sellers), late delivery still has ${ws.odds_ratio.toFixed(1)}× the odds (95% CI ${ws.ci_low.toFixed(1)}–${ws.ci_high.toFixed(1)}). Observational data — association, not proof of cause.`);
  }

  function drawBars(kind: 'states' | 'categories') {
    const metric = state[kind];
    const spec = kind === 'states' ? STATE[metric] : CAT[metric];
    let rows = (kind === 'states' ? data.states.filter((r) => Number(r.orders) >= 300) : data.categories)
      .map((r) => ({ name: String(kind === 'states' ? r.state : r.category), v: Number(r[metric]), r }));
    rows.sort((a, b) => (spec.asc ? a.v - b.v : b.v - a.v));
    if (kind === 'categories') rows = rows.slice(0, 15);
    const overall = kind === 'states'
      ? { late_rate: data.kpi.late_rate, median_delivery_days: data.kpi.median_delivery_days, avg_review: data.kpi.avg_review }[metric]
      : undefined;
    barChart($<HTMLElement>(`[data-chart="${kind}"]`), $<HTMLElement>(`[data-chart="${kind}"] + .tooltip`), {
      items: rows.map(({ name, v, r }) => ({
        label: kind === 'states' ? name : nice(name), value: v,
        tip: [['Orders', fmtNum(Number(r.orders))], ['Late rate', fmtPct(Number(r.late_rate))], ['Avg review', Number(r.avg_review).toFixed(2)]] as [string, string][],
      })),
      format: spec.fmt, labelWidth: kind === 'states' ? 44 : 170, max: spec.max,
      ref: overall !== undefined ? { value: overall, label: 'all' } : undefined,
    });
    if (kind === 'categories') set('catNote', (spec as (typeof CAT)[string]).note);
  }

  function draw() { drawMonthly(); drawCliff(); drawForest(); drawBars('states'); drawBars('categories'); }
  let raf = 0, lastW = 0;
  new ResizeObserver(([e]) => {
    const w = Math.round(e.contentRect.width);
    if (w === lastW) return;                       // height changes from redrawing must not trigger another redraw
    lastW = w; cancelAnimationFrame(raf); raf = requestAnimationFrame(draw);
  }).observe($<HTMLElement>('.ec-body'));
  draw();
}
