// =========================================================
// i18n.js — sitio bilingüe (español por defecto, inglés opcional)
// El español vive en el HTML (funciona sin JS). Al arrancar se copia
// en memoria, así este archivo solo necesita guardar el inglés.
// Marcado en el HTML:
//   data-i18n="clave"                    → traduce el texto (textContent)
//   data-i18n-attr="aria-label:clave"    → traduce atributos (varios separados por coma)
// =========================================================

const SUPPORTED_LANGS = ['es', 'en'];
const DEFAULT_LANG = 'es';
const STORAGE_KEY = 'lang';

// Atributos que una traducción puede cambiar. Lista cerrada: nunca href, src ni on*.
const TRANSLATABLE_ATTRS = ['aria-label', 'alt', 'title', 'data-label-open', 'data-label-close'];

// Textos en inglés. Si falta una clave, se queda el texto en español.
const TRANSLATIONS = {
  en: {
    'meta.title': 'Carlos Mario Hoyos Ríos | Data Engineer',
    'skip': 'Skip to content',

    // Hero
    'hero.title': 'Data Engineer',
    'hero.subtitle': 'Reliable pipelines that turn data into business decisions',
    'hero.location': 'Cali, Colombia · Open to on-site, hybrid or remote work',
    'profiles.label': 'Two profiles',
    'profiles.de.skill1': 'ETL/ELT pipelines and medallion architecture',
    'profiles.de.skill2': 'Python, SQL, dbt and Dagster',
    'profiles.de.skill3': 'Data Lake on AWS (S3, Athena)',
    'profiles.de.cv': 'Download CV (Spanish) – Data Engineer',
    'profiles.bi.title': 'Data Analyst / BI',
    'profiles.bi.skill2': 'Advanced SQL and dimensional modeling',
    'profiles.bi.cv': 'Download CV (Spanish) – Data Analyst / BI',
    'social.label': 'Social links and contact',
    'social.mail': 'Email',

    // Navegación
    'nav.label': 'Site sections',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'nav.lang': 'Language',
    'nav.about': 'About me',
    'nav.projects': 'Projects',
    'nav.experience': 'Experience',
    'nav.education': 'Education',
    'nav.contact': 'Contact',

    // Sobre mí
    'about.title': 'About me',
    'about.photo': 'Photo of Carlos Mario Hoyos Ríos',
    'about.p1': 'I am a BI Developer focused on data engineering, with more than 7 years of experience in the banking and financial sector. I build ETL/ELT pipelines on an AWS Data Lake and turn them into reliable information for business areas such as Risk and Deposits.',
    'about.p2': 'I migrated ETL processes from Pandas to Polars and reduced execution times by 20%. I am a Systems Engineer and a Specialist in Visual Analytics and Big Data. Today I am strengthening my profile in lakehouse (Databricks), distributed processing and AI applied to data.',
    'facts.years': '7+ years',
    'facts.years.text': 'in the banking and financial sector',
    'facts.aws.text': 'pipelines on a Data Lake',
    'facts.polars.text': 'in execution times after migrating from Pandas to Polars',

    // Stack
    'stack.languages': 'Programming languages',
    'stack.dataeng': 'Data engineering',
    'stack.orchestration': 'Transformation and orchestration',
    'stack.distributed': 'Distributed processing',
    'stack.databases': 'Databases',
    'stack.tools': 'Tools',
    'stack.learning': 'Learning',
    'chip.sqlAdvanced': 'SQL (advanced)',
    'chip.dimensional': 'Dimensional modeling (star schema)',
    'chip.medallion': 'Medallion architecture',
    'chip.dataQuality': 'Data quality',
    'chip.fabric': 'Microsoft Fabric (hands-on knowledge)',
    'chip.spark': 'Apache Spark / PySpark (basic)',
    'chip.powerbi': 'Power BI (DAX, data modeling)',
    'chip.excel': 'Advanced Excel',

    // Proyectos
    'projects.title': 'Projects',
    'projects.tech': 'Technologies',
    'projects.plannedStack': 'Planned stack',
    'projects.details': 'Show details',
    'projects.code': 'Code',
    'status.done': 'Completed',
    'status.wip': 'In development (v1)',
    'status.soon': 'Coming soon',
    'date.jul2026': 'Jul 2026',
    'date.nov2025': 'Nov 2025',
    'date.jan2026': 'Jan 2026',
    'date.jun2025': 'Jun 2025',
    'date.jan2023': 'Jan 2023',
    'p1.title': 'Marketplace Data Warehouse – medallion architecture',
    'p1.summary': 'End-to-end data warehouse for an e-commerce marketplace (Bronze → Silver → Gold).',
    'p1.d1': 'Ingestion of sales, products and customers into the Bronze layer with Python (Pandas, SQLAlchemy).',
    'p1.d2': 'dbt: staging in Silver and a star schema in Gold (1 fact table + 5 dimensions) with referential integrity (PK/FK).',
    'p1.d3': 'Asset-based orchestration with Dagster Cloud (Serverless) and a daily schedule.',
    'p1.d4': 'PostgreSQL on Supabase, Docker, 100% cloud deployment and documentation with diagrams.',
    'p2.title': 'Statistical analysis of Pokémon (Gen 1–6) with Python and Power BI',
    'p2.summary': 'Cleaning, exploratory analysis and visualization of the dataset, with an interactive Power BI dashboard.',
    'p2.d1': 'Dataset cleaning and validation (missing values, outliers, special forms).',
    'p2.d2': 'EDA: aggregations by generation, comparison of legendary and Mega Evolution Pokémon, and segmentation of the "elite" (total stats > 600).',
    'p2.d3': 'Visualizations with Matplotlib and Seaborn and an interactive Power BI dashboard.',
    'p2.d4': 'Its LinkedIn post got more than 17,000 impressions.',
    'p3.title': 'Job Offer Radar',
    'p3.summary': 'A tool to find the job offers with the best chance of success: it collects, normalizes and compares offers against my CV with a score from 0 to 100 and a recommendation, plus a tracking dashboard.',
    'p3.d1': 'Roadmap: v1 rules and keywords (Python + SQLite) → v2 local embeddings (sentence-transformers) → v3 automation with Dagster → v4 optional, with local models (Ollama).',
    'p3.d2': 'Principle: zero cost, only local tools and sources that allow their use.',
    'p4.summary': 'It will be a lakehouse for fraud detection on Databricks with Delta Lake, using the public PaySim dataset and focused on anti-money laundering (AML).',

    // Experiencia
    'exp.title': 'Experience',
    'exp.e1.until': '– Present · Remote',
    'exp.e1.role': 'BI Developer (Data Engineering)',
    'exp.e1.text': 'Regulatory interest rate risk project on an AWS Data Lake: ETL/ELT pipelines between S3 and reporting layers, Parquet normalization, validation with Athena and Power BI dashboards.',
    'exp.e1.achievement': 'Achievement:',
    'exp.e1.achievement.text': 'migration from Pandas to Polars (−20% in execution times).',
    'exp.e2.role': 'Incident, Event and Problem Engineer',
    'exp.e2.text': 'SQL for root cause analysis, ETL with Pentaho and SLA reports (100% compliance).',
    'exp.e3.role': 'IT Services Operator Engineer',
    'exp.e3.text': 'SQL (Oracle) for the daily banking close, reconciliation on IBM AS/400 and automation of reprocessing tasks.',
    'exp.e4.role': 'Help Desk Technician',
    'exp.e4.company': '· Banco Unión (2018–2022) and Banco W (2015–2017)',

    // Educación y certificaciones
    'edu.title': 'Education and certifications',
    'edu.education': 'Education',
    'edu.specialization': 'Specialization in Visual Analytics and Big Data',
    'edu.engineering': 'Systems Engineering',
    'edu.technology': 'Systems Technology',
    'edu.camacho': 'Antonio José Camacho University Institution · 2022',
    'edu.languages': 'Languages',
    'edu.spanish': 'Spanish',
    'edu.native': 'Native',
    'edu.english': 'English',
    'edu.englishLevel': 'B1, actively learning',
    'edu.certifications': 'Certifications',
    // Nombres de cursos traducidos para leerlos en inglés (el certificado conserva el nombre original)
    'cert.spark': 'Big Data and Spark: Data Engineering with Python and PySpark',
    'cert.powerbi': 'Power BI TOTAL: Advanced Data Analyst',
    'cert.excel': 'Excel University: Basic, Intermediate and Advanced',
    'cert.python': 'Python Programming Course',
    'edu.verify': 'Verify',

    // Contacto y footer
    'contact.title': 'Contact',
    'contact.text': 'Do you have an opportunity or a data project? Write to me by email or LinkedIn and I will be happy to get in touch.',
    'footer.made': 'Built with HTML, CSS and JS · Published on GitHub Pages',
  },
};

/**
 * Lógica pura: devuelve el idioma si está permitido, o null si no.
 * @param {unknown} value valor a revisar (puede venir de localStorage)
 * @returns {'es'|'en'|null}
 */
function normalizeLang(value) {
  return SUPPORTED_LANGS.includes(value) ? value : null;
}

/**
 * Lee el idioma guardado. Nunca falla: si localStorage está bloqueado
 * (modo privado, archivo local) o el valor no es válido, devuelve null.
 * @param {Storage|null} storage normalmente window.localStorage
 * @returns {'es'|'en'|null}
 */
function readSavedLang(storage) {
  try {
    return normalizeLang(storage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

/**
 * Guarda el idioma elegido. Si no se puede, la web sigue funcionando igual.
 * @param {Storage|null} storage normalmente window.localStorage
 * @param {'es'|'en'} lang idioma a guardar
 */
function saveLang(storage, lang) {
  try {
    storage.setItem(STORAGE_KEY, lang);
  } catch {
    // Sin almacenamiento: el idioma solo dura mientras la página esté abierta
  }
}

/** Obtiene localStorage sin romper la página: en algunos navegadores solo leerlo ya lanza un error. */
function getStorage(view) {
  try {
    return view ? view.localStorage : null;
  } catch {
    return null;
  }
}

/**
 * Lógica pura: convierte "aria-label:clave, alt:otra" en pares [atributo, clave].
 * Descarta los atributos que no están en la lista permitida.
 * @param {string|null} spec valor de data-i18n-attr
 * @returns {[string, string][]}
 */
function parseAttrSpec(spec) {
  if (!spec) return [];
  return spec
    .split(',')
    .map((pair) => pair.split(':').map((part) => part.trim()))
    .filter(([attr, key]) => key && TRANSLATABLE_ATTRS.includes(attr));
}

/**
 * Copia los textos actuales del HTML (el español) en un objeto { clave: texto }.
 * @param {Document} root
 * @returns {Record<string, string>}
 */
function collectTexts(root) {
  const texts = {};
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    texts[el.dataset.i18n] = el.textContent;
  });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    for (const [attr, key] of parseAttrSpec(el.dataset.i18nAttr)) {
      texts[key] = el.getAttribute(attr);
    }
  });
  return texts;
}

/**
 * Pone en la página los textos del diccionario. Solo usa textContent y
 * setAttribute con la lista permitida: nunca interpreta HTML.
 * @param {Document} root
 * @param {Record<string, string>} dict
 */
function applyTranslations(root, dict) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const text = dict[el.dataset.i18n];
    if (typeof text === 'string') el.textContent = text;
  });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    for (const [attr, key] of parseAttrSpec(el.dataset.i18nAttr)) {
      if (typeof dict[key] === 'string') el.setAttribute(attr, dict[key]);
    }
  });
}

/**
 * Cambia el idioma de toda la página.
 * @param {Document} root
 * @param {'es'|'en'} lang
 * @param {Record<string, string>} spanish textos originales del HTML
 */
function setLanguage(root, lang, spanish) {
  // El español completo es la base: si falta una traducción, se ve en español
  const dict = lang === 'es' ? spanish : { ...spanish, ...TRANSLATIONS[lang] };
  applyTranslations(root, dict);
  root.documentElement.lang = lang; // lectores de pantalla y buscadores usan este dato

  // Botones ES | EN: aria-pressed indica cuál está activo
  root.querySelectorAll('.lang-switch__btn').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
  });

  // Aviso para otras funcionalidades (por ejemplo, el texto del botón "Menú")
  const view = root.defaultView;
  if (view) root.dispatchEvent(new view.CustomEvent('i18n:change', { detail: { lang } }));
}

/**
 * Botones ES | EN: aplica el idioma guardado y cambia al hacer clic.
 * @param {Document} root
 * @param {Storage|null} storage dónde recordar la elección
 */
function initI18n(root = document, storage = getStorage(root.defaultView)) {
  const buttons = root.querySelectorAll('.lang-switch__btn');
  if (buttons.length === 0) return;

  const spanish = collectTexts(root); // copia antes de traducir nada
  const saved = readSavedLang(storage);
  if (saved && saved !== DEFAULT_LANG) setLanguage(root, saved, spanish);

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = normalizeLang(btn.dataset.lang);
      if (!lang) return;
      setLanguage(root, lang, spanish);
      saveLang(storage, lang);
    });
  });
}

// Exporta las funciones para las pruebas en Node (el navegador ignora esto)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SUPPORTED_LANGS,
    STORAGE_KEY,
    TRANSLATABLE_ATTRS,
    TRANSLATIONS,
    normalizeLang,
    readSavedLang,
    saveLang,
    parseAttrSpec,
    collectTexts,
    applyTranslations,
    setLanguage,
    initI18n,
  };
}
