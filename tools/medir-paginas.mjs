// Las cinco páginas del sitio: que carguen, que el menú marque la que toca,
// que el título del documento sea el suyo y que no haya desborde.
//
//   node tools/medir-paginas.mjs [ancho] [base]
const ANCHO = +(process.argv[2] ?? 1440);
const BASE = process.argv[3] ?? "http://127.0.0.1:3100";
const RUTAS = ["/", "/productos", "/melipona", "/quienes-somos", "/club"];
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

await send("Page.enable");
await send("Network.enable");
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
await send("Emulation.setDeviceMetricsOverride", { width: ANCHO, height: 900, deviceScaleFactor: 1, mobile: ANCHO < 700 });

const filas = [];
for (const ruta of RUTAS) {
  await send("Page.navigate", { url: BASE + ruta });
  await sleep(2600);
  const total = await evaluar("document.body.scrollHeight");
  for (let y = 0; y < total; y += 700) { await evaluar(`window.scrollTo(0, ${y})`); await sleep(160); }
  await sleep(600);
  filas.push({ ruta, ...(await evaluar(`(() => {
    const de = document.documentElement;
    const activa = document.querySelector('.nav__enlace[aria-current="page"]');
    return {
      titulo: document.title.replace(' — BRUMA1800', '').slice(0, 26),
      h1: (document.querySelector('h1')?.textContent ?? '(ninguno)').slice(0, 26),
      pestanaActiva: activa ? activa.textContent.trim() : '(ninguna)',
      pendientes: document.querySelectorAll('.border-dashed').length,
      main: !!document.querySelector('#main-content'),
      pie: !!document.querySelector('footer'),
      desborde: de.scrollWidth - de.clientWidth,
      alto: Math.round(de.scrollHeight),
    };
  })()`)) });
}
console.log(`ancho ${ANCHO}`);
console.table(filas);

// Navegación real: pulsar una pestaña tiene que cambiar de página sin recargar.
await send("Page.navigate", { url: BASE + "/" });
await sleep(2600);
const antes = await evaluar("performance.getEntriesByType('navigation').length");
await evaluar(`[...document.querySelectorAll('.nav__enlace')].find(a => a.textContent.includes('Melipona')).click(), true`);
await sleep(1800);
console.log("clic en 'Línea Melipona' desde la portada:", JSON.stringify(await evaluar(`(() => ({
  url: location.pathname,
  navegacionesDeDocumento: performance.getEntriesByType('navigation').length,
  h1: document.querySelector('h1')?.textContent,
}))()`)), `(antes ${antes}: si no sube, fue del lado del cliente)`);
ws.close();
