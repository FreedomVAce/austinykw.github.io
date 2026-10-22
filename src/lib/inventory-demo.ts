/**
 * Forecast explorer for the inventory case study.
 * Reads the JSON exported by the inventory-forecasting-demo repo and renders
 * plain SVG — no chart library. All labels go in via textContent.
 */

type ModelResult = {
  backtest: number[]; forecast: number[]; lo: number[]; hi: number[];
  rmse1: number; mase: number; mae: number; bias: number;
};
type Series = {
  sku: string; branch: string; profile: string; actual: number[];
  models: Record<string, ModelResult>;
  position: { on_hand: number; on_order: number; last_30: number; last_90: number; last_365: number; next_lt_last_year: number };
};
type Data = {
  meta: {
    asof: string; months: string[]; forecast_months: string[]; default_model: string;
    default_service: number; models: { id: string; label: string }[];
  };
  products: { sku: string; name: string; profile: string; lead_time: number; case_pack: number }[];
  branches: { code: string; name: string }[];
  series: Series[];
};

const SVG = 'http://www.w3.org/2000/svg';
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtMonth = (ym: string) => `${MONTH[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;
const fmt = (v: number, d = 0) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, parent?: Element) {
  const node = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  parent?.appendChild(node);
  return node;
}

/** Inverse standard normal CDF (Acklam's rational approximation, |error| < 1.2e-9). */
export function invNorm(p: number): number {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425;
  if (p < lo) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - lo) return -invNorm(1 - p);
  const q = p - 0.5, r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

/** Mirrors invdemo/replenish.py so the page and the Python pipeline agree. */
export function decide(forecast: number[], firstMonth: string, rmse1: number, leadTime: number,
  service: number, onHand: number, onOrder: number, casePack: number) {
  const [y, m] = firstMonth.split('-').map(Number);
  const rate: number[] = [];
  forecast.forEach((f, i) => {
    const days = new Date(Date.UTC(y, m - 1 + i + 1, 0)).getUTCDate();
    for (let k = 0; k < days; k++) rate.push(f / days);
  });
  const sum = (a: number, b: number) => rate.slice(a, b).reduce((s, v) => s + v, 0);
  const ltd = sum(0, leadTime);
  const ss = invNorm(service) * rmse1 * Math.sqrt(leadTime / 30);
  const rop = ltd + ss;
  const position = onHand + onOrder;
  let order = 0;
  if (position <= rop) {
    const target = rop + sum(leadTime, leadTime + 30);
    order = Math.ceil(Math.max(target - position, 0) / casePack) * casePack;
  }
  return { ltd, ss, rop, position, order };
}

function niceMax(v: number) {
  const step = Math.pow(10, Math.floor(Math.log10(Math.max(v, 1))));
  for (const k of [1, 2, 2.5, 5, 10]) if (k * step >= v) return k * step;
  return 10 * step;
}

export async function mountInventoryDemo(root: HTMLElement) {
  const $ = <T extends Element>(s: string) => root.querySelector(s) as T;
  const status = $<HTMLElement>('.status');
  const form = $<HTMLFormElement>('.controls');
  const sel = (n: string) => form.elements.namedItem(n) as HTMLSelectElement;
  const inp = (n: string) => form.elements.namedItem(n) as HTMLInputElement;
  const out = (n: string) => form.elements.namedItem(n) as HTMLOutputElement;

  let data: Data;
  try {
    const res = await fetch(root.dataset.src!);
    if (!res.ok) throw new Error(String(res.status));
    data = await res.json();
  } catch {
    status.textContent = 'The demo data could not be loaded. Please refresh to try again.';
    return;
  }

  const fill = (s: HTMLSelectElement, items: [string, string][], value: string) => {
    for (const [v, label] of items) {
      const o = document.createElement('option');
      o.value = v; o.textContent = label; s.appendChild(o);
    }
    s.value = value;
  };
  fill(sel('sku'), data.products.map((p) => [p.sku, `${p.name}`]), data.products[0].sku);
  fill(sel('branch'), data.branches.map((b) => [b.code, `${b.code} · ${b.name}`]), data.branches[0].code);
  fill(sel('model'), data.meta.models.map((m) => [m.id, m.label]), data.meta.default_model);
  inp('svc').value = String(data.meta.default_service * 100);

  const key = (s: Series) => `${s.sku}|${s.branch}`;
  const bySeries = new Map(data.series.map((s) => [key(s), s]));
  const product = () => data.products.find((p) => p.sku === sel('sku').value)!;
  let lastSku = '';

  status.textContent = '';
  root.querySelectorAll<HTMLElement>('[hidden]:not(.tooltip)').forEach((n) => (n.hidden = false));

  const chartBox = $<HTMLElement>('.chart');
  const barsBox = $<HTMLElement>('.bars');
  const tooltip = $<HTMLElement>('.tooltip');

  function render() {
    const p = product();
    if (p.sku !== lastSku) { inp('lt').value = String(p.lead_time); lastSku = p.sku; }
    const s = bySeries.get(`${p.sku}|${sel('branch').value}`)!;
    const mid = sel('model').value;
    const m = s.models[mid];
    const svc = Number(inp('svc').value) / 100;
    const lt = Number(inp('lt').value);
    out('svcOut').textContent = `${inp('svc').value}%`;
    out('ltOut').textContent = `${lt} days`;

    // Tiles
    const naive = s.models.naive;
    const set = (k: string, v: string) => { $<HTMLElement>(`[data-k="${k}"]`).textContent = v; };
    if (mid === 'naive') {
      set('skill', `MASE ${m.mase.toFixed(2)}`);
      set('skillNote', 'this is the baseline');
    } else {
      const gain = 100 * (1 - m.mae / naive.mae);
      set('skill', `${gain >= 0 ? '−' : '+'}${fmt(Math.abs(gain), 0)}%`);
      set('skillNote', `mean abs. error vs seasonal naive (MASE ${m.mase.toFixed(2)} vs ${naive.mase.toFixed(2)})`);
    }
    const total = m.forecast.reduce((a, b) => a + b, 0);
    set('fc6', fmt(total));
    set('fc6Note', `units, ${fmtMonth(data.meta.forecast_months[0])} – ${fmtMonth(data.meta.forecast_months.at(-1)!)}`);
    const dcs = decide(m.forecast, data.meta.forecast_months[0], m.rmse1, lt, svc, s.position.on_hand, s.position.on_order, p.case_pack);
    set('rop', fmt(dcs.rop));
    set('ropNote', `units · stock position now ${fmt(dcs.position)}`);
    set('order', dcs.order ? fmt(dcs.order) : 'None');
    set('orderNote', dcs.order ? `units, in packs of ${p.case_pack}` : 'position covers lead-time demand');

    drawChart(s, m);
    drawBars(s, mid);
    drawCalc(s, dcs, lt, svc, m.rmse1);
    drawTable(s, m);
  }

  function drawChart(s: Series, m: ModelResult) {
    const months = [...data.meta.months, ...data.meta.forecast_months];
    const nA = data.meta.months.length, nB = m.backtest.length;
    const W = Math.max(chartBox.clientWidth, 300);
    const H = W < 560 ? 240 : 320;
    const pad = { l: 40, r: 12, t: 16, b: 26 };
    const x = (i: number) => pad.l + (i / (months.length - 1)) * (W - pad.l - pad.r);
    const ymax = niceMax(Math.max(...s.actual, ...m.hi, ...m.backtest, 1) * 1.05);
    const y = (v: number) => H - pad.b - (v / ymax) * (H - pad.t - pad.b);

    chartBox.replaceChildren();
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H });
    chartBox.appendChild(svg);

    const grid = el('g', { class: 'grid' }, svg);
    for (let k = 0; k <= 4; k++) {
      const v = (ymax / 4) * k;
      el('line', { x1: pad.l, x2: W - pad.r, y1: y(v), y2: y(v) }, grid);
      const t = el('text', { x: pad.l - 6, y: y(v) + 4, 'text-anchor': 'end' }, svg);
      t.textContent = fmt(v);
    }
    months.forEach((ym, i) => {
      if (ym.endsWith('-01')) {
        const t = el('text', { x: x(i), y: H - 8, 'text-anchor': 'middle' }, svg);
        t.textContent = ym.slice(0, 4);
      }
    });

    // "Today" marker between the last actual month and the first forecast month.
    const nowX = (x(nA - 1) + x(nA)) / 2;
    el('line', { x1: nowX, x2: nowX, y1: pad.t, y2: H - pad.b, class: 'cross', 'stroke-dasharray': '3 3' }, svg);
    // Label sits right of the marker when there is room, otherwise left of it.
    const roomRight = W - pad.r - nowX > 80;
    const nl = el('text', { x: roomRight ? nowX + 6 : nowX - 6, y: pad.t + 10, class: 'now-label', 'text-anchor': roomRight ? 'start' : 'end' }, svg);
    nl.textContent = 'Forecast →';

    const path = (pts: [number, number][]) => pts.map(([i, v], k) => `${k ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
    // 80% band, anchored at the last actual point so it fans out from history.
    const fIdx = m.forecast.map((_, k) => nA + k);
    const upper: [number, number][] = [[nA - 1, s.actual[nA - 1]], ...fIdx.map((i, k) => [i, m.hi[k]] as [number, number])];
    const lower: [number, number][] = [...fIdx.map((i, k) => [i, m.lo[k]] as [number, number]).reverse(), [nA - 1, s.actual[nA - 1]]];
    el('path', { d: path(upper) + path(lower).replace('M', 'L') + 'Z', fill: 'var(--band)', stroke: 'none' }, svg);

    const line = (d: string, color: string, dash?: string) =>
      el('path', { d, fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...(dash ? { 'stroke-dasharray': dash } : {}) }, svg);
    line(path(s.actual.map((v, i) => [i, v])), 'var(--series-1)');
    line(path(m.backtest.map((v, k) => [nA - nB + k, v])), 'var(--series-2)', '5 4');
    line(path([[nA - 1, s.actual[nA - 1]], ...m.forecast.map((v, k) => [nA + k, v] as [number, number])]), 'var(--series-2)');

    // Crosshair + tooltip
    const cross = el('line', { y1: pad.t, y2: H - pad.b, class: 'cross', visibility: 'hidden' }, svg);
    const dots = [el('circle', { r: 4, fill: 'var(--series-1)', stroke: 'var(--surface-1)', 'stroke-width': 2, visibility: 'hidden' }, svg),
      el('circle', { r: 4, fill: 'var(--series-2)', stroke: 'var(--surface-1)', 'stroke-width': 2, visibility: 'hidden' }, svg)];
    const hit = el('rect', { x: pad.l, y: pad.t, width: W - pad.l - pad.r, height: H - pad.t - pad.b, fill: 'transparent' }, svg);

    const row = (color: string | null, label: string, value: string) => {
      const r = document.createElement('div'); r.className = 'tt-row';
      const a = document.createElement('span');
      if (color) { const sw = document.createElement('i'); sw.style.cssText = `width:8px;height:8px;border-radius:50%;background:${color};display:inline-block`; a.appendChild(sw); }
      a.append(label);
      const b = document.createElement('b'); b.textContent = value;
      r.append(a, b); return r;
    };
    const show = (clientX: number) => {
      const box = svg.getBoundingClientRect();
      const px = ((clientX - box.left) / box.width) * W;
      const i = Math.max(0, Math.min(months.length - 1, Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (months.length - 1))));
      cross.setAttribute('x1', String(x(i))); cross.setAttribute('x2', String(x(i)));
      cross.setAttribute('visibility', 'visible');
      tooltip.replaceChildren();
      const h = document.createElement('div'); h.className = 'tt-h'; h.textContent = fmtMonth(months[i]); tooltip.appendChild(h);
      const [d1, d2] = dots;
      d1.setAttribute('visibility', 'hidden'); d2.setAttribute('visibility', 'hidden');
      if (i < nA) {
        tooltip.appendChild(row('var(--series-1)', 'Actual', fmt(s.actual[i])));
        d1.setAttribute('cx', String(x(i))); d1.setAttribute('cy', String(y(s.actual[i]))); d1.setAttribute('visibility', 'visible');
        const b = i - (nA - nB);
        if (b >= 0) {
          tooltip.appendChild(row('var(--series-2)', 'Backtest', fmt(m.backtest[b])));
          tooltip.appendChild(row(null, 'Error', `${m.backtest[b] - s.actual[i] >= 0 ? '+' : '−'}${fmt(Math.abs(m.backtest[b] - s.actual[i]))}`));
          d2.setAttribute('cx', String(x(i))); d2.setAttribute('cy', String(y(m.backtest[b]))); d2.setAttribute('visibility', 'visible');
        }
      } else {
        const k = i - nA;
        tooltip.appendChild(row('var(--series-2)', 'Forecast', fmt(m.forecast[k])));
        tooltip.appendChild(row(null, '80% range', `${fmt(m.lo[k])} – ${fmt(m.hi[k])}`));
        d2.setAttribute('cx', String(x(i))); d2.setAttribute('cy', String(y(m.forecast[k]))); d2.setAttribute('visibility', 'visible');
      }
      tooltip.hidden = false;
      const card = chartBox.parentElement!.getBoundingClientRect();
      const left = box.left - card.left + (x(i) / W) * box.width;
      const tw = tooltip.offsetWidth;
      tooltip.style.left = `${Math.min(Math.max(left + 12 + tw > card.width ? left - tw - 12 : left + 12, 4), card.width - tw - 4)}px`;
      tooltip.style.top = `${box.top - card.top + 12}px`;
    };
    const hide = () => { tooltip.hidden = true; cross.setAttribute('visibility', 'hidden'); dots.forEach((d) => d.setAttribute('visibility', 'hidden')); };
    hit.addEventListener('pointermove', (e) => show(e.clientX));
    hit.addEventListener('pointerdown', (e) => show(e.clientX));
    hit.addEventListener('pointerleave', hide);
  }

  function drawBars(s: Series, selected: string) {
    const items = data.meta.models.map((mm) => ({ id: mm.id, label: mm.label.replace(' (baseline)', '').replace(' (average of 3)', ''), v: s.models[mm.id].mase }));
    const W = Math.max(barsBox.clientWidth, 280), rowH = 30, pad = { l: 140, r: 46, t: 6, b: 6 };
    const H = pad.t + pad.b + items.length * rowH;
    const xmax = Math.max(...items.map((i) => i.v)) * 1.1;
    const x = (v: number) => pad.l + (v / xmax) * (W - pad.l - pad.r);
    barsBox.replaceChildren();
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img' });
    const title = el('title', {}, svg);
    title.textContent = items.map((i) => `${i.label}: MASE ${i.v.toFixed(2)}`).join('; ');
    barsBox.appendChild(svg);
    items.forEach((it, k) => {
      const yy = pad.t + k * rowH;
      const lab = el('text', { x: pad.l - 8, y: yy + rowH / 2 + 4, 'text-anchor': 'end', class: it.id === selected ? 'lbl-sel' : '' }, svg);
      lab.textContent = it.label;
      const w = Math.max(x(it.v) - pad.l, 2);
      el('rect', { x: pad.l, y: yy + 6, width: w, height: rowH - 12, rx: 3, class: `bar${it.id === selected ? ' sel' : ''}` }, svg);
      const val = el('text', { x: pad.l + w + 6, y: yy + rowH / 2 + 4, class: it.id === selected ? 'lbl-sel' : '' }, svg);
      val.textContent = it.v.toFixed(2);
    });
    const bx = x(s.models.naive.mase);
    el('line', { x1: bx, x2: bx, y1: pad.t, y2: H - pad.b, class: 'base' }, svg);
  }

  function drawCalc(s: Series, d: ReturnType<typeof decide>, lt: number, svc: number, rmse1: number) {
    const dl = $<HTMLElement>('.calc-list');
    dl.replaceChildren();
    const add = (k: string, v: string, cls = '') => {
      const wrap = document.createElement('div'); if (cls) wrap.className = cls;
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = v;
      wrap.append(dt, dd); dl.appendChild(wrap);
    };
    add(`Forecast demand over ${lt}-day lead time`, fmt(d.ltd, 1));
    add(`Safety stock (z ${invNorm(svc).toFixed(2)} × ${fmt(rmse1, 1)} × √(${lt}/30))`, fmt(d.ss, 1));
    add('Reorder point', fmt(d.rop, 1), 'total');
    add(`On hand ${fmt(s.position.on_hand)} + on order ${fmt(s.position.on_order)}`, fmt(d.position));
    add('Sold, last 30 / 90 days', `${fmt(s.position.last_30)} / ${fmt(s.position.last_90)}`);
    add(`Same ${lt}-day window last year`, fmt(s.position.next_lt_last_year));
    add('Suggested order', d.order ? `${fmt(d.order)} units` : 'none', 'total');
  }

  function drawTable(s: Series, m: ModelResult) {
    const nA = data.meta.months.length, nB = m.backtest.length;
    const table = $<HTMLTableElement>('.table-view table');
    table.replaceChildren();
    const thead = table.createTHead().insertRow();
    for (const h of ['Month', 'Actual', 'Backtest', 'Forecast', '80% low', '80% high']) {
      const th = document.createElement('th'); th.textContent = h; thead.appendChild(th);
    }
    const body = table.createTBody();
    const add = (cells: string[]) => { const r = body.insertRow(); cells.forEach((c) => { r.insertCell().textContent = c; }); };
    data.meta.months.forEach((ym, i) => {
      const b = i - (nA - nB);
      add([fmtMonth(ym), fmt(s.actual[i]), b >= 0 ? fmt(m.backtest[b]) : '', '', '', '']);
    });
    data.meta.forecast_months.forEach((ym, k) => add([fmtMonth(ym), '', '', fmt(m.forecast[k]), fmt(m.lo[k]), fmt(m.hi[k])]));
  }

  form.addEventListener('input', render);
  form.addEventListener('change', render);
  let raf = 0;
  new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(render); }).observe(chartBox);
  render();
}
