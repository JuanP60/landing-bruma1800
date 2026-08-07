import Image from "next/image";
import Link from "next/link";
import Wrap from "@/components/ui/Wrap";
import Nav from "@/components/ui/Nav";

/**
 * Cabecera de las páginas interiores. En la portada esta función la cumple el
 * propio hero, que además es el `<header>` del documento; aquí hace falta una
 * versión corta con lo imprescindible: el logo, que vuelve a la portada, y el
 * mismo menú.
 *
 * Conserva el azul bruma del hero para que al cambiar de página no parezca otro
 * sitio. Por eso el logo va en su variante oscura, que es la que el brandbook
 * exige sobre fondo claro, y el menú mantiene su `--cafe-profundo`.
 */
export default function SiteHeader() {
  return (
    <header className="bg-niebla pt-6 pb-8 md:pt-8 md:pb-10">
      <Wrap>
        <Nav />
        <Link href="/" className="mt-6 inline-block md:mt-7" aria-label="BRUMA1800 — ir a la portada">
          <Image
            src="/images/logo/logo-bruma1800-oscuro.png"
            alt="BRUMA1800 — Pijao, Quindío"
            width={518}
            height={232}
            priority
            className="h-14 w-auto md:h-[72px]"
          />
        </Link>
      </Wrap>
    </header>
  );
}
