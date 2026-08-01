import type { ElementType, HTMLAttributes, ReactNode } from "react";

type EyebrowProps = HTMLAttributes<HTMLParagraphElement> & {
  /** `onNiebla`: café profundo (8.48:1) — para texto sobre el fondo azul
   * bruma del hero y de la sección Origen. `--tierra`, el tono por defecto,
   * cae a 3.95:1 sobre ese azul y no llega al mínimo AA de 4.5:1. */
  variant?: "default" | "light" | "club" | "onNiebla";
  children: ReactNode;
};

export function Eyebrow({ variant = "default", className = "", children, ...props }: EyebrowProps) {
  const variantClass =
    variant === "light"
      ? "text-niebla"
      : variant === "club"
        ? "text-club-gris tracking-[0.2em] text-sm"
        : variant === "onNiebla"
          ? "text-cafe-profundo"
          : "text-tierra";

  return (
    <p
      className={`font-editorial mb-4 text-[15px] tracking-[0.16em] uppercase italic ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

type H2RustProps = HTMLAttributes<HTMLHeadingElement> & {
  light?: boolean;
  wide?: boolean;
  children: ReactNode;
};

export function H2Rust({ light, wide, className = "", children, ...props }: H2RustProps) {
  return (
    <h2
      className={`font-titulo mb-5 text-[clamp(32px,5.2vw,52px)] leading-[1.08] ${wide ? "" : "max-w-[20ch]"} ${
        light ? "text-hueso" : "text-cafe-profundo"
      } ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
}

type BodyProps = HTMLAttributes<HTMLParagraphElement> & {
  as?: ElementType;
  variant?: "default" | "light" | "onNiebla";
  intro?: boolean;
  /** Opcional: los párrafos de Origen usan `dangerouslySetInnerHTML` (llevan
   * `<strong>` para los nombres de finca) en vez de `children`. */
  children?: ReactNode;
};

export function Body({ as: Tag = "p", variant = "default", intro, className = "", children, ...props }: BodyProps) {
  const variantClass = variant === "light" ? "text-piedra-calida" : variant === "onNiebla" ? "text-cafe-profundo" : "text-tierra";

  return (
    <Tag
      className={`text-[17px] leading-[1.8] ${intro ? "mb-12 max-w-[60ch]" : "mb-5"} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
