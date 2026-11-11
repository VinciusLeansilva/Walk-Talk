import {
  ArrowDown,
  ArrowUpRight,
  RadioTower,
  ShieldCheck,
  Satellite,
  Globe2,
} from "lucide-react";
import { useParallax } from "../hooks/useParallax";
import { PTTButton } from "../components/PTTButton";
import { ProductStage } from "../components/ProductStage";
import { TransmissionFeedback } from "../components/TransmissionFeedback";
import { useExperience } from "../store/useExperience";
export function Hero() {
  const parallax = useParallax();
  const active = useExperience((s) => s.ptt);
  const pulse = useExperience((s) => s.pulse);
  return (
    <section id="inicio" className="hero">
      <div className="star-field" aria-hidden="true" />
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow hero-eyebrow">
              <span className="tiny-square" /> APRESENTAMOS WALK TALK{" "}
              <span className="eyebrow-rule" />
            </div>
            <h1>
              LONGE DE TUDO.
              <br />
              PERTO DE
              <br />
              <span>QUEM IMPORTA.</span>
            </h1>
            <p className="hero-description">
              O sinal de celular pode ficar para trás.
              <br /> A sua voz, não. Conheça o comunicador via satélite feito
              para conectar você ao que importa.
            </p>
            <div className="hero-buttons">
              <a className="primary-button" href="#jornada">
                Ver como funciona <ArrowUpRight size={18} />
              </a>
              <a className="text-button" href="#ptt">
                Experimentar o PTT <span>+</span>
              </a>
            </div>
            <div className="hero-proof">
              <ShieldCheck size={17} />
              <span>Sem depender de redes de celular.</span>
            </div>
          </div>
          <ProductStage />
        </div>
        <div className={`experience-dock ${active ? "is-transmitting" : ""}`}>
          <div className="dock-copy">
            <div className="dock-icon">
              <AudioWave active={active} />
            </div>
            <div>
              <span className="micro-label">SINTA A CONEXÃO</span>
              <p>
                {active
                  ? "Sua voz está em movimento."
                  : pulse
                    ? "Uma mensagem. Um mundo de distância."
                    : "A distância muda com um toque."}
              </p>
            </div>
          </div>
          <div className="dock-interaction">
            <span className="dock-instruction">
              Segure. Fale. Solte.<small>Demonstração interativa de PTT</small>
            </span>
            <PTTButton />
          </div>
        </div>
        <TransmissionFeedback />
        <div className="hero-baseline">
          <a href="#jornada">
            <ArrowDown size={14} /> EXPLORE SEM FRONTEIRAS
          </a>
          <span>TECNOLOGIA QUE APROXIMA.</span>
          {parallax.supported && (
            <div className="gyro-control">
              <button onClick={parallax.toggle} aria-pressed={parallax.enabled}>
                {parallax.enabled
                  ? "Desativar movimento"
                  : "Ativar movimento do celular"}
              </button>
              {parallax.message && (
                <small role="status">{parallax.message}</small>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="feature-strip">
        <div className="container">
          <span>
            <Globe2 /> Conexão entre continentes
          </span>
          <span>
            <Satellite /> Tecnologia via satélite
          </span>
          <span>
            <RadioTower /> Além do sinal de celular
          </span>
          <span>
            <ShieldCheck /> Comunicação protegida
          </span>
        </div>
      </div>
    </section>
  );
}
export function AudioWave({ active = false }: { active?: boolean }) {
  return (
    <span className={`audio-wave ${active ? "active" : ""}`} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <i
          key={i}
          style={{
            height: `${8 + Math.sin(i * 1.8) ** 2 * 20}px`,
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
    </span>
  );
}
