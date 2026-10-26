// =========================================================
// main.js — interacción del portafolio
// Patrón: una función initX(root) por funcionalidad; boot() las arranca.
// Recibir "root" (el documento) como parámetro permite probarlas con jsdom.
// =========================================================

/**
 * Menú de navegación en móvil: abre y cierra la lista de secciones.
 * En escritorio el CSS oculta el botón, así que esto no afecta.
 * @param {Document} root documento donde buscar el menú
 */
function initMobileMenu(root = document) {
  const nav = root.querySelector('.site-nav');
  const toggle = root.querySelector('.site-nav__toggle');
  if (!nav || !toggle) return;

  // Cambia el estado del menú y lo comunica a lectores de pantalla (aria-expanded).
  // Los textos salen de data-label-open/close, que i18n.js traduce
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open
      ? toggle.dataset.labelClose || 'Cerrar'
      : toggle.dataset.labelOpen || 'Menú';
  };

  toggle.addEventListener('click', () => {
    setOpen(!nav.classList.contains('is-open'));
  });

  // Al cambiar de idioma, se vuelve a escribir el texto del botón en el idioma nuevo
  root.addEventListener('i18n:change', () => setOpen(nav.classList.contains('is-open')));

  // Al elegir una sección, se cierra el menú
  nav.querySelectorAll('ul a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  // La tecla Escape cierra el menú y devuelve el foco al botón
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}

/**
 * Lógica pura (sin DOM): decide qué sección está activa según su posición.
 * La activa es la última cuyo borde superior ya pasó la línea de referencia.
 * @param {{id: string, top: number}[]} positions secciones en orden, con su distancia al borde superior de la ventana
 * @param {number} threshold línea de referencia en px desde arriba de la ventana
 * @param {boolean} atBottom true si se llegó al final de la página
 * @returns {string|null} id de la sección activa, o null si aún estamos en el hero
 */
function pickActiveSection(positions, threshold, atBottom = false) {
  // Al final de la página la última sección (Contacto) es corta y quizá nunca cruce la línea
  if (atBottom && positions.length > 0) return positions[positions.length - 1].id;

  let active = null;
  for (const { id, top } of positions) {
    if (top <= threshold) active = id;
  }
  return active;
}

/**
 * Marca el enlace de la sección activa: clase is-active (estilo) y
 * aria-current="location" (para que el lector de pantalla diga "ubicación actual").
 * @param {HTMLAnchorElement[]} links enlaces del índice
 * @param {string|null} activeId id de la sección activa
 */
function markActiveLink(links, activeId) {
  for (const link of links) {
    const isActive = link.getAttribute('href') === `#${activeId}`;
    link.classList.toggle('is-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}

/**
 * Índice pipeline: enciende el nodo de la sección que se está leyendo.
 * @param {Document} root documento donde buscar el índice y las secciones
 * @returns {(() => void)|undefined} la función que recalcula (útil en las pruebas)
 */
function initActiveSection(root = document) {
  const view = root.defaultView;
  const links = [...root.querySelectorAll('.site-nav ul a[href^="#"]')];
  // Solo los enlaces cuya sección existe
  const targets = links
    .map((link) => root.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);
  if (!view || targets.length === 0) return undefined;

  const update = () => {
    const positions = targets.map((el) => ({ id: el.id, top: el.getBoundingClientRect().top }));
    const threshold = view.innerHeight * 0.35; // un tercio de la pantalla: la sección ya se está leyendo
    const atBottom =
      view.scrollY > 0 &&
      view.innerHeight + view.scrollY >= root.documentElement.scrollHeight - 2;
    markActiveLink(links, pickActiveSection(positions, threshold, atBottom));
  };

  // requestAnimationFrame agrupa los muchos eventos de scroll en un cálculo por cuadro
  let scheduled = false;
  const onScroll = () => {
    if (scheduled) return;
    scheduled = true;
    view.requestAnimationFrame(() => {
      scheduled = false;
      update();
    });
  };

  view.addEventListener('scroll', onScroll, { passive: true });
  view.addEventListener('resize', onScroll);
  update();
  return update;
}

/**
 * Footer: muestra el año actual. El HTML trae un año fijo por si JS no carga.
 * @param {Document} root documento donde buscar el año
 * @param {Date} now fecha actual (se puede cambiar en las pruebas)
 */
function initYear(root = document, now = new Date()) {
  const year = root.getElementById('year');
  if (!year) return;
  year.textContent = String(now.getFullYear());
}

/** Arranca todas las funcionalidades cuando el HTML está listo. */
function boot() {
  initMobileMenu(); // primero: así escucha el aviso de cambio de idioma
  initActiveSection();
  initYear();
  // i18n.js se carga antes que este archivo; si faltara, la web sigue en español
  if (typeof initI18n === 'function') initI18n();
}

// Solo en el navegador (en Node, durante las pruebas, "document" no existe)
if (typeof document !== 'undefined') {
  // Se ejecuta de inmediato, antes de pintar: activa los estilos que dependen de JS
  document.documentElement.classList.add('js');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}

// Exporta las funciones para las pruebas en Node (el navegador ignora esto)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initMobileMenu, pickActiveSection, markActiveLink, initActiveSection, initYear };
}
