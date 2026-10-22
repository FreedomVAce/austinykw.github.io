/**
 * Small, dependency-free SVG chart helpers shared by the demos.
 * Colours come from CSS tokens (--series-n); every label is set with textContent.
 */

const SVG = 'http://www.w3.org/2000/svg';

export function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, parent?: Element) {
  const node = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  parent?.appendChild(node);
  return node;
}

export function niceMax(v: number) {
  const step = Math.pow(10, Math.floor(Math.log10(Math.max(v, 1e-9))));
  for (const k of [1, 1.2, 1.6, 2, 2.4, 3.2, 4, 4.8, 6, 8, 10]) if (k * step >= v) return k * step;   // each /4 is round
  return 10 * step;
}

export const fmtNum = (v: number, d = 0) =>
  v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

/** $1.23M · $45.6k · $789 */
export function fmtMoney(v: number) {
  const a = Math.abs(v), s = v < 0 ? '−' : '';
  if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(2)}M`;
  if (a >= 1e4) return `${s}$${(a / 1e3).toFixed(1)}k`;
  return `${s}$${fmtNum(a)}`;
}

export const fmtPct = (v: number, d = 1) => `${(100 * v).toFixed(d)}%`;

function ttRow(color: string | null, label: string, value: string) {
  const r = document.createElement('div'); r.className = 'tt-row';
  const a = document.createElement('span');
  if (color) {
    const sw = document.createElement('i');
    sw.style.cssText = `width:8px;height:8px;border-radius:50%;background:${color};display:inline-block`;
    a.appendChild(sw);
  }
  a.append(label);
  const b = document.createElement('b'); b.textContent = value;
  r.append(a, b);
  return r;
}

function placeTooltip(tooltip: HTMLElement, svg: SVGSVGElement, xSvg: number, W: number) {
  const card = (tooltip.offsetParent as HTMLElement | null) ?? tooltip.parentElement!;
  const cb = card.getBoundingClientRect(), box = svg.getBoundingClientRect();
  const left = box.left - cb.left + (xSvg / W) * box.width;
  const tw = tooltip.offsetWidth;
  const x = left + 12 + tw > cb.width ? left - tw - 12 : left + 12;
  tooltip.style.left = `${Math.min(Math.max(x, 4), cb.width - tw - 4)}px`;
  tooltip.style.top = `${box.top - cb.top + 8}px`;
}

export type LineSeries = {
  label: string;
  color: string;                 // e.g. 'var(--series-1)'
  values: (number | null)[];
  dash?: string;
  directLabel?: boolean;         // print the label at the line's last point
};

export function lineChart(box: HTMLElement, tooltip: HTMLElement, o: {
  labels: string[];              // one per x position
  tick: (label: string, i: number) => string | null;   // axis text, or null for no tick
  title: (label: string) => string;                    // tooltip heading
  series: LineSeries[];
  yFormat: (v: number) => string;
  yMin?: number;
  yMax?: number;
  yStep?: number;                // fixed tick spacing; default is four equal steps
  ref?: { value: number; label: string };
  xMark?: { index: number; label: string };            // vertical marker at an x position
  extraRows?: (i: number) => [string, string][];       // additional tooltip rows
}) {
  const W = Math.max(box.clientWidth, 280);
  const H = W < 560 ? 230 : 280;
  const hasDirect = o.series.some((s) => s.directLabel);
  const pad = { l: 52, r: hasDirect ? 92 : 12, t: 14, b: 26 };
  const all = o.series.flatMap((s) => s.values.filter((v): v is number => v != null));
  const lo = o.yMin ?? 0;
  const hi = o.yMax ?? niceMax(Math.max(...all, o.ref?.value ?? 0) * 1.05);
  const n = o.labels.length;
  const x = (i: number) => pad.l + (n === 1 ? 0.5 : i / (n - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => H - pad.b - ((v - lo) / (hi - lo)) * (H - pad.t - pad.b);

  box.replaceChildren();
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H });
  box.appendChild(svg);
  const grid = el('g', { class: 'grid' }, svg);
  const step = o.yStep ?? (hi - lo) / 4;
  for (let k = 0; lo + k * step <= hi + 1e-9; k++) {
    const v = lo + k * step;
    el('line', { x1: pad.l, x2: W - pad.r, y1: y(v), y2: y(v) }, grid);
    el('text', { x: pad.l - 6, y: y(v) + 4, 'text-anchor': 'end' }, svg).textContent = o.yFormat(v);
  }
  o.labels.forEach((lab, i) => {
    const t = o.tick(lab, i);
    if (t) el('text', { x: x(i), y: H - 8, 'text-anchor': 'middle' }, svg).textContent = t;
  });
  if (o.ref && o.ref.value >= lo && o.ref.value <= hi) {
    el('line', { x1: pad.l, x2: W - pad.r, y1: y(o.ref.value), y2: y(o.ref.value), class: 'ref' }, svg);
    el('text', { x: pad.l + 4, y: y(o.ref.value) - 5 }, svg).textContent = o.ref.label;
  }

  if (o.xMark) {
    const mx = x(o.xMark.index);
    el('line', { x1: mx, x2: mx, y1: pad.t, y2: H - pad.b, class: 'ref' }, svg);
    el('text', { x: mx + 5, y: pad.t + 10, class: 'now-label' }, svg).textContent = o.xMark.label;
  }

  const placed: number[] = [];
  for (const s of o.series) {
    let d = '', pen = false;
    s.values.forEach((v, i) => {
      if (v == null) { pen = false; return; }
      d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`; pen = true;
    });
    el('path', { d, fill: 'none', stroke: s.color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...(s.dash ? { 'stroke-dasharray': s.dash } : {}) }, svg);
    if (s.directLabel) {
      const last = s.values.map((v, i) => [i, v] as const).filter(([, v]) => v != null).at(-1);
      if (last) {
        let ly = y(last[1]!) + 4;
        while (placed.some((p) => Math.abs(p - ly) < 12)) ly += 12;   // nudge apart overlapping labels
        placed.push(ly);
        el('text', { x: x(last[0]) + 6, y: ly, class: 'direct-label' }, svg).textContent = s.label;
      }
    }
  }

  const cross = el('line', { y1: pad.t, y2: H - pad.b, class: 'cross', visibility: 'hidden' }, svg);
  const dots = o.series.map((s) => el('circle', { r: 4, fill: s.color, stroke: 'var(--surface-1)', 'stroke-width': 2, visibility: 'hidden' }, svg));
  const hit = el('rect', { x: pad.l, y: pad.t, width: W - pad.l - pad.r, height: H - pad.t - pad.b, fill: 'transparent' }, svg);
  const show = (clientX: number) => {
    const b = svg.getBoundingClientRect();
    const px = ((clientX - b.left) / b.width) * W;
    const i = Math.max(0, Math.min(n - 1, Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (n - 1))));
    cross.setAttribute('x1', String(x(i))); cross.setAttribute('x2', String(x(i))); cross.setAttribute('visibility', 'visible');
    tooltip.replaceChildren();
    const h = document.createElement('div'); h.className = 'tt-h'; h.textContent = o.title(o.labels[i]); tooltip.appendChild(h);
    o.series.forEach((s, k) => {
      const v = s.values[i];
      if (v == null) { dots[k].setAttribute('visibility', 'hidden'); return; }
      tooltip.appendChild(ttRow(s.color, s.label, o.yFormat(v)));
      dots[k].setAttribute('cx', String(x(i))); dots[k].setAttribute('cy', String(y(v))); dots[k].setAttribute('visibility', 'visible');
    });
    for (const [k, v] of o.extraRows?.(i) ?? []) tooltip.appendChild(ttRow(null, k, v));
    tooltip.hidden = false;
    placeTooltip(tooltip, svg, x(i), W);
  };
  const hide = () => { tooltip.hidden = true; cross.setAttribute('visibility', 'hidden'); dots.forEach((d) => d.setAttribute('visibility', 'hidden')); };
  hit.addEventListener('pointermove', (e) => show(e.clientX));
  hit.addEventListener('pointerdown', (e) => show(e.clientX));
  hit.addEventListener('pointerleave', hide);
}

export type BarItem = { label: string; value: number; highlight?: boolean; tip?: [string, string][] };

/** Horizontal bars, one hue; value printed at the bar end; optional dashed reference line. */
export function barChart(box: HTMLElement, tooltip: HTMLElement | null, o: {
  items: BarItem[];
  format: (v: number) => string;
  ref?: { value: number; label: string };
  labelWidth?: number;
  max?: number;
}) {
  const W = Math.max(box.clientWidth, 280), rowH = 28;
  const pad = { l: o.labelWidth ?? 120, r: 64, t: o.ref ? 18 : 4, b: 4 };
  const H = pad.t + pad.b + o.items.length * rowH;
  const max = o.max ?? Math.max(...o.items.map((i) => i.value), o.ref?.value ?? 0, 1e-9) * 1.05;
  const x = (v: number) => pad.l + (Math.max(v, 0) / max) * (W - pad.l - pad.r);
  box.replaceChildren();
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img' });
  el('title', {}, svg).textContent = o.items.map((i) => `${i.label}: ${o.format(i.value)}`).join('; ');
  box.appendChild(svg);
  o.items.forEach((it, k) => {
    const yy = pad.t + k * rowH;
    const g = el('g', { class: 'row' }, svg);
    el('text', { x: pad.l - 8, y: yy + rowH / 2 + 4, 'text-anchor': 'end', class: it.highlight ? 'lbl-sel' : '' }, g).textContent = it.label;
    const w = Math.max(x(it.value) - pad.l, 2);
    el('rect', { x: pad.l, y: yy + 5, width: w, height: rowH - 10, rx: 3, class: `bar${it.highlight ? ' sel' : ''}` }, g);
    el('text', { x: pad.l + w + 6, y: yy + rowH / 2 + 4, class: it.highlight ? 'lbl-sel' : '' }, g).textContent = o.format(it.value);
    el('rect', { x: 0, y: yy, width: W, height: rowH, fill: 'transparent' }, g);   // generous hit target
    if (tooltip) {
      const show = () => {
        tooltip.replaceChildren();
        const h = document.createElement('div'); h.className = 'tt-h'; h.textContent = it.label; tooltip.appendChild(h);
        tooltip.appendChild(ttRow('var(--series-1)', 'Value', o.format(it.value)));
        for (const [a, b] of it.tip ?? []) tooltip.appendChild(ttRow(null, a, b));
        tooltip.hidden = false;
        placeTooltip(tooltip, svg, x(it.value), W);
        tooltip.style.top = `${(svg.getBoundingClientRect().top - (tooltip.offsetParent as HTMLElement).getBoundingClientRect().top) + yy + rowH}px`;
      };
      g.addEventListener('pointerenter', show);
      g.addEventListener('pointerdown', show);
      g.addEventListener('pointerleave', () => { tooltip.hidden = true; });
    }
  });
  if (o.ref) {
    const rx = x(o.ref.value);
    el('line', { x1: rx, x2: rx, y1: pad.t - 4, y2: H - pad.b, class: 'base' }, svg);
    el('text', { x: rx, y: pad.t - 7, 'text-anchor': 'middle' }, svg).textContent = o.ref.label;
  }
}

/** Fill a <table class="data-table"> from header + rows. */
export function fillTable(table: HTMLTableElement, header: string[], rows: (string | number)[][]) {
  table.replaceChildren();
  const tr = table.createTHead().insertRow();
  for (const h of header) { const th = document.createElement('th'); th.textContent = h; tr.appendChild(th); }
  const body = table.createTBody();
  for (const r of rows) { const row = body.insertRow(); r.forEach((c) => { row.insertCell().textContent = String(c); }); }
}
