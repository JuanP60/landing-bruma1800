import Image from "next/image";

/**
 * Ornamentación en acuarela de la sección Origen: dos copias del mismo
 * archivo (la de abajo girada 180° por CSS) más una abeja con dos ritmos de
 * animación anidados. Decorativa pura: aria-hidden y alt vacío. Ancla a las
 * esquinas de la sección (no al `.wrap`) para sangrar por los bordes, igual
 * que el diseño original — ver `.decor__*` en globals.css.
 */
export default function DecorOrigen() {
  return (
    <div className="decor" aria-hidden="true">
      <span className="decor__rama decor__rama--sup">
        <Image src="/images/decor/rama-cafeto.webp" alt="" width={1100} height={555} />
      </span>
      <span className="decor__rama decor__rama--inf">
        <Image src="/images/decor/rama-cafeto.webp" alt="" width={1100} height={555} />
      </span>
      <span className="decor__abeja">
        <span className="decor__abeja-aleteo">
          <Image src="/images/decor/abeja.webp" alt="" width={220} height={170} />
        </span>
      </span>
    </div>
  );
}
