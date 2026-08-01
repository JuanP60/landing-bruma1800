import type { AnchorHTMLAttributes } from "react";

type Variant = "primary" | "ghost-light" | "ghost-dark" | "club";

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  block?: boolean;
  external?: boolean;
};

/**
 * Todos los CTA de la landing son enlaces (WhatsApp, Instagram, anclas), no
 * botones de formulario — por eso es un `<a>`, nunca un `<button>`.
 * `.hero .btn--ghost-light` cambia de color automáticamente dentro del
 * hero (ver globals.css): no hace falta una prop de contexto aquí.
 */
export default function Button({ variant = "primary", block, external, className = "", children, ...props }: ButtonProps) {
  const variantClass = `btn--${variant}`;
  const externalProps = external ? { target: "_blank", rel: "noopener" } : {};

  return (
    <a className={`btn ${variantClass} ${block ? "btn--block" : ""} ${className}`} {...externalProps} {...props}>
      {children}
    </a>
  );
}
