<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# BRUMA1800 — Contexto del proyecto

Este es el proyecto de **migración a Next.js** del sitio estático original.
Para el mapa del código (stack, estructura de carpetas, cómo correr, chatbot)
ver `README.md`. Para la bitácora de qué se hizo y por qué en la migración
(bugs encontrados, decisiones de arquitectura, fix de responsive) ver
`handoff.md`. Este archivo es solo marca y datos.

> **Este es el proyecto activo.** Decisión del cliente, 3 de agosto de 2026: el
> trabajo continúa aquí. La versión estática queda como referencia y como
> respaldo desplegable, y **no debe recibir funcionalidad nueva** — mantener las
> dos en paralelo ya provocó dos divergencias en un solo día. Verificado el 3 de
> agosto que esta versión está a la par de aquella: 7/7 enlaces de WhatsApp con
> texto diferenciado, puntajes SCA `87.5|83.0`, precio de Aguijón y las tres
> castas, las dos fincas y las dos familias, sin desborde horizontal.

**Ojo con las rutas de este archivo y del `README.md`:** varias apuntan a
`../bruma1800-landing/`, dando por hecho que el sitio estático está al lado con
ese nombre. En el equipo del cliente la carpeta se llama `CLAUDE CODE` y cuelga
de `BRUMA 1800/`, así que esas rutas relativas no resuelven. Los datos de marca
de abajo son copia completa, precisamente para no depender de ellas.

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
| Verde montaña | `#4A6741` | Apoyo. **Es el fondo de la sección de calidad** desde el 3 de agosto de 2026 |
| Azul bruma | `#B7C9D3` | Atmósfera, nunca como CTA. Es el fondo del hero |

El hero **no es ancla oscura**: es azul bruma, con montaña acuarela y tres
capas de nubes reales, texto en variantes oscuras y logo oscuro.

**La sección de calidad pasó de café profundo a verde montaña** el 3 de agosto de
2026, a petición del cliente. `.cta` sigue en café profundo. El cambio obligó a
subir dos textos: sobre el verde, `--niebla` cae a 3,72:1 y `--arena` a 3,25:1,
y los dos van ahora en `--piedra-calida` (4,72:1 medido). De ahí sale la variante
`onVerde` del `Eyebrow`. Ver `handoff.md` §2.10.

La sección de origen se probó en azul bruma y **se revirtió a petición del
cliente**: su fondo es `--piedra-calida`, el del diseño original. Conserva la
ornamentación de rama de cafeto y la abeja en acuarela, que no dependen del
fondo. Al volver al beige dejó de necesitar `variant="onNiebla"` en su texto:
sobre piedra cálida `--tierra` da 5.02:1 por sí solo.

> **Sobre azul bruma, `--tierra` no vale para cuerpo de texto.** Da 3.95:1,
> por debajo del mínimo AA de 4.5:1. Usar `--cafe-profundo`, que da 8.48:1.
> Ya causó un bug real en esta migración (`handoff.md` §3.1) — si alguna
> sección cambia a este fondo, es lo primero que hay que revisar.

**Sub-marca Club 1800:** paleta propia negro/plateado/glow — nunca se mezcla
con la paleta principal. Su lenguaje de animación también es propio: el texto y
el botón entran con un fade largo, sin desplazamiento ni cascada.

> **Excepciones, decididas por el cliente el 3 de agosto de 2026:**
>
> 1. La tarjeta de membresía **sí** flota y **sí** lleva brillo metalizado, como
>    los mockups del hero. Se le dio un ciclo más lento que a cualquier pieza del
>    hero (9 s frente a 6,5–8,5 s) para que no compita con ellas ni se lea
>    nerviosa. El recorrido se subió después de 16 a 30 px, también a petición,
>    porque apenas se notaba: se alargó el viaje, **no** se aceleró el ciclo.
> 2. La tarjeta **se inclina en 3D siguiendo al cursor o el dedo** (±5°, con
>    rebote al soltar). Hook propio `useTilt3D` + CSS: **sin dependencias
>    nuevas**. Va sobre un envoltorio, `.tarjeta-club-3d`, y no sobre la tarjeta
>    misma — GSAP le deja un `transform` en línea que gana a la hoja de estilos.
>    Ver `handoff.md` §2.11.
>
>    Tres cosas de esta tarjeta están **cerradas por el cliente** y no se tocan
>    por iniciativa propia: los ±5° con `perspective(400px)` se quedan aunque el
>    efecto se note; en móvil el dedo sobre la tarjeta la inclina y **no**
>    desplaza la página; y su entrada sigue sin desplazamiento ni cascada.
> 3. La sección lleva **las mismas nubes del hero**, a las mismas velocidades y
>    con otro reparto de alturas y fases. Sus opacidades son mucho más bajas
>    (0,09 / 0,075 / 0,06 frente a 0,85 / 0,72 / 0,40) porque sobre el negro del
>    Club una nube blanca se come el contraste del texto plateado. **Están medidas**
>    con `tools/medir-contraste.mjs`; quien las suba, que vuelva a correrlo.
>
> Lo demás de la sección sigue quieto: el texto y el botón entran con su fade
> largo, sin desplazamiento ni cascada.

**Regla general que dejaron la tarjeta y la abeja del CTA:** sobre un elemento
que GSAP revela (`useReveal`, `useClubReveal`), el CSS propio tiene que
mantenerse **fuera de `transform`, `translate`, `rotate` y `scale`**. GSAP se
apropia de esa familia y su `clearProps` congela lo que encuentre, dejando un
estilo en línea que ya no se va. `filter` y `opacity` son terreno libre, y para
lo demás, envolver el elemento. Ver `handoff.md` §2.11 y §2.12.

**Movimiento y `prefers-reduced-motion`:** la regla de la casa es *atenuar, nunca
apagar* — Windows manda `reduce` de fábrica y aplicarla al pie de la letra dejaría
la página muerta. **Sin excepciones, y el vídeo de origen tampoco.** Hubo una
versión en la que ahí `reduce` significaba arrancar pausado, y el cliente pidió
retirarla el 3 de agosto de 2026: quería que se reprodujera sin tener que pulsar
nada. Lo que se conserva es el botón de pausa, que es lo que el criterio 2.2.2 de
WCAG exige de verdad — una forma de pararlo, no que no empiece.

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
- [x] Tarjeta del Club: el cliente aportó el render y ya está recortada y colocada
  (`public/images/club/tarjeta-1800.webp`)
- [x] **Ya no queda ningún hueco de foto.** El último, el de `finca-familia.jpg`,
  lo ocupa desde el 3 de agosto de 2026 un **bucle de vídeo mudo** del corredor de la
  casa de la finca, recortado del comercial que aportó el cliente
  (`public/video/finca-corredor.mp4`). Las 3 del portafolio usan los renders del
  propio producto. Si algún día llega la foto de la familia, habrá que decidir si
  sustituye al vídeo: ya no hay respaldo automático que la recoja sola
- [ ] Testimonios reales pendientes
- [x] `@bruma1800_cafe` **confirmada por el cliente** (3 de agosto de 2026) como la
  cuenta oficial. Vive en `INSTAGRAM_HANDLE` de `src/lib/content.ts` y de ahí sale a
  Club, CTA final y footer — si algún día cambia, se toca en un solo sitio
- [ ] Elegir hosting con runtime Node (Hostinger compartido no sirve para
  esto) y desplegar
