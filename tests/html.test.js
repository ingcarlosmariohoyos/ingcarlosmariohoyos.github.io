// Pruebas de index.html: estructura, accesibilidad básica y reglas de contenido (CLAUDE.md sección 3)
const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, loadIndex } = require('./helpers');

const { document } = loadIndex();

/** Busca la tarjeta de proyecto cuyo título contiene el texto dado. */
function findProject(title) {
  return [...document.querySelectorAll('.project')].find((card) =>
    card.querySelector('h3').textContent.includes(title)
  );
}

describe('Estructura y accesibilidad', () => {
  test('el idioma de la página es español', () => {
    assert.equal(document.documentElement.lang, 'es');
  });

  test('hay un solo h1 y es el nombre', () => {
    const h1s = document.querySelectorAll('h1');
    assert.equal(h1s.length, 1);
    assert.equal(h1s[0].textContent.trim(), 'Carlos Mario Hoyos Ríos');
  });

  test('tiene las regiones semánticas header, nav, main y footer', () => {
    for (const tag of ['header', 'nav', 'main', 'footer']) {
      assert.ok(document.querySelector(tag), `falta <${tag}>`);
    }
  });

  test('todas las imágenes tienen texto alternativo', () => {
    for (const img of document.querySelectorAll('img')) {
      assert.ok(img.getAttribute('alt')?.trim(), `imagen sin alt: ${img.src}`);
    }
  });

  test('los ids no se repiten', () => {
    const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test('los enlaces internos (#...) apuntan a ids que existen', () => {
    for (const link of document.querySelectorAll('a[href^="#"]')) {
      const id = link.getAttribute('href').slice(1);
      assert.ok(document.getElementById(id), `enlace roto: #${id}`);
    }
  });

  test('todos los enlaces tienen un nombre legible (aunque solo muestren un icono)', () => {
    for (const link of document.querySelectorAll('a')) {
      const name = link.textContent.trim() || link.getAttribute('aria-label');
      assert.ok(name, `enlace sin nombre accesible: ${link.getAttribute('href')}`);
    }
  });

  test('los iconos usados (<use href="#icon-...">) existen en el sprite', () => {
    for (const use of document.querySelectorAll('use')) {
      const id = use.getAttribute('href').slice(1);
      assert.equal(document.getElementById(id)?.tagName.toLowerCase(), 'symbol', `icono inexistente: #${id}`);
    }
  });

  test('los SVG decorativos están ocultos para lectores de pantalla', () => {
    for (const svg of document.querySelectorAll('svg')) {
      assert.equal(svg.getAttribute('aria-hidden'), 'true');
    }
  });

  test('tiene metadatos SEO y Open Graph', () => {
    assert.ok(document.title.trim());
    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:title"]',
      'meta[property="og:image"]',
      'meta[name="twitter:card"]',
    ]) {
      assert.ok(document.querySelector(selector)?.content, `falta ${selector}`);
    }
  });

  test('cada "Ver detalles" es un <details> con su <summary> y una lista dentro', () => {
    const blocks = document.querySelectorAll('.project__more');
    assert.ok(blocks.length > 0, 'no hay bloques de detalles');
    for (const details of blocks) {
      assert.equal(details.tagName.toLowerCase(), 'details');
      assert.equal(details.firstElementChild.tagName.toLowerCase(), 'summary', 'el <summary> debe ir primero');
      assert.equal(details.firstElementChild.textContent.trim(), 'Ver detalles');
      assert.ok(details.querySelector('.project__details li'), 'detalles vacíos');
    }
  });

  test('todas las tarjetas de proyecto están dentro de la rejilla .projects', () => {
    for (const card of document.querySelectorAll('.project')) {
      assert.ok(card.parentElement.classList.contains('projects'));
    }
  });
});

describe('Reglas de contenido', () => {
  const text = document.body.textContent;

  test('no se publica ningún teléfono', () => {
    assert.equal(document.querySelector('a[href^="tel:"]'), null);
    assert.doesNotMatch(text, /\+57|\b3\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/);
  });

  test('la insignia de AWS tiene su nombre exacto y no se presenta como certificación', () => {
    assert.ok(text.includes('AWS Cloud Quest: Cloud Practitioner – Training Badge'));
    assert.doesNotMatch(text, /AWS Certified/i);
  });

  test('Fraud Detection Lakehouse: solo "Próximamente", atenuado y sin enlaces', () => {
    const card = findProject('Fraud Detection Lakehouse');
    assert.ok(card, 'no se encontró la tarjeta');
    assert.equal(card.querySelector('.status').textContent.trim(), 'Próximamente');
    assert.ok(card.classList.contains('project--upcoming'));
    assert.equal(card.querySelectorAll('a').length, 0, 'no debe tener botón "Código" ni enlaces');
    assert.equal(card.querySelector('details'), null, 'no debe tener "Ver detalles": aún no hay resultados');
  });

  test('Radar de Ofertas Laborales: "En desarrollo" y sin botón "Código"', () => {
    const card = findProject('Radar de Ofertas Laborales');
    assert.ok(card, 'no se encontró la tarjeta');
    assert.match(card.querySelector('.status').textContent, /En desarrollo/);
    assert.equal(card.querySelectorAll('a').length, 0);
  });

  test('cada proyecto tiene un único estado válido con su estilo correspondiente', () => {
    const allowed = {
      'status--done': /^Terminado$/,
      'status--wip': /^En desarrollo/,
      'status--soon': /^Próximamente$/,
    };
    for (const card of document.querySelectorAll('.project')) {
      const statuses = card.querySelectorAll('.status');
      assert.equal(statuses.length, 1);
      const [modifier] = [...statuses[0].classList].filter((c) => c in allowed);
      assert.ok(modifier, 'estado sin clase status--done/wip/soon');
      assert.match(statuses[0].textContent.trim(), allowed[modifier]);
    }
  });

  test('el correo publicado es el de empleo', () => {
    const mails = [...document.querySelectorAll('a[href^="mailto:"]')].map((a) => a.href);
    assert.ok(mails.length > 0);
    for (const mail of mails) assert.equal(mail, 'mailto:carloshoyosrios@gmail.com');
  });
});

describe('Archivos locales', () => {
  test('las imágenes, CV y favicon referenciados existen', () => {
    // srcset puede traer varias rutas: "foto-320.webp 320w, foto.webp 800w"
    const fromSrcset = (value) => value.split(',').map((part) => part.trim().split(/\s+/)[0]);
    const refs = [...document.querySelectorAll('[src], [srcset], link[rel="icon"], a[href]')]
      .flatMap((el) => [el.getAttribute('src'), el.getAttribute('href'), ...fromSrcset(el.getAttribute('srcset') || '')])
      .filter((ref) => ref && !/^(https?:|mailto:|#)/.test(ref));
    const missing = refs.filter((ref) => !fs.existsSync(path.join(ROOT, ref)));
    assert.deepEqual(missing, []);
  });
});

describe('404.html', () => {
  const { JSDOM } = require('jsdom');
  const page = new JSDOM(fs.readFileSync(path.join(ROOT, '404.html'), 'utf8')).window.document;
  const text = page.body.textContent;

  test('tiene idioma, un solo h1 y el texto en los dos idiomas', () => {
    assert.equal(page.documentElement.lang, 'es');
    assert.equal(page.querySelectorAll('h1').length, 1);
    assert.match(text, /Página no encontrada/);
    assert.match(text, /Page not found/);
    // El inglés está marcado con lang="en" para los lectores de pantalla
    assert.ok([...page.querySelectorAll('[lang="en"]')].some((el) => /Page not found/.test(el.textContent)));
  });

  test('tiene un enlace para volver al inicio', () => {
    assert.ok(page.querySelector('a[href="/"]'));
  });

  test('no se indexa en buscadores', () => {
    assert.match(page.querySelector('meta[name="robots"]')?.content || '', /noindex/);
  });

  test('usa rutas absolutas para que cargue en cualquier subcarpeta', () => {
    const local = [...page.querySelectorAll('link[href]')]
      .map((el) => el.getAttribute('href'))
      .filter((href) => !/^https:/.test(href));
    assert.ok(local.length > 0);
    for (const href of local) {
      assert.match(href, /^\//, `ruta relativa: ${href}`);
      assert.ok(fs.existsSync(path.join(ROOT, href)), `no existe: ${href}`);
    }
  });

  test('misma CSP que index.html, sin scripts ni eventos inline', () => {
    const csp = (doc) => doc.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content;
    assert.equal(csp(page), csp(document));
    assert.equal(page.querySelectorAll('script').length, 0);
    for (const el of page.querySelectorAll('*')) {
      assert.deepEqual([...el.attributes].filter((a) => a.name.startsWith('on')), []);
    }
  });

  test('no publica teléfono', () => {
    assert.doesNotMatch(text, /\+57|\b3\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/);
  });
});
