# Carlos Mario Hoyos Ríos — Portafolio

Mi portafolio como **Ingeniero de Datos | Data Engineer**.

👉 **https://ingcarlosmariohoyos.github.io**

Perfil, stack, proyectos, experiencia y certificaciones en una sola página, en español e inglés.

## Qué demuestra este proyecto

- **Sin frameworks ni dependencias:** HTML, CSS y JavaScript puro. La web no tiene paso de build ni carga nada de otros dominios.
- **Lighthouse 100** en Performance, Accessibility, Best Practices y SEO (móvil y escritorio).
- **Accesible:** HTML semántico, contraste AA, navegable con teclado y respeta `prefers-reduced-motion`.
- **Seguro:** Content Security Policy estricta (solo `'self'`), sin scripts inline ni `innerHTML`.
- **Bilingüe ES / EN** sin librerías, recordando el idioma elegido.
- **82 pruebas automatizadas** que validan el comportamiento, la seguridad y que el contenido no tenga errores.

## Decisiones técnicas

- **Mejora progresiva:** el contenido vive en el HTML y la página funciona sin JavaScript. El JS solo agrega comodidad (menú móvil, sección activa, idioma).
- **Lógica separada del DOM:** las funciones de decisión, como "¿qué sección está activa?", son puras y se prueban sin navegador.
- **Fuentes propias** (Inter y JetBrains Mono, licencia OFL): más rápido y sin depender de servicios externos.

## Desarrollo

Requiere Node.js. Las pruebas usan `node:test` y `jsdom`, solo en desarrollo.

```bash
npm install
npm test
```
