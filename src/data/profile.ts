/**
 * Everything personal on the site lives here, so updating a link or a skill
 * never means hunting through page markup.
 */
export const profile = {
  name: 'Austin Yu',
  firstName: 'Austin',
  role: 'Data Analyst · Data Scientist',
  location: 'Vancouver, BC',
  tagline:
    'I turn messy operational data into forecasts, recommendations and dashboards that teams actually use.',
  intro:
    'I work across the full analytics workflow — SQL and Python pipelines, statistical modelling and machine learning, and the dashboards and write-ups that turn results into decisions.',
  openToWork: true,
  photo: 'images/profile_pic.jpeg',
  links: {
    linkedin: 'https://www.linkedin.com/in/austinykw/',
    github: 'https://github.com/FreedomVAce',
    /** Set to a public address to show an email link. Left empty on purpose. */
    email: '',
    /** Formspree form ID (the part after /f/). Empty = the contact form is hidden. */
    formspreeId: '',
    /** Path under public/ to a résumé PDF, e.g. "resume.pdf". Empty = no download button. */
    resumePdf: '',
  },
};

/** Tags available to the project filter. Project files must use these exact strings. */
export const SKILLS = [
  'SQL',
  'Python',
  'Dashboards',
  'Statistics',
  'Forecasting',
  'Machine Learning',
  'Deep Learning',
  'Recommender Systems',
  'Customer Analytics',
  'Data Pipelines',
] as const;

export const skillGroups = [
  {
    title: 'Analysis & BI',
    items: ['SQL (CTEs, window functions)', 'Power BI & DAX', 'Tableau', 'Excel & Power Query'],
    detail: 'KPI design, exploratory analysis, cohort and segment reporting for finance, logistics and commercial teams.',
  },
  {
    title: 'Python & Data Engineering',
    items: ['pandas', 'NumPy', 'SciPy (sparse)', 'FastAPI', 'Docker', 'pytest'],
    detail: 'Repeatable pipelines that clean, join and aggregate millions of rows, with tests and validation built in.',
  },
  {
    title: 'Statistics & Forecasting',
    items: ['Regression', 'Holt-Winters', 'SARIMAX', 'Seasonality', 'A/B testing'],
    detail: 'Time-series forecasting, backtesting against baselines, and honest uncertainty in the results.',
  },
  {
    title: 'Machine Learning',
    items: ['scikit-learn', 'Clustering', 'Collaborative filtering', 'Market basket analysis', 'TensorFlow / Keras', 'PCA'],
    detail: 'Segmentation, recommendation and classification models evaluated the way they will be used.',
  },
  {
    title: 'Delivery',
    items: ['Git & GitHub', 'Jira', 'Documentation', 'Stakeholder presentations'],
    detail: 'Clear write-ups and dashboards for non-technical audiences; reproducible work for technical ones.',
  },
];

export const about = {
  paragraphs: [
    'I’m a data analyst who likes the whole pipeline: getting raw exports into shape, building the model, and then explaining what it means to the people who have to act on it.',
    'Most of my recent work has been in distribution and retail — freight costs, inventory and demand, customer purchasing behaviour, and product recommendations built on years of transaction history. Much of that work runs on confidential data, so the case studies on this site are rebuilt on public or synthetic datasets that keep the technical problem intact without exposing anything real.',
    'I care about data quality, reproducibility and documentation, and I try to measure models against simple baselines before claiming they work.',
  ],
  strengths: [
    { title: 'End-to-end ownership', text: 'From the SQL extract to the dashboard or API that serves the result.' },
    { title: 'Business translation', text: 'I can walk a finance lead and a data engineer through the same result.' },
    { title: 'Evidence first', text: 'Holdout tests, baselines and validation before a number goes in a deck.' },
  ],
};

/**
 * Résumé entries. Sections with no entries are hidden, so nothing placeholder-ish
 * is ever shown. Keep employer descriptions generic if they must stay confidential.
 */
export const resume: {
  experience: { role: string; org: string; period: string; points: string[] }[];
  education: { title: string; org: string; period?: string; detail?: string }[];
} = {
  experience: [
    // { role: 'Data Analyst', org: 'Company (or "Multi-branch distributor")', period: '2023 – Present',
    //   points: ['Built …', 'Automated …'] },
  ],
  education: [
    { title: 'Data Science Program', org: 'BrainStation', detail: 'Capstone: face recognition and emotion detection with CNNs.' },
  ],
};
