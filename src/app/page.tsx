import Hero from "@/components/sections/Hero";
import Origen from "@/components/sections/Origen";
import Portafolio from "@/components/sections/Portafolio";
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
        <Calidad />
        <Club />
        <CtaFinal />
      </main>
      <Footer />
      <ChatbotWidget />
    </>
  );
}
