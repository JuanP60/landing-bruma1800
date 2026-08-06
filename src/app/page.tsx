import Hero from "@/components/sections/Hero";
import Origen from "@/components/sections/Origen";
import Portafolio from "@/components/sections/Portafolio";
import Melipona from "@/components/sections/Melipona";
import Calidad from "@/components/sections/Calidad";
import Club from "@/components/sections/Club";
import CtaFinal from "@/components/sections/CtaFinal";
import Footer from "@/components/sections/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";

/*
 * Sección de testimonios: desactivada a propósito, igual que en el sitio
 * original. No hay testimonios reales todavía — no rellenar con citas
 * inventadas. El titular verificado para cuando existan es "CUATRO DE CADA
 * CINCO CLIENTES LLEGARON POR VOZ A VOZ". Ver bruma1800-landing/CLAUDE.md.
 */

export default function Home() {
  return (
    <>
      <main id="main-content">
        <Hero />
        <Origen />
        <Portafolio />
        {/* Melipona va detrás del portafolio: es cómo se compra por volumen lo
            que ya se acaba de enseñar. Ojo, el orden de la página no es el del
            menú — el cliente pidió «Quiénes somos» en cuarta posición y aquí
            Origen sigue siendo la segunda sección. */}
        <Melipona />
        <Calidad />
        <Club />
        <CtaFinal />
      </main>
      <Footer />
      <ChatbotWidget />
    </>
  );
}
