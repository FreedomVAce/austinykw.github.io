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
    'I bridge business operations and machine learning, turning operational data into cost savings, better decisions and production-ready tools.',
  /** Short professional summary used on the homepage and résumé page. */
  intro:
    'Data analyst and machine learning developer with six years in wholesale distribution and supply chain, working across inventory and pricing data, freight analytics, recommendation systems and LLM services. I combine business understanding with hands-on SQL, Python, BI and cloud implementation.',
  openToWork: true,
  lookingFor: 'Data Analyst, Machine Learning Engineer and AI Engineer roles',
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
  { value: '6 years', label: 'of turning operational data into decisions across inventory, pricing, logistics and product information' },
  { value: '−5% / +10%', label: 'reduction in freight cost and increase in freight recovery, from my analysis' },
  { value: '1.2 Million+', label: 'product records managed, with Python automation saving about 10 hours a week' },
  { value: '4', label: 'machine learning and AI services built: product recommendations, LLM categorization, image classification and a chatbot backend' },
];

/** "What I do" on the homepage: analytics + data science + business understanding + implementation. */
export const capabilities = [
  { icon: 'chart', title: 'Analytics', text: 'Freight, pricing and inventory analysis that ties every number to a cost, a saving or a decision.' },
  { icon: 'database', title: 'Data Engineering', text: 'SQL pipelines, data validation and automated cleaning, so every report and model is built on accurate, consistent data.' },
  { icon: 'sparkles', title: 'Machine Learning', text: 'Forecasting, segmentation and recommendation models, always measured against a simple baseline.' },
  { icon: 'box', title: 'Deployment', text: 'Models served through FastAPI, LLM services and AWS, built into the tools teams already use.' },
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
    detail: 'Recommendation, classification and LLM solutions, from training to production.',
  },
  {
    title: 'Cloud & Delivery',
    items: ['AWS (Bedrock, Lambda, IAM, Secrets Manager)', 'FastAPI', 'Git & GitHub', 'Jira (Agile)', 'Figma'],
    detail: 'Serving models as APIs, user stories and acceptance criteria, and UX concepts with developers.',
  },
];

export const about = {
  paragraphs: [
    'I’m a data analyst and machine learning developer with six years in wholesale distribution and supply chain. My work sits where the business and the data meet: freight costs, pricing, inventory and a product catalogue of more than a million items.',
    'I started on the inventory team in 2020, moved into pricing and product data, and then into analytics and machine learning. That path keeps my analysis practical: I know where the data comes from, which numbers people actually use, and what a model must fit into before anyone will rely on it.',
    'Today my work covers three areas: analysis that turns data into decisions, such as freight analysis that helped cut freight cost by 5% and raise recovery by 10%; automation that removes manual effort; and ML and AI services built into the tools my colleagues use every day, including recommendations, LLM product categorization, image classification and a chatbot backend on AWS.',
    'I hold a BSc in Mathematics from Simon Fraser University, with further training in data science (BrainStation), database administration (BCIT) and applied AI in data analytics (SFU).',
  ],
  strengths: [
    { title: 'Business first', text: 'I start from the cost, the decision or the bottleneck, then choose the data and method.' },
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
  /** Skills, in the résumé's own categories. */
  skills: { label: string; items: string }[];
  /** "Project Highlights" at the end of the résumé; href is a case-study path. */
  projects: { title: string; href: string; text: string }[];
} = {
  profile: [
    'Analytics professional who bridges business operations and machine learning. With six years of experience in wholesale distribution and supply chain, I have progressed from inventory and pricing into data analysis and ML development. Combines deep knowledge of supply-chain, pricing and product data with SQL, Python, Power BI and AWS to deliver measurable results, including a 5% reduction in freight cost and a 10% increase in freight recovery. I am seeking Data Analyst, Machine Learning Engineer or AI Engineer roles where I can turn operational data into cost savings, better decisions and production-ready tools.',
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
  projects: [
    { title: 'Applied AI at Work', href: 'projects/applied-ai-at-work/', text: 'Designed and deployed three AI services that automate catalogue and support workflows: LLM product categorization, CNN image classification and an AWS chatbot backend.' },
    { title: 'Freight Spend & Recovery', href: 'projects/freight-spend-recovery/', text: 'Identified sources of freight cost leakage and built a unified view of freight spend and recovery, contributing to a 5% reduction in freight cost.' },
    { title: 'Product Recommendation Engine', href: 'projects/product-recommendation-engine/', text: 'Developed segment-specific product recommendations served through FastAPI, using purchase history, product similarity and curated pairings.' },
    { title: 'E-Commerce Sales Analysis', href: 'projects/ecommerce-sales-analysis/', text: 'Delivered an end-to-end sales, delivery and customer analysis of 99,000 marketplace orders, quantifying the impact of late delivery on customer satisfaction.' },
  ],
  experience: [
    {
      role: 'Junior Machine Learning Developer',
      org: 'Andrew Sheret Limited',
      location: 'Victoria, BC',
      period: 'Feb 2026 – Present',
      note: 'Part-time, alongside the Data Analyst role',
      points: [
        { text: 'Built a hybrid recommendation engine that suggests related products on product and cart pages, combining purchase history, product similarity and expert pairings, tuned for each customer segment and served through FastAPI.', href: 'projects/product-recommendation-engine/', label: 'Case study' },
        { text: 'Developed an LLM service, running locally or on AWS Bedrock, that assigns new products to the right place in a multi-level category taxonomy, sends uncertain cases to staff for review and improves from their corrections.', href: 'projects/applied-ai-at-work/', label: 'How it works' },
        { text: 'Develop the AWS backend for an internal AI chatbot, using Lambda to handle requests and Amazon Bedrock to generate answers, with credentials stored in Secrets Manager and access controlled through IAM.', href: 'projects/applied-ai-at-work/', label: 'How it works' },
      ],
    },
    {
      role: 'Data Analyst',
      org: 'Andrew Sheret Limited',
      location: 'Victoria, BC',
      period: 'Sep 2022 – Present',
      points: [
        { text: 'Conduct monthly and yearly freight analysis to optimize delivery schedules, resulting in a 5% reduction in freight cost and a 10% increase in recovery.', href: 'projects/freight-spend-recovery/', label: 'Case study' },
        'Analyze and reimplement a calculation for non-SKU products by partnering with various business stakeholders which reduce redundancies by 90% and establish data warehouse business rules.',
        'Revolutionize the pricing platform by automating pricing for non-stock products, significantly boosting profitability and accuracy.',
        'Devise a decision-tree approach for dynamic pricing that integrates factors such as price range, product category, and shipment type.',
        'Create and analyze comprehensive freight analytics reports using Python (pandas, matplotlib, statistical methods, scikit-learn) and delivered actionable insights through Dundas BI dashboards (data modeling, DAX and dashboard UX design) to support operational planning and cost optimization.',
        { text: 'Built demand forecasts for each branch from raw stock movement data, comparing seasonal regression, Holt-Winters and SARIMA models to support replenishment planning.', href: 'projects/inventory-demand-forecasting/', label: 'Case study' },
        { text: 'Designed and deployed a CNN image classification model that sorts product images into categories with a single click inside an internal Java application, flagging uncertain images for review and replacing a slow manual process.', href: 'projects/applied-ai-at-work/', label: 'How it works' },
        'Partner with major retail giants to provide insightful product information to key distributors, and precise pricing and product data to facilitate online sales.',
        'Create and manage Jira tickets within an Agile delivery environment, defining user personas, user stories, and acceptance criteria to translate business requirements into actionable analytics and product deliverables.',
        'Design intuitive and user-centered SaaS interface concepts using Figma, collaborating with developers and stakeholders to translate analytical workflows into clear, actionable user experiences.',
      ],
    },
    {
      role: 'Pricing Data Administrator',
      org: 'Andrew Sheret Limited',
      location: 'Victoria, BC',
      period: 'May 2021 – Sep 2022',
      points: [
        'Orchestrated daily maintenance for over 1.2 million product items, including updating part IDs, verifying product descriptions and names, and ensuring the accuracy of images and documents.',
        'Managed a database of over 1 million products, including sensitive pricing information and donation processing.',
        'Spearheaded the seamless migration of pricing data from the acquired competitor, during the expansion into Alberta and Saskatchewan, to ensure minimal disruption and maximum efficiency.',
        'Automated data wrangling and cleaning workflows using Python, reducing manual intervention, accelerating insight delivery, and saving 10 hours per week while improving data reliability for business reporting.',
        'Collaborated with software developers to improve API data collection and storage processes, and provided regular communication to purchasing agents on data quality issues.',
        'Led a dedicated team to ensure data integrity by verifying UPC (12-digit) and EAN (13-digit) codes which drastically improved customer search accuracy.',
        'Standardized product finish attributes to ensure consistency and reliability across the database.',
        'Extracted, joined, and structured large datasets (50K+ records) from PIM using SQL, supporting downstream analytics, reporting, and data quality improvements.',
      ],
    },
    {
      role: 'Inventory Specialist',
      org: 'Andrew Sheret Limited',
      location: 'Vancouver, BC',
      period: 'Aug 2020 – May 2021',
      points: [
        'Generated an ABC Inventory Analysis Report using shipping data to determine the top 20% of high-performing products based on cost and sales units.',
        'Contributed to the implementation of promotional discount programs for clearance and deleted products, increasing revenue levels in a competitive market.',
        'Trained and mentored 3 new receivers to ensure a thorough understanding of shipping methodology and a focus on detail.',
      ],
    },
    {
      role: 'Marketing Coordinator',
      org: 'VIVA Health Products Ltd.',
      location: 'Richmond, BC',
      period: 'Feb 2019 – Jan 2020',
      points: [
        'Successfully planned and executed 10 x 10 booth displays for event operations and Asia Cosmetics tradeshows in Hong Kong in 2019.',
        'Maintained spreadsheets for orders, inventory, and overseas distributor contacts and handled daily invoicing in QuickBooks for customer inquiries.',
      ],
    },
  ],
  education: [
    { title: 'Bachelor of Science, Mathematics', org: 'Simon Fraser University, Burnaby, BC', period: 'September 2013 – December 2018' },
  ],
  certifications: [
    { title: 'Certificate, Applied AI in Data Analytics', org: 'Simon Fraser University', period: 'October 2025 – January 2026' },
    { title: 'Certificate, Applied Database Administration and Design', org: 'BCIT', period: 'September 2020 – December 2021' },
    { title: 'Diploma, Data Science', org: 'BrainStation', period: 'January – March 2020', detail: 'Capstone: face recognition and emotion detection with CNNs.' },
  ],
};
