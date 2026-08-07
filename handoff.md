# BRUMA1800 — Migración a Next.js — Handoff de sesión

Estado del trabajo para retomarlo después de un `/clear`. Complementa a `README.md`
(stack, estructura de carpetas, cómo correr, cómo activar el chatbot) — este
documento es la bitácora de **qué se hizo y por qué**, no el mapa del código.

**Última actualización:** 3 de agosto de 2026. Recoge tres sesiones: la migración
inicial (31 de julio), la de diseño del 3 de agosto —en la que este proyecto pasó
a ser **el activo**, ver §2.5— y la del bucle de vídeo de la finca, §2.8.

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

### 2.8 El último hueco: un bucle de vídeo de la finca

El de `finca-familia.jpg`, el único que quedaba. El cliente aportó
**`BRUMA 1800 COMERCIAL #1.mp4`**: 2160×3840, 60 fps, 72 s, **405 MB**. Vertical,
que es la suerte de todo esto — el marco de Origen es 4:5, así que el recorte cae
arriba y abajo y no se pierde nada por los lados.

**De 72 s a 10.** Se detectaron los doce cortes de plano del comercial y se
evaluaron los cuatro planos continuos largos por cómo *ciclan*, no por lo bonitos
que son sueltos:

| plano | duración | por qué sí o no |
|---|---|---|
| **casa de la finca** (12,4–17,4) | 5,0 s | **el elegido.** Corredor, piso de madera, materas, luz de las cinco |
| marquesina (43,1–49,4) | 6,3 s | arranca en una viga oscura y el salto de cierre es grande |
| granos y atardecer (49,5–59,8) | 10,3 s | el mejor remate del comercial, pero principio y final son planos distintos |
| manos y bolsa (59,9–68,0) | 8,1 s | enseña empaque, y esta sección no vende |

**Ida y vuelta, no fundido cruzado.** El plano es un travelling: su último
fotograma no empalma con el primero. En vez de disimular el salto con un
crossfade —que emborrona un segundo, y en un movimiento tan lento se nota— se
concatena el plano con su reverso. Quedan 9,93 s y **ni un solo corte**: la
cámara avanza y vuelve, y se lee como una deriva.

Los dos fotogramas del pliegue se descartan a propósito. `reverse` devuelve
repetidos el último y el primero, y dejarlos ahí congela la imagen una trama en
cada extremo — el hipo clásico del ping-pong. Por eso el filtro lleva
`trim=start_frame=1:end_frame=n-1` y por eso el resultado son 298 tramas exactas
y no 300.

**Un solo formato.** Lo normal sería servir también WebM/VP9, y se probó: a
calidad indistinguible al 100%, VP9 pesa 1341 KB contra 1413 KB del H.264. **72 KB,
un 5%.** Este material es luz cálida y suave, con poco detalle de alta frecuencia,
y ahí VP9 no saca la ventaja que saca en otros. No compensa un segundo archivo que
regenerar y mantener sincronizado, así que se quedó en MP4. Si el plano cambia por
uno con más textura, conviene volver a medirlo en vez de darlo por sentado.

**Cómo se comporta** (`MediaVideo.tsx`, hermano de `MediaFrame`):

- Mudo y sin pista de audio: no hay nada que silenciar.
- **Botón de pausa.** Son casi diez segundos de movimiento automático y sin una
  forma de detenerlo esto incumple el criterio 2.2.2 de WCAG. Alcanzable con
  teclado, no solo al pasar el cursor.
- **Arranca solo, sin que nadie pulse nada**, y **también con `reduce`**. Hubo una
  primera versión que con esa preferencia se quedaba en el póster esperando al
  botón; el cliente pidió retirarla. El motivo de fondo es el gotcha 8 del proyecto
  original: en este Windows `reduce` viene puesto de fábrica sin que nadie lo elija,
  así que aquello dejaba el vídeo sin reproducirse casi nunca. Ahora el vídeo sigue
  el mismo criterio que el resto de la página —moverse siempre— y lo que se conserva
  es el botón de pausa, que es lo que el criterio 2.2.2 de WCAG pide de verdad:
  **una forma de pararlo**, no que no empiece.
- **Solo corre mientras se ve**, por `IntersectionObserver` con `rootMargin` de
  250 px. La sección está bien abajo; no tiene sentido decodificar para nadie. Ese
  margen es lo que hace que la reproducción se sienta inmediata: cuando la sección
  asoma, el vídeo ya lleva un momento corriendo, en vez de empezar a buscar datos
  justo al aparecer. Una pausa a mano manda sobre el observador: volver a la sección
  no la reanuda.
- `video.muted = true` **también desde JS**: React no siempre emite ese atributo en
  el HTML del servidor, y sin él la política de autoplay bloquea la reproducción.
- Detrás sigue el panel de marca de montaña, por si el archivo falla algún día.

**El fuente no vive en el repo.** 405 MB no entran en git. Está en la videoteca del
cliente, `MULTIMEDIA BRUMA1800/BRUMA COMERCIALES/`, y `tools/preparar-video-origen.py`
lo lee de ahí. Llegó a haber una copia suelta en el `assets/img/` del sitio
estático; se borró tras verificar que era byte a byte idéntica, y ese repo ganó una
regla en `.gitignore` para que no vuelva a colarse.

**Efecto colateral: `MediaFrame` adelgazó.** Al ocupar el vídeo el último hueco de
foto, su modo `fit="cover"` —el panel de «foto por venir» y el estado de error— se
quedó sin un solo uso: ahora solo lo llama el portafolio, siempre con `contain`. Se
retiró, igual que antes se retiró `vacio="club"`. El panel sigue vivo dentro de
`MediaVideo`, que es donde hace falta.

### 2.9 Bruma en el Club, y la tarjeta flotando más

Las dos cosas las pidió el cliente en la misma vuelta.

**Las nubes del hero, ahora también en el Club.** Las mismas tres imágenes y
**exactamente las mismas velocidades** —deriva 150/98/64 s, vaivén 44/33/26 s—,
repartidas de otra manera: otras alturas (4% / 42% / 72%), otros mosaicos y otras
fases, para que no se lea como la misma imagen repetida más abajo. Van las tres
por detrás del contenido; en el hero una capa pasa por delante del texto, pero
sobre el negro del Club eso emborronaría el plateado.

Es una **excepción al criterio de `AGENTS.md`**, que reserva al Club un lenguaje
propio y sin el tratamiento de la marca principal. La pidió el cliente, igual que
en su día la flotación de la tarjeta. Queda anotada como decisión suya.

**Las opacidades no son las del hero, y no por gusto.** Allí van sobre azul bruma
a 0,85/0,72/0,40; aquí el fondo es casi negro y a esa opacidad una nube blanca no
es bruma, es una mancha que levanta la luminancia del fondo y se lleva por delante
el contraste del texto plateado.

El primer intento —0,13/0,09/0,06— **pasaba por los pelos**: eyebrow en 4,59:1 y
número en 4,53:1 contra un mínimo de 4,5. Con unas nubes que derivan sin parar, un
margen del 2% significa que un rato más tarde ya no pasa. Bajando la capa alta a
0,09 y la media a 0,075, el peor caso sube a **5,07:1** y la bruma se sigue
leyendo. La capa baja puede ser la más suelta porque cae por la zona de la
tarjeta, que es opaca.

`tools/medir-contraste-club.mjs` lo comprueba con el criterio de siempre: tapa el
texto, y busca el **peor píxel** que hay detrás de cada línea en nueve instantes
distintos del ciclo. Ni promedios ni una sola captura — una nube pasa por encima
de unas letras y no de otras. El color de cada línea se lee con
`getComputedStyle`, no se supone. El botón queda fuera de la medición **a
propósito**: es opaco, ninguna nube puede tocarlo, y medirlo daría un falso
negativo (el gotcha 13 del proyecto estático, otra vez).

**La tarjeta flota más.** El recorrido pasó de 16 a **30 px**; medido en el
navegador, el viaje real es de **35,8 px**, porque a la traslación se le suma la
escala. Se tocó la amplitud y **no la duración**: el ciclo sigue en 9 s. Alargar el
viaje dentro del mismo ciclo hace el movimiento más visible sin volverlo inquieto,
que es lo que habría pasado acelerándolo.

Además crece un **2%** al llegar arriba, para que además de subir parezca
acercarse. Es lo que vende la levitación sobre un fondo negro: aquí la sombra no
puede ayudar —una sombra sobre negro no se ve—, así que el trabajo lo hace la
perspectiva. `translate` y `scale` son propiedades independientes y se animan en
el mismo keyframe sin pisarse, que es justo lo que no se podía hacer con dos
animaciones sobre el mismo elemento.

La escala se calcula desde `--amp-scale`, así que con `reduce` se achica sola junto
con el recorrido: **16,6 px y 1%**, casi exactamente lo que era el efecto completo
antes de este cambio.

### 2.10 Calidad, de café profundo a verde montaña

Petición del cliente: `#4A6741`, el verde montaña del brandbook. El token ya
existía en la paleta con el nombre `--verde-hoja`, así que el fondo es
`bg-verde-hoja` y no hay ningún hex suelto en el código.

**El cambio no es solo de fondo.** El café profundo es casi negro (luminancia
0,029) y el verde montaña es un tono medio (0,115): cuatro veces más claro. Todo
el texto de la sección es claro, así que todo pierde contraste de golpe. Medido
antes de aplicarlo:

| línea | color | sobre café | sobre verde | mínimo | |
|---|---|---|---|---|---|
| eyebrow | `--niebla` | 7,81 | **3,72** | 4,5 | se rompe |
| protocolo SCA | `--arena` | 6,53 | **3,25** | 4,5 | se rompe |
| intro y «quien» | `--piedra-calida` | 9,86 | 4,76 | 4,5 | aguanta |
| titular, puntaje, lugar | `--hueso` | 11,7 | 5,64 | 3 / 4,5 | aguanta |

Los dos que se rompen suben a `--piedra-calida`. Eran los dos tonos más apagados
de la sección —el eyebrow en azulado frío, la línea del SCA en un tan tostado— y
sobre el café profundo se podían permitir ser tenues porque partían de 7:1. Sobre
el verde ya no. Se pierde un matiz de jerarquía, pero es eso o texto que no se
lee.

El eyebrow estrena variante **`onVerde`** en `Typography.tsx`, hermana de
`onNiebla`. El caso es el mismo al revés: un fondo de tono medio deja fuera al
tono claro más frío, igual que el azul bruma dejaba fuera a `--tierra`.

Verificado en el navegador a 390 y 1440: **el peor caso es 4,72:1** sobre un
mínimo de 4,5. El margen es justo, pero aquí es un color plano —no hay nubes
derivando por detrás como en el Club—, así que el número es determinista y no va
a moverse solo.

**El medidor de contraste ahora sirve para las dos secciones.** Lo que era
`medir-contraste-club.mjs` es ahora `tools/medir-contraste.mjs`, con un pequeño
registro de secciones: `node tools/medir-contraste.mjs calidad|club|todas`. Las
de fondo en movimiento declaran cuántas muestras necesitan; las de color plano,
una. Se hizo al necesitar lo mismo para Calidad: dos copias de 120 líneas casi
iguales envejecen mal.

### 2.11 Inclinación 3D de la tarjeta, siguiendo al cursor

Petición del cliente, a partir de un patrón de referencia hecho en React +
Framer Motion. **No se trajo ninguna dependencia**: sale con un hook propio
(`useTilt3D`) y CSS, que es como está hecho el resto del movimiento de la casa.

El mecanismo: el hook escribe `--tx` y `--ty` normalizadas de −1 a 1 según dónde
esté el puntero respecto al centro, y el CSS decide los grados. Ese reparto deja
el rango en un solo sitio y permite que `prefers-reduced-motion` lo recorte a la
mitad sin que el hook se entere de nada — mismo criterio que `--amp-scale`.

**El envoltorio no es decorativo, es el arreglo.** La inclinación no puede ir
sobre `.tarjeta-club`: GSAP le deja un `transform` **en línea** al revelarla —una
foto congelada de la flotación, sin rotación— y el estilo en línea gana siempre a
la hoja de estilos. El resultado era que `--tx` y `--ty` cambiaban correctamente y
la tarjeta no se movía ni un grado. Es el gotcha 5 del proyecto original asomando
por otro lado, y se ve en el estilo calculado:

```css
transform: translate3d(0px, -5.85px, 0px) scale(1.0039) matrix3d(…, -0.0025, …)
```

La solución es la de siempre aquí: repartir los movimientos entre dos elementos,
como la rama de cafeto. `.tarjeta-club-3d` envuelve y se inclina; `.tarjeta-club`
sigue flotando y brillando dentro. Ninguna pisa a la otra.

Detalles que importan:

- **±5°** y `perspective(400px)`, los valores del patrón de referencia.
  **Confirmados por el cliente el 3 de agosto de 2026**, después de verlos
  funcionando: se avisó de que para una tarjeta de ~515 px esa perspectiva es
  cerrada y el efecto se nota bastante, y aun así se quedan. Si algún día hay que
  suavizarlo, subir la distancia (600–800 px) antes que bajar el ángulo.
- La transición con rebote (`cubic-bezier(0.34, 1.56, 0.64, 1)`, 620 ms) **solo
  actúa al soltar**: mientras el puntero manda, la clase `.esta-inclinandose` la
  apaga. Con transición activa durante el movimiento se leería como retardo.
- `touchmove` va con `preventDefault` y **`{ passive: false }`**, que es
  obligatorio: sin esa opción el navegador ignora el `preventDefault` y avisa por
  consola. Ojo, esto significa que **arrastrar el dedo sobre la tarjeta no
  desplaza la página**; en móvil la tarjeta ocupa casi todo el ancho, así que es
  una decisión con coste. **Confirmada por el cliente el 3 de agosto de 2026**
  con el coste sobre la mesa: quiere que el dedo incline la tarjeta y no
  arrastre. No revertirlo por iniciativa propia.
- El movimiento se acumula en un `requestAnimationFrame`: `mousemove` dispara
  mucho más a menudo de lo que la pantalla pinta.

**Verificado** con `tools/medir-tilt-club.mjs`, que descompone la matriz 3D real
en vez de leer el CSS (ahí pone `rotateX(calc(...))`, no los grados aplicados):
en reposo 0°, en las cuatro esquinas entre 2,98° y 3,91° con los signos
simétricos, **nunca pasa de 5°**, vuelve a 0 al salir el cursor, y en `touchmove`
el evento sale cancelado y la página no se desplaza.

> Al escribir ese verificador, la primera versión medía en las esquinas al 2% y
> al 98% y daba ceros: la tarjeta flota 30 px sin parar, así que entre medir la
> caja y mandar el evento el punto se quedaba fuera y saltaba `mouseleave`. Los
> puntos de prueba están al 12–88%.

**Lo que no se trasladó del patrón de referencia**, y por qué:

- **La cascada de texto dentro de la tarjeta no se puede hacer**: la tarjeta es
  un render en WebP de una tarjeta física, no una composición de elementos de
  texto. No hay dentro «nivel actual» ni «cada compra suma metros» ni números de
  metros con glow — eso es contenido del ejemplo. El texto real del Club
  («1800 · 18:00», la nota, el CTA) vive **al lado** de la tarjeta, no dentro.
- **El desplazamiento vertical en la entrada tampoco se aplicó.** La tarjeta ya
  se revela al hacer scroll, pero con fade largo **sin desplazamiento y sin
  cascada**, que es el lenguaje propio del Club documentado en `AGENTS.md` y en
  `useClubReveal`. Añadirle desplazamiento contradice esa decisión de marca, y el
  cliente **confirmó el 3 de agosto de 2026 que se queda así**. El asunto está
  cerrado: la entrada de la tarjeta no lleva desplazamiento ni cascada.
- El botón de mostrar/ocultar tipo «ojo» se omitió, como se pidió: no hay
  información que ocultar en esta tarjeta.

---

### 2.12 La abeja del CTA de portafolio

Petición del cliente: que al pasar el cursor —o al pulsar en móvil— salga la
abeja que ya se usaba. Es literalmente **el mismo archivo** de la sección de
origen (`/images/decor/abeja.webp`) y aletea con **los mismos keyframes**
(`abeja-aletear`), así que se lee como el mismo bicho y no como un icono nuevo.

Va solo en el CTA del cierre de portafolio (`abeja` como prop del `Button`).
Los otros seis enlaces de WhatsApp no la llevan: aquí tiene sentido porque la
sección habla de Aguijón y de las abejas que polinizan el cafetal, y repetirla
en toda la página la gastaría.

- Entra desde abajo y desde la derecha, con la misma curva de rebote que la
  tarjeta del Club. Aletea **solo mientras se ve** (`animation-play-state`), que
  no tiene sentido aletear para nadie.
- El `hover` va acotado a `(hover: hover) and (pointer: fine)`. En táctil el
  hover se queda pegado después de tocar y la abeja no se iría nunca; ahí manda
  la clase `.esta-pulsado`, que el componente pone y quita con eventos de
  puntero. Se usan eventos de puntero y no `:active` porque en iOS `:active` no
  se aplica de forma fiable a un `<a>`.
- También sale con `:focus-visible`, para quien llega al CTA con el tabulador.
- Con `reduce` no se apaga —la saca el usuario, no aparece sola— pero llega con
  menos vuelo y aletea más despacio, igual que su hermana de origen.

**El pulsado oscurece el botón en vez de hundirlo, y eso es un arreglo.** La
primera versión usaba `scale: 0.97`. Si el usuario pulsaba mientras el reveal de
la sección seguía corriendo, el botón se quedaba hundido **para siempre**:
`useReveal` anima ese mismo elemento y su `clearProps` congela lo que encuentre
en la familia `transform`, dejando un `transform: scale(0.97)` en línea que ya no
se va. Es el gotcha 5 otra vez, y la regla general que deja es:

> Sobre un elemento que GSAP revela, el CSS propio tiene que mantenerse fuera de
> `transform`, `translate`, `rotate` y `scale`. `filter` es terreno libre.

**Verificado** con `tools/medir-abeja-cta.mjs` a 390 y 1440, y con `reduce`:
oculta en reposo, visible y aleteando con el cursor encima, botón atenuado al
pulsar, y **de vuelta a oculta al salir**. Sin desborde horizontal.

> Dos trampas de medición, las dos por la misma vía. La primera versión del
> script recorría varios anchos en la misma pestaña y daba números falsos: se
> quedaba el botón del ratón pulsado entre iteraciones y arrastraba la escala de
> la emulación anterior (medía 53 px donde el CSS pide 46). Y al pulsar de
> verdad, como el CTA es un enlace con `target="_blank"`, **se abría WhatsApp en
> otra pestaña y esta pasaba a segundo plano, donde Chrome congela las
> transiciones CSS**: la abeja parecía quedarse pegada para siempre. No lo
> estaba. El script cierra ahora la pestaña que se abre y recupera el primer
> plano antes de seguir midiendo.

---

### 2.13 Menú del header, y la sección Melipona que hizo falta para tenerlo

El cliente pidió cinco pestañas: **Inicio · Productos · Línea Melipona · Quiénes
somos · Club**. Cuatro tenían destino. **Línea Melipona no existía en la
página**: era un dato verificado de `AGENTS.md` —programa de distribución, pedido
mínimo de $200.000 COP, precio fijo sin excepciones, disponibilidad sujeta a
cosecha— sin sección, sin copy y sin nada a lo que enlazar. El cliente eligió
crear la sección.

> **El copy de Melipona es un borrador pendiente de su aprobación.** Sale
> entero de esos hechos verificados y de nada más: no dice a quién va dirigido
> el programa, ni plazos, ni condiciones de pago, porque eso no está verificado
> y la regla de marca prohíbe inventarlo. Está marcado como borrador en
> `lib/content.ts` y en el componente.

La pestaña se etiquetó **Club 1800** y no «Club 18:00»: el titular de la sección
dice CLUB 1800 y «1800 · 18:00» es su tagline, así que el menú y el destino
coinciden. Lo confirmó el cliente.

**El menú va en su propia fila, encima del logo.** Compartiendo fila con él
ocupaba 619 px a 1440 y el sobre de Drip empieza en x=1058: se pisaban 212 px y
«Quiénes somos» y «Club 1800» quedaban detrás de los mockups. Poniéndolo arriba,
todo el bloque baja con él y la composición flotante —afinada a mano, no se
toca— conserva sus distancias. Verificado con **0 solapes** a 1280, 1440 y 1920.

Detalles del componente (`ui/Nav.tsx`):

- **Una sola lista de enlaces**, que en escritorio es una fila y por debajo de
  900 px se pliega tras un botón. Duplicar el `<ul>` para tener versión de
  escritorio y de móvil habría dejado diez enlaces en el documento, y un lector
  de pantalla los lee todos aunque la mitad estén ocultos.
- Son anclas de la misma página: el desplazamiento suave ya lo da
  `scroll-behavior: smooth`, que se apaga solo con `prefers-reduced-motion`. No
  hace falta JS para eso.
- `aria-current="page"` en Inicio: la pestaña de la ventana actual se anuncia,
  no se deja solo al color.
- Mismo criterio de accesibilidad que el widget del chat: `aria-expanded`,
  `aria-controls`, Escape cierra y **el foco vuelve al botón**.
- El plegado se oculta con `display` y no solo con opacidad, para que el
  tabulador no entre en un menú cerrado. Medido: **0 enlaces alcanzables** con el
  menú cerrado a 390, 5 a 1440.
- Color en `--cafe-profundo` y no `--tierra`: el fondo es azul bruma y ahí
  `--tierra` se queda en 3.95:1. Y sin naranja, que el acento único de la pieza
  ya lo gasta el CTA principal del hero.

**El orden del menú no es el de la página.** El cliente pidió «Quiénes somos» en
cuarta posición y en la página Origen sigue siendo la segunda sección. Es su
menú, así que manda su orden; queda anotado para que no se lea como un error.

**Verificado** a 390, 768, 900, 1280, 1440 y 1920: los cinco destinos existen, el
botón aparece exactamente por debajo de 900 px, 0 desborde, y el salto deja la
sección con su borde superior en 0.

---

### 2.14 De anclas a páginas propias

El cliente pidió que cada pestaña del menú **abriera una página aparte** con más
detalle, en vez de desplazar dentro de la portada. Hay cuatro rutas nuevas:
`/productos`, `/melipona`, `/quienes-somos` y `/club`. Navegación normal en la
misma pestaña, con `next/link`: el botón de atrás del navegador funciona y no se
recarga el documento (medido: las entradas de navegación no suben al pulsar).

> **Aviso que se dio antes de construir nada: no hay información más detallada
> que la que ya estaba.** Los hechos verificados son los que son y todos estaban
> publicados. El cliente eligió montar la estructura y **marcar los huecos**, así
> que cada página lleva un bloque `<Pendiente>` que dice por escrito qué falta,
> sin rellenarlo. Ninguna de esas cajas afirma un dato que no esté verificado.

**Las páginas no llevan entradilla propia.** La primera versión ponía encima un
bloque con eyebrow, titular y bajada, y en `/melipona` y `/club` el resultado era
el mismo titular dos veces seguidas con casi el mismo texto debajo — se ve en la
captura del primer intento. Cada sección ya se presenta sola; lo único que hacía
falta era que su titular fuera el `<h1>` de la página, y para eso está la prop
`comoPagina` de `Portafolio`, `Origen`, `Melipona` y `Club`. Solo cambia el nivel
del encabezado, no el aspecto. `PageIntro` se creó, quedó sin uso y se retiró.

**Las secciones se reutilizan, no se duplican.** `/productos` monta el mismo
`<Portafolio>` de la portada, `/quienes-somos` junta `<Origen>` y `<Calidad>`,
etc. Copiar el copy a otro archivo habría creado dos sitios donde cambiar un
precio, que es exactamente cómo divergen dos versiones.

**La portada conserva sus secciones.** Sigue siendo el resumen; las páginas son
el detalle. Sus `id` (`#inicio`, `#portafolio`, `#melipona`, `#quienes-somos`,
`#club`) se quedan puestos: el botón «Ver el portafolio» del hero los sigue
usando.

`SiteHeader` es la cabecera de las páginas interiores: logo que vuelve a la
portada y el mismo menú, sobre el azul bruma del hero para que al cambiar de
página no parezca otro sitio. La pestaña activa se decide con `usePathname` y no
con una marca fija en los datos, así sigue siendo correcta aunque alguien entre
directo a `/club` desde un enlace.

**Verificado** a 390 y 1440, en las cinco páginas: título de documento propio, un
solo `<h1>`, la pestaña correcta marcada con `aria-current`, `#main-content`
presente —el atajo de «Saltar al contenido» funciona en todas—, pie, y **0
desborde**. `tools/medir-paginas.mjs`.

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
python tools/preparar-video-origen.py "../MULTIMEDIA BRUMA1800/BRUMA COMERCIALES/BRUMA 1800 COMERCIAL #1.mp4"
```

`assets-fuente/` guarda los originales que entrega el cliente. Queda **fuera de
`public/`** a propósito: son material de trabajo, no se sirven. Los vídeos son la
excepción y ni siquiera pasan por ahí: pesan cientos de MB y se leen directamente
de la videoteca del cliente.

`preparar-video-origen.py` necesita **ffmpeg**, que no venía en este equipo. Se
instaló con `winget install Gyan.FFmpeg`. Ojo: winget **no lo deja en el PATH**
—no crea los enlaces—, así que el script lo busca él mismo dentro de
`%LOCALAPPDATA%\Microsoft\WinGet\Packages` cuando `shutil.which` no lo encuentra.

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
- **Con vídeo, `paused:false` no prueba nada.** Un elemento que no ha cargado
  también lo dice. Lo que prueba que se está reproduciendo de verdad es que
  `currentTime` **avance** entre dos lecturas separadas en el tiempo. Es lo que
  mide `tools/medir-video-origen.mjs`.
- **En headless hace falta `--autoplay-policy=no-user-gesture-required`.** Sin esa
  bandera Chrome bloquea hasta el autoplay mudo y la medición dice que el vídeo no
  arranca, cuando en un navegador normal arranca perfectamente.
- **`Page.captureScreenshot` recorta en coordenadas de PÁGINA, no de viewport.**
  Pasarle un `getBoundingClientRect` a secas devuelve una captura en blanco de una
  zona que está por encima del contenido. Hay que sumarle `scrollX`/`scrollY`.
  Cuidado, porque este falla **en silencio**: la primera vez dio una captura
  vacía, que se ve enseguida; la segunda dio una tabla entera de contrastes
  plausibles pero medidos sobre otra sección, y esos números sí se podrían haber
  dado por buenos.
- **No borrar `.next` con el servidor corriendo.** Cuesta caro y no avisa. Al
  hacerlo, el optimizador de imágenes se queda con entradas que cree tener y no
  tiene, y a partir de ahí **una petición concreta se cuelga para siempre**: el
  navegador la pide, no llega respuesta nunca, y la imagen se queda en
  `complete:false` con `currentSrc` vacío. Pasó con la tarjeta del Club a 390 px
  (`w=384`), mientras 256, 640 y 750 respondían en 20 ms, y llevó un buen rato de
  sospechar del ancho y de la imagen. Con el servidor reiniciado y
  `.next/cache/images` borrada **en frío**, esa misma petición tarda 166 ms.
  Parar el servidor, borrar, reconstruir, levantar.

  > Esto huele mucho al misterio de §2.7, el de `loading="lazy"` que «no llegaba
  > a disparar» en esta misma imagen: el síntoma descrito allí —petición hecha,
  > ninguna respuesta, imagen incompleta— es exactamente este. **No está
  > demostrado**, porque aquello no se volvió a reproducir, pero antes de volver a
  > tocar el `loading="eager"` de la tarjeta conviene probar en un servidor limpio.
- **No fiarse de las duraciones declaradas: cronometrar el movimiento.** Para
  comparar el destello automático con el del cursor (§2.7) hubo que medir cuánto
  tarda en cruzar, no leer `animation-duration`. Y esperar a que el bucle esté en
  reposo antes de meter el cursor: si entra a media pasada, la posición salta
  atrás al reiniciar y la ventana de medida abarca dos tramos, dando ~1630 ms que
  no son reales frente a los 1062 correctos.

### Cifras de referencia al cierre

- **10/10** imágenes de producto cargadas en 390, 768, 1280, 1440 y 1920 px.
- **0** imágenes rotas visibles y **0** desborde horizontal en esos cinco anchos.
- **0** paneles de hueco: no queda ninguna foto pendiente en la página.
- Bucle de origen, en los cinco anchos: parado antes de llegar a la sección,
  avanzando dentro de ella (~1,78 → ~2,99 s), para con el botón, sigue al
  volver a pulsarlo y para al salir de pantalla. **Con `reduce` arranca solo
  igualmente** (1,78 → 2,99) y el botón lo sigue parando. Marco de 342×428
  (390 px), 688×860 (768) y 514×620 desde 1280.
- Vídeo: 720×900, 30 fps, **298 tramas** exactas, 9,93 s, 1413 KB.
- Contraste del Club con la bruma detrás, peor píxel en nueve instantes del ciclo
  y a 390/1440: eyebrow **5,12 / 5,56**, número **5,51 / 5,07**, párrafo
  **11,99 / 10,10**, nota **16,48 / 16,48**, titular **11,86 / 11,95**. Mínimos
  4,5 (y 3 para el titular, que es texto grande).
- Tarjeta del Club: recorrido real **35,8 px** y crecimiento del **2,13%** con
  ciclo de 9 s; con `reduce`, **16,6 px** y **1%** en 14 s.
- Inclinación 3D de la tarjeta: 0° en reposo, entre **2,98° y 3,91°** en las
  cuatro esquinas con signos simétricos, **nunca por encima de 5°**, y vuelta a 0
  al salir el cursor. En `touchmove` el evento sale cancelado y la página no se
  desplaza.
- Imagen de la tarjeta cargada en 360, 390, 500, 640, 700 y 768 px.
- Contraste de Calidad sobre verde montaña, a 390 y 1440: peor caso **4,72:1**
  (eyebrow, intro, protocolo SCA y «quien»), **5,64:1** el resto. Mínimos 4,5,
  y 3 para titular y puntaje, que son texto grande.
- **8/8** enlaces de WhatsApp a `573152103231`, con `?text=` diferenciado por
  sección. Eran 7 hasta que la sección Melipona añadió el suyo (§2.13); si en el
  sitio estático siguen siendo 7, es por eso y no por una divergencia.
- Puntajes SCA `87.5|83.0`.
- Destello: cruza en **1062 ms** solo y **1067 ms** con el cursor encima.
- Las **cinco páginas** (`/`, `/productos`, `/melipona`, `/quienes-somos`,
  `/club`) a 390 y 1440: título propio, un solo `<h1>`, la pestaña correcta con
  `aria-current`, `#main-content` presente, pie, y 0 desborde. Navegación del
  lado del cliente, sin recarga de documento.

---

## 6. Pendientes

Nada quedó a medias: build, ESLint y la auditoría WIG están limpios al cierre.
Lo que falta depende de material o de decisiones del cliente:

- [x] **Ya no falta ninguna foto.** El último hueco, el de `finca-familia.jpg`, lo
      ocupa el bucle de vídeo de la finca (§2.8). Las tres del portafolio usan los
      renders del propio producto (§2.6) y la del Club se resolvió con la tarjeta
      (§2.7). Si algún día llega una foto real de la familia, hay que decidir si
      sustituye al vídeo y apuntarla a mano: ya no queda respaldo automático.
- [ ] **BLOQUEA EL DESPLIEGUE — los cuatro bloques `<Pendiente>`.** Las páginas
      interiores llevan cada una una caja de borde discontinuo que declara qué
      contenido falta (§2.14). **Ninguna debe salir a producción**: o el cliente
      aporta el texto, o la caja se retira. Lo que hace falta, por página:
      notas de cata y proceso de cada línea (`/productos`); cómo se entra al
      programa, plazos, cobertura y pago (`/melipona`); la historia de las dos
      familias y su foto (`/quienes-somos`); beneficios, acceso y fecha de
      apertura (`/club`).
- [ ] **El copy de la sección Melipona sigue siendo un borrador** (§2.13), tanto
      en la portada como en `/melipona`.
- [ ] **Testimonios reales.** La sección sigue sin existir a propósito; no
      rellenar con texto inventado.
- [ ] **Conectar `N8N_WEBHOOK_URL`.** El chatbot tiene el scaffold listo y
      responde con un mensaje de respaldo mientras no exista la variable.
- [ ] **Elegir hosting con runtime Node** y desplegar. Hostinger compartido, que
      era el destino del sitio estático, no sirve: `/api/chat` necesita servidor.

Confirmado y cerrado el 3 de agosto: `@bruma1800_cafe` es la cuenta oficial de
Instagram, y el fondo de la sección de origen vuelve a piedra cálida.
