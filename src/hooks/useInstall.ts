import { useEffect, useState } from "react";
interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
export function useInstall() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    setInstalled(matchMedia("(display-mode: standalone)").matches);
    const before = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallEvent);
    };
    const done = () => {
      setInstalled(true);
      setPrompt(null);
      setMessage(
        "WALK TALK instalado. Sua experiência está pronta para acompanhar você.",
      );
    };
    window.addEventListener("beforeinstallprompt", before);
    window.addEventListener("appinstalled", done);
    return () => {
      window.removeEventListener("beforeinstallprompt", before);
      window.removeEventListener("appinstalled", done);
    };
  }, []);
  const install = async () => {
    if (prompt) {
      try {
        await prompt.prompt();
        const result = await prompt.userChoice;
        setPrompt(null);
        setMessage(
          result.outcome === "accepted"
            ? "Instalação solicitada. Conclua a etapa no seu navegador."
            : "Você pode instalar depois pelo menu do navegador.",
        );
      } catch {
        setMessage("Abra o menu do navegador e escolha Instalar aplicativo.");
      }
    } else
      setMessage(
        "No Chrome ou Edge, abra o menu e escolha “Instalar aplicativo”. No iPhone, use Safari → Compartilhar → Adicionar à Tela de Início. A instalação depende do navegador e de uma conexão HTTPS.",
      );
  };
  return { install, available: !!prompt, installed, message };
}
