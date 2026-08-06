// El menú del header: que las cinco pestañas existan, apunten a una sección que
// existe de verdad, y que el plegado de móvil abra, cierre y no deje enlaces
// alcanzables con el tabulador cuando está cerrado.
//
//   node tools/medir-menu.mjs [ancho] [url]
//
// Una anchura por ejecucion, por lo aprendido en `medir-abeja-cta.mjs`.
const ANCHO = +(process.argv[2] ?? 1440);
const URL_BASE = process.argv[3] ?? "http://127.0.0.1:3100/";
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
await send("Page.navigate", { url: URL_BASE });
await sleep(2800);

// Cada destino tiene que existir. Un ancla rota no da error: no hace nada, que
// es peor, porque parece que el menu "no funciona" sin decir por que.
const enlaces = await evaluar(`(() => {
  return [...document.querySelectorAll('.nav__enlace')].map(a => {
    const destino = document.querySelector(a.getAttribute('href'));
    return {
      etiqueta: a.textContent.trim(),
      destino: a.getAttribute('href'),
      existe: !!destino,
      seccion: destino ? destino.tagName.toLowerCase() + (destino.className ? '.' + destino.className.split(' ')[0] : '') : '—',
      actual: a.getAttribute('aria-current') === 'page',
    };
  });
})()`);
console.log(`ancho ${ANCHO}`);
console.table(enlaces);

const estado = await evaluar(`(() => {
  const b = document.querySelector('.nav__boton');
  const l = document.querySelector('.nav__lista');
  // checkVisibility mira tambien a los ancestros. Comprobar el display del
  // propio enlace no vale: el que esta oculto es el UL que lo contiene, y una
  // sonda asi devolvia "5 alcanzables" con el menu cerrado.
  const visible = (el) => el.checkVisibility();
  return {
    botonVisible: getComputedStyle(b).display !== 'none',
    listaVisible: getComputedStyle(l).display !== 'none',
    expandido: b.getAttribute('aria-expanded'),
    controla: b.getAttribute('aria-controls') === l.id,
    enlacesAlcanzables: [...document.querySelectorAll('.nav__enlace')].filter(visible).length,
    desborde: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
})()`);
console.log("de partida:", JSON.stringify(estado));

if (estado.botonVisible) {
  await evaluar(`document.querySelector('.nav__boton').click(), true`);
  await sleep(500);
  console.log("tras abrir :", JSON.stringify(await evaluar(`(() => {
    const b = document.querySelector('.nav__boton'), l = document.querySelector('.nav__lista');
    return { expandido: b.getAttribute('aria-expanded'), listaVisible: getComputedStyle(l).display !== 'none',
             desborde: document.documentElement.scrollWidth - document.documentElement.clientWidth }; })()`)));

  // Escape cierra y devuelve el foco al boton.
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await sleep(500);
  console.log("tras Escape:", JSON.stringify(await evaluar(`(() => {
    const b = document.querySelector('.nav__boton'), l = document.querySelector('.nav__lista');
    return { expandido: b.getAttribute('aria-expanded'), listaVisible: getComputedStyle(l).display !== 'none',
             focoEnBoton: document.activeElement === b }; })()`)));
}

// Que el ancla lleve de verdad a la seccion.
const salto = await evaluar(`(async () => {
  const abrir = document.querySelector('.nav__boton');
  if (getComputedStyle(abrir).display !== 'none') abrir.click();
  await new Promise(r => setTimeout(r, 300));
  const a = [...document.querySelectorAll('.nav__enlace')].find(x => x.getAttribute('href') === '#melipona');
  a.click();
  await new Promise(r => setTimeout(r, 1800));
  const s = document.querySelector('#melipona').getBoundingClientRect();
  return { arribaDeLaSeccion: Math.round(s.top), desplazo: window.scrollY > 100 };
})()`);
console.log("clic en 'Línea Melipona':", JSON.stringify(salto));
ws.close();
