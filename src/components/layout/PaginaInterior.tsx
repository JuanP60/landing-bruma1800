import type { ReactNode } from "react";
import SiteHeader from "@/components/layout/SiteHeader";
import Pendiente from "@/components/ui/Pendiente";
import Footer from "@/components/sections/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";

type PaginaInteriorProps = {
  pendiente: { titulo: string; texto: string };
  children: ReactNode;
};

/**
 * Armazón común de las cuatro páginas interiores: cabecera corta, el contenido
 * verificado que le toque a cada una, el hueco declarado de lo que falta, y el
 * pie y el chat de siempre.
 *
 * **No lleva entradilla propia.** La primera versión ponía encima un bloque con
 * eyebrow, titular y bajada, y en `/melipona` y `/club` el resultado era el
 * mismo titular dos veces seguidas con casi el mismo texto debajo. Cada sección
 * ya se presenta sola; lo único que hacía falta era que su titular fuera el
 * `<h1>` de la página, y para eso está la prop `comoPagina`.
 *
 * El `<main id="main-content">` es el mismo destino que el enlace de «Saltar al
 * contenido» del layout, así que ese atajo funciona en todas las páginas y no
 * solo en la portada.
 */
export default function PaginaInterior({ pendiente, children }: PaginaInteriorProps) {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        {children}
        <div className="bg-hueso py-14 md:py-16">
          <Pendiente {...pendiente} />
        </div>
      </main>
      <Footer />
      <ChatbotWidget />
    </>
  );
}
