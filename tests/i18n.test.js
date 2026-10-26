// Pruebas de js/i18n.js
const { describe, test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { loadIndex } = require('./helpers');
const {
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
} = require('../js/i18n.js');
const { initMobileMenu } = require('../js/main.js');

/** localStorage de mentira: guarda en un Map y cuenta lo que se escribe. */
function fakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    data,
  };
}

/** localStorage bloqueado: cualquier uso lanza un error (como en modo privado estricto). */
const brokenStorage = {
  getItem() { throw new Error('bloqueado'); },
  setItem() { throw new Error('bloqueado'); },
};

/** Clic en el botón de un idioma. */
const clickLang = (document, lang) => document.querySelector(`.lang-switch__btn[data-lang="${lang}"]`).click();

describe('normalizeLang (lista permitida)', () => {
  test('acepta solo "es" y "en"', () => {
    assert.equal(normalizeLang('es'), 'es');
    assert.equal(normalizeLang('en'), 'en');
  });

  test('rechaza cualquier otro valor', () => {
    for (const value of ['fr', 'EN', ' en', '', null, undefined, 42, '<script>']) {
      assert.equal(normalizeLang(value), null, `debería rechazar ${String(value)}`);
    }
  });
});

describe('readSavedLang y saveLang (localStorage seguro)', () => {
  test('lee un idioma válido guardado', () => {
    assert.equal(readSavedLang(fakeStorage({ [STORAGE_KEY]: 'en' })), 'en');
  });

  test('ignora un valor manipulado o inválido', () => {
    assert.equal(readSavedLang(fakeStorage({ [STORAGE_KEY]: 'hack' })), null);
  });

  test('sin nada guardado devuelve null', () => {
    assert.equal(readSavedLang(fakeStorage()), null);
  });

  test('si localStorage falla o no existe, no rompe la página', () => {
    assert.equal(readSavedLang(brokenStorage), null);
    assert.equal(readSavedLang(null), null);
    assert.doesNotThrow(() => saveLang(brokenStorage, 'en'));
    assert.doesNotThrow(() => saveLang(null, 'en'));
  });

  test('saveLang guarda el idioma con la clave acordada', () => {
    const storage = fakeStorage();
    saveLang(storage, 'en');
    assert.equal(storage.data.get(STORAGE_KEY), 'en');
  });
});

describe('parseAttrSpec (atributos traducibles)', () => {
  test('lee uno o varios pares atributo:clave', () => {
    assert.deepEqual(parseAttrSpec('aria-label:nav.label'), [['aria-label', 'nav.label']]);
    assert.deepEqual(parseAttrSpec('data-label-open:a, data-label-close:b'), [
      ['data-label-open', 'a'],
      ['data-label-close', 'b'],
    ]);
  });

  test('descarta atributos peligrosos o que no están en la lista permitida', () => {
    assert.deepEqual(parseAttrSpec('href:x, onclick:y, src:z, style:w'), []);
  });

  test('la lista permitida no incluye atributos que cambien enlaces o ejecuten código', () => {
    for (const attr of TRANSLATABLE_ATTRS) {
      assert.doesNotMatch(attr, /^(href|src|srcset|style|on)/);
    }
  });

  test('sin valor devuelve una lista vacía', () => {
    assert.deepEqual(parseAttrSpec(null), []);
    assert.deepEqual(parseAttrSpec(''), []);
  });
});

describe('collectTexts y applyTranslations', () => {
  test('applyTranslations usa textContent: el HTML de una traducción se muestra como texto', () => {
    const { document } = loadIndex();
    applyTranslations(document, { 'contact.title': '<img src=x>' });
    const title = document.getElementById('contacto-titulo');
    assert.equal(title.textContent, '<img src=x>');
    assert.equal(title.querySelector('img'), null, 'no debe crear elementos');
  });

  test('una clave que falta deja el texto como estaba', () => {
    const { document } = loadIndex();
    applyTranslations(document, {});
    assert.equal(document.getElementById('contacto-titulo').textContent, 'Contacto');
  });

  test('collectTexts copia los textos y atributos en español', () => {
    const { document } = loadIndex();
    const texts = collectTexts(document);
    assert.equal(texts['contact.title'], 'Contacto');
    assert.equal(texts['nav.label'], 'Secciones del sitio');
    assert.equal(texts['about.photo'], 'Foto de Carlos Mario Hoyos Ríos');
  });
});

describe('Traducciones al inglés', () => {
  const { document } = loadIndex();
  const keysInHtml = new Set(Object.keys(collectTexts(document)));
  const en = TRANSLATIONS.en;

  test('cada texto marcado en el HTML tiene su traducción', () => {
    const missing = [...keysInHtml].filter((key) => !(key in en));
    assert.deepEqual(missing, []);
  });

  test('no sobran traducciones (claves que ya no existen en el HTML)', () => {
    const unused = Object.keys(en).filter((key) => !keysInHtml.has(key));
    assert.deepEqual(unused, []);
  });

  test('ninguna traducción está vacía', () => {
    for (const [key, text] of Object.entries(en)) {
      assert.ok(text.trim(), `traducción vacía: ${key}`);
    }
  });

  test('las reglas de contenido también se cumplen en inglés', () => {
    const all = Object.values(en).join('\n');
    assert.doesNotMatch(all, /\+57|\b3\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/, 'sin teléfono');
    assert.doesNotMatch(all, /AWS Certified/i, 'la insignia AWS no es certificación');
    // Fraud Detection: solo en futuro, sin resultados
    assert.match(en['p4.summary'], /^It will be/);
    assert.equal(en['status.soon'], 'Coming soon');
    assert.match(en['status.wip'], /In development/);
  });
});

describe('setLanguage', () => {
  let document, spanish;

  beforeEach(() => {
    ({ document } = loadIndex());
    spanish = collectTexts(document);
  });

  test('en inglés cambia textos, atributos, <html lang> y el título de la pestaña', () => {
    setLanguage(document, 'en', spanish);
    assert.equal(document.documentElement.lang, 'en');
    assert.equal(document.getElementById('contacto-titulo').textContent, 'Contact');
    assert.equal(document.querySelector('.site-nav').getAttribute('aria-label'), 'Site sections');
    assert.equal(document.title, TRANSLATIONS.en['meta.title']);
  });

  test('al volver a español recupera exactamente los textos originales', () => {
    const before = document.querySelector('main').textContent;
    setLanguage(document, 'en', spanish);
    setLanguage(document, 'es', spanish);
    assert.equal(document.documentElement.lang, 'es');
    assert.equal(document.querySelector('main').textContent, before);
  });

  test('marca con aria-pressed el botón del idioma activo', () => {
    setLanguage(document, 'en', spanish);
    const pressed = [...document.querySelectorAll('.lang-switch__btn[aria-pressed="true"]')];
    assert.deepEqual(pressed.map((b) => b.dataset.lang), ['en']);
  });

  test('no cambia los enlaces ni los nombres propios', () => {
    const hrefs = () => [...document.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    const before = hrefs();
    setLanguage(document, 'en', spanish);
    assert.deepEqual(hrefs(), before);
    assert.equal(document.querySelector('h1').textContent, 'Carlos Mario Hoyos Ríos');
  });
});

describe('initI18n', () => {
  test('sin idioma guardado la página queda en español', () => {
    const { document } = loadIndex();
    initI18n(document, fakeStorage());
    assert.equal(document.documentElement.lang, 'es');
    assert.equal(document.getElementById('contacto-titulo').textContent, 'Contacto');
  });

  test('aplica el idioma guardado al cargar', () => {
    const { document } = loadIndex();
    initI18n(document, fakeStorage({ [STORAGE_KEY]: 'en' }));
    assert.equal(document.documentElement.lang, 'en');
    assert.equal(document.getElementById('contacto-titulo').textContent, 'Contact');
  });

  test('los botones cambian el idioma y lo recuerdan', () => {
    const { document } = loadIndex();
    const storage = fakeStorage();
    initI18n(document, storage);

    clickLang(document, 'en');
    assert.equal(document.documentElement.lang, 'en');
    assert.equal(storage.data.get(STORAGE_KEY), 'en');

    clickLang(document, 'es');
    assert.equal(document.documentElement.lang, 'es');
    assert.equal(storage.data.get(STORAGE_KEY), 'es');
  });

  test('funciona aunque localStorage esté bloqueado', () => {
    const { document } = loadIndex();
    assert.doesNotThrow(() => initI18n(document, brokenStorage));
    clickLang(document, 'en');
    assert.equal(document.documentElement.lang, 'en');
  });

  test('el botón "Menú" del móvil también cambia de idioma', () => {
    const { document } = loadIndex();
    initMobileMenu(document);
    initI18n(document, fakeStorage());
    const toggle = document.querySelector('.site-nav__toggle');

    clickLang(document, 'en');
    assert.equal(toggle.textContent, 'Menu');
    toggle.click();
    assert.equal(toggle.textContent, 'Close');

    clickLang(document, 'es');
    assert.equal(toggle.textContent, 'Cerrar');
  });

  test('no falla si la página no tiene selector de idioma', () => {
    const { JSDOM } = require('jsdom');
    const empty = new JSDOM('<p>sin idioma</p>').window.document;
    assert.doesNotThrow(() => initI18n(empty, fakeStorage()));
  });
});
