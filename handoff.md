a# BRUMA1800 — Migración a Next.js — Handoff de sesión

Estado del trabajo para retomarlo después de un `/clear`. Complementa a `README.md`
(stack, estructura de carpetas, cómo correr, cómo activar el chatbot) — este
documento es la bitácora de **qué se hizo y por qué**, no el mapa del código.

**Última actualización:** sesión del 31 de julio de 2026.

---

## 1. Arranque rápido

```powershell
cd "Desktop\Proyectos con Claude Code\Migracion-bruma1800"
npm install
npm run build && npm run start -- -p 3300   # o npm run dev para desarrollo
```

Abrir <http://localhost:3300/>. A diferencia del sitio estático original, este
sí sirve bien sobre HMR/dev server — no hace falta levantar Python.

---

## 2. Qué se hizo en esta sesión

Partiendo de `../bruma1800-landing/dist/` (el sitio estático terminado, ver su
propio `handoff.md`), se migró todo a una base de código en React con el
objetivo de que fuera **visualmente idéntica** salvo un fix de responsive
pedido explícitamente, y quedara lista para dos cosas que el HTML/CSS/JS plano
no permitía bien: un chatbot conectado a n8n y crecimiento futuro del sitio.

### 2.1 Scaffold y stack

- `create-next-app` con Next.js 16 (App Router), React 19, TypeScript estricto,
  Tailwind CSS v4 — todas las versiones las resolvió el propio scaffold (latest
  al momento de la sesión), no se fijaron a mano.
- `gsap` + `@gsap/react` instalados aparte: se decidió **no** migrar la
  animación a Framer Motion. Las animaciones del sitio original estaban
  afinadas a mano con valores muy específicos (recorridos de flotación,
  velocidad de deriva de nubes, aleteo de abeja) — reescribirlas en otra
  librería era el mayor riesgo de fidelidad de toda la migración.
- Las 5 fuentes de marca se copiaron desde `../bruma1800-landing/dist/fonts/`
  (los WOFF2 ya optimizados, con Suranna ya reparada) a `src/fonts/` y se
  cargan con `next/font/local`.
- Assets (`montana.webp`, nubes, productos, decor, logos) copiados a
  `public/images/`, organizados por carpeta en vez del `assets/img/` plano
  del original.

### 2.2 Arquitectura de componentes

- `lib/content.ts` centraliza **todo** el copy, precios y links de WhatsApp —
  antes repartidos en el HTML. Nada de este contenido se inventó: todo sale
  verbatim del handoff original / `CLAUDE.md`.
- Hooks en `hooks/` que replican 1:1 las funciones de `main.js` del sitio
  original (`initHeroIntro`, `initHeroProducts`, `initCiclo`, `initReveals`,
  `initCounts`, `initClub`, `initSafetyNet`), pero como hooks de React
  (`useReveal`, `useHeroAnimations`, `useCounts`, `useClubReveal`) en vez de
  un IIFE recorriendo el DOM a mano.
- La composición flotante del hero, la deriva de nubes, la ornamentación de
  Origen y la línea de progreso del ciclo se dejaron como CSS plano en
  `globals.css`, portado casi verbatim del original — son piezas con
  matemática muy específica por elemento (custom properties alimentando
  keyframes) que no ganan nada al volverse utilidades atómicas.
- El resto de la página (tipografía, botones, cards, grillas) sí es Tailwind
  puro, componente por componente, con primitivas reutilizables en
  `components/ui/` (`Wrap`, `Button`, `Eyebrow`/`H2Rust`/`Body`, `MediaFrame`).

### 2.3 Fix de responsive pedido por el cliente

En el sitio original, en pantallas angostas (~360–390px) los 4 mockups
flotantes del hero se veían chicos — el frasco de Aguijón terminaba en
~100px reales. Se subieron los porcentajes base de `.hero-prod--*` (ver
`globals.css`) entre 8 y 12 puntos porcentuales para <980px, sin tocar la
composición de escritorio (≥980px) ni el orden de apilamiento.

### 2.4 Chatbot (n8n) — scaffold listo para activar

- `components/chatbot/ChatbotWidget.tsx`: botón flotante + panel de chat,
  con historial en memoria y `sessionId` persistido en `localStorage`.
- `app/api/chat/route.ts`: proxy server-side hacia `N8N_WEBHOOK_URL`. Sin esa
  variable de entorno, responde con un mensaje de respaldo en vez de fallar —
  se probó por curl y funciona en ambos estados.
- `.env.example` documenta el contrato exacto (`{message, sessionId, history,
  source}` → `{reply}}`) para cuando se construya el workflow en n8n.

### 2.5 Sincronización con el sitio original: origen vuelve a piedra cálida

La migración se hizo mientras el sitio estático tenía la sección de origen en
**azul bruma**. Ese fondo se probó para replicar un comparativo y el cliente lo
**revirtió** poco después: vuelve a `--piedra-calida`, el del diseño original.
Aquí se aplicó lo mismo, para que las dos versiones no diverjan:

- `Origen.tsx`: `bg-niebla` → `bg-piedra-calida`.
- `Origen.tsx`: fuera `variant="onNiebla"` del `Eyebrow` y de los `Body`. Ese
  override existía solo para compensar el azul; sobre piedra cálida `--tierra`
  da **5.02:1** por sí solo y el H2 en café profundo **10.75:1**.
- La variante `onNiebla` **se queda** en `Typography.tsx`: el hero la sigue
  usando. Solo se corrigió su comentario, que decía que servía a las dos.

Lo demás de la sección **no se toca**: la ornamentación de rama y abeja, sus
animaciones y el `pt-[160px]` de móvil son independientes del color de fondo.
Ese padding, en concreto, no es decorativo: sin él las hojas quedan detrás del
eyebrow y el contraste cae (medido en el original: 2.55:1 a 390px y 1.21:1 a
768px). Las hojas son verde oscuro, así que eso pasa con cualquier fondo.

### 2.6 Los cinco huecos de foto

La página tenía **cinco rectángulos planos de `--gris-calido`** donde faltaban
fotos: tres en el portafolio, uno en Origen y uno en Club. Ocupaban cerca de un
tercio del alto y se leían como imagen rota, no como contenido por llegar. La
regla de marca prohíbe fotografía de stock, así que rellenarlos no era opción.

Se resolvió por dos caminos distintos, según lo que había disponible:

**Las tres del portafolio ya tenían sustituto legítimo.** Las tarjetas son de
Esencial, Origen 70 y Drip Coffee, y los renders transparentes de esos tres
productos ya estaban en el proyecto — solo se usaban en el hero. Ahora
`content.ts` apunta a `/images/products/*.webp` y `MediaFrame` los pinta con
`fit="contain"` sobre un panel de piedra cálida, con la misma sombra propia que
las piezas del hero. No es stock: es el producto real de la marca.

**Las otras dos no lo tenían**, así que se diseñó el hueco en vez de taparlo.
`MediaFrame` compone un panel con la marca de montaña al 10% de opacidad, que se
lee como «foto por venir». Respeta la regla de contraste del brandbook — variante
oscura sobre fondo claro en Origen, clara sobre oscuro en Club — y la prop
`vacio="club"` mantiene esa sección dentro de su paleta propia, que no se mezcla
con la principal.

El fallback por `onError` se conserva: en cuanto los archivos reales aparezcan en
`public/images/pending/`, la foto tapa el panel sin tocar una línea de código.

Medido en 390/768/1280/1440/1920: **10/10** imágenes de producto cargadas, 2
paneles de hueco, **0 imágenes rotas visibles** (antes 5) y sin desborde.

### 2.7 La tarjeta del Club, recortada de su render

El cliente aportó un render de la tarjeta de fidelización y, aparte, un `.obj`
con su modelo 3D. **El modelo no hizo falta**: se comprobó que llega sin
texturas (`map=no` en los tres materiales), es decir, una tarjeta en blanco. El
render, en cambio, ya trae el arte. Los dos quedan en `assets-fuente/` por si
algún día se quiere otro ángulo — el modelo sí tiene las UV desplegadas de 0 a 1,
así que aceptaría una textura sin tocar geometría.

Recortar el render tuvo su trabajo, y por eso hay un script con las medidas
dentro: `tools/recortar-tarjeta.py`. Dos problemas encadenados:

- **El interior de la tarjeta es casi blanco**, igual que el fondo. Borrar por
  color se la lleva entera. Se rellena por inundación desde las esquinas, que
  solo alcanza el blanco conectado con el exterior.
- **El reflejo del suelo va soldado al canto inferior.** Comparten borde y
  ningún umbral los separa; subir la tolerancia empezaba a comerse el filo antes
  de limpiar el reflejo. Hace falta cortar por geometría, con un polígono.

Las coordenadas del polígono están **medidas, no estimadas**: el filo derecho
baja de (1418,270) a (1309,740) y el inferior sube de (200,722) a (800,811); el
cruce de ambas rectas da el vértice inferior derecho en (1273,879) — unos 40 px
más abajo de lo que parecía a ojo, que era justo por donde se colaba el reflejo.

En `Club.tsx` la tarjeta va suelta sobre el fondo, sin marco ni borde: es un
objeto, no una fotografía enmarcada. **Sin animación de flotación a propósito** —
el Club tiene lenguaje propio (fade largo, sin desplazamiento) y `AGENTS.md`
prohíbe darle el tratamiento del resto de la página. La separa del negro una
sombra, no el movimiento.

Al dejar de usarse el hueco del Club, la variante `vacio="club"` de `MediaFrame`
quedó sin uso y se eliminó en el mismo commit.

---

## 3. Bugs encontrados y corregidos en esta sesión

Dos rondas de QA después del primer build: una comparando colores contra el
original, otra comparando fuentes. Ambas encontraron bugs reales, no
cosméticos. Quedan documentados aquí porque el patrón puede repetirse si se
sigue portando CSS a mano.

### 3.1 Colores del hero — overrides de contraste no migrados

El CSS original resolvía varios colores por **cascada de ancestro**: una
regla base (p. ej. `.hero__script{color:var(--arena)}`) quedaba pisada más
abajo en el archivo por un override específico de sección
(`.hero .hero__script{color:var(--tierra)}`, con mejor contraste sobre el
fondo azul bruma). Al migrar a componentes, se copió la regla **base** en
varios sitios y se perdió el override, porque ya no hay una cascada de
ancestro — cada componente resuelve su propio color por props.

Afectó:
- `Hero.tsx` — el script "de la finca a su taza" (quedó en `--arena`, un
  beige claro, en vez de `--tierra`)
- `Hero.tsx` — el número de cada paso del ciclo (`01`/`02`/`03`, mismo bug)

**Fix:** colores baked directamente en el componente (`text-tierra`,
`text-cafe-profundo`) en vez de depender de una cascada que ya no existe.
Verificado por captura de pantalla antes/después.

### 3.2 Bug raíz: `--font-texto` no era una variable CSS real

Más serio que el de color. Una auditoría con `getComputedStyle()` en el
navegador (no solo relectura del código) encontró que **todo el texto de
cuerpo** de la página — párrafos de Origen, descripciones de tarjetas,
precios, texto de Club, etc., ~20 elementos — caía al font stack del sistema
operativo en vez de Aileron. Los títulos y eyebrows se veían bien porque usan
las utilidades `font-editorial`/`font-titulo` de Tailwind directamente.

**Causa:** en Tailwind v4, `@theme inline` (usado para los 5 tokens de fuente
porque dependen de las custom properties que `next/font` inyecta en
runtime) **no crea una variable CSS global real** — solo la inlinea dentro de
las utilidades que Tailwind genera a partir de ella. Dos reglas escritas a
mano en `globals.css` (`body{font-family:var(--font-texto)}` y
`.btn{font-family:var(--font-texto)}`) asumían que `--font-texto` existía
como variable global, y no existía: el navegador la resolvía a nada y caía al
valor inicial.

**Fix:** ambas reglas apuntan ahora a `--nf-texto` — la variable real que
`next/font` inyecta en `<body>` (ver `src/fonts/index.ts`). Cualquier CSS
escrito a mano que necesite una de las 5 fuentes de marca debe usar el prefijo
`--nf-*`, nunca `--font-*` (ese namespace es solo para utilidades de
Tailwind). Verificado auditando la fuente calculada de un elemento
representativo en las 8 secciones — las 40 combinaciones coinciden ahora con
el original.

### 3.3 Cursor del widget del chat

El botón flotante y los botones internos del chat no mostraban
`cursor:pointer` — Tailwind v4 no incluye ese reset por defecto en `<button>`
(a diferencia de versiones viejas). Se agregó `cursor-pointer` explícito a
los 3 botones del widget (abrir/cerrar, cerrar panel, enviar).

---

## 4. Auditoría de Web Interface Guidelines (Vercel)

A pedido del cliente, se corrió una revisión contra las
[Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines)
de Vercel. Primero solo diagnóstico (sin tocar código), después se
implementaron las 6 correcciones que encontró:

| # | Hallazgo | Archivo | Fix |
|---|---|---|---|
| 1 | Sin landmark `<main>` ni skip link | `layout.tsx`, `page.tsx` | `<main id="main-content">` envolviendo Hero→CTA final + skip link ("Saltar al contenido") al inicio del `<body>`, visible solo con foco de teclado |
| 2 | Input del chat sin label/autocomplete | `ChatbotWidget.tsx` | `<label>` (sr-only) + `id`/`name`/`autocomplete="off"` |
| 3 | Respuestas del bot sin `aria-live` | `ChatbotWidget.tsx` | `role="log"` + `aria-live="polite"` en el contenedor de mensajes |
| 4 | Scroll del panel se propagaba a la página | `ChatbotWidget.tsx` | `overscroll-behavior: contain` |
| 5 | Panel fijo sin `safe-area-inset` | `ChatbotWidget.tsx` | `bottom`/`right` con `max(1.25rem, env(safe-area-inset-*))` — no queda tapado por el home indicator en iPhone |
| 6 | Panel no cerraba con teclado | `ChatbotWidget.tsx` | listener de `Escape` |
| 7 | Contador animado (87.5/83.0) sin `tabular-nums` | `Calidad.tsx` | `tabular-nums` — los dígitos ya no cambian de ancho mientras cuentan |
| 8 | Deriva de nubes sin `prefers-reduced-motion` | `globals.css` | `.bruma__capa` ahora entra en el bloque de reduced-motion (recorte de amplitud + ciclo 2-3× más lento, mismo criterio que el resto: nunca apagar del todo) |
| 9 | Pares número+unidad con riesgo de wrap feo | `lib/content.ts` | `&nbsp;` entre número y unidad en los 19 pares cortos (`"250 g"`, `"$22.000 COP"`, `"1.800 m.s.n.m."`) — fix técnico de wrapping, no se tocó ninguna palabra del copy |

Todo verificado por navegador (Playwright), no solo relectura de código:
`main` existe, el input tiene label, `aria-live="polite"` presente,
`overscroll-behavior: contain` aplicado, Escape cierra el panel,
`tabular-nums` activo.

**No se tocaron** las reglas de copy de las guidelines (Title Case, voz
activa, etc.) — el contenido de marca está congelado por `CLAUDE.md` del
proyecto original y no es terreno de esta migración.

---

## 5. Cómo verificar

No hay scripts de medición dedicados como en el sitio original (`tools/*.mjs`
con CDP) — para esta sesión se usó Playwright ad hoc contra el build de
producción:

```powershell
npm run build
npm run start -- -p 3300
```

Luego, con un script Node cualquiera que importe
`node_modules/@playwright/mcp/node_modules/playwright` (o instalar
`playwright` como dependencia si se va a repetir seguido), se puede:

- Recorrer la página con scroll incremental antes de capturar full-page
  (los reveals son `ScrollTrigger` con `once:true`, si no se dispara scroll
  primero la captura sale con secciones en blanco).
- Auditar `getComputedStyle(el).fontFamily` / `.cursor` / `.overscrollBehaviorY`
  por elemento — más confiable que releer el JSX, como demostró el bug de
  §3.2.

---

## 6. Pendientes

Ver `README.md` §"Pendientes" para la lista completa (fotos reales,
testimonios, conectar `N8N_WEBHOOK_URL`, elegir hosting con runtime Node).
Nada de esta sesión quedó a medias — build, lint y la auditoría WIG están
limpios al cierre.
