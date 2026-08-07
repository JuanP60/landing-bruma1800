"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { menu } from "@/lib/content";

/**
 * Menú del header. **Una sola lista de enlaces**, no dos: en escritorio se
 * pinta como una fila y por debajo de 900px se pliega tras un botón, todo con
 * CSS. Duplicar el `<ul>` para tener una versión de escritorio y otra de móvil
 * habría dejado diez enlaces en el documento, y un lector de pantalla los lee
 * todos aunque la mitad estén ocultos con `display:none`.
 *
 * Cada pestaña es una **página propia**, no un ancla: el cliente pidió que
 * llevaran a una vista aparte con más detalle en vez de desplazar dentro de la
 * portada. Van con `next/link`, así que la navegación es del lado del cliente y
 * el botón de atrás del navegador funciona.
 *
 * La pestaña activa se decide con `usePathname` y no con una marca fija en los
 * datos: así sigue siendo correcta se entre por donde se entre, incluso si
 * alguien abre `/club` directamente desde un enlace.
 *
 * Accesibilidad, con el mismo criterio que el widget del chat (auditoría WIG,
 * §4 del handoff): `aria-expanded` y `aria-controls` en el botón, cierre con
 * Escape y foco de vuelta al botón, para no dejar a quien navega con teclado
 * perdido al final del documento.
 */
export default function Nav() {
  const [abierto, setAbierto] = useState(false);
  const botonRef = useRef<HTMLButtonElement>(null);
  const ruta = usePathname();

  useEffect(() => {
    if (!abierto) return;
    const alPulsarTecla = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setAbierto(false);
      botonRef.current?.focus();
    };
    document.addEventListener("keydown", alPulsarTecla);
    return () => document.removeEventListener("keydown", alPulsarTecla);
  }, [abierto]);

  return (
    <nav className="nav" aria-label="Secciones de la página">
      <button
        ref={botonRef}
        type="button"
        className="nav__boton"
        aria-expanded={abierto}
        aria-controls="nav-lista"
        onClick={() => setAbierto((v) => !v)}
      >
        {abierto ? "Cerrar" : "Menú"}
        <span className="nav__rayas" data-abierto={abierto} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      <ul id="nav-lista" className="nav__lista" data-abierto={abierto}>
        {menu.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="nav__enlace"
              /* La página en la que se está se anuncia como tal, y no se deja
                 solo al color, que un lector de pantalla no ve. */
              aria-current={ruta === item.href ? "page" : undefined}
              onClick={() => setAbierto(false)}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
