# BRUMA1800 — Migración a Next.js

Reimplementación en Next.js + React + TypeScript + Tailwind del sitio estático
en `../bruma1800-landing/dist/`, con el mismo diseño, tipografía y animaciones
— pixel por pixel salvo el fix de tamaño de móvil descrito abajo. El objetivo
de esta migración es tener una base de código escalable (componentes,
tipado, contenido centralizado) sobre la que construir el chatbot de n8n y
futuras features, cosa que el HTML/CSS/JS plano original no ofrecía.

`bruma1800-landing/CLAUDE.md` sigue siendo la fuente de verdad de marca,
precios y hechos verificados — este README es solo el mapa del código.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** estricto
- **Tailwind CSS v4** (config vía `@theme` en `globals.css`, sin `tailwind.config.js`)
- **GSAP 3 + `@gsap/react`** para toda la capa de animación (scroll reveals,
  composición flotante del hero, conteo de puntajes) — se conservó GSAP en
  vez de migrar a Framer Motion porque las animaciones ya estaban afinadas a
  mano con valores muy específicos; reescribirlas en otra librería era el
  riesgo de fidelidad más alto de toda la migración
- `next/font/local` para las 5 tipografías de marca (mismos WOFF2 ya
  optimizados del sitio original, incluida la Suranna ya reparada con
  tildes/ñ/rayas)
- `next/image` para todo el contenido fotográfico, con fallback automático a
  fondo cálido cuando la imagen todavía no existe (ver `MediaFrame`)

## Cómo correr

```bash
npm install
npm run dev       # http://localhost:3000
npm run build && npm run start   # build de producción
```

## Estructura

```
src/
├─ app/
│  ├─ layout.tsx        fuentes, metadata SEO, script beforeInteractive de .js-anim
│  ├─ page.tsx           ensambla las secciones
│  ├─ globals.css        tokens Tailwind + capa de animación portada del CSS original
│  └─ api/chat/route.ts  proxy hacia el webhook de n8n (ver sección Chatbot)
├─ components/
│  ├─ sections/          Hero, Origen, Portafolio, Calidad, Club, CtaFinal, Footer
│  ├─ decor/              Montana, Bruma, DecorOrigen — piezas puramente decorativas
│  ├─ portfolio/          ProductCard
│  ├─ chatbot/            ChatbotWidget
│  └─ ui/                 Wrap, Button, Typography (Eyebrow/H2Rust/Body), MediaFrame
├─ hooks/                 useReveal, useHeroAnimations, useCounts, useClubReveal
├─ lib/
│  ├─ content.ts          TODO el copy, precios y links — única fuente de verdad
│  └─ motion.ts            constantes y helpers compartidos de GSAP
└─ fonts/                  next/font/local + los 5 .woff2 de marca
```

### Por qué esta estructura

- **`lib/content.ts` centraliza todo el texto y los precios.** En el sitio
  original estaban repartidos en el HTML; acá cualquier cambio de precio,
  copy o link de WhatsApp se hace en un solo archivo tipado, sin tocar JSX.
- **Los hooks replican 1:1 las funciones de `main.js`** del sitio original
  (`initHeroIntro`, `initHeroProducts`, `initCiclo`, `initReveals`,
  `initCounts`, `initClub`, `initSafetyNet`) para que el comportamiento de
  scroll/reveal sea idéntico, pero como hooks de React reutilizables en vez
  de un IIFE que recorre el DOM a mano.
- **La capa de animación más "artesanal"** (composición flotante del hero,
  deriva de nubes, ornamentación en acuarela, línea de progreso del ciclo)
  se dejó en CSS plano dentro de `globals.css`, casi verbatim del original.
  Son piezas con matemática muy específica (custom properties por elemento
  alimentando keyframes) que no ganan nada al reexpresarse como utilidades
  atómicas — el resto de la página sí vive en Tailwind, componente por
  componente.

## Fix de responsive: mockups del hero en móvil

En el sitio original, el ancho de los 4 mockups flotantes del hero era un
porcentaje pequeño (30–56%) de un contenedor que en un teléfono angosto
(~360–390px) ya es chico de por sí — el frasco de Aguijón, por ejemplo,
terminaba en ~100px de ancho real. Se subieron los porcentajes base
(`hero-prod--*` en `globals.css`) entre 8 y 12 puntos porcentuales para
pantallas <980px; la composición de escritorio (≥980px) quedó intacta. Nada
de posiciones relativas ni el orden de apilamiento cambió, solo la escala.

## Chatbot (n8n) — listo para activar

`ChatbotWidget` (botón flotante + panel) ya habla con `POST /api/chat`, que
reenvía el mensaje a un webhook de n8n. Mientras `N8N_WEBHOOK_URL` no esté
configurada, el endpoint responde con un mensaje de respaldo en vez de
fallar — el widget funciona igual, solo que "sin cerebro" todavía.

Para activarlo:

1. En n8n, crear un workflow con un nodo **Webhook** (POST) que reciba:
   ```json
   { "message": "...", "sessionId": "...", "history": [...], "source": "bruma1800-web" }
   ```
   y devuelva:
   ```json
   { "reply": "..." }
   ```
2. Copiar `.env.example` a `.env.local` y pegar la URL del webhook en
   `N8N_WEBHOOK_URL`.

No hace falta tocar código en el front ni en `/api/chat` para prenderlo.

## Pendientes (heredados del sitio original, ver `bruma1800-landing/CLAUDE.md`)

- 5 fotos reales: colocarlas en `public/images/pending/` con el mismo nombre
  de archivo que ya referencia `lib/content.ts` (`finca-familia.jpg`,
  `producto-esencial.jpg`, `producto-origen70.jpg`, `producto-drip.jpg`,
  `club-tarjeta.jpg`) y aparecen solas, sin cambiar código.
- Testimonios reales — sección deliberadamente ausente, no rellenar con citas inventadas.
- Conectar `N8N_WEBHOOK_URL` cuando el workflow esté listo.
- Elegir hosting: este proyecto necesita un runtime Node (por `/api/chat` y
  por `next/image`) — Hostinger compartido, donde vive el sitio estático
  actual, no sirve para esto. Vercel es la ruta de menor fricción; cualquier
  otro host con soporte Node.js también funciona.
