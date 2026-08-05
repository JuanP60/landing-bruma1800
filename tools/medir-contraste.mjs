// Contraste WCAG real del texto de una seccion, midiendo lo que hay detras.
//
//   node tools/medir-contraste.mjs [seccion] [url]
//
//   seccion: club | calidad | todas   (por defecto: todas)
//
// No mide cajas ni supone el color de fondo: tapa el texto, captura el trozo
// exacto de cada linea y busca el **peor pixel** que hay detras. Es el criterio
// de `contraste-origen.py` del proyecto estatico, y la razon es la de siempre:
// un fondo no siempre es plano — una nube pasa por encima de unas letras y no
// de otras—, asi que el promedio miente y el minimo no.
//
// El color de cada linea se lee con `getComputedStyle`, nunca se supone: es lo
// que hace que la medicion siga valiendo despues de un cambio de paleta.
//
// Las secciones con fondo en movimiento se muestrean varias veces a lo largo
// del ciclo; con una sola captura se puede tener suerte. Las de color plano
// solo necesitan una.
import { writeFileSync } from "node:fs";

const QUE = process.argv[2] ?? "todas";
const URL_BASE = process.argv[3] ?? "http://127.0.0.1:3100/";

// Minimos: 4.5:1 para texto normal; 3:1 a partir de 24px (o 18.66px en negrita).
// Ojo con los nth-of-type: el Eyebrow tambien es un <p>, asi que ocupa la
// primera posicion y todo lo demas va corrido.
const SECCIONES = {
  club: {
    selector: ".club",
    // Las nubes derivan sin parar: hay que muestrear a lo largo del ciclo.
    muestras: 9,
    esperaEntre: 4000,
    lineas: [
      { sel: ".club [data-reveal-club] p:nth-of-type(1)", nombre: "eyebrow", minimo: 4.5 },
      { sel: ".club [data-reveal-club] h2", nombre: "titular", minimo: 3 },
      { sel: ".club [data-reveal-club] p:nth-of-type(2)", nombre: "numero 1800", minimo: 4.5 },
      { sel: ".club [data-reveal-club] p:nth-of-type(3)", nombre: "parrafo", minimo: 4.5 },
      { sel: ".club [data-reveal-club] p:nth-of-type(4)", nombre: "nota italica", minimo: 4.5 },
    ],
  },
  calidad: {
    selector: ".calidad",
    // Verde montaña plano: no hay nada detras que se mueva.
    muestras: 1,
    esperaEntre: 0,
    lineas: [
      { sel: ".calidad [data-reveal-group] p:nth-of-type(1)", nombre: "eyebrow", minimo: 4.5 },
      { sel: ".calidad h2", nombre: "titular", minimo: 3 },
      { sel: ".calidad [data-reveal-group] p:nth-of-type(2)", nombre: "intro", minimo: 4.5 },
      { sel: ".calidad article p[data-count]", nombre: "puntaje", minimo: 3 },
      { sel: ".calidad article p:nth-of-type(2)", nombre: "protocolo SCA", minimo: 4.5 },
      { sel: ".calidad article p:nth-of-type(3)", nombre: "lugar", minimo: 4.5 },
      { sel: ".calidad article p:nth-of-type(4)", nombre: "quien", minimo: 4.5 },
    ],
  },
};
// Los botones quedan siempre fuera: son opacos y se pintan encima de todo, asi
// que nada de lo que haya detras puede tocarlos. Medirlos daria un falso
// negativo — el gotcha 13 del proyecto estatico, donde las tarjetas opacas
// "chocaban" con la rama de cafeto sin que hubiera nada que arreglar.

const ANCHOS = [390, 1440];
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
const evaluar = async (expression) =>
  (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;

const canal = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// Decodifica el PNG con el propio Chrome, para no meter una dependencia solo
// por leer unos pixeles. Devuelve una malla densa, no todos: para buscar el
// peor pixel de un fondo continuo sobra.
async function muestrear(buf) {
  const b64 = buf.toString("base64");
  return await evaluar(`(async () => {
    const img = new Image();
    img.src = 'data:image/png;base64,${b64}';
    await img.decode();
    const c = new OffscreenCanvas(img.width, img.height);
    const cx = c.getContext('2d');
    cx.drawImage(img, 0, 0);
    const d = cx.getImageData(0, 0, img.width, img.height).data;
    const out = [];
    const paso = Math.max(1, Math.floor(img.width / 120));
    for (let y = 0; y < img.height; y += 2)
      for (let x = 0; x < img.width; x += paso) {
        const i = (y * img.width + x) * 4;
        out.push([d[i], d[i+1], d[i+2]]);
      }
    return out;
  })()`);
}

await send("Page.enable");
await send("Network.enable");
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });

const nombres = QUE === "todas" ? Object.keys(SECCIONES) : [QUE];
const informe = [];

for (const nombre of nombres) {
  const cfg = SECCIONES[nombre];
  if (!cfg) { console.error(`Seccion desconocida: ${nombre}`); continue; }

  for (const ancho of ANCHOS) {
    await send("Emulation.setDeviceMetricsOverride", { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 700 });
    await send("Page.navigate", { url: URL_BASE });
    await sleep(2600);
    await evaluar(`document.querySelector('${cfg.selector}').scrollIntoView({block:'center'}), true`);
    await sleep(1500);

    const lineas = await evaluar(`(() => {
      return ${JSON.stringify(cfg.lineas)}.map(d => {
        const el = document.querySelector(d.sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const c = getComputedStyle(el).color.match(/[\\d.]+/g).slice(0,3).map(Number);
        // Coordenadas de PAGINA: es lo que espera el clip de captureScreenshot.
        // Con las del viewport la captura sale de otra parte del sitio y la
        // medicion da numeros plausibles pero falsos, sin avisar de nada.
        return { nombre: d.nombre, minimo: d.minimo, color: c,
                 caja: { x: Math.round(r.x + scrollX), y: Math.round(r.y + scrollY),
                         w: Math.round(r.width), h: Math.round(r.height) } };
      }).filter(Boolean);
    })()`);

    await evaluar(`document.querySelectorAll('${cfg.selector} p, ${cfg.selector} h2').forEach(e => e.style.visibility='hidden'), true`);

    const peor = new Map(lineas.map((l) => [l.nombre, Infinity]));
    for (let m = 0; m < cfg.muestras; m++) {
      for (const l of lineas) {
        if (l.caja.w <= 0 || l.caja.h <= 0) continue;
        const { data } = await send("Page.captureScreenshot", {
          format: "png",
          captureBeyondViewport: true,
          clip: { x: l.caja.x, y: Math.max(0, l.caja.y), width: l.caja.w, height: l.caja.h, scale: 1 },
        });
        for (const p of await muestrear(Buffer.from(data, "base64"))) {
          const c = contraste(l.color, p);
          if (c < peor.get(l.nombre)) peor.set(l.nombre, c);
        }
      }
      if (cfg.esperaEntre) await sleep(cfg.esperaEntre);
    }

    for (const l of lineas) {
      const c = peor.get(l.nombre);
      informe.push({ seccion: nombre, ancho, linea: l.nombre, minimo: l.minimo,
                     peor: +c.toFixed(2), veredicto: c >= l.minimo ? "ok" : "NO PASA" });
    }
  }
}

console.table(informe);
const fallos = informe.filter((f) => f.veredicto !== "ok");
console.log(fallos.length ? `\n${fallos.length} linea(s) por debajo del minimo` : "\nTodas las lineas pasan");
writeFileSync(new URL("../.medicion-contraste.json", import.meta.url), JSON.stringify(informe, null, 2));
ws.close();
