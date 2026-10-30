/**
 * Everything personal on the site lives here, so updating a link or a skill
 * never means hunting through page markup.
 */
export const profile = {
  name: 'Austin Yu',
  firstName: 'Austin',
  role: 'Data Analyst · Machine Learning Developer',
  location: 'Vancouver, BC',
  /** Homepage hero: who I am and what I deliver, in one or two sentences. */
  tagline:
    'I find where a business is losing time or money, prove it with data, and build the tool that fixes it — from SQL and dashboards to forecasting models and AI services in production.',
  /** Short professional summary used on the homepage and résumé page. */
  intro:
    'Data analyst and machine learning developer with six years inside a building-products distributor — from inventory and pricing data to freight analytics, recommendation systems and LLM services. I combine business understanding with hands-on SQL, Python, BI and cloud implementation.',
  openToWork: true,
  lookingFor: 'Data Analyst, Data Scientist and Machine Learning roles',
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

/** Proof points under the homepage hero. Only verifiable, résumé-backed facts. */
export const proof = [
  { value: '6 yrs', label: 'in distribution data — inventory, pricing, freight and product catalogue' },
  { value: '−5% / +10%', label: 'freight cost and freight recovery, from my freight analysis' },
  { value: '1.2M+', label: 'product records maintained, with Python automation saving ~10 h a week' },
  { value: '4', label: 'ML and AI systems built: recommendations, LLM categorization, image classification, chatbot backend' },
];

/** "What I do" on the homepage: analytics + data science + business understanding + implementation. */
export const capabilities = [
  { icon: 'chart', title: 'Find the money', text: 'Freight, pricing and inventory analysis that ties every number to a cost, a saving or a decision.' },
  { icon: 'database', title: 'Make the data reliable', text: 'SQL, data-warehouse rules and automated cleaning, so reports and models start from data people trust.' },
  { icon: 'sparkles', title: 'Predict and recommend', text: 'Forecasting, segmentation and recommendation models, always measured against a simple baseline.' },
  { icon: 'box', title: 'Ship it', text: 'Models served through FastAPI, LLM services and AWS — built into the tools teams already use.' },
];

/** Tags available to the project filter. Project files must use these exact strings. */
export const SKILLS = [
  'SQL',
  'Python',
  'Dashboards',
  'Statistics',
  'Forecasting',
  'Machine Learning',
  'Deep Learning',
  'LLM & AI',
  'Recommender Systems',
  'Customer Analytics',
  'Data Pipelines',
  'Cloud',
] as const;

export const skillGroups = [
  {
    title: 'Analysis & BI',
    items: ['Power BI & DAX', 'Dundas BI', 'Tableau', 'Excel & Power Query'],
    detail: 'Freight, pricing and inventory analytics and the dashboards finance and operations act on.',
  },
  {
    title: 'Databases & SQL',
    items: ['SQL (CTEs, window functions)', 'SSMS · SSAS · SSRS', 'DuckDB', 'Data-warehouse rules'],
    detail: 'Querying, modelling and cleaning large product, pricing and transaction tables.',
  },
  {
    title: 'Python & Automation',
    items: ['pandas', 'NumPy', 'SciPy', 'pytest', 'Docker'],
    detail: 'Repeatable pipelines and automated data-quality checks that replace manual work.',
  },
  {
    title: 'Statistics & Forecasting',
    items: ['Regression', 'Hypothesis testing', 'A/B tests', 'Holt-Winters', 'SARIMA'],
    detail: 'Forecasts and tests that are backtested and compared against simple baselines.',
  },
  {
    title: 'Machine Learning & AI',
    items: ['scikit-learn', 'TensorFlow / Keras', 'PyTorch', 'Recommender systems', 'LLMs', 'NLP'],
    detail: 'Recommendation, classification and LLM solutions — from training to production.',
  },
  {
    title: 'Cloud & Delivery',
    items: ['AWS (Bedrock, Lambda, IAM, Secrets Manager)', 'FastAPI', 'Git & GitHub', 'Jira (Agile)', 'Figma'],
    detail: 'Serving models as APIs, user stories and acceptance criteria, and UX concepts with developers.',
  },
];

export const about = {
  paragraphs: [
    'I’m a data analyst and machine learning developer at Andrew Sheret Limited, a building-products distributor in British Columbia. My work sits where the business and the data meet: freight costs, pricing, inventory and a product catalogue of more than a million items.',
    'I started on the inventory team in 2020, moved into pricing and product data, and then into analytics and machine learning. That path is the reason my analysis tends to be practical — I know where the data comes from, which numbers people actually use, and what a model has to fit into before anyone will rely on it.',
    'Today that means three kinds of work: analysis that turns data into decisions (my freight analysis helped cut freight cost by 5% and raise recovery by 10%), automation that removes manual effort, and ML and AI services — recommendations, LLM product categorization, image classification and a chatbot backend on AWS — built into the tools my colleagues use every day.',
    'I hold a BSc in Mathematics from Simon Fraser University, with further training in data science (BrainStation), database administration (BCIT) and applied AI in data analytics (SFU).',
  ],
  strengths: [
    { title: 'Business first', text: 'I start from the cost, the decision or the bottleneck — then choose the data and method.' },
    { title: 'Analysis to implementation', text: 'I take work from the SQL query to the dashboard, model or API that people use.' },
    { title: 'Evidence over claims', text: 'Baselines, holdout tests and clear limits, so results stand up to questions.' },
  ],
};

/** A résumé bullet: plain text, or text with a link to a case study on this site. */
export type Bullet = string | { text: string; href: string; label?: string };

/**
 * Résumé entries. Sections with no entries are hidden.
 * Project bullets stay generic: no internal system names, client names or confidential figures.
 */
export const resume: {
  /** Profile paragraph(s) at the top of the résumé. */
  profile: string[];
  experience: { role: string; org: string; location: string; period: string; note?: string; points: Bullet[] }[];
  education: { title: string; org: string; period?: string; detail?: string }[];
  certifications: { title: string; org: string; period?: string; detail?: string }[];
  /** Sidebar skills, in the résumé's own categories. */
  skills: { label: string; items: string }[];
} = {
  profile: [
    'Data analyst and machine learning developer with six years in a building-products distribution business. I turn operational data — freight, pricing, inventory and a 1.2-million-item product catalogue — into decisions, automation and production tools.',
    'My work spans SQL and data-warehouse rules, Python automation, BI dashboards, forecasting and recommendation models, and LLM and AI services on FastAPI and AWS. My freight analysis helped reduce freight cost by 5% and increase recovery by 10%.',
  ],
  skills: [
    { label: 'Databases', items: 'SQL, SSMS, SSAS, SSRS, DuckDB' },
    { label: 'Programming', items: 'Python (pandas, NumPy, SciPy), Visual Studio, MATLAB' },
    { label: 'Machine Learning', items: 'scikit-learn, forecasting, supervised & unsupervised learning, recommender systems' },
    { label: 'Neural Networks & LLMs', items: 'TensorFlow, Keras, PyTorch, LLM classification' },
    { label: 'NLP', items: 'NLTK, spaCy' },
    { label: 'Cloud & Serving', items: 'AWS (Bedrock, Lambda, IAM, Secrets Manager), FastAPI, Docker' },
    { label: 'Statistics', items: 'Hypothesis testing, A/B tests, regression, backtesting' },
    { label: 'Big Data', items: 'Hadoop, Spark, Hive' },
    { label: 'Data Visualization', items: 'Power BI (Power Query, DAX, data modelling, publishing), Dundas BI, Tableau, Matplotlib, Seaborn, Plotly' },
    { label: 'Microsoft Office', items: 'Excel, Access, Word, PowerPoint' },
    { label: 'Project Tools', items: 'Jira (Agile), Figma, Git & GitHub' },
  ],
  experience: [
    {
      role: 'Junior Machine Learning Developer',
      org: 'Andrew Sheret Limited',
      location: 'Victoria, BC',
      period: 'Feb 2026 – Present',
      note: 'Part-time, alongside the Data Analyst role',
      points: [
        { text: 'Built a hybrid recommendation engine — collaborative filtering, market-basket analysis, content similarity and expert-curated pairings, tuned per customer segment — serving product-page and cart recommendations through a FastAPI service.', href: 'projects/product-recommendation-engine/', label: 'Case study' },
        { text: 'Developed an LLM-based product categorization service (local models or AWS Bedrock) that files new products into a multi-level category taxonomy, scores its own confidence to route each prediction to auto-accept, spot-check or human review, and learns from reviewer corrections.', href: 'projects/applied-ai-at-work/', label: 'How it works' },
        { text: 'Implemented the AWS backend for an internal AI chatbot: an AWS Lambda function handles each request and calls a foundation model on Amazon Bedrock, with credentials kept in AWS Secrets Manager instead of code and IAM roles and policies controlling what the function can access.', href: 'projects/applied-ai-at-work/', label: 'How it works' },
      ],
    },
    {
      role: 'Data Analyst',
      org: 'Andrew Sheret Limited',
      location: 'Victoria, BC',
      period: 'Sep 2022 – Present',
      points: [
        { text: 'Conduct monthly and yearly freight analysis to optimize delivery schedules, resulting in a 5% reduction in freight cost and a 10% increase in freight recovery.', href: 'projects/freight-spend-recovery/', label: 'Case study' },
        { text: 'Designed and deployed a CNN image classification model that sorts product images into categories, served through FastAPI and integrated into an internal Java application as a one-click action; each prediction carries a confidence score so uncertain images can be reviewed — replacing a manual, click-heavy workflow.', href: 'projects/applied-ai-at-work/', label: 'How it works' },
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
