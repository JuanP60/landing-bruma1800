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
  ref?: Ref<HTMLElement>;
  [dataAttr: `data-${string}`]: string | boolean | undefined;
};

/**
 * Marco para fotografía de producto/finca. Cinco de estas imágenes todavía
 * no existen (ver README del handoff original) — `onError` oculta el <img>
 * roto y deja el fondo cálido de respaldo visible, igual que hacía
 * `initMissingPhotos` en el sitio estático. En cuanto el archivo real
 * aparezca en `public/images/pending/...`, esto renderiza solo, sin tocar
 * código.
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
  ref,
  ...dataAttrs
}: MediaFrameProps) {
  const [broken, setBroken] = useState(false);

  return (
    <figure
      ref={ref}
      {...dataAttrs}
      className={`relative overflow-hidden bg-gris-calido ${radiusClassName} ${aspectClassName} ${className}`}
    >
      {!broken && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setBroken(true)}
        />
      )}
    </figure>
  );
}
