# Portafolio de Carlos Mario Hoyos Ríos

Sitio web personal como **Ingeniero de Datos | Data Engineer**, publicado en GitHub Pages:

👉 https://ingcarlosmariohoyos.github.io

## Qué contiene

Una sola página con mi perfil, stack, proyectos, experiencia, educación, certificaciones y contacto. Bilingüe (español / inglés).

## Stack

- HTML5, CSS3 y JavaScript vanilla
- Sin frameworks, sin dependencias y sin paso de build
- Fuentes Inter y JetBrains Mono alojadas en el propio sitio (licencia OFL): no se carga nada de otros dominios
- Content Security Policy estricta, accesible (WCAG AA) y Lighthouse 100 en las cuatro categorías
- Publicado gratis con GitHub Pages

## Estructura

```
/
├── index.html        # Página principal
├── 404.html          # Página de error
├── css/styles.css    # Estilos
├── js/main.js        # Interacción
├── js/i18n.js        # Traducciones ES / EN
├── assets/           # Imágenes, CV, fuentes y favicon
└── tests/            # Pruebas (solo desarrollo)
```

## Cómo correrlo localmente

Opción 1: abrir `index.html` directamente en el navegador.

Opción 2 (recomendada, se parece más a GitHub Pages): levantar un servidor local desde la carpeta del proyecto con Node:

```bash
npx http-server -p 8000 -c-1
```

Y abrir http://localhost:8000

## Pruebas

Las pruebas usan `node:test` (incluido en Node) y `jsdom` para simular el navegador. Son solo para desarrollo: la web no las carga.

```bash
npm install   # solo la primera vez
npm test
```

- `tests/main.test.js`: comportamiento del JS (menú móvil, sección activa del índice, año del footer).
- `tests/i18n.test.js`: cambio de idioma, traducciones completas y uso seguro de `localStorage`.
- `tests/html.test.js`: estructura, accesibilidad básica, reglas de contenido y página 404.
- `tests/security.test.js`: Content Security Policy, enlaces seguros y uso de APIs peligrosas.

## Contacto

- LinkedIn: https://www.linkedin.com/in/carlosmario-hoyosrios
- GitHub: https://github.com/ingcarlosmariohoyos
- Correo: carloshoyosrios@gmail.com
