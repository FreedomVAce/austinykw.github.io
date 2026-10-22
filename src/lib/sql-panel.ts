/**
 * In-browser SQL over a Parquet file, using DuckDB-WASM loaded on demand from jsDelivr.
 * Nothing is sent to a server: the file is fetched once and queried locally.
 */
import { fillTable, fmtNum } from './charts';

const DUCKDB_VERSION = '1.32.0';
const DUCKDB_ESM = `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@${DUCKDB_VERSION}/+esm`;
const MAX_ROWS = 500;

type Conn = { query: (sql: string) => Promise<any>; close: () => Promise<void> };

async function openDuckDB(parquetUrl: string, table: string): Promise<Conn> {
  const duckdb: any = await import(/* @vite-ignore */ DUCKDB_ESM);
  const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles());
  // Workers must be same-origin, so wrap the CDN worker script in a blob.
  const workerUrl = URL.createObjectURL(new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' }));
  const db = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), new Worker(workerUrl));
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(workerUrl);
  const buf = new Uint8Array(await (await fetch(parquetUrl)).arrayBuffer());
  await db.registerFileBuffer(`${table}.parquet`, buf);
  const conn = await db.connect();
  await conn.query(`CREATE VIEW ${table} AS SELECT * FROM read_parquet('${table}.parquet')`);
  return conn;
}

/** Decimal places needed to show a number exactly, capped at 4. */
const decimalsOf = (v: number) => {
  if (!Number.isFinite(v) || Number.isInteger(v)) return 0;
  const s = v.toFixed(4).replace(/0+$/, '');
  return s.length - s.indexOf('.') - 1;
};

function cell(v: unknown, type: string, decimals: number): string {
  if (v == null) return '∅';
  if (typeof v === 'bigint') return fmtNum(Number(v));
  if (type.startsWith('Date') || type.startsWith('Timestamp')) {
    const d = v instanceof Date ? v : new Date(Number(v));
    return type.startsWith('Date') ? d.toISOString().slice(0, 10) : d.toISOString().replace('T', ' ').slice(0, 19);
  }
  if (typeof v === 'number') return fmtNum(v, decimals);
  return String(v);
}

export function mountSqlPanel(root: HTMLElement, parquetUrl: string, queries: { label: string; sql: string }[], table = 'shipments') {
  const $ = <T extends Element>(s: string) => root.querySelector(s) as T;
  const input = $<HTMLTextAreaElement>('.sql-input');
  const runBtn = $<HTMLButtonElement>('[data-act="run"]');
  const loadBtn = $<HTMLButtonElement>('[data-act="load"]');
  const status = $<HTMLElement>('.sql-status');
  const presets = $<HTMLElement>('.presets');
  const resultWrap = $<HTMLElement>('.result-wrap');
  const result = $<HTMLTableElement>('[data-table="result"]');
  let conn: Conn | null = null;
  let loading: Promise<Conn> | null = null;

  const choose = (i: number) => {
    input.value = queries[i].sql;
    presets.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
  };
  queries.forEach((q, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = q.label; b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => { choose(i); if (conn) run(); });
    presets.appendChild(b);
  });
  choose(0);
  input.addEventListener('input', () => presets.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false')));

  const setStatus = (msg: string, err = false) => { status.textContent = msg; status.classList.toggle('err', err); };

  async function load() {
    if (conn) return conn;
    if (!loading) {
      loadBtn.disabled = true;
      loadBtn.textContent = 'Loading…';
      setStatus('Downloading the DuckDB engine and the data file…');
      const t = performance.now();
      loading = openDuckDB(parquetUrl, table).then(async (c) => {
        conn = c;
        loadBtn.hidden = true;
        runBtn.disabled = false;
        runBtn.classList.replace('btn--ghost', 'btn--primary');
        setStatus(`Engine ready in ${((performance.now() - t) / 1000).toFixed(1)} s.`);
        const desc = await c.query(`DESCRIBE ${table}`);
        const ul = $<HTMLElement>('[data-k="schema"]');
        ul.replaceChildren();
        for (const r of desc.toArray()) {
          const li = document.createElement('li'); li.className = 'chip';
          li.textContent = `${r.column_name} · ${String(r.column_type).toLowerCase()}`;
          ul.appendChild(li);
        }
        return c;
      }).catch((e) => {
        loading = null;
        loadBtn.disabled = false;
        loadBtn.textContent = 'Retry loading';
        setStatus(`Could not load the SQL engine: ${e?.message ?? e}`, true);
        throw e;
      });
    }
    return loading;
  }

  async function run() {
    const sql = input.value.trim();
    if (!sql) return;
    let c: Conn;
    try { c = await load(); } catch { return; }
    runBtn.disabled = true;
    setStatus('Running…');
    const t = performance.now();
    try {
      const res = await c.query(sql);
      const ms = performance.now() - t;
      const fields = res.schema.fields as { name: string; type: { toString(): string } }[];
      const rows = res.toArray() as any[];
      const shown = rows.slice(0, MAX_ROWS);
      // One decimal setting per column, so numbers line up.
      const dec = fields.map((f) => Math.max(0, ...shown.map((r) => (typeof r[f.name] === 'number' ? decimalsOf(r[f.name]) : 0))));
      fillTable(result, fields.map((f) => f.name),
        shown.map((r) => fields.map((f, k) => cell(r[f.name], f.type.toString(), dec[k]))));
      resultWrap.hidden = fields.length === 0;
      setStatus(`${fmtNum(rows.length)} row${rows.length === 1 ? '' : 's'}${rows.length > MAX_ROWS ? ` (showing ${MAX_ROWS})` : ''} · ${ms.toFixed(0)} ms`);
    } catch (e: any) {
      setStatus(String(e?.message ?? e).split('\n')[0], true);
    } finally {
      runBtn.disabled = false;
    }
  }

  loadBtn.addEventListener('click', () => { load().then(run).catch(() => {}); });
  runBtn.addEventListener('click', run);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); run(); }
  });
}
