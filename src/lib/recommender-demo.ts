/**
 * Recommendation explorer. Re-implements the hybrid scoring from recdemo/engines.py
 * over the exported candidate lists, so weights and carts update instantly.
 */
import { barChart, fillTable } from './charts';

const SIGNALS = ['cf', 'mba', 'content', 'curated'] as const;
type Signal = (typeof SIGNALS)[number];
type Weights = Record<Signal, number>;
const COLORS: Record<Signal, string> = { cf: 'var(--series-1)', mba: 'var(--series-2)', content: 'var(--series-3)', curated: 'var(--series-4)' };
const WHY: Record<Signal, string> = { cf: 'customers also buy', mba: 'bought together', content: 'matches style', curated: 'expert pairing' };
const SEGMENT_LABEL: Record<string, string> = { trade_high: 'Trade, high volume', trade_general: 'Trade, general', retail: 'Retail', all: 'All segments' };

type Data = {
  meta: { pop_weight: number; products: number; lines: number; invoices: number };
  products: { name: string[]; leaf: string[]; department: string[]; brand: string[]; price: number[]; variant: number[] };
  candidates: number[][][];                       // per product: [j, cf, mba, content, curated]
  popularity: Record<string, [number, number][]>;
  weights: { tuned: Record<string, Weights>; default: Weights };
  evaluation: { basket: { method: string; segment: string; hr: number; ndcg: number; coverage: number; cases: number }[] };
};

export async function mountRecommenderDemo(root: HTMLElement) {
  const $ = <T extends Element>(s: string) => root.querySelector(s) as T;
  const status = $<HTMLElement>('.status');
  let data: Data;
  try {
    const res = await fetch(root.dataset.src!);
    if (!res.ok) throw new Error(String(res.status));
    data = await res.json();
  } catch {
    status.textContent = 'The demo data could not be loaded. Please refresh to try again.';
    return;
  }
  const P = data.products;
  const form = $<HTMLFormElement>('.rec-controls');
  const sel = (n: string) => form.elements.namedItem(n) as HTMLSelectElement;
  const slider = (s: Signal) => root.querySelector<HTMLInputElement>(`input[name="w_${s}"]`)!;
  const output = (s: Signal) => root.querySelector<HTMLOutputElement>(`output[name="o_${s}"]`)!;

  // Category -> product pickers (products listed by popularity within each category).
  const pop = new Map(data.popularity.all.map(([j, v]) => [j, v]));
  const depts = [...new Set(P.department)].sort();
  for (const d of depts) { const o = document.createElement('option'); o.value = d; o.textContent = d; sel('dept').appendChild(o); }
  const fillProducts = () => {
    const d = sel('dept').value;
    const ids = P.name.map((_, i) => i).filter((i) => P.department[i] === d)
      .sort((a, b) => (pop.get(b) ?? 0) - (pop.get(a) ?? 0) || P.leaf[a].localeCompare(P.leaf[b]) || P.name[a].localeCompare(P.name[b]));
    const s = sel('product');
    s.replaceChildren();
    const groups = new Map<string, HTMLOptGroupElement>();
    for (const i of ids) {
      let g = groups.get(P.leaf[i]);
      if (!g) { g = document.createElement('optgroup'); g.label = P.leaf[i]; groups.set(P.leaf[i], g); }
      const o = document.createElement('option'); o.value = String(i); o.textContent = P.name[i]; g.appendChild(o);
    }
    [...groups.values()].sort((a, b) => a.label.localeCompare(b.label)).forEach((g) => s.appendChild(g));
  };
  sel('dept').value = 'Bathroom';
  fillProducts();
  const firstFaucet = P.leaf.findIndex((l) => l === 'Lavatory Faucets');
  if (firstFaucet >= 0) sel('product').value = String(firstFaucet);

  const cart: number[] = [];
  const mode = () => (form.querySelector<HTMLInputElement>('input[name="mode"]:checked')?.value ?? 'product');
  const weights = (): Weights => Object.fromEntries(SIGNALS.map((s) => [s, Number(slider(s).value)])) as Weights;
  // Show which preset (if any) the sliders currently match, so a preset button never looks dead.
  const markPreset = () => {
    const cur = weights();
    const same = (w: Weights) => SIGNALS.every((s) => Math.abs((w[s] ?? 0) - cur[s]) < 1e-9);
    $<HTMLButtonElement>('[data-act="tuned"]').setAttribute('aria-pressed', String(same(data.weights.tuned[sel('segment').value])));
    $<HTMLButtonElement>('[data-act="default"]').setAttribute('aria-pressed', String(same(data.weights.default)));
  };
  const setWeights = (w: Weights, note: string) => {
    for (const s of SIGNALS) slider(s).value = String(w[s] ?? 0);
    $<HTMLElement>('[data-k="wnote"]').textContent = note;
  };
  const applyTuned = () => setWeights(data.weights.tuned[sel('segment').value], `Tuned on validation data for ${SEGMENT_LABEL[sel('segment').value].toLowerCase()} customers.`);

  function score(anchors: number[], w: Weights, segment: string) {
    const total = SIGNALS.reduce((s, k) => s + w[k], 0) || 1;
    const parts = new Map<number, Record<Signal, number>>();
    for (const a of anchors) {
      for (const [j, ...v] of data.candidates[a]) {
        const p = parts.get(j) ?? { cf: 0, mba: 0, content: 0, curated: 0 };
        SIGNALS.forEach((s, k) => { p[s] += (w[s] / total) * (v[k] / 100); });
        parts.set(j, p);
      }
    }
    const segPop = new Map(data.popularity[segment].map(([j, v]) => [j, v]));
    for (const j of segPop.keys()) if (!parts.has(j)) parts.set(j, { cf: 0, mba: 0, content: 0, curated: 0 });
    const blocked = new Set(anchors.map((a) => P.variant[a]).filter((v) => v >= 0));
    return [...parts.entries()]
      .filter(([j]) => !anchors.includes(j) && !blocked.has(P.variant[j]))
      .map(([j, p]) => ({ j, p, s: SIGNALS.reduce((t, k) => t + p[k], 0) + data.meta.pop_weight * (segPop.get(j) ?? 0) }))
      .sort((a, b) => b.s - a.s || a.j - b.j)
      .slice(0, 10);
  }

  function renderCart() {
    const box = $<HTMLElement>('.cart');
    box.hidden = mode() !== 'cart';
    const ul = $<HTMLUListElement>('.cart-list');
    ul.replaceChildren();
    if (!cart.length) { const li = document.createElement('li'); li.className = 'empty'; li.textContent = 'Empty. Select products above and add them.'; ul.appendChild(li); }
    cart.forEach((i, k) => {
      const li = document.createElement('li');
      li.append(P.name[i]);
      const b = document.createElement('button'); b.type = 'button'; b.textContent = '×'; b.setAttribute('aria-label', `Remove ${P.name[i]}`);
      b.addEventListener('click', () => { cart.splice(k, 1); render(); });
      li.appendChild(b); ul.appendChild(li);
    });
    // Say why "add" does nothing instead of failing silently.
    const add = $<HTMLButtonElement>('[data-act="add"]');
    const inCart = cart.includes(Number(sel('product').value));
    add.disabled = inCart || cart.length >= 8;
    add.textContent = inCart ? 'Already in cart' : cart.length >= 8 ? 'Cart is full (8 items)' : 'Add selected product';
  }

  function render() {
    for (const s of SIGNALS) output(s).textContent = Number(slider(s).value).toFixed(2);
    markPreset();
    renderCart();
    const anchors = mode() === 'cart' ? cart : [Number(sel('product').value)];
    $<HTMLElement>('[data-k="title"]').textContent = mode() === 'cart'
      ? (cart.length ? `Recommended for this cart (${cart.length} item${cart.length > 1 ? 's' : ''})` : 'Add products to the cart')
      : `Often bought with: ${P.name[anchors[0]]}`;
    const list = $<HTMLOListElement>('.rec-list');
    list.replaceChildren();
    if (!anchors.length) return;
    const recs = score(anchors, weights(), sel('segment').value);
    const top = recs[0]?.s || 1;
    recs.forEach((r, k) => {
      const li = document.createElement('li');
      const rk = document.createElement('span'); rk.className = 'rk'; rk.textContent = String(k + 1);
      const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = P.name[r.j];
      const meta = document.createElement('span'); meta.className = 'meta';
      meta.textContent = `${P.leaf[r.j]} · $${P.price[r.j].toFixed(2)}`;
      const stack = document.createElement('div'); stack.className = 'stack';
      stack.setAttribute('aria-hidden', 'true');
      for (const s of SIGNALS) {
        if (r.p[s] <= 0) continue;
        const seg = document.createElement('span');
        seg.style.width = `${(100 * r.p[s]) / top}%`; seg.style.background = COLORS[s];
        stack.appendChild(seg);
      }
      const why = document.createElement('span'); why.className = 'why';
      const reasons = SIGNALS.filter((s) => r.p[s] > 0).sort((a, b) => r.p[b] - r.p[a]).map((s) => `${WHY[s]} ${(r.p[s]).toFixed(2)}`);
      why.textContent = reasons.length ? reasons.join(' · ') : 'popular with this segment';
      const body = document.createElement('div');
      body.append(nm, document.createElement('br'), meta, stack, why);
      li.append(rk, body);
      list.appendChild(li);
    });
  }

  // Evaluation chart
  const methods = ['Popularity', 'Content (style match)', 'Collaborative filtering', 'Curated rules', 'Market basket',
    'Hybrid — hand-set weights', 'Hybrid — tuned per segment'];
  const ev = data.evaluation.basket;
  const get = (m: string, s: string) => ev.find((r) => r.method === m && r.segment === s)!;
  const drawEval = () => barChart($<HTMLElement>('[data-chart="eval"]'), $<HTMLElement>('[data-chart="eval"] + .tooltip'), {
    items: methods.map((m) => {
      const r = get(m, 'all');
      return { label: m.replace('Hybrid — ', 'Hybrid: '), value: r.ndcg, highlight: m.endsWith('tuned per segment'),
        tip: [['Hit rate @10', r.hr.toFixed(3)], ['Catalogue coverage', `${Math.round(100 * r.coverage)}%`], ['Test cases', r.cases.toLocaleString('en-US')]] as [string, string][] };
    }),
    format: (v) => v.toFixed(3), labelWidth: 176,
  });
  fillTable($<HTMLTableElement>('[data-table="eval"]'), ['Method', 'Trade, high volume', 'Trade, general', 'Retail', 'All', 'HR@10 (all)', 'Coverage'],
    methods.map((m) => [m.replace('Hybrid — ', 'Hybrid: '), ...['trade_high', 'trade_general', 'retail', 'all'].map((s) => get(m, s).ndcg.toFixed(3)),
      get(m, 'all').hr.toFixed(3), `${Math.round(100 * get(m, 'all').coverage)}%`]));

  // Wiring
  status.textContent = '';
  $<HTMLElement>('.rec-body').hidden = false;
  applyTuned();
  sel('dept').addEventListener('change', () => { fillProducts(); render(); });
  sel('product').addEventListener('change', render);
  sel('segment').addEventListener('change', () => { applyTuned(); render(); });
  form.querySelectorAll('input[name="mode"]').forEach((r) => r.addEventListener('change', () => {
    if (mode() === 'cart' && !cart.length) cart.push(Number(sel('product').value));
    render();
  }));
  $<HTMLButtonElement>('[data-act="add"]').addEventListener('click', () => {
    const i = Number(sel('product').value);
    if (!cart.includes(i) && cart.length < 8) cart.push(i);
    render();
  });
  for (const s of SIGNALS) slider(s).addEventListener('input', () => {
    $<HTMLElement>('[data-k="wnote"]').textContent = 'Custom weights.';
    render();
  });
  $<HTMLButtonElement>('[data-act="tuned"]').addEventListener('click', () => { applyTuned(); render(); });
  $<HTMLButtonElement>('[data-act="default"]').addEventListener('click', () => { setWeights(data.weights.default, 'Hand-set weights, before tuning.'); render(); });
  let raf = 0;
  new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(drawEval); }).observe($<HTMLElement>('.eval'));
  render();
  drawEval();
}
