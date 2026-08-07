import Wrap from "@/components/ui/Wrap";

type PendienteProps = {
  titulo: string;
  texto: string;
};

/**
 * Hueco de contenido declarado. Marca lo que falta **por escrito**, en vez de
 * rellenarlo con texto inventado o de dejar un vacío que parezca un olvido.
 *
 * Se ve a propósito y no se disimula: el borde discontinuo y la etiqueta dicen
 * que eso no es contenido final. Es la misma idea que el panel de «foto por
 * venir» que tuvo `MediaFrame` — un hueco diseñado se lee como algo que va a
 * llegar; un hueco sin diseñar se lee como algo roto.
 *
 * **Es un bloqueo de despliegue.** Ninguna de estas cajas debe salir a
 * producción: o el cliente aporta el texto, o la caja se retira junto con la
 * sección que la contiene. Está anotado en `handoff.md` §6.
 */
export default function Pendiente({ titulo, texto }: PendienteProps) {
  return (
    <Wrap>
      <div className="rounded-2xl border-2 border-dashed border-cafe-profundo/28 bg-hueso-claro/60 p-8 md:p-10">
        <p className="font-editorial mb-3 text-[13px] tracking-[0.18em] text-verde-hoja uppercase italic">
          Pendiente de contenido
        </p>
        <h3 className="font-titulo mb-3 text-[26px] text-cafe-profundo">{titulo}</h3>
        <p className="max-w-[62ch] text-[16px] leading-[1.75] text-tierra">{texto}</p>
      </div>
    </Wrap>
  );
}
