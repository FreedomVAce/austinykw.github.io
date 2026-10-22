import { barChart, fmtNum, fmtPct, lineChart } from './charts';

type PerClass = { label: string; precision: number; recall: number; f1: number; support: number };
type Task = {
  labels: string[]; confusion: number[][]; per_class: PerClass[]; accuracy: number; test: number; train: number;
  history: { loss: number[]; acc: number[]; val_loss: number[]; val_acc: number[] };
  baselines: { label: string; value: number }[]; images?: number; params?: number;
};
type Data = { face: Task; emotion: Task };

const NOTES = {
  face: {
    curve: 'Training and test accuracy stay within a point of each other (99.2% vs 98.5% at epoch 10), so the model is not overfitting. Caveat: the test set was also used as validation data during training, and neighbouring webcam frames are near-duplicates — real-world accuracy on new sessions would be lower.',
    cm: 'Only 22 of 1,440 test images are misclassified, and every error involves the “Unknown” class — the model never confuses the two known people with each other.',
    base: 'PCA + KNN (eigenfaces) already reaches 95%: with one person per class under similar lighting, the task is easy. The CNN closes most of the remaining gap.',
  },
  emotion: {
    curve: 'Test loss is still falling at epoch 20 and training accuracy (64%) is close to test accuracy (62%): the model was still learning, not overfitting — more epochs, augmentation or a pretrained backbone would likely help.',
    cm: 'Fear is the hardest emotion: only 25% are recognised and 28% are predicted as sad. Sad absorbs errors from fear, neutral and angry faces, which is why its precision (44%) is the lowest.',
    base: 'Seven classes make random guessing 14%, and always predicting “happy” scores 26%. The CNN reaches 62%, close to the roughly 65% human accuracy reported for FER-2013 (Goodfellow et al., 2013).',
  },
};

export async function mountFaceEmotionDemo(root: HTMLElement) {
  const $ = <T extends Element>(s: string) => root.querySelector(s) as T;
  const status = $<HTMLElement>('.status');
  let data: Data;
  try {
    const res = await fetch(root.dataset.src!);
    if (!res.ok) throw new Error(String(res.status));
    data = await res.json();
  } catch {
    status.textContent = 'The results could not be loaded. Please refresh to try again.';
    return;
  }
  status.textContent = '';
  $<HTMLElement>('.fe-body').hidden = false;
  const set = (k: string, v: string) => { const n = $<HTMLElement>(`[data-k="${k}"]`); if (n) n.textContent = v; };
  const state: Record<string, string> = { task: 'face', curve: 'acc', cm: 'pct', metric: 'recall' };

  root.querySelectorAll<HTMLElement>('[data-toggle]').forEach((g) => g.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b) return;
    state[g.dataset.toggle!] = b.dataset.v!;
    g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    draw();
  }));

  function draw() {
    const key = state.task as 'face' | 'emotion';
    const t = data[key];
    const notes = NOTES[key];
    const naive = t.baselines[1];
    const hardest = [...t.per_class].sort((a, b) => a.recall - b.recall)[0];

    set('acc', fmtPct(t.accuracy, 1));
    set('accNote', `${fmtNum(Math.round(t.accuracy * t.test))} of ${fmtNum(t.test)} test images`);
    set('base', fmtPct(naive.value, 1));
    set('baseNote', `${naive.label.toLowerCase()} · model is ${(t.accuracy / naive.value).toFixed(1)}× better`);
    set('hard', hardest.label);
    set('hardNote', `${fmtPct(hardest.recall, 0)} recalled · ${fmtNum(hardest.support)} test images`);
    set('data', fmtNum(t.train + t.test));
    set('dataNote', key === 'face'
      ? `self-recorded 50×50 frames · CNN with ${fmtNum(t.params!)} parameters`
      : `public FER-2013-derived images · ${fmtNum(t.train)} train / ${fmtNum(t.test)} test`);
    set('curveNote', notes.curve);
    set('cmNote', notes.cm);
    set('baseFine', notes.base);

    // Training curves
    const h = t.history;
    const isAcc = state.curve === 'acc';
    lineChart($<HTMLElement>('[data-chart="curves"]'), $<HTMLElement>('[data-chart="curves"] + .tooltip'), {
      labels: h.acc.map((_, i) => String(i + 1)),
      tick: (s, i) => (h.acc.length <= 10 || i % 2 === 1 ? s : null),
      title: (s) => `Epoch ${s}`,
      series: [
        { label: 'Training', color: 'var(--series-1)', values: isAcc ? h.acc : h.loss, directLabel: true },
        { label: 'Test', color: 'var(--series-2)', values: isAcc ? h.val_acc : h.val_loss, directLabel: true },
      ],
      yFormat: isAcc ? (v) => fmtPct(v, 0) : (v) => v.toFixed(1),
      yMin: 0, yMax: isAcc ? 1 : undefined, yStep: isAcc ? 0.2 : undefined,
    });

    // Baselines
    barChart($<HTMLElement>('[data-chart="baselines"]'), $<HTMLElement>('[data-chart="baselines"] + .tooltip'), {
      items: t.baselines.map((b) => ({ label: b.label, value: b.value, highlight: /CNN/.test(b.label) })),
      format: (v) => fmtPct(v, 1), labelWidth: 130, max: 1,
    });

    // Confusion matrix as a heat table
    const table = $<HTMLTableElement>('[data-table="cm"]');
    table.replaceChildren();
    const head = table.createTHead().insertRow();
    const corner = document.createElement('th'); corner.textContent = 'True ↓ / Pred →'; head.appendChild(corner);
    for (const l of t.labels) { const th = document.createElement('th'); th.scope = 'col'; th.textContent = l; head.appendChild(th); }
    const body = table.createTBody();
    t.confusion.forEach((row, i) => {
      const tr = body.insertRow();
      const th = document.createElement('th'); th.scope = 'row'; th.textContent = t.labels[i]; tr.appendChild(th);
      const total = row.reduce((a, b) => a + b, 0);
      row.forEach((n, j) => {
        const td = tr.insertCell();
        const share = n / total;
        td.textContent = state.cm === 'pct' ? `${Math.round(100 * share)}%` : fmtNum(n);
        const step = Math.min(6, Math.floor(share * 6.999));
        td.style.background = `var(--seq-${step})`;
        td.style.color = step >= 4 ? 'var(--seq-ink-dark)' : 'var(--seq-ink-light)';
        if (i === j) td.classList.add('diag');
        td.title = `True ${t.labels[i]}, predicted ${t.labels[j]}: ${fmtNum(n)} of ${fmtNum(total)} (${fmtPct(share, 1)})`;
      });
    });

    // Per-class scores
    const m = state.metric as 'recall' | 'precision' | 'f1';
    barChart($<HTMLElement>('[data-chart="perclass"]'), $<HTMLElement>('[data-chart="perclass"] + .tooltip'), {
      items: [...t.per_class].sort((a, b) => b[m] - a[m]).map((c) => ({
        label: c.label, value: c[m],
        tip: [['Recall', fmtPct(c.recall, 1)], ['Precision', fmtPct(c.precision, 1)], ['F1', c.f1.toFixed(3)], ['Test images', fmtNum(c.support)]] as [string, string][],
      })),
      format: (v) => (m === 'f1' ? v.toFixed(2) : fmtPct(v, 0)), labelWidth: 80, max: 1,
    });
    set('metricNote', {
      recall: 'Recall: of the faces that truly show this class, the share the model found.',
      precision: 'Precision: of the faces the model labelled with this class, the share that were right.',
      f1: 'F1: the harmonic mean of precision and recall.',
    }[m]);
  }

  let raf = 0, lastW = 0;
  new ResizeObserver(([e]) => {
    const w = Math.round(e.contentRect.width);
    if (w === lastW) return;
    lastW = w; cancelAnimationFrame(raf); raf = requestAnimationFrame(draw);
  }).observe($<HTMLElement>('.fe-body'));
  draw();
}
