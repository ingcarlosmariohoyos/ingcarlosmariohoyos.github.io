// Pruebas de js/main.js
const { describe, test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { loadIndex } = require('./helpers');
const {
  initMobileMenu,
  pickActiveSection,
  markActiveLink,
  initActiveSection,
  initYear,
} = require('../js/main.js');

describe('initMobileMenu', () => {
  let document, window, nav, toggle;

  // Antes de cada prueba: documento nuevo y menú inicializado
  beforeEach(() => {
    ({ document, window } = loadIndex());
    initMobileMenu(document);
    nav = document.querySelector('.site-nav');
    toggle = document.querySelector('.site-nav__toggle');
  });

  test('empieza cerrado', () => {
    assert.equal(nav.classList.contains('is-open'), false);
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  });

  test('el botón abre el menú y actualiza aria-expanded y el texto', () => {
    toggle.click();
    assert.equal(nav.classList.contains('is-open'), true);
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');
    assert.equal(toggle.textContent, 'Cerrar');
  });

  test('un segundo clic lo vuelve a cerrar', () => {
    toggle.click();
    toggle.click();
    assert.equal(nav.classList.contains('is-open'), false);
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(toggle.textContent, 'Menú');
  });

  test('elegir una sección cierra el menú', () => {
    toggle.click();
    nav.querySelector('ul a').click();
    assert.equal(nav.classList.contains('is-open'), false);
  });

  test('Escape cierra el menú y devuelve el foco al botón', () => {
    toggle.click();
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
    assert.equal(nav.classList.contains('is-open'), false);
    assert.equal(document.activeElement, toggle);
  });

  test('no falla si la página no tiene menú', () => {
    const { JSDOM } = require('jsdom');
    const empty = new JSDOM('<p>sin menú</p>').window.document;
    assert.doesNotThrow(() => initMobileMenu(empty));
  });
});

describe('pickActiveSection (lógica pura)', () => {
  // Secciones de ejemplo: "top" es la distancia al borde superior de la ventana
  const positions = [
    { id: 'sobre-mi', top: -900 },
    { id: 'stack', top: -100 },
    { id: 'proyectos', top: 250 },
    { id: 'contacto', top: 1200 },
  ];

  test('elige la última sección que ya cruzó la línea de referencia', () => {
    assert.equal(pickActiveSection(positions, 300), 'proyectos');
    assert.equal(pickActiveSection(positions, 200), 'stack');
  });

  test('en el hero (ninguna sección cruzó la línea) devuelve null', () => {
    assert.equal(pickActiveSection([{ id: 'sobre-mi', top: 700 }], 300), null);
  });

  test('al final de la página activa la última sección aunque no cruce la línea', () => {
    assert.equal(pickActiveSection(positions, 300, true), 'contacto');
  });

  test('sin secciones devuelve null', () => {
    assert.equal(pickActiveSection([], 300), null);
    assert.equal(pickActiveSection([], 300, true), null);
  });
});

describe('markActiveLink', () => {
  let links;

  beforeEach(() => {
    const { document } = loadIndex();
    links = [...document.querySelectorAll('.site-nav ul a')];
  });

  test('marca solo el enlace activo con is-active y aria-current', () => {
    markActiveLink(links, 'stack');
    const active = links.filter((a) => a.classList.contains('is-active'));
    assert.equal(active.length, 1);
    assert.equal(active[0].getAttribute('href'), '#stack');
    assert.equal(active[0].getAttribute('aria-current'), 'location');
  });

  test('al cambiar de sección, el enlace anterior se apaga', () => {
    markActiveLink(links, 'stack');
    markActiveLink(links, 'contacto');
    const stack = links.find((a) => a.getAttribute('href') === '#stack');
    assert.equal(stack.classList.contains('is-active'), false);
    assert.equal(stack.hasAttribute('aria-current'), false);
  });

  test('con null (estamos en el hero) ningún enlace queda activo', () => {
    markActiveLink(links, 'stack');
    markActiveLink(links, null);
    assert.equal(links.some((a) => a.classList.contains('is-active')), false);
  });
});

describe('initActiveSection', () => {
  /** Simula la posición de cada sección (jsdom no calcula el diseño). */
  function placeSections(document, tops) {
    for (const [id, top] of Object.entries(tops)) {
      document.getElementById(id).getBoundingClientRect = () => ({ top });
    }
  }

  test('enciende el enlace de la sección que se está leyendo', () => {
    const { document } = loadIndex();
    // jsdom: ventana de 768 px de alto → línea de referencia en 768 × 0,35 ≈ 269 px
    placeSections(document, {
      'sobre-mi': -1500, stack: -600, proyectos: 100,
      experiencia: 900, educacion: 1800, contacto: 2600,
    });
    const update = initActiveSection(document);
    assert.equal(typeof update, 'function');
    assert.equal(document.querySelector('.site-nav a.is-active').getAttribute('href'), '#proyectos');
  });

  test('recalcula cuando cambian las posiciones (al hacer scroll)', () => {
    const { document } = loadIndex();
    placeSections(document, {
      'sobre-mi': 900, stack: 1800, proyectos: 2700,
      experiencia: 3600, educacion: 4500, contacto: 5400,
    });
    const update = initActiveSection(document);
    assert.equal(document.querySelector('.site-nav a.is-active'), null, 'en el hero no hay sección activa');

    placeSections(document, { 'sobre-mi': -300, stack: 200 });
    update();
    assert.equal(document.querySelector('.site-nav a.is-active').getAttribute('href'), '#stack');
  });

  test('no falla si la página no tiene índice', () => {
    const { JSDOM } = require('jsdom');
    const empty = new JSDOM('<p>sin índice</p>').window.document;
    assert.equal(initActiveSection(empty), undefined);
  });
});

describe('initYear', () => {
  test('pone el año de la fecha dada en el footer', () => {
    const { document } = loadIndex();
    initYear(document, new Date(2030, 5, 15));
    assert.equal(document.getElementById('year').textContent, '2030');
  });

  test('sin fecha usa el año actual', () => {
    const { document } = loadIndex();
    initYear(document);
    assert.equal(document.getElementById('year').textContent, String(new Date().getFullYear()));
  });

  test('no falla si la página no tiene el año', () => {
    const { JSDOM } = require('jsdom');
    const empty = new JSDOM('<p>sin año</p>').window.document;
    assert.doesNotThrow(() => initYear(empty));
  });
});
