import { useEffect, useRef } from "react";
import { AudioLines, Radio, ArrowUpRight } from "lucide-react";
import { useExperience } from "../store/useExperience";
import { unlockAudio } from "../hooks/useAudio";
export function PTTButton() {
  const sound = useExperience((s) => s.sound);
  const active = useExperience((s) => s.ptt);
  const pulse = useExperience((s) => s.pulse);
  const held = useRef(false);
  const begin = () => {
    if (useExperience.getState().sound) unlockAudio();
    held.current = true;
    useExperience.getState().setPTT(true);
  };
  const end = () => {
    if (held.current) {
      held.current = false;
      useExperience.getState().setPTT(false);
    }
  };
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const element = event.target as HTMLElement;
      if (
        event.code === "Space" &&
        !event.repeat &&
        !element.closest(
          "button, a, input, textarea, select, [contenteditable]",
        )
      ) {
        event.preventDefault();
        begin();
      }
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === "Space") end();
    };
    const hidden = () => {
      if (document.hidden) end();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", end);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", end);
      document.removeEventListener("visibilitychange", hidden);
      end();
    };
  }, []);
  return (
    <div className="ptt-module">
      <button
        id="ptt"
        className={`ptt-button ${active ? "transmitting" : ""}`}
        aria-label={
          active
            ? "Transmitindo... PTT: solte para enviar o sinal simulado"
            : "Segure para falar. PTT: simular transmissão"
        }
        aria-pressed={active}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          begin();
        }}
        onPointerUp={end}
        onPointerCancel={end}
        onLostPointerCapture={end}
        onBlur={end}
        onKeyDown={(e) => {
          if ([" ", "Enter"].includes(e.key)) {
            e.preventDefault();
            if (!e.repeat) begin();
          }
        }}
        onKeyUp={(e) => {
          if ([" ", "Enter"].includes(e.key)) {
            e.preventDefault();
            end();
          }
        }}
      >
        {active ? <AudioLines size={22} /> : <Radio size={22} />}{" "}
        <span>{active ? "Transmitindo..." : "Segure para falar"}</span>
        <ArrowUpRight size={18} />
      </button>
      <div className="ptt-hint" aria-live="polite">
        {active ? (
          <span className="orange">Sua mensagem está em movimento</span>
        ) : pulse ? (
          <span className="cyan">Sinal enviado ao satélite · simulação</span>
        ) : (
          <>
            {sound ? "SOM ATIVADO" : "SOM DESLIGADO"}{" "}
            <span>
              ou segure <kbd>espaço</kbd>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
