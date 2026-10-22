/**
 * Everything personal on the site lives here, so updating a link or a skill
 * never means hunting through page markup.
 */
export const profile = {
  name: 'Austin Yu',
  firstName: 'Austin',
  role: 'Data Analyst · Machine Learning Developer',
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
    /** Public email — shown on Contact, Résumé and in the footer. Set to '' to hide it. */
    email: 'austinyu504@gmail.com',
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
    items: ['SQL (CTEs, window functions)', 'SSMS · SSAS · SSRS', 'Power BI & DAX', 'Dundas BI', 'Tableau', 'Excel & Power Query'],
    detail: 'KPI design, freight and pricing analytics, cohort and segment reporting for finance, logistics and commercial teams.',
  },
  {
    title: 'Python & Data Engineering',
    items: ['pandas', 'NumPy', 'SciPy', 'DuckDB', 'FastAPI', 'Docker', 'pytest'],
    detail: 'Repeatable pipelines that clean, join and validate millions of rows, and ML models served as APIs.',
  },
  {
    title: 'Statistics & Forecasting',
    items: ['Regression', 'Hypothesis testing', 'A/B tests', 'Holt-Winters', 'SARIMA', 'Backtesting'],
    detail: 'Time-series forecasting, significance testing, and honest comparison against baselines.',
  },
  {
    title: 'Machine Learning & AI',
    items: ['scikit-learn', 'TensorFlow / Keras', 'PyTorch', 'Recommender systems', 'LLM classification', 'NLP (NLTK, spaCy)'],
    detail: 'Recommendation, classification and segmentation models — from training to production APIs.',
  },
  {
    title: 'Cloud, Big Data & Delivery',
    items: ['AWS', 'Spark', 'Hadoop & Hive', 'Git & GitHub', 'Jira (Agile)', 'Figma'],
    detail: 'User stories and acceptance criteria, UX concepts with developers, and documentation people can follow.',
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

/** A résumé bullet: plain text, or text with a link to a case study on this site. */
export type Bullet = string | { text: string; href: string; label?: string };

/**
 * Résumé entries. Sections with no entries are hidden.
 * Project bullets stay generic: no internal system names, client names or confidential figures.
 */
export const resume: {
  experience: { role: string; org: string; location: string; period: string; note?: string; points: Bullet[] }[];
  education: { title: string; org: string; period?: string; detail?: string }[];
  certifications: { title: string; org: string; period?: string; detail?: string }[];
} = {
  experience: [
    {
      role: 'Junior Machine Learning Developer',
      org: 'Andrew Sheret Limited',
      location: 'Victoria, BC',
      period: 'Feb 2026 – Present',
      note: 'Part-time, alongside the Data Analyst role',
      points: [
        { text: 'Built a hybrid recommendation engine — collaborative filtering, market-basket analysis, content similarity and expert-curated pairings, tuned per customer segment — serving product-page and cart recommendations through a FastAPI service.', href: 'projects/product-recommendation-engine/', label: 'Case study' },
        'Developed an LLM-based product categorization service that assigns new products to a multi-level category taxonomy, with a confidence score that routes each prediction to auto-accept, spot-check or human review, and reviewer feedback that improves later predictions.',
        'Building an internal knowledge assistant: an LLM chatbot that answers staff questions using company documents and product data.',
      ],
    },
    {
      role: 'Data Analyst',
      org: 'Andrew Sheret Limited',
      location: 'Victoria, BC',
      period: 'Sep 2022 – Present',
      points: [
        { text: 'Conduct monthly and yearly freight analysis to optimize delivery schedules, resulting in a 5% reduction in freight cost and a 10% increase in freight recovery.', href: 'projects/freight-spend-recovery/', label: 'Case study' },
        'Designed and deployed a CNN image classification model that sorts product images into categories, served through FastAPI and integrated into an internal Java application as a one-click action, with audit logging and human review of low-confidence results — replacing a manual, click-heavy workflow.',
        'Automated pricing for non-stock products and devised a decision-tree approach to dynamic pricing based on price range, product category and shipment type.',
        'Re-implemented the calculation for non-SKU products with business stakeholders, reducing redundancies by 90% and establishing data-warehouse business rules.',
        'Built freight and operations analytics in Python (pandas, Matplotlib, statistical methods, scikit-learn) and delivered them through Dundas BI dashboards (data modelling, DAX, dashboard UX).',
        { text: 'Built branch-level demand forecasts from raw stock-movement data — rebuilding stock positions and comparing seasonal regression, Holt-Winters and SARIMA — to support replenishment planning.', href: 'projects/inventory-demand-forecasting/', label: 'Case study' },
        'Provide product information, pricing and product data to major online and big-box retail partners to support online sales.',
        'Write Jira user stories, personas and acceptance criteria in an Agile team, and design SaaS interface concepts in Figma with developers and stakeholders.',
      ],
    },
    {
      role: 'Pricing Data Administrator',
      org: 'Andrew Sheret Limited',
      location: 'Victoria, BC',
      period: 'May 2021 – Sep 2022',
      points: [
        'Maintained data for over 1.2 million product items — part IDs, descriptions, names, images and documents — including sensitive pricing information.',
        'Automated data cleaning and validation with Python, saving about 10 hours of manual work per week and improving the reliability of business reporting.',
        'Led the migration of pricing data from an acquired competitor during the expansion into Alberta and Saskatchewan, with minimal disruption.',
        'Extracted, joined and structured large datasets (50K+ records) from the product information system with SQL for analytics, reporting and data-quality work.',
        'Led a team verifying UPC and EAN codes and standardized product finish attributes, improving customer search accuracy and catalogue consistency.',
        'Worked with software developers to improve API data collection and storage, and reported data-quality issues to purchasing agents.',
      ],
    },
    {
      role: 'Inventory Specialist',
      org: 'Andrew Sheret Limited',
      location: 'Vancouver, BC',
      period: 'Aug 2020 – May 2021',
      points: [
        'Produced an ABC inventory analysis from shipping data to identify the top 20% of products by cost and units sold.',
        'Contributed to promotional discount programs for clearance and discontinued products, lifting revenue in a competitive market.',
        'Trained and mentored three new receivers on shipping methodology and attention to detail.',
      ],
    },
    {
      role: 'Marketing Coordinator',
      org: 'VIVA Health Products Ltd.',
      location: 'Richmond, BC',
      period: 'Feb 2019 – Jan 2020',
      points: [
        'Planned and ran 10×10 booth displays for events and the Asia Cosmetics trade show in Hong Kong (2019).',
        'Maintained order, inventory and overseas-distributor spreadsheets, and handled daily invoicing in QuickBooks.',
      ],
    },
  ],
  education: [
    { title: 'Bachelor of Science, Mathematics', org: 'Simon Fraser University, Burnaby, BC', period: '2013 – 2018' },
  ],
  certifications: [
    { title: 'Certificate, Applied AI in Data Analytics', org: 'Simon Fraser University', period: 'Oct 2025 – Jan 2026' },
    { title: 'Certificate, Applied Database Administration and Design', org: 'BCIT', period: 'Sep 2020 – Dec 2021' },
    { title: 'Diploma, Data Science', org: 'BrainStation', period: 'Jan – Mar 2020', detail: 'Capstone: face recognition and emotion detection with CNNs.' },
  ],
};
