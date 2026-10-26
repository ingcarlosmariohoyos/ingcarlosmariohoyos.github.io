// Utilidades compartidas por las pruebas
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');

/** Lee un archivo del proyecto como texto. */
function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

/**
 * Carga index.html en un navegador simulado (jsdom).
 * Los <script> NO se ejecutan: cada prueba arranca la funcionalidad que necesita.
 */
function loadIndex() {
  const dom = new JSDOM(readProjectFile('index.html'));
  return { dom, document: dom.window.document, window: dom.window };
}

module.exports = { ROOT, readProjectFile, loadIndex };
