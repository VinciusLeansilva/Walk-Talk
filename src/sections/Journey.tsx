import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Check,
  Radio,
  Satellite,
  AudioLines,
  ArrowUpRight,
  Mountain,
  TreePine,
  Waves,
  Sun,
  Play,
  Pause,
} from "lucide-react";
import { useExperience } from "../store/useExperience";
import { steps } from "../assets/content";
import { Globe } from "../components/Globe";
import { usePlayback } from "../hooks/usePlayback";
export function Journey() {
  const { playing, toggle, selectStep } = usePlayback();
  const step = useExperience((s) => s.step);
  const detailed = useExperience((s) => s.detailed);

  const current = steps[step];
  const CurrentIcon = current.icon;
  return (
    <section className="section journey-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="section-index">01 /</span> UMA CONEXÃO
              EXTRAORDINÁRIA
            </div>
            <h2>
              DA SUA VOZ.
              <br />
              <span>PARA QUALQUER LUGAR.</span>
            </h2>
          </div>
          <div className="heading-aside">
            <p>
              Um toque inicia uma jornada.
              <br />
              Descubra o caminho que conecta vocês.
            </p>
            <div
              className="segmented"
              role="group"
              aria-label="Quantidade de detalhes"
            >
              <button
                aria-pressed={!detailed}
                onClick={() => useExperience.getState().setDetailed(false)}
              >
                Resumido
              </button>
              <button
                aria-pressed={detailed}
                onClick={() => useExperience.getState().setDetailed(true)}
              >
                Detalhado
              </button>
            </div>
          </div>
        </div>
        <div
          id="simulator-panel"
          role="region"
          className="simulator glass"
          tabIndex={0}
          aria-label="Simulador da mensagem. Use as setas esquerda e direita para navegar."
          onKeyDown={(e) => {
            if (["ArrowLeft", "ArrowRight", "Home"].includes(e.key)) {
              e.preventDefault();
              selectStep(
                e.key === "Home" ? 0 : step + (e.key === "ArrowRight" ? 1 : -1),
              );
            }
          }}
        >
          <div className="sim-visual">
            <div className="sim-label">
              <span className="status-dot" /> JORNADA DO SINAL{" "}
              <span>SIMULAÇÃO INTERATIVA</span>
            </div>
            <Globe story />
            <img
              className="journey-device"
              src="/product/walk-talk-mobile.webp"
              width="480"
              height="720"
              loading="lazy"
              alt="Aparelho WALK TALK de origem"
            />
            <div className="journey-phase">
              <span className="status-dot" />
              {current.phase}
            </div>
            <div className={`signal-path signal-step-${step}`}>
              <i />
              <i />
              <i />
            </div>
            <div className="sim-endpoints">
              <span>
                <Radio size={15} /> SEU WALK TALK
              </span>
              <span>
                <Satellite size={15} /> REDE SATELITAL
              </span>
              <span>
                <AudioLines size={15} /> DESTINATÁRIO
              </span>
            </div>
          </div>
          <div className="sim-controls">
            <div className="sim-topline">
              <span>EXPLORE A CONEXÃO</span>
              <span className="cyan">
                0{step + 1}
                <span className="muted"> / 06</span>
              </span>
            </div>
            <div
              className="step-indicators"
              role="group"
              aria-label="Etapas da transmissão"
            >
              {steps.map((s, i) => (
                <button
                  key={s.title}
                  onClick={() => selectStep(i)}
                  aria-label={`Passo ${i + 1}: ${s.title}`}
                  aria-current={step === i ? "step" : undefined}
                  className={i <= step ? "complete" : ""}
                >
                  {i < step ? <Check size={13} /> : i + 1}
                </button>
              ))}
            </div>
            <motion.div
              className="current-step"
              key={`${step}-${detailed}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              aria-live="polite"
            >
              <div className="step-icon">
                <CurrentIcon size={26} />
              </div>
              <span className="micro-label">{current.location}</span>
              <h3>{current.title}</h3>
              <p>{detailed ? current.detail : current.short}</p>
            </motion.div>
            <div
              className="sim-progress"
              role="progressbar"
              aria-label="Progresso da simulação"
              aria-valuenow={step + 1}
              aria-valuemin={0}
              aria-valuemax={6}
            >
              <span style={{ width: `${((step + 1) / 6) * 100}%` }} />
            </div>
            <div className="playback-row">
              <button
                className="playback-button"
                aria-pressed={playing}
                onClick={toggle}
              >
                {playing ? <Pause size={15} /> : <Play size={15} />}{" "}
                {playing ? "Pausar jornada" : "Reproduzir jornada"}
              </button>
              <span>6 ETAPAS · UMA CONEXÃO</span>
            </div>
            <div className="sim-navigation">
              <button
                className="icon-button"
                aria-label="Reiniciar simulação"
                onClick={() => selectStep(0)}
              >
                <RotateCcw size={17} />
              </button>
              <div>
                <button
                  className="icon-button"
                  aria-label="Passo anterior"
                  disabled={step === 0}
                  onClick={() => selectStep(step - 1)}
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  className="next-button"
                  disabled={step === 5}
                  onClick={() => selectStep(step + 1)}
                >
                  Próximo <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <small className="keyboard-note">
              Use também ← → com o simulador selecionado
            </small>
          </div>
        </div>
        <div className="story-layout">
          {[0, 1].map((part) => (
            <div key={part} className="journey-part">
              <div className="part-heading">
                <span>PARTE 0{part + 1}</span>
                <h3>
                  {part === 0
                    ? "Da sua voz ao satélite."
                    : "Do satélite até outro aparelho."}
                </h3>
                <ArrowUpRight size={22} />
              </div>
              <div className="story-grid">
                {steps.slice(part * 3, part * 3 + 3).map((s, index) => {
                  const number = part * 3 + index;
                  const Icon = s.icon;
                  return (
                    <article
                      key={s.title}
                      data-story-step={number}
                      className={`story-card ${step === number ? "highlighted" : ""}`}
                    >
                      <div className="story-card-top">
                        <Icon size={23} />
                        <span>0{number + 1}</span>
                      </div>
                      <h4>{s.title}</h4>
                      <p>{detailed ? s.detail : s.short}</p>
                      <button
                        onClick={() => {
                          selectStep(number);
                          document
                            .getElementById("simulator-panel")
                            ?.scrollIntoView({
                              behavior: matchMedia(
                                "(prefers-reduced-motion: reduce)",
                              ).matches
                                ? "instant"
                                : "smooth",
                              block: "center",
                            });
                          document
                            .getElementById("simulator-panel")
                            ?.focus({ preventScroll: true });
                        }}
                        aria-label={`Explorar etapa ${number + 1}: ${s.title}`}
                      >
                        Explorar etapa <ArrowUpRight size={14} />
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="remote-banner">
          <div>
            <Radio size={19} />
            <p>
              O sinal de celular termina.
              <br />
              <strong>A sua conexão continua.</strong>
            </p>
          </div>
          <div className="landscapes">
            {[
              { icon: Mountain, name: "Montanhas" },
              { icon: TreePine, name: "Florestas" },
              { icon: Waves, name: "Mar" },
              { icon: Sun, name: "Desertos" },
            ].map(({ icon: Icon, name }) => (
              <span key={name}>
                <Icon size={22} />
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
