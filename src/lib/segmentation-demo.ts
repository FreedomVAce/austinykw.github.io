import { barChart, el, fmtNum, lineChart } from './charts';

type Profile = {
  segment: string; customers: number; share_customers: number; share_revenue: number;
  median_recency: number; median_frequency: number; median_monetary: number; action: string;
};
type Data = {
  meta: { customers: number; segments: string[]; cutoff: string; outcome_end: string; k: number };
  profile: Profile[];
  points: { frequency: number[]; monetary: number[]; recency: number[]; segment: number[] };
  holdout: { segments: { segment: string; customers: number; return_rate: number; revenue_per_customer: number }[]; overall: { return_rate: number } };
  cohorts: { cohort: string; cohort_size: number; month_offset: number; retention: number }[];
  selection: { k: number; silhouette: number; stability: number }[];
};

const gbp = (v: number) => `£${fmtNum(v)}`;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ym = (s: string) => `${MON[Number(s.slice(5, 7)) - 1]} ${s.slice(0, 4)}`;
const day = (s: string) => { const [y, m, d] = s.split('-'); return `${Number(d)} ${MON[Number(m) - 1]} ${y}`; };

export async function mountSegmentationDemo(root: HTMLElement) {
  const $ = <T extends Element>(s: string) => root.querySelector(s) as T;
  const status = $<HTMLElement>('.status');
  let data: Data;
  try {
    const res = await fetch(root.dataset.src!);
    if (!res.ok) throw new Error(String(res.status));
    data = await res.json();
  } catch {
    status.textContent = 'The analysis data could not be loaded. Please refresh to try again.';
    return;
  }
  status.textContent = '';
  $<HTMLElement>('.seg-body').hidden = false;
  const set = (k: string, v: string) => { const n = $<HTMLElement>(`[data-k="${k}"]`); if (n) n.textContent = v; };
  let selected = 0;

  // Segment cards
  const cards = $<HTMLElement>('.seg-cards');
  data.profile.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-pressed', String(i === selected));
    const parts: [string, string][] = [
      ['sc-name', p.segment],
      ['sc-big', `${Math.round(100 * p.share_customers)}% of customers · ${Math.round(100 * p.share_revenue)}% of revenue`],
      ['sc-meta', `Median: ${fmtNum(p.median_frequency)} order${p.median_frequency === 1 ? '' : 's'} · ${gbp(p.median_monetary)} · last bought ${fmtNum(p.median_recency)} days ago`],
      ['sc-act', p.action],
    ];
    for (const [cls, text] of parts) { const s = document.createElement('span'); s.className = cls; s.textContent = text; b.appendChild(s); }
    b.addEventListener('click', () => { selected = i; cards.querySelectorAll('button').forEach((x, k) => x.setAttribute('aria-pressed', String(k === i))); drawScatter(); });
    cards.appendChild(b);
  });

  // Scatter (log–log), selected segment coloured, the rest muted
  const box = $<HTMLElement>('[data-chart="scatter"]');
  const tip = $<HTMLElement>('[data-chart="scatter"] + .tooltip');
  const P = data.points;
  const n = P.frequency.length;
  function drawScatter() {
    set('selName', data.profile[selected].segment);
    const W = Math.max(box.clientWidth, 280), H = W < 560 ? 280 : 340;
    const pad = { l: 56, r: 12, t: 10, b: 30 };
    const fx = [1, Math.max(...P.frequency)], fy = [Math.max(10, Math.min(...P.monetary.filter((v) => v > 0))), Math.max(...P.monetary)];
    const lx0 = Math.log10(fx[0]), lx1 = Math.log10(fx[1]) + 0.05, ly0 = Math.floor(Math.log10(fy[0])), ly1 = Math.ceil(Math.log10(fy[1]));
    const x = (v: number) => pad.l + ((Math.log10(Math.max(v, 1)) - lx0) / (lx1 - lx0)) * (W - pad.l - pad.r);
    const y = (v: number) => H - pad.b - ((Math.log10(Math.max(v, 10 ** ly0)) - ly0) / (ly1 - ly0)) * (H - pad.t - pad.b);
    // Deterministic jitter so customers with identical integer order counts don't stack on one line.
    const jit = (i: number) => (((i * 2654435761) % 1000) / 1000 - 0.5) * 6;
    box.replaceChildren();
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H });
    box.appendChild(svg);
    const grid = el('g', { class: 'grid' }, svg);
    for (let e = ly0; e <= ly1; e++) {
      el('line', { x1: pad.l, x2: W - pad.r, y1: y(10 ** e), y2: y(10 ** e) }, grid);
      el('text', { x: pad.l - 6, y: y(10 ** e) + 4, 'text-anchor': 'end' }, svg).textContent = gbp(10 ** e).replace('£1,000,000', '£1M').replace(',000', 'k');
    }
    for (const t of [1, 2, 5, 10, 20, 50, 100, 200].filter((t) => t <= fx[1])) {
      el('line', { x1: x(t), x2: x(t), y1: pad.t, y2: H - pad.b }, grid);
      el('text', { x: x(t), y: H - 12, 'text-anchor': 'middle' }, svg).textContent = String(t);
    }
    el('text', { x: W - pad.r, y: H - 1, 'text-anchor': 'end' }, svg).textContent = 'orders →';
    const bg = el('g', {}, svg), fg = el('g', {}, svg);
    for (let i = 0; i < n; i++) {
      const on = P.segment[i] === selected;
      el('circle', { cx: (x(P.frequency[i]) + jit(i)).toFixed(1), cy: y(P.monetary[i]).toFixed(1), r: on ? 2.6 : 2,
        fill: on ? 'var(--series-1)' : 'var(--muted-mark)', 'fill-opacity': on ? 0.75 : 0.5 }, on ? fg : bg);
    }
    const ring = el('circle', { r: 6, fill: 'none', stroke: 'var(--text-primary)', 'stroke-width': 1.5, visibility: 'hidden' }, svg);
    const hit = el('rect', { x: pad.l, y: pad.t, width: W - pad.l - pad.r, height: H - pad.t - pad.b, fill: 'transparent' }, svg);
    const show = (e: PointerEvent) => {
      const b = svg.getBoundingClientRect();
      const px = ((e.clientX - b.left) / b.width) * W, py = ((e.clientY - b.top) / b.height) * H;
      let best = -1, bd = 14 * 14;
      for (let i = 0; i < n; i++) {
        const dx = x(P.frequency[i]) + jit(i) - px, dy = y(P.monetary[i]) - py, d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = i; }
      }
      if (best < 0) { tip.hidden = true; ring.setAttribute('visibility', 'hidden'); return; }
      ring.setAttribute('cx', String(x(P.frequency[best]) + jit(best))); ring.setAttribute('cy', String(y(P.monetary[best])));
      ring.setAttribute('visibility', 'visible');
      tip.replaceChildren();
      const h = document.createElement('div'); h.className = 'tt-h'; h.textContent = data.meta.segments[P.segment[best]]; tip.appendChild(h);
      for (const [k, v] of [['Orders', fmtNum(P.frequency[best])], ['Net spend', gbp(P.monetary[best])], ['Last order', `${fmtNum(P.recency[best])} days before data end`]]) {
        const r = document.createElement('div'); r.className = 'tt-row';
        const a = document.createElement('span'); a.textContent = k; const bb = document.createElement('b'); bb.textContent = v;
        r.append(a, bb); tip.appendChild(r);
      }
      tip.hidden = false;
      const card = box.parentElement!.getBoundingClientRect();
      const left = b.left - card.left + ((x(P.frequency[best]) + jit(best)) / W) * b.width;
      const tw = tip.offsetWidth;
      tip.style.left = `${Math.min(Math.max(left + 14 + tw > card.width ? left - tw - 14 : left + 14, 4), card.width - tw - 4)}px`;
      tip.style.top = `${b.top - card.top + (y(P.monetary[best]) / H) * b.height - 20}px`;
    };
    hit.addEventListener('pointermove', show);
    hit.addEventListener('pointerdown', show);
    hit.addEventListener('pointerleave', () => { tip.hidden = true; ring.setAttribute('visibility', 'hidden'); });
  }

  // Out-of-time validation
  const hold = data.holdout;
  set('holdSub', `segmented on data before ${day(data.meta.cutoff)}`);
  set('holdNote', `Customers followed from ${day(data.meta.cutoff)} to ${day(data.meta.outcome_end)}. All customers: ${Math.round(100 * hold.overall.return_rate)}% bought again.`);
  const drawHold = () => barChart($<HTMLElement>('[data-chart="holdout"]'), $<HTMLElement>('[data-chart="holdout"] + .tooltip'), {
    items: hold.segments.map((s) => ({ label: s.segment, value: s.return_rate,
      tip: [['Customers', fmtNum(s.customers)], ['Revenue per customer', gbp(s.revenue_per_customer)]] as [string, string][] })),
    format: (v) => `${Math.round(100 * v)}%`, ref: { value: hold.overall.return_rate, label: 'all' }, labelWidth: 130, max: 1,
  });

  // Cohort heatmap as a real table
  const cohorts = [...new Set(data.cohorts.map((c) => c.cohort))].sort();
  const maxOff = Math.max(...data.cohorts.map((c) => c.month_offset));
  const table = $<HTMLTableElement>('[data-table="cohort"]');
  const head = table.createTHead().insertRow();
  for (const h of ['Cohort', 'New', ...Array.from({ length: maxOff }, (_, k) => `+${k + 1}`)]) {
    const th = document.createElement('th'); th.textContent = h; th.scope = 'col'; head.appendChild(th);
  }
  const body = table.createTBody();
  const vals = data.cohorts.filter((c) => c.month_offset > 0).map((c) => c.retention);
  const vmax = Math.max(...vals);
  for (const co of cohorts) {
    const tr = body.insertRow();
    const th = document.createElement('th'); th.scope = 'row'; th.textContent = ym(co); tr.appendChild(th);
    const size = data.cohorts.find((c) => c.cohort === co && c.month_offset === 0)!.cohort_size;
    tr.insertCell().textContent = fmtNum(size);
    for (let k = 1; k <= maxOff; k++) {
      const td = tr.insertCell();
      const r = data.cohorts.find((c) => c.cohort === co && c.month_offset === k);
      if (!r) { td.textContent = ''; continue; }
      const step = Math.min(6, Math.floor((r.retention / vmax) * 6.999));
      td.textContent = `${Math.round(100 * r.retention)}%`;
      td.style.background = `var(--seq-${step})`;
      td.style.color = step >= 4 ? 'var(--seq-ink-dark)' : 'var(--seq-ink-light)';
      td.title = `${ym(co)} cohort, ${k} month${k > 1 ? 's' : ''} later: ${fmtNum(Math.round(r.retention * size))} of ${fmtNum(size)} customers`;
    }
  }

  // Model selection
  const sel = data.selection;
  const chosen = sel.find((s) => s.k === data.meta.k)!;
  set('selNote', `k = ${data.meta.k} chosen: separation is essentially tied with k = 3 (${chosen.silhouette.toFixed(2)} vs ${sel.find((s) => s.k === 3)!.silhouette.toFixed(2)}) and stays stable (${chosen.stability.toFixed(2)}), while splitting new customers from lapsed ones — groups that need opposite actions. k = 2 separates best but only says "good" vs "bad".`);
  const drawSel = () => lineChart($<HTMLElement>('[data-chart="selection"]'), $<HTMLElement>('[data-chart="selection"] + .tooltip'), {
    labels: sel.map((s) => String(s.k)), tick: (k) => `k=${k}`, title: (k) => `${k} segments${Number(k) === data.meta.k ? ' (chosen)' : ''}`,
    series: [
      { label: 'Silhouette', color: 'var(--series-1)', values: sel.map((s) => s.silhouette) },
      { label: 'Stability', color: 'var(--series-2)', values: sel.map((s) => s.stability) },
    ],
    yFormat: (v) => v.toFixed(1), yMin: 0, yMax: 1, yStep: 0.2,
  });

  let raf = 0;
  const redraw = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { drawScatter(); drawHold(); drawSel(); }); };
  new ResizeObserver(redraw).observe($<HTMLElement>('.seg-grid'));
  drawScatter(); drawHold(); drawSel();
}
