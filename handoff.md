# BRUMA1800 — Migración a Next.js — Handoff de sesión

Estado del trabajo para retomarlo después de un `/clear`. Complementa a `README.md`
(stack, estructura de carpetas, cómo correr, cómo activar el chatbot) — este
documento es la bitácora de **qué se hizo y por qué**, no el mapa del código.

**Última actualización:** 3 de agosto de 2026. Recoge dos sesiones: la migración
inicial (31 de julio) y la de diseño del 3 de agosto, en la que este proyecto
pasó a ser **el activo** — ver §2.5.

---

## 1. Arranque rápido

```powershell
cd "C:\Users\juane\Desktop\PROYECTOS\BRUMA 1800\landing-bruma1800"
npm ci
npm run build
npm run start          # http://localhost:3000
```

`npm run dev` sirve para trabajar, pero **verificar siempre contra el build de
producción**: el optimizador de imágenes y el CSS de Tailwind se comportan
distinto en dev, y varios de los bugs de §2.6 y §2.7 solo se ven en `start`.

En el equipo del cliente las dependencias ya están instaladas. Ocupan 419 MB de
los 430 del proyecto, así que si hace falta espacio se puede borrar
`node_modules` sin miedo y restaurarlo con `npm ci`.

> **Si cambia un archivo de `public/` y no ve el cambio, borre `.next`.** Next
> cachea en `.next/cache/images` todo lo que optimiza, con 4 horas de vida, y la
> URL no cambia al cambiar el archivo. Costó un rato de sospechar del archivo
> equivocado; el detalle está en §2.7.

---

## 2. Qué se hizo

Los apartados 2.1 a 2.4 son de la migración inicial; del 2.5 en adelante, de la
sesión de diseño del 3 de agosto.

Partiendo del sitio estático terminado, se migró todo a una base de código en
React con el objetivo de que fuera **visualmente idéntica** salvo un fix de
responsive pedido explícitamente, y quedara lista para dos cosas que el
HTML/CSS/JS plano no permitía bien: un chatbot conectado a n8n y crecimiento
futuro del sitio.

> **Ojo con las rutas de este documento y del `README.md`.** Varias apuntan a
> `../bruma1800-landing/`, dando por hecho que el sitio estático está al lado con
> ese nombre. En el equipo del cliente esa carpeta se llama **`CLAUDE CODE`** y
> cuelga de `BRUMA 1800/`, así que esas rutas relativas no resuelven. Los datos
> de marca están copiados enteros en `AGENTS.md` justo para no depender de ellas.

### 2.1 Scaffold y stack

- `create-next-app` con Next.js 16 (App Router), React 19, TypeScript estricto,
  Tailwind CSS v4 — todas las versiones las resolvió el propio scaffold (latest
  al momento de la sesión), no se fijaron a mano.
- `gsap` + `@gsap/react` instalados aparte: se decidió **no** migrar la
  animación a Framer Motion. Las animaciones del sitio original estaban
  afinadas a mano con valores muy específicos (recorridos de flotación,
  velocidad de deriva de nubes, aleteo de abeja) — reescribirlas en otra
  librería era el mayor riesgo de fidelidad de toda la migración.
- Las 5 fuentes de marca se copiaron del `dist/fonts/` del sitio estático
  (los WOFF2 ya optimizados, con Suranna ya reparada) a `src/fonts/` y se
  cargan con `next/font/local`. En el equipo del cliente ese sitio está en
  `../CLAUDE CODE/`, no en `../bruma1800-landing/`.
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
lee como «foto por venir», con la variante oscura del logo sobre fondo claro que
exige el brandbook. La del Club dejó de hacer falta poco después, al aportar el
cliente la tarjeta real (§2.7).

El fallback por `onError` se conserva: en cuanto el archivo real aparezca en
`public/images/pending/`, la foto tapa el panel sin tocar una línea de código.

Medido en 390/768/1280/1440/1920: **10/10** imágenes de producto cargadas,
**0 imágenes rotas visibles** (antes 5) y sin desborde. Queda un solo hueco, el
de `finca-familia.jpg`.

### 2.7 La tarjeta del Club: flotación y brillo metalizado

El cliente aportó primero un render sobre fondo blanco y un `.obj` con el modelo
3D; después, un PNG ya con alfa. **Solo hace falta el último.**

**El `.obj` nunca sirvió para esto:** llega sin texturas (`map=no` en los tres
materiales), o sea una tarjeta en blanco. Se conserva en `assets-fuente/` porque
tiene las UV desplegadas de 0 a 1 y aceptaría una textura sin tocar geometría,
por si algún día se quiere otro ángulo o una animación 3D.

**El recorte manual del primer render se retiró.** Costó lo suyo —el interior de
la tarjeta es casi blanco como el fondo, y el reflejo del suelo iba soldado al
canto inferior, así que hubo que combinar inundación desde las esquinas con un
polígono de coordenadas medidas— y quedó obsoleto en cuanto llegó el archivo con
alfa. Su script se borró: mantener código que ya nadie ejecuta es peor que no
tenerlo. `tools/optimizar-tarjeta.py` hace ahora lo único que hace falta,
recortar a la caja de alfa, con el mismo criterio que los mockups de producto.
Si alguna vez vuelve a llegar un render sobre fondo blanco, el episodio está en
el historial de git.

**Flotación y brillo.** Petición explícita del cliente, y una excepción al
lenguaje quieto del Club que queda anotada en `AGENTS.md`. La excepción es el
objeto, no la sección: el texto y el botón siguen entrando con su fade largo.

- **Ciclo de 9 s**, más lento que cualquier pieza del hero (6,5–8,5 s), y con
  menos recorrido: 16,7 px medidos. Un objeto de este peso visual moviéndose al
  ritmo de una bolsa de café se lee nervioso.
- **Doble sombra**: una corta y densa que lo despega del negro, otra larga y
  difusa que hace de contacto. Con una sola, o flota sin peso o se pega al fondo.
- **El barrido de luz va enmascarado con la propia tarjeta** (`mask-image` con el
  mismo WebP). Sin la máscara la banda sería un rectángulo y se saldría por las
  esquinas redondeadas y el canto biselado.
- La banda ocupa el **12% del degradado**, que a `background-size: 280%` son unos
  34% del ancho. El primer intento la puso al 30% (84% del ancho) y no se leía
  como destello: subía el brillo de toda la superficie a la vez y lavaba la
  impresión. Un reflejo especular es estrecho.
- **Ciclo de 4,5 s** y, en punteros finos, **un barrido al pasar el cursor**.
  Funciona porque cambiar el `animation-name` reinicia la animación desde cero,
  así que responde a cada pasada del ratón por rápida que sea. En táctil no hay
  hover y el bucle de fondo cumple solo.
- Los dos van **exactamente a la misma velocidad**, no parecida:
  `tarjeta-brillo-cursor` es copia literal de `tarjeta-brillo` —mismas paradas,
  misma curva— y ambos leen la duración de `--ciclo`. La variable es lo que ata
  las dos cosas: cambiarla mueve las dos a la vez, y por eso `reduce` ajusta
  `--ciclo` en vez de `animation-duration`. La copia hace falta porque sin
  cambiar el nombre la animación no se reinicia; `animation-iteration-count: 1`
  sobre el original no vale. Medido: cruzan en **1062 ms y 1067 ms**, 0,5% de
  diferencia, que es el error de muestrear a 16 ms.
- Con `reduce`, la flotación baja a 8 px en 14 s y el brillo a 0,45 de opacidad
  en 12 s. El destello es lo más parecido a un parpadeo que hay en la página, así
  que ahí `reduce` sí tiene razón — pero no se apaga, se atenúa.

**Dos trampas que costaron tiempo aquí:**

**La imagen vieja se quedó servida.** Al sustituir el archivo por el que trajo
alfa, la página seguía mostrando el recorte anterior. No era el recorte: Next
guarda en `.next/cache/images` las imágenes que optimiza, con **4 h de vida**, y
la URL no cambia al cambiar el archivo. Si se reemplaza un asset de `public/` y
no se ve el cambio, **borrar `.next` antes de sospechar del archivo**.

**`loading="lazy"` no llegaba a disparar en esta imagen.** Entera dentro del
viewport, con scroll de rueda real y diez segundos de espera, seguía en
`complete:false` y sin una sola petición de red — mientras las demás imágenes
perezosas de la página cargaban bien. Se descartaron por medición el contenedor
animado, el `will-change`, el `filter: drop-shadow` y el `srcset`: copias
inyectadas con cada uno de esos rasgos sí cargaban. **La causa exacta quedó sin
aislar**, así que la imagen va con `loading="eager"`. Cuesta 85 KB por
adelantado; el precio de equivocarse al otro lado es que la sección se quede sin
su único objeto.

Al dejar de usarse el hueco del Club, la variante `vacio="club"` de `MediaFrame`
quedó sin uso y se eliminó.

---

## 3. Bugs encontrados y corregidos en la migración

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

`npm run build` y `npx eslint src --max-warnings=0` son el mínimo, pero **no
bastan**: casi todos los bugs de estas dos sesiones compilaban perfectamente.
Lo que los encontró fue medir en un navegador de verdad.

### Herramientas de la casa

En `tools/` hay scripts Python para preparar imágenes, con el mismo criterio de
recorte-a-alfa que el sitio original:

```powershell
python tools/optimizar-tarjeta.py assets-fuente/tarjeta-club-1800.png public/images/club/tarjeta-1800.webp
```

`assets-fuente/` guarda los originales que entrega el cliente. Queda **fuera de
`public/`** a propósito: son material de trabajo, no se sirven.

### Medir en el navegador

Chrome con CDP abierto, igual que en el proyecto original:

```powershell
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  -ArgumentList '--headless','--disable-gpu','--hide-scrollbars', `
                '--remote-debugging-port=9222',"--user-data-dir=$env:TEMP\cdp",'about:blank'
```

Cuatro cosas aprendidas a base de tropezar, que valen para cualquier medición
futura de este proyecto:

- **Mandar `Network.setCacheDisabled`.** Sin eso el perfil persistente sirve
  CSS viejo y una medición sale idéntica tras un cambio real.
- **Recorrer la página con scroll antes de capturar.** Los reveals son
  `ScrollTrigger` con `once:true`; sin scroll previo las secciones salen en
  blanco.
- **Auditar `getComputedStyle` por elemento, no releer el JSX.** Así apareció el
  bug de §3.2, donde ~20 elementos caían al font stack del sistema y el código
  parecía correcto.
- **No fiarse de las duraciones declaradas: cronometrar el movimiento.** Para
  comparar el destello automático con el del cursor (§2.7) hubo que medir cuánto
  tarda en cruzar, no leer `animation-duration`. Y esperar a que el bucle esté en
  reposo antes de meter el cursor: si entra a media pasada, la posición salta
  atrás al reiniciar y la ventana de medida abarca dos tramos, dando ~1630 ms que
  no son reales frente a los 1062 correctos.

### Cifras de referencia al cierre

- **10/10** imágenes de producto cargadas en 390, 768, 1280, 1440 y 1920 px.
- **0** imágenes rotas visibles y **0** desborde horizontal en esos cinco anchos.
- **1** panel de hueco, el de `finca-familia.jpg`.
- 7/7 enlaces de WhatsApp a `573152103231`, con `?text=` diferenciado por sección.
- Puntajes SCA `87.5|83.0`.
- Destello: cruza en **1062 ms** solo y **1067 ms** con el cursor encima.

---

## 6. Pendientes

Nada quedó a medias: build, ESLint y la auditoría WIG están limpios al cierre.
Lo que falta depende de material o de decisiones del cliente:

- [ ] **Una foto real**, `finca-familia.jpg`, en `public/images/pending/`. Las
      tres del portafolio ya no bloquean — usan los renders del propio producto
      (§2.6) — y la del Club se resolvió con la tarjeta (§2.7). Ese único hueco
      muestra hoy un panel de marca, no un rectángulo vacío.
- [ ] **Testimonios reales.** La sección sigue sin existir a propósito; no
      rellenar con texto inventado.
- [ ] **Conectar `N8N_WEBHOOK_URL`.** El chatbot tiene el scaffold listo y
      responde con un mensaje de respaldo mientras no exista la variable.
- [ ] **Elegir hosting con runtime Node** y desplegar. Hostinger compartido, que
      era el destino del sitio estático, no sirve: `/api/chat` necesita servidor.

Confirmado y cerrado el 3 de agosto: `@bruma1800_cafe` es la cuenta oficial de
Instagram, y el fondo de la sección de origen vuelve a piedra cálida.
