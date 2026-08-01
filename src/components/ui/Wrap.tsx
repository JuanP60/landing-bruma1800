import type { ElementType, ReactNode, Ref } from "react";

type WrapProps = {
  as?: ElementType;
  /** El CTA final angosta el wrap a 820px para centrar su copy — mismo
   * truco que el sitio original (dos clases en el mismo nodo, la más
   * específica gana). Aquí se resuelve como prop para no depender del
   * orden en que Tailwind emite las utilidades `max-w-*`. */
  narrow?: boolean;
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
  [dataAttr: `data-${string}`]: unknown;
};

/** Contenedor centrado de 1180px (u 820px con `narrow`), con el mismo
 * padding responsivo del sitio original (24px hasta 720px, 40px desde ahí). */
export default function Wrap({ as: Tag = "div", narrow, children, className = "", ref, ...dataAttrs }: WrapProps) {
  return (
    <Tag ref={ref} {...dataAttrs} className={`mx-auto ${narrow ? "max-w-[820px]" : "max-w-[1180px]"} px-6 sm:px-10 ${className}`}>
      {children}
    </Tag>
  );
}
