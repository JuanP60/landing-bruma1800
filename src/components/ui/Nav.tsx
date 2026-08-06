"use client";

import { useEffect, useRef, useState } from "react";
import { menu } from "@/lib/content";

/**
 * Menú del header. **Una sola lista de enlaces**, no dos: en escritorio se
 * pinta como una fila y por debajo de 900px se pliega tras un botón, todo con
 * CSS. Duplicar el `<ul>` para tener una versión de escritorio y otra de móvil
 * habría dejado diez enlaces en el documento, y un lector de pantalla los lee
 * todos aunque la mitad estén ocultos con `display:none`.
 *
 * Son anclas dentro de la misma página, no rutas: el desplazamiento suave ya lo
 * da `scroll-behavior: smooth` en globals.css, que además se apaga solo con
 * `prefers-reduced-motion`. No hace falta JS para eso.
 *
 * Accesibilidad, con el mismo criterio que el widget del chat (auditoría WIG,
 * §4 del handoff): `aria-expanded` y `aria-controls` en el botón, cierre con
 * Escape y foco de vuelta al botón, para no dejar a quien navega con teclado
 * perdido al final del documento.
 */
export default function Nav() {
  const [abierto, setAbierto] = useState(false);
  const botonRef = useRef<HTMLButtonElement>(null);

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
            <a
              href={item.href}
              className="nav__enlace"
              /* La pestaña de inicio es la ventana actual. Se anuncia como tal
                 y no se deja solo al color, que un lector de pantalla no ve. */
              aria-current={"actual" in item && item.actual ? "page" : undefined}
              onClick={() => setAbierto(false)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
