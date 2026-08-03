"use client";

import Image from "next/image";
import { useState, type Ref } from "react";

type MediaFrameProps = {
  src: string;
  alt: string;
  aspectClassName: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  radiusClassName?: string;
  /** `cover` para fotografía; `contain` para los renders de producto, que son
   *  PNG recortados a su alfa y hay que dejarlos respirar dentro del marco. */
  fit?: "cover" | "contain";
  /** Paleta del estado vacío. `club` para la sección Club 1800, que tiene
   *  paleta propia y no se mezcla con la principal. */
  vacio?: "calido" | "club";
  ref?: Ref<HTMLElement>;
  [dataAttr: `data-${string}`]: string | boolean | undefined;
};

/**
 * Marco de imagen con dos modos.
 *
 * **Render de producto** (`fit="contain"`): el mockup transparente centrado
 * sobre un panel de marca, con la misma sombra propia que usan las piezas del
 * hero. No necesita estado vacío porque el archivo siempre existe.
 *
 * **Fotografía** (`fit="cover"`, por defecto): dos de estas fotos todavía no
 * existen. Antes, al fallar la carga, quedaba un rectángulo plano de
 * `--gris-calido` que se leía como imagen rota. Ahora el hueco es un panel
 * compuesto con la marca de montaña al 10% — se lee como «foto por venir», que
 * es lo que es. En cuanto el archivo aparezca en `public/images/pending/`,
 * la foto tapa el panel y esto renderiza solo, sin tocar código.
 *
 * Acepta `ref` directamente como prop (React 19, sin forwardRef) para que
 * los hooks de reveal (`useReveal`) puedan engancharse al `<figure>`.
 */
export default function MediaFrame({
  src,
  alt,
  aspectClassName,
  sizes = "100vw",
  priority,
  className = "",
  radiusClassName = "rounded-2xl",
  fit = "cover",
  vacio = "calido",
  ref,
  ...dataAttrs
}: MediaFrameProps) {
  const [roto, setRoto] = useState(false);
  const esRender = fit === "contain";

  const fondo = esRender
    ? "bg-piedra-calida"
    : vacio === "club"
      ? "bg-club-negro"
      : "bg-arena";

  return (
    <figure
      ref={ref}
      {...dataAttrs}
      className={`relative overflow-hidden ${fondo} ${radiusClassName} ${aspectClassName} ${className}`}
    >
      {/* Estado vacío: solo se ve si la foto falla o aún no existe. Va debajo,
          así que en cuanto el archivo real aparezca queda tapado sin más. */}
      {!esRender && (
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
          <Image
            src={vacio === "club" ? "/images/logo/marca-montana-claro.png" : "/images/logo/marca-montana-oscuro.png"}
            alt=""
            width={200}
            height={200}
            className="h-auto w-[34%] max-w-[180px] opacity-10"
          />
        </span>
      )}

      {!roto && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={
            esRender
              ? "object-contain p-[12%] drop-shadow-[0_18px_22px_rgba(18,9,4,0.28)]"
              : "object-cover"
          }
          onError={() => setRoto(true)}
        />
      )}
    </figure>
  );
}
