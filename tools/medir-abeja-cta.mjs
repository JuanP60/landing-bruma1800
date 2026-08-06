// La abeja del CTA de portafolio: que salga al pasar el cursor y al pulsar, y
// que se vaya al soltar y al salir.
//
//   node tools/medir-abeja-cta.mjs [ancho] [url]
//
// **Una sola anchura por ejecucion, a proposito.** La primera version recorria
// varios anchos en la misma pestaña y daba resultados falsos: se quedaba el
// boton del raton pulsado entre iteraciones —lo que altera el hover— y arrastraba
// la escala de la emulacion anterior (medía 53 px donde el CSS pide 46). Si hay
// que comparar anchos, se llama al script una vez por cada uno.
const ANCHO = +(process.argv[2] ?? 1440);
const URL_BASE = process.argv[3] ?? "http://127.0.0.1:3100/";
const REDUCE = process.argv[4] ?? "no-preference";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const targets = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluar = async (e) => (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result.value;

const SONDA = `(() => {
  const b = document.querySelector('.btn--abeja');
  const a = b.querySelector('.btn__abeja');
  const cs = getComputedStyle(a);
  const img = a.querySelector('img');
  const de = document.documentElement;
  return {
    opacidad: +(+cs.opacity).toFixed(2),
    desplazada: cs.translate !== '0px' && cs.translate !== 'none',
    aleteo: getComputedStyle(a.querySelector('.btn__abeja-aleteo')).animationPlayState,
    pulsado: b.classList.contains('esta-pulsado'),
    escala: getComputedStyle(b).scale,
    anchoAbeja: Math.round(a.getBoundingClientRect().width),
    imgOk: img.complete && img.naturalWidth > 0,
    desborde: de.scrollWidth - de.clientWidth,
  };
})()`;

await send("Page.enable");
await send("Network.enable");
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: REDUCE }] });
await send("Emulation.setDeviceMetricsOverride", { width: ANCHO, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: URL_BASE });
await sleep(2600);
await evaluar(`document.querySelector('.btn--abeja').scrollIntoView({block:'center'}), true`);
// Espera larga a proposito: hay que dejar que termine el reveal de GSAP antes
// de tocar el boton. Interactuar a la vez que corre el tween da lecturas que no
// se corresponden con el uso normal, y ya mando a perseguir un fantasma.
await sleep(3500);

const c = await evaluar(`(() => { const r = document.querySelector('.btn--abeja').getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
const raton = (type, extra = {}) => send("Input.dispatchMouseEvent", { type, x: c.x, y: c.y, button: "none", ...extra });

const pasos = [];
pasos.push({ momento: "en reposo", ...(await evaluar(SONDA)) });

await raton("mouseMoved");
await sleep(800);
pasos.push({ momento: "cursor encima", ...(await evaluar(SONDA)) });

await raton("mousePressed", { button: "left", clickCount: 1 });
await sleep(400);
pasos.push({ momento: "pulsado", ...(await evaluar(SONDA)) });

await raton("mouseReleased", { button: "left", clickCount: 1 });
// El CTA es un enlace con target="_blank": soltar encima abre WhatsApp en otra
// pestaña y esta pasa a segundo plano, donde Chrome **congela las transiciones
// CSS**. Sin devolver el foco aqui, la abeja parece quedarse pegada para
// siempre y no es verdad — costo un buen rato descubrirlo. Se cierra la pestaña
// que se abrio y se recupera el primer plano.
await sleep(500);
for (const t of await (await fetch("http://127.0.0.1:9222/json/list")).json()) {
  if (t.type === "page" && t.id !== page.id) await fetch(`http://127.0.0.1:9222/json/close/${t.id}`);
}
await send("Page.bringToFront");
await sleep(600);
pasos.push({ momento: "soltado (cursor sigue encima)", ...(await evaluar(SONDA)) });

// Salir del boton: el cursor se va lejos y la abeja debe irse con el.
await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 8, y: 8, button: "none" });
await sleep(900);
pasos.push({ momento: "cursor fuera", ...(await evaluar(SONDA)) });

console.log(`ancho ${ANCHO} · prefers-reduced-motion: ${REDUCE}`);
console.table(pasos);
ws.close();
