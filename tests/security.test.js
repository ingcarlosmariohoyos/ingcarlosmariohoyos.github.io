// Pruebas de seguridad (CLAUDE.md sección 4.3)
const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, readProjectFile, loadIndex } = require('./helpers');

const { document } = loadIndex();

describe('index.html', () => {
  test('tiene Content Security Policy estricta (sin unsafe-inline ni unsafe-eval)', () => {
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content;
    assert.ok(csp, 'falta la meta CSP');
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /script-src 'self'/);
    assert.match(csp, /object-src 'none'/);
    assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
  });

  test('la CSP no permite ningún dominio externo (fuentes y estilos son propios)', () => {
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]').content;
    assert.doesNotMatch(csp, /https?:/);
  });

  test('no carga estilos, fuentes ni scripts de otros dominios', () => {
    const external = [...document.querySelectorAll('link[href], script[src]')]
      .filter((el) => el.getAttribute('rel') !== 'canonical')
      .map((el) => el.getAttribute('href') || el.getAttribute('src'))
      .filter((url) => /^(https?:)?\/\//.test(url));
    assert.deepEqual(external, []);
  });

  test('no hay scripts inline (la CSP los bloquearía)', () => {
    for (const script of document.querySelectorAll('script')) {
      assert.ok(script.src, 'script inline encontrado');
      assert.equal(script.textContent.trim(), '');
    }
  });

  test('no hay atributos de eventos inline (onclick, onload...)', () => {
    for (const el of document.querySelectorAll('*')) {
      const inline = [...el.attributes].filter((attr) => attr.name.startsWith('on'));
      assert.deepEqual(inline.map((a) => a.name), [], `<${el.tagName.toLowerCase()}> con evento inline`);
    }
  });

  test('no hay estilos inline (style="..." o <style>): la CSP los bloquearía', () => {
    assert.equal(document.querySelectorAll('[style]').length, 0);
    assert.equal(document.querySelectorAll('style').length, 0);
  });

  test('los enlaces que abren pestaña nueva usan rel="noopener noreferrer"', () => {
    for (const link of document.querySelectorAll('a[target="_blank"]')) {
      const rel = link.getAttribute('rel') || '';
      assert.ok(rel.includes('noopener') && rel.includes('noreferrer'), `falta rel en ${link.href}`);
    }
  });

  test('ningún recurso o enlace usa http:// (sin cifrar)', () => {
    for (const el of document.querySelectorAll('[href], [src], meta[content]')) {
      const value = el.getAttribute('href') || el.getAttribute('src') || el.getAttribute('content');
      assert.doesNotMatch(value, /^http:\/\//, `URL insegura: ${value}`);
    }
  });
});

describe('Archivos JS', () => {
  const jsFiles = fs.readdirSync(path.join(ROOT, 'js')).filter((f) => f.endsWith('.js'));
  const forbidden = /\b(innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval)\b|new Function\(/;

  for (const file of jsFiles) {
    test(`js/${file} no usa APIs peligrosas (innerHTML, eval...)`, () => {
      // Se ignoran los comentarios para que documentar la regla no cuente como uso
      const code = readProjectFile(`js/${file}`)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
      assert.doesNotMatch(code, forbidden);
    });
  }
});
