// Verifica la inclinacion 3D de la tarjeta del Club por CDP.
//
//   node tools/medir-tilt-club.mjs [url]
//
// Comprueba cinco cosas, midiendo la matriz de transformacion real y no lo que
// dice el CSS:
//
//   1. En reposo la tarjeta no esta inclinada.
//   2. El cursor la inclina, y hacia el lado que toca.
//   3. El angulo nunca pasa del tope declarado (--tilt).
//   4. Al salir el cursor vuelve sola a cero.
//   5. `touchmove` cancela el scroll de la pagina, no lo deja pasar.
//
// La rotacion se saca descomponiendo la matriz 3D calculada. No vale leer el
// `transform` del CSS: ahi pone `rotateX(calc(...))`, no los grados aplicados.
import { writeFileSync } from "node:fs";

const URL_BASE = process.argv[2] ?? "http://127.0.0.1:3100/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const targets = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
};
const send = (method, params = {}) =>
  new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluar = async (e) => (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result.value;

// Angulos en grados a partir de la matriz calculada. La flotacion mete
// translate y scale, que no afectan a la parte rotacional que se lee aqui.
const SONDA = `(() => {
  const f = document.querySelector('.tarjeta-club-3d');
  const m = new DOMMatrix(getComputedStyle(f).transform);
  const gr = (r) => +(r * 180 / Math.PI).toFixed(2);
  return {
    rotY: gr(Math.asin(Math.max(-1, Math.min(1, -m.m13)))),
    rotX: gr(Math.atan2(m.m23, m.m33)),
    tx: getComputedStyle(f).getPropertyValue('--tx').trim() || '0',
    ty: getComputedStyle(f).getPropertyValue('--ty').trim() || '0',
    tope: getComputedStyle(f).getPropertyValue('--tilt').trim(),
    inclinando: f.classList.contains('esta-inclinandose'),
    transicion: getComputedStyle(f).transitionDuration,
  };
})()`;

await send("Page.enable");
await send("Network.enable");
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: URL_BASE });
await sleep(2600);
await evaluar(`document.querySelector('.club').scrollIntoView({block:'center'}), true`);
await sleep(1800);

const caja = await evaluar(`(() => {
  const r = document.querySelector('.tarjeta-club-3d').getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
})()`);

const raton = async (x, y) => {
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "none" });
  await sleep(180);
};

const pasos = [];
const reposo = await evaluar(SONDA);
pasos.push({ momento: "en reposo", ...reposo });

// Cerca de las esquinas, pero no pegado al filo: la tarjeta flota 30 px sin
// parar, asi que un punto al 98% del alto puede quedarse fuera de la caja entre
// que se mide y que se manda el evento, y entonces salta `mouseleave` y la
// medicion sale a cero. Pasa de verdad: la primera version del script lo hacia.
const esquinas = [
  ["cerca sup-izq", caja.x + caja.w * 0.12, caja.y + caja.h * 0.18],
  ["cerca sup-der", caja.x + caja.w * 0.88, caja.y + caja.h * 0.18],
  ["cerca inf-der", caja.x + caja.w * 0.88, caja.y + caja.h * 0.82],
  ["cerca inf-izq", caja.x + caja.w * 0.12, caja.y + caja.h * 0.82],
  ["centro exacto", caja.x + caja.w / 2, caja.y + caja.h / 2],
];
for (const [nombre, x, y] of esquinas) {
  await raton(x, y);
  pasos.push({ momento: nombre, ...(await evaluar(SONDA)) });
}

// Fuera de la tarjeta: dispara mouseleave y tiene que volver sola.
await raton(caja.x - 60, caja.y - 60);
await sleep(1100);
pasos.push({ momento: "tras salir", ...(await evaluar(SONDA)) });

// touchmove: lo que importa es que la pagina no se desplace.
const scrollTouch = await evaluar(`(async () => {
  const f = document.querySelector('.tarjeta-club-3d');
  const r = f.getBoundingClientRect();
  const antes = window.scrollY;
  let cancelado = null;
  const punto = (dy) => new Touch({ identifier: 1, target: f,
    clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 + dy });
  f.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true, touches: [punto(0)] }));
  for (const dy of [-40, -80, -120]) {
    const ev = new TouchEvent('touchmove', { bubbles: true, cancelable: true, touches: [punto(dy)] });
    f.dispatchEvent(ev);
    cancelado = ev.defaultPrevented;
    await new Promise(r => requestAnimationFrame(r));
  }
  await new Promise(r => setTimeout(r, 200));
  const durante = getComputedStyle(f).getPropertyValue('--ty').trim();
  f.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true, touches: [] }));
  await new Promise(r => setTimeout(r, 800));
  return { cancelado, desplazoLaPagina: window.scrollY !== antes,
           tyDuranteElToque: durante, tyTrasSoltar: getComputedStyle(f).getPropertyValue('--ty').trim() };
})()`);

console.table(pasos);
console.log("\ntoque:");
console.log("  touchmove cancelado:      ", scrollTouch.cancelado ? "si (no arrastra la pagina)" : "NO (arrastraria)");
console.log("  la pagina se desplazo:    ", scrollTouch.desplazoLaPagina ? "SI (mal)" : "no (correcto)");
console.log("  --ty durante el toque:    ", scrollTouch.tyDuranteElToque);
console.log("  --ty tras soltar:         ", scrollTouch.tyTrasSoltar);

const tope = parseFloat(pasos[0].tope);
const excedidos = pasos.filter((p) => Math.abs(p.rotX) > tope + 0.05 || Math.abs(p.rotY) > tope + 0.05);
console.log(`\ntope declarado ${tope} grados -> ${excedidos.length ? "SE PASA en " + excedidos.length : "nunca se pasa"}`);
writeFileSync(new URL("../.medicion-tilt.json", import.meta.url), JSON.stringify({ pasos, scrollTouch }, null, 2));
ws.close();
