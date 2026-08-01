<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# BRUMA1800 — Contexto del proyecto

Este es el proyecto de **migración a Next.js** del sitio estático original
(`../bruma1800-landing/`). Para el mapa del código (stack, estructura de
carpetas, cómo correr, chatbot) ver `README.md`. Para la bitácora de qué se
hizo y por qué en la migración (bugs encontrados, decisiones de arquitectura,
fix de responsive) ver `handoff.md`. Este archivo es solo marca y datos —
la fuente de verdad original vive en `../bruma1800-landing/CLAUDE.md` y en
`../bruma1800-landing/brand-reference/brandbook.html`; lo de abajo es una
copia para que este proyecto no dependa de tener esa carpeta al lado.

## Qué es esto

Landing page de venta directa para BRUMA1800 — café y miel picante de finca
familiar en Pijao, Quindío, Colombia. El objetivo de esta migración es una
base de código escalable (componentes, tipado, contenido centralizado en
`src/lib/content.ts`) que reemplace el HTML/CSS/JS plano, manteniéndose
**visualmente idéntica** al original salvo el fix de responsive documentado
en `handoff.md` §2.3.

## Identidad de marca

**Paleta (usar exactamente estos hex, ninguno más):**

| Color | Hex | Rol |
|---|---|---|
| Café profundo | `#3B2418` | Ancla oscura |
| Piedra cálida | `#E8DDC7` | Ancla clara |
| Naranja cafetero | `#E85A2B` | Acento único — nunca más de un uso por pieza |
| Verde montaña | `#4A6741` | Apoyo, uso ocasional |
| Azul bruma | `#B7C9D3` | Atmósfera, nunca como CTA. Es el fondo del hero y de la sección de origen |

El hero **no es ancla oscura**: es azul bruma, con montaña acuarela y tres
capas de nubes reales, texto en variantes oscuras y logo oscuro. La sección
de origen sigue el mismo tratamiento, con ornamentación de rama de cafeto y
una abeja en acuarela. `.calidad` y `.cta` siguen en café profundo.

> **Sobre azul bruma, `--tierra` no vale para cuerpo de texto.** Da 3.95:1,
> por debajo del mínimo AA de 4.5:1. Usar `--cafe-profundo`, que da 8.48:1.
> Ya causó un bug real en esta migración (`handoff.md` §3.1) — si alguna
> sección más cambia a este fondo, es lo primero que hay que revisar.

**Sub-marca Club 1800** (si el proyecto llega a tocarla): paleta propia
negro/plateado/glow — nunca se mezcla con la paleta principal ni recibe el
mismo tratamiento de animación.

**Tipografía y roles:** Britanny Signature (portada/hero únicamente), Intro
Rust Line (titulares secundarios), Suranna itálica (taglines/eyebrows/citas
**y el H1 del hero**), Aileron (cuerpo de texto), Darrell Rolando (acentos
puntuales, nunca párrafos). Las 5 viven como WOFF2 en `src/fonts/` y se
cargan con `next/font/local` — Suranna ya trae los glifos de español
reparados (tildes, ñ, rayas), no reparar de nuevo. Cualquier CSS escrito a
mano que necesite una de estas fuentes debe usar el prefijo `--nf-*` (la
variable real que `next/font` inyecta), nunca `--font-*` — ver `handoff.md`
§3.2 sobre el bug que causó confundir ambos.

**Logo:** 4 variantes (claro/oscuro × logotipo completo/ícono montaña) en
`public/images/`. Regla de contraste: oscuro sobre fondo claro, claro sobre
fondo oscuro. Nunca al revés.

## Voz de marca

Dos modos, nunca mezclados en un mismo texto:
- **Modo montaña activa** — eventos, deporte, patrocinios. Energético, jerga colombiana natural.
- **Modo origen** — finca, producto, tradición. Pausado, casi poético, sin jerga.

Evitar: anglicismos innecesarios, superlativos vacíos, tono corporativo genérico.

## Hechos verificados (no inventar variaciones)

- Fundada julio 2025. Fincas **La Cubana** y **El Retiro**, Pijao, Quindío,
  1.800 m.s.n.m., variedad Castillo. Familia **Osorio y Restrepo**.
- Origen 70 validado por catadores SCA: **87.5 pts** (Cafeína Coffee Shop,
  Julián Castañeda) y **83.0 pts** (Lusitania Coffee Co., Alejandro Macías).
- Líneas: Esencial, Origen 70, Drip Coffee (café); Aguijón — miel picante
  Zángano/Obrera/Reina, 130g, **$15.000 COP por frasco** (mismo precio en
  las 3 intensidades).
- Programa de distribución: **Melipona** — pedido mínimo $200.000 COP,
  precio fijo sin excepciones, disponibilidad sujeta a cosecha.
- WhatsApp real: **573152103231** — ya está puesto en los CTAs, no tocar.
- Canal dominante: 4 de 5 clientes reales llegan por voz a voz / WhatsApp /
  Instagram DM — no por checkout online. No hay e-commerce y no se ha
  decidido construir uno.

## Reglas críticas para este proyecto

1. **Fiel al sitio original** salvo la migración de stack y el fix de
   responsive ya aplicado. No mejorar copy, no cambiar jerarquía ni spacing
   sin preguntar.
2. **No usar fotos de stock** (ni Openverse ni ningún banco) para llenar los
   espacios vacíos de imágenes pendientes — regla de marca: solo fotografía
   real y documental. Dejar los placeholders/fallbacks tal como están.
3. **No inventar datos** (nombres de fincas, cifras, testimonios) — todo dato
   debe salir de este archivo. Ya hubo casos de datos inventados por
   herramientas de diseño anteriores (ej. una finca que no existe) —
   verificar dos veces antes de usar cualquier cifra.
4. La sección de testimonios está **desactivada a propósito** — no hay
   testimonios reales todavía, no rellenar con citas inventadas.
5. Todo el copy, precios y links vive en `src/lib/content.ts` — cambios de
   contenido van ahí, no repartidos en JSX.

## Estado actual

- [x] Migración a Next.js 16 + React 19 + TypeScript + Tailwind v4 completa,
  visualmente fiel al original
- [x] Las 5 fuentes en WOFF2 vía `next/font/local`, Suranna reparada
- [x] Chatbot n8n con scaffold listo (`ChatbotWidget.tsx` + `/api/chat`),
  falta configurar `N8N_WEBHOOK_URL`
- [x] Auditoría de Web Interface Guidelines (Vercel) completa, 6 fixes aplicados
- [ ] 5 fotos reales pendientes (specs en `README.md` del sitio original)
- [ ] Testimonios reales pendientes
- [ ] Verificar que `@bruma1800_cafe` sea la cuenta correcta de Instagram
- [ ] Elegir hosting con runtime Node (Hostinger compartido no sirve para
  esto) y desplegar
