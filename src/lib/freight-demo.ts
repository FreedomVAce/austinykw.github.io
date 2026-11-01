import { barChart, fillTable, fmtMoney, fmtNum, fmtPct, lineChart } from './charts';
import { mountSqlPanel } from './sql-panel';

const METRICS = [
  'shipments', 'billable_shipments', 'spend', 'billable_spend', 'charged', 'credited', 'included', 'recovered',
  'leak_threshold', 'leak_discretionary', 'leak_credit', 'leak_undercharge', 'leak_included', 'over_recovery',
  'duplicate_cost',
] as const;
type Metric = (typeof METRICS)[number];
type Totals = Record<Metric, number>;

type Data = {
  meta: { months: string[]; shipments: number; parquet_bytes: number };
  branches: { code: string; name: string; region: string }[];
  carriers: { code: string; name: string; service: string }[];
  cube: { m: number[]; b: number[]; c: number[] } & Record<Metric, number[]>;
  findings: {
    opportunities: { finding: string; scope: string; period: string; amount: number; basis: string }[];
    charge_ratio_carrier: { carrier_code: string; q: string; charge_to_cost: number }[];
  };
  queries: { label: string; sql: string }[];
};

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthTitle = (ym: string) => `${MON[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;
const zero = (): Totals => Object.fromEntries(METRICS.map((k) => [k, 0])) as Totals;

export async function mountFreightDemo(root: HTMLElement) {
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

  const form = $<HTMLFormElement>('.controls');
  const sel = (n: string) => form.elements.namedItem(n) as HTMLSelectElement;
  const fill = (s: HTMLSelectElement, items: [string, string][]) => {
    for (const [v, l] of items) { const o = document.createElement('option'); o.value = v; o.textContent = l; s.appendChild(o); }
  };
  const years = [...new Set(data.meta.months.map((m) => m.slice(0, 4)))];
  fill(sel('year'), [['', 'All years'], ...years.map((y) => [y, y] as [string, string])]);
  fill(sel('region'), [['', 'All regions'], ...[...new Set(data.branches.map((b) => b.region))].sort().map((r) => [r, r] as [string, string])]);
  fill(sel('carrier'), [['', 'All carriers'], ...data.carriers.map((c, i) => [String(i), c.name] as [string, string])]);

  const set = (k: string, v: string) => { const n = $<HTMLElement>(`[data-k="${k}"]`); if (n) n.textContent = v; };
  set('nShip', fmtNum(data.meta.shipments));
  set('pqSize', `${(data.meta.parquet_bytes / 1e6).toFixed(1)} MB`);
  status.textContent = '';
  $<HTMLElement>('.body').hidden = false;

  const { cube } = data;
  const n = cube.m.length;
  const monthYear = data.meta.months.map((m) => m.slice(0, 4));

  function aggregate(year: string, region: string, carrier: string) {
    const total = zero();
    const byMonth = new Map<number, Totals>();
    const byBranch = data.branches.map(() => zero());
    for (let i = 0; i < n; i++) {
      if (year && monthYear[cube.m[i]] !== year) continue;
      if (region && data.branches[cube.b[i]].region !== region) continue;
      if (carrier && String(cube.c[i]) !== carrier) continue;
      const mt = byMonth.get(cube.m[i]) ?? zero();
      for (const k of METRICS) {
        const v = cube[k][i];
        total[k] += v; mt[k] += v; byBranch[cube.b[i]][k] += v;
      }
      byMonth.set(cube.m[i], mt);
    }
    return { total, byMonth, byBranch };
  }

  const rate = (t: Totals) => (t.billable_spend ? t.recovered / t.billable_spend : 0);

  function render() {
    const year = sel('year').value, region = sel('region').value, carrier = sel('carrier').value;
    const { total, byMonth, byBranch } = aggregate(year, region, carrier);
    const prev = year && years.includes(String(Number(year) - 1)) ? aggregate(String(Number(year) - 1), region, carrier).total : null;
    const delta = (cur: number, p: number | undefined, label = 'vs prior year') =>
      p ? `${cur >= p ? '+' : '−'}${Math.abs(100 * (cur / p - 1)).toFixed(1)}% ${label}` : `${fmtNum(total.shipments)} shipments`;

    set('spend', fmtMoney(total.spend));
    set('spendNote', delta(total.spend, prev?.spend));
    set('rec', fmtMoney(total.recovered));
    set('recNote', delta(total.recovered, prev?.recovered));
    set('rate', fmtPct(rate(total)));
    set('rateNote', prev ? `${rate(total) >= rate(prev) ? '+' : '−'}${Math.abs(100 * (rate(total) - rate(prev))).toFixed(1)} pts vs prior year` : `of ${fmtMoney(total.billable_spend)} billable`);
    set('net', fmtMoney(total.spend - total.recovered));
    set('netNote', delta(total.spend - total.recovered, prev ? prev.spend - prev.recovered : undefined));

    // Monthly lines
    const months = data.meta.months.map((m, i) => ({ m, i })).filter(({ m }) => !year || m.startsWith(year));
    const spend = months.map(({ i }) => byMonth.get(i)?.billable_spend ?? 0);
    const rec = months.map(({ i }) => byMonth.get(i)?.recovered ?? 0);
    lineChart($<HTMLElement>('[data-chart="monthly"]'), $<HTMLElement>('[data-chart="monthly"] + .tooltip'), {
      labels: months.map(({ m }) => m),
      tick: (m) => (year ? MON[Number(m.slice(5, 7)) - 1].slice(0, 1) : m.endsWith('-01') ? m.slice(0, 4) : null),
      title: monthTitle,
      series: [
        { label: 'Billable spend', color: 'var(--series-1)', values: spend },
        { label: 'Recovered', color: 'var(--series-2)', values: rec },
      ],
      yFormat: fmtMoney,
      extraRows: (i) => [['Recovery rate', spend[i] ? fmtPct(rec[i] / spend[i]) : '–']],
    });
    fillTable($<HTMLTableElement>('[data-table="monthly"]'), ['Month', 'Billable spend', 'Recovered', 'Rate'],
      months.map(({ m }, k) => [monthTitle(m), fmtMoney(spend[k]), fmtMoney(rec[k]), spend[k] ? fmtPct(rec[k] / spend[k]) : '–']));

    // Branch bars
    const branchItems = data.branches
      .map((b, i) => ({ b, t: byBranch[i] }))
      .filter(({ t }) => t.billable_spend > 0)
      .map(({ b, t }) => ({
        label: b.name, value: rate(t),
        tip: [['Billable spend', fmtMoney(t.billable_spend)], ['Recovered', fmtMoney(t.recovered)],
              ['Discretionary waivers', fmtMoney(t.leak_discretionary)]] as [string, string][],
      }))
      .sort((a, z) => a.value - z.value);
    barChart($<HTMLElement>('[data-chart="branches"]'), $<HTMLElement>('[data-chart="branches"] + .tooltip'), {
      items: branchItems, format: (v) => fmtPct(v), ref: { value: rate(total), label: 'all' }, labelWidth: 96, max: 1,
    });

    // Leak causes
    const causes: [string, number][] = [
      ['Free-freight threshold', total.leak_threshold],
      ['Discretionary waivers', total.leak_discretionary],
      ['Delivered-pricing gap', total.leak_included],
      ['Under-charging', total.leak_undercharge],
      ['Credits issued', total.leak_credit],
    ];
    const gap = causes.reduce((s, [, v]) => s + v, 0) - total.over_recovery;
    barChart($<HTMLElement>('[data-chart="causes"]'), $<HTMLElement>('[data-chart="causes"] + .tooltip'), {
      items: causes.sort((a, z) => z[1] - a[1]).map(([label, value]) => ({
        label, value, tip: [['Share of gross leakage', fmtPct(value / causes.reduce((s, [, v]) => s + v, 0))]],
      })),
      format: fmtMoney, labelWidth: 150,
    });
    set('causesNote', `Net of ${fmtMoney(total.over_recovery)} charged above cost, billable freight left ${fmtMoney(gap)} unrecovered. ` +
      `Separately, ${fmtMoney(total.duplicate_cost)} of duplicate carrier billing is recoverable from carriers.`);
  }

  // Charge-to-cost lines (static — the pattern needs every branch to be visible)
  const ltl = data.carriers.filter((c) => c.service === 'ltl');
  const quarters = [...new Set(data.findings.charge_ratio_carrier.map((r) => r.q))].sort();
  const ratio = (code: string) => quarters.map((q) => data.findings.charge_ratio_carrier.find((r) => r.carrier_code === code && r.q === q)?.charge_to_cost ?? null);
  // Show the carrier whose ratio strays furthest from its peers against the mean of the others —
  // chosen from the data, so the chart works for any dataset.
  const peerMean = (code: string) => quarters.map((_, k) => {
    const v = ltl.filter((c) => c.code !== code).map((c) => ratio(c.code)[k]).filter((x): x is number => x != null);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  });
  const deviation = (code: string) => Math.max(...ratio(code).map((v, k) => Math.abs((v ?? 0) - (peerMean(code)[k] ?? 0))));
  const focus = [...ltl].sort((a, z) => deviation(z.code) - deviation(a.code))[0];
  const ratioLegend = $<HTMLElement>('[data-k="ratioLegend"]');
  if (ratioLegend) ratioLegend.textContent = focus.name;
  set('ratioLegend2', focus.name);
  const drawRatio = () => {
    const series = [
      { label: 'Other LTL (mean)', color: 'var(--series-1)', values: peerMean(focus.code), directLabel: true },
      { label: focus.name.split(' ')[0], color: 'var(--series-2)', values: ratio(focus.code), directLabel: true },
    ];
    const vals = series.flatMap((s) => s.values.filter((v): v is number => v != null));
    const lo = Math.floor((Math.min(...vals, 1) - 0.02) * 10) / 10;
    const hi = Math.max(Math.ceil((Math.max(...vals) + 0.02) * 10) / 10, lo + 0.2);
    lineChart($<HTMLElement>('[data-chart="ratio"]'), $<HTMLElement>('[data-chart="ratio"] + .tooltip'), {
      labels: quarters,
      tick: (q) => (q.endsWith('Q1') ? q.slice(0, 4) : null),
      title: (q) => q.replace('-', ' '),
      series,
      yFormat: (v) => v.toFixed(2),
      yMin: lo,
      yMax: hi,
      yStep: 0.1,
      ref: { value: 1, label: 'break-even' },
    });
    fillTable($<HTMLTableElement>('[data-table="ratio"]'), ['Quarter', ...ltl.map((c) => c.name)],
      quarters.map((q, k) => [q, ...ltl.map((c) => { const v = ratio(c.code)[k]; return v == null ? '–' : v.toFixed(3); })]));
  };

  // Findings
  const list = $<HTMLOListElement>('.opp-list');
  for (const o of data.findings.opportunities) {
    const li = document.createElement('li');
    const t = document.createElement('span'); t.className = 'o-title'; t.textContent = `${o.finding}: ${o.scope}, ${o.period}`;
    const a = document.createElement('span'); a.className = 'o-amt'; a.textContent = fmtMoney(o.amount);
    const b = document.createElement('span'); b.className = 'o-basis'; b.textContent = o.basis;
    li.append(t, a, b); list.appendChild(li);
  }

  form.addEventListener('change', render);
  let raf = 0;
  const redraw = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { render(); drawRatio(); }); };
  new ResizeObserver(redraw).observe($<HTMLElement>('[data-chart="monthly"]').parentElement!);
  render();
  drawRatio();

  mountSqlPanel($<HTMLElement>('.sql'), new URL(root.dataset.parquet!, location.href).href, data.queries);
}
