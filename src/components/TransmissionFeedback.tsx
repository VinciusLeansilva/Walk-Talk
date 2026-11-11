import { useEffect, useState } from "react";
import { AudioLines, Check, Radio, Satellite } from "lucide-react";
import { useExperience } from "../store/useExperience";
import "./transmission-feedback.css";

const nodes = [
  { label: "Seu aparelho", icon: Radio },
  { label: "Satélite", icon: Satellite },
  { label: "Destinatário", icon: AudioLines },
];

/** Visual feedback only: this demo never captures or transmits microphone audio. */
export function TransmissionFeedback() {
  const ptt = useExperience((state) => state.ptt);
  const pulse = useExperience((state) => state.pulse);
  const [completedPulse, setCompletedPulse] = useState(0);
  const phase = ptt
    ? "talking"
    : pulse > completedPulse
      ? "transit"
      : pulse > 0
        ? "received"
        : "ready";

  useEffect(() => {
    if (ptt || pulse === 0) return;
    const timer = window.setTimeout(() => setCompletedPulse(pulse), 2400);
    return () => window.clearTimeout(timer);
  }, [ptt, pulse]);

  const status = {
    ready: "Pronto para conectar",
    talking: "Preparando sua mensagem",
    transit: "Sinal em trânsito",
    received: "Mensagem recebida",
  }[phase];
  const instruction = {
    ready: "Segure o botão PTT para começar.",
    talking: "Solte o PTT para acompanhar o sinal.",
    transit: "Do seu aparelho ao outro lado da conversa.",
    received: "Uma conexão completa. Experimente de novo.",
  }[phase];

  return (
    <section
      className={`transmission-feedback transmission-${phase}`}
      aria-label="Acompanhe a transmissão simulada"
    >
      <ol className="transmission-track" aria-label="Caminho do sinal">
        {nodes.map(({ label, icon: Icon }, index) => (
          <li
            key={label}
            className={`transmission-node transmission-node-${index}`}
          >
            {index < nodes.length - 1 && (
              <span className="transmission-connector" aria-hidden="true">
                <i key={`${pulse}-${phase}`} />
              </span>
            )}
            <span className="transmission-node-icon" aria-hidden="true">
              {phase === "received" && index === 2 ? (
                <Check size={17} />
              ) : (
                <Icon size={17} />
              )}
            </span>
            <span>{label}</span>
          </li>
        ))}
      </ol>
      <div className="transmission-result">
        <div
          className="transmission-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="transmission-status-light" aria-hidden="true" />
          {status}
        </div>
        <p>{instruction}</p>
        <small>Simulação visual. Nenhuma voz é gravada ou enviada.</small>
      </div>
    </section>
  );
}
