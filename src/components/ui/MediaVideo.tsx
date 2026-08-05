"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type Ref } from "react";

type MediaVideoProps = {
  src: string;
  poster: string;
  /** Qué se ve en el plano. Va al `aria-label` del vídeo y al del botón. */
  label: string;
  aspectClassName: string;
  className?: string;
  radiusClassName?: string;
  ref?: Ref<HTMLElement>;
  [dataAttr: `data-${string}`]: string | boolean | undefined;
};

/**
 * Marco de vídeo en bucle, hermano de `MediaFrame`: mismo `<figure>`, mismo
 * panel de marca detrás por si el archivo falla.
 *
 * El bucle es mudo y no lleva pista de audio, así que no hay nada que silenciar
 * ni ningún control de volumen que ofrecer. Lo que sí lleva es **un botón de
 * pausa**: son casi diez segundos de movimiento automático, y sin una forma de
 * detenerlo esto incumple el criterio 2.2.2 de WCAG. El botón es discreto pero
 * alcanzable con teclado, no solo al pasar el cursor.
 *
 * **Arranca solo, sin que nadie pulse nada.** Lo pidió el cliente
 * explícitamente. Hubo una versión que con `prefers-reduced-motion` se quedaba
 * en el póster esperando al botón, y se retiró: en el Windows de este equipo
 * `reduce` viene puesto de fábrica sin que nadie lo elija (handoff del proyecto
 * original, §6 gotcha 8), así que en la práctica el vídeo no se reproducía casi
 * nunca. Ahora el vídeo sigue el mismo criterio que el resto de la página —
 * moverse siempre— y quien no quiera movimiento tiene el botón de pausa a mano,
 * que es lo que el criterio 2.2.2 de WCAG exige de verdad: **una forma de
 * pararlo**, no que no empiece.
 *
 * **Solo se reproduce mientras se ve.** Un `IntersectionObserver` lo arranca al
 * acercarse y lo para al alejarse: la sección está bien abajo de la página y no
 * tiene sentido gastar batería decodificando algo que nadie mira. El margen de
 * 250 px es lo que hace que la reproducción se sienta inmediata: para cuando la
 * sección entra en pantalla, el vídeo ya lleva un momento cargando y corriendo,
 * en vez de empezar a buscar datos justo al asomarse.
 *
 * Si el usuario pausa a mano, eso manda y volver a la sección no lo reanuda.
 */
export default function MediaVideo({
  src,
  poster,
  label,
  aspectClassName,
  className = "",
  radiusClassName = "rounded-2xl",
  ref,
  ...dataAttrs
}: MediaVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [roto, setRoto] = useState(false);
  const [enMarcha, setEnMarcha] = useState(false);
  /** Una pausa a mano manda sobre el observador: al volver no se reanuda solo. */
  const pausadoAMano = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // React no siempre emite el atributo `muted` en el HTML del servidor, y sin
    // él la política de autoplay bloquea la reproducción. Se fija a mano.
    video.muted = true;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (pausadoAMano.current) return;
        if (entrada.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      // Se adelanta 250 px a la sección para que al llegar ya esté en marcha.
      { rootMargin: "250px 0px", threshold: 0 },
    );
    observador.observe(video);
    return () => observador.disconnect();
  }, []);

  function alternar() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      pausadoAMano.current = false;
      video.play().catch(() => {});
    } else {
      pausadoAMano.current = true;
      video.pause();
    }
  }

  return (
    <figure
      ref={ref}
      {...dataAttrs}
      className={`relative overflow-hidden bg-arena ${radiusClassName} ${aspectClassName} ${className}`}
    >
      {/* Mismo panel de «foto por venir» que MediaFrame: solo asoma si el
          archivo falla, y entonces la sección no se queda con un hueco plano. */}
      <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
        <Image
          src="/images/logo/marca-montana-oscuro.png"
          alt=""
          width={200}
          height={200}
          className="h-auto w-[34%] max-w-[180px] opacity-10"
        />
      </span>

      {!roto && (
        <>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            aria-label={label}
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setEnMarcha(true)}
            onPause={() => setEnMarcha(false)}
            onError={() => setRoto(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <button
            type="button"
            onClick={alternar}
            aria-label={enMarcha ? `Pausar el vídeo: ${label}` : `Reproducir el vídeo: ${label}`}
            className="absolute bottom-3 right-3 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-cafe-profundo/55 text-hueso-claro backdrop-blur-sm transition-colors hover:bg-cafe-profundo/75 focus-visible:bg-cafe-profundo/75"
          >
            {enMarcha ? (
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="currentColor">
                <rect x="1.5" y="1" width="3.5" height="12" rx="1" />
                <rect x="9" y="1" width="3.5" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="currentColor">
                <path d="M3 1.6a1 1 0 0 1 1.52-.85l8 5.4a1 1 0 0 1 0 1.7l-8 5.4A1 1 0 0 1 3 12.4z" />
              </svg>
            )}
          </button>
        </>
      )}
    </figure>
  );
}
