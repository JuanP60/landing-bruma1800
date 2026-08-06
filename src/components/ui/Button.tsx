"use client";

import Image from "next/image";
import { useState, type AnchorHTMLAttributes } from "react";

type Variant = "primary" | "ghost-light" | "ghost-dark" | "club";

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  block?: boolean;
  external?: boolean;
  /** Saca la abeja de acuarela al pasar el cursor o al pulsar. Decorativa:
   *  la misma de la sección de origen, no un icono nuevo. */
  abeja?: boolean;
};

/**
 * Todos los CTA de la landing son enlaces (WhatsApp, Instagram, anclas), no
 * botones de formulario — por eso es un `<a>`, nunca un `<button>`.
 * `.hero .btn--ghost-light` cambia de color automáticamente dentro del
 * hero (ver globals.css): no hace falta una prop de contexto aquí.
 *
 * El estado de pulsado se lleva en React y no con `:active` a secas porque en
 * iOS `:active` no se aplica de forma fiable a un `<a>` si no hay un listener
 * de toque de por medio. Los eventos de puntero cubren ratón y dedo con el
 * mismo código, así que no hay dos caminos que mantener.
 */
export default function Button({
  variant = "primary",
  block,
  external,
  abeja,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const [pulsado, setPulsado] = useState(false);
  const variantClass = `btn--${variant}`;
  const externalProps = external ? { target: "_blank", rel: "noopener" } : {};
  const abejaProps = abeja
    ? {
        onPointerDown: () => setPulsado(true),
        onPointerUp: () => setPulsado(false),
        onPointerCancel: () => setPulsado(false),
        onPointerLeave: () => setPulsado(false),
      }
    : {};

  return (
    <a
      className={`btn ${variantClass} ${block ? "btn--block" : ""} ${abeja ? "btn--abeja" : ""} ${
        pulsado ? "esta-pulsado" : ""
      } ${className}`}
      {...externalProps}
      {...abejaProps}
      {...props}
    >
      {children}
      {abeja && (
        <span className="btn__abeja" aria-hidden="true">
          <span className="btn__abeja-aleteo">
            <Image src="/images/decor/abeja.webp" alt="" width={220} height={170} />
          </span>
        </span>
      )}
    </a>
  );
}
