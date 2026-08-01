/**
 * Tres capas de nubes reales (nube-1/2/3.webp) en `background-image`, no
 * `<img>`: se repiten en mosaico y derivan con `translate`, lo que pide un
 * fondo, no un elemento con dimensiones propias. Ver `.bruma__capa--*` en
 * globals.css para mosaico/opacidad/velocidad de cada capa.
 *
 * `back` va antes del contenido (capas lejos + media); `front` va después,
 * con más z-index, y pasa por delante de texto y mockups — así lo pide el
 * comparativo del cliente.
 */
export function BrumaBack() {
  return (
    <div className="bruma" aria-hidden="true">
      <span className="bruma__capa bruma__capa--lejos" />
      <span className="bruma__capa bruma__capa--media" />
    </div>
  );
}

export function BrumaFront() {
  return (
    <div className="bruma bruma--frente" aria-hidden="true">
      <span className="bruma__capa bruma__capa--cerca" />
    </div>
  );
}
