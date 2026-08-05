// Verifica el bucle de video de la seccion de origen por CDP.
//
//   node tools/medir-video-origen.mjs [url]
//
// Comprueba, a cinco anchos, que el video arranca solo al entrar en pantalla,
// que avanza de verdad (no basta con `paused:false`: un elemento roto tambien
// dice eso), que el boton de pausa manda y que se para al salir de pantalla.
// Y de paso, que nada de esto mete desborde horizontal.
//
// Con `prefers-reduced-motion` **tambien tiene que arrancar solo**: el cliente
// pidio que no hiciera falta pulsar nada, y hubo una version que ahi se quedaba
// en el poster. Lo que se conserva con reduce, y lo que de verdad pide el
// criterio 2.2.2 de WCAG, es el boton de pausa.
//
// Node 22: fetch y WebSocket son globales. Chrome tiene que estar abierto con
// --remote-debugging-port=9222 y --autoplay-policy=no-user-gesture-required,
// que en headless hace falta para que el autoplay mudo no quede bloqueado.
import { writeFileSync } from "node:fs";

const URL_BASE = process.argv[2] ?? "http://127.0.0.1:3100/";
const PORT = 9222;
const ANCHOS = [390, 768, 1280, 1440, 1920];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
  }
};
const send = (method, params = {}) =>
  new Promise((res) => {
    const myId = ++id;
    pending.set(myId, res);
    ws.send(JSON.stringify({ id: myId, method, params }));
  });

const evaluar = async (expression) => {
  const { result } = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return result.value;
};

await send("Page.enable");
await send("Network.enable");
// El perfil persistente sirve archivos viejos y la medicion sale identica
// despues de un cambio real. Ya paso en este proyecto.
await send("Network.setCacheDisabled", { cacheDisabled: true });

const SONDA = `(() => {
  const v = document.querySelector('.origen video');
  if (!v) return { existe: false };
  return {
    existe: true,
    pausado: v.paused,
    t: +v.currentTime.toFixed(2),
    ancho: v.videoWidth,
    alto: v.videoHeight,
    listo: v.readyState,
    caja: (({width, height}) => ({ w: Math.round(width), h: Math.round(height) }))(v.getBoundingClientRect()),
  };
})()`;

const IR_A_ORIGEN = `(() => {
  document.querySelector('.origen').scrollIntoView({ block: 'center' });
  return true;
})()`;

const filas = [];
for (const ancho of ANCHOS) {
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  await send("Emulation.setDeviceMetricsOverride", {
    width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 700,
  });
  await send("Page.navigate", { url: URL_BASE });
  await sleep(2500);

  // Antes de llegar a la seccion no deberia estar reproduciendose.
  const antes = await evaluar(SONDA);

  await evaluar(IR_A_ORIGEN);
  await sleep(1800);
  const dentro1 = await evaluar(SONDA);
  await sleep(1200);
  const dentro2 = await evaluar(SONDA);

  // El boton de pausa manda.
  await evaluar(`document.querySelector('.origen figure button').click(), true`);
  await sleep(700);
  const trasPausa = await evaluar(SONDA);

  // Y al volver a pulsarlo, sigue.
  await evaluar(`document.querySelector('.origen figure button').click(), true`);
  await sleep(900);
  const trasSeguir = await evaluar(SONDA);

  // Al salir de pantalla se para.
  await evaluar(`window.scrollTo(0, 0), true`);
  await sleep(1200);
  const fuera = await evaluar(SONDA);

  const desborde = await evaluar(
    `document.documentElement.scrollWidth - document.documentElement.clientWidth`,
  );

  filas.push({
    ancho,
    caja: `${dentro1.caja.w}x${dentro1.caja.h}`,
    fuente: `${dentro1.ancho}x${dentro1.alto}`,
    antesDeLlegar: antes.pausado ? "parado" : "REPRODUCIENDO",
    avanza: dentro2.t > dentro1.t ? `si (${dentro1.t} -> ${dentro2.t})` : `NO (${dentro1.t} -> ${dentro2.t})`,
    pausaManual: trasPausa.pausado ? "para" : "NO PARA",
    reanuda: !trasSeguir.pausado ? "sigue" : "NO SIGUE",
    fueraDePantalla: fuera.pausado ? "para" : "NO PARA",
    desborde,
  });
}

// Reduced motion: tiene que arrancar solo igualmente, y el boton seguir parandolo.
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: URL_BASE });
await sleep(2500);
await evaluar(IR_A_ORIGEN);
await sleep(1800);
const conReduce = await evaluar(SONDA);
await sleep(1200);
const conReduceDespues = await evaluar(SONDA);
await evaluar(`document.querySelector('.origen figure button').click(), true`);
await sleep(900);
const reduceTrasPulsar = await evaluar(SONDA);

console.table(filas);
console.log("\nprefers-reduced-motion: reduce");
console.log("  arranca solo:      ", !conReduce.pausado ? "si (correcto)" : "NO (mal)");
console.log(
  "  avanza:            ",
  conReduceDespues.t > conReduce.t ? `si (${conReduce.t} -> ${conReduceDespues.t})` : `NO (${conReduce.t} -> ${conReduceDespues.t})`,
);
console.log("  el boton lo para:  ", reduceTrasPulsar.pausado ? "si (correcto)" : "NO (mal)");

const salida = { url: URL_BASE, filas, reduce: { conReduce, conReduceDespues, reduceTrasPulsar } };
writeFileSync(new URL("../.medicion-video.json", import.meta.url), JSON.stringify(salida, null, 2));
ws.close();
