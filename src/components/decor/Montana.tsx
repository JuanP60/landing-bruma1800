import Image from "next/image";

/** Acuarela de montaña, decorativa: aria-hidden y alt vacío porque no aporta
 * nada que leer, solo atmósfera. Va antes que la bruma en el DOM para que
 * las nubes pasen por delante de ella (ver Hero.tsx). Tamaño y posición
 * exactos en la clase `.montana img` de globals.css. */
export default function Montana() {
  return (
    <div className="montana" aria-hidden="true">
      <Image src="/images/hero/montana.webp" alt="" width={1200} height={513} priority />
    </div>
  );
}
