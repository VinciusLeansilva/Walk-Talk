import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Compass, MapPin, Radio, Check } from "lucide-react";
import "./field-experience.css";

const moments = [
  {
    title: "A partida",
    label: "Antes de seguir",
    message: "Estamos começando a trilha. Nos falamos no próximo ponto.",
    description: "Combine o caminho. Compartilhe o primeiro passo.",
    icon: Compass,
  },
  {
    title: "A travessia",
    label: "Longe das redes de celular",
    message: "A vista daqui é incrível. Queria dividir este momento com você.",
    description:
      "Há lugares que pedem silêncio. E momentos que pedem a sua voz.",
    icon: MapPin,
  },
  {
    title: "O reencontro",
    label: "Do outro lado da aventura",
    message: "Chegamos ao ponto de encontro. Tudo certo por aqui.",
    description: "Uma mensagem simples pode aproximar quem ficou longe.",
    icon: Check,
  },
];

export function FieldExperience() {
  const [moment, setMoment] = useState(1);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const current = moments[moment];
  const Icon = current.icon;
  return (
    <section className="section field-section" aria-labelledby="field-title">
      <div className="container field-heading">
        <div className="eyebrow">
          <span className="tiny-square" /> FORA DO ÓBVIO. DENTRO DA CONVERSA.
        </div>
        <a className="text-button" href="#jornada">
          Conheça o caminho da sua voz <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="field-canvas">
        <picture className="field-photograph">
          <img
            src="/landscapes/expedition.webp"
            alt="Alpinista de jaqueta laranja em uma cordilheira acima de um lago, em uma paisagem conceitual de expedição"
            width="1536"
            height="1024"
            loading="lazy"
            decoding="async"
          />
        </picture>
        <div className="field-shade" />
        <div className="container field-content">
          <div className="field-title-group">
            <span className="field-kicker">
              <Compass size={15} /> AVENTURE-SE MAIS LONGE
            </span>
            <h2 id="field-title">
              O MUNDO CHAMA.
              <br />
              <span>LEVE A SUA VOZ.</span>
            </h2>
            <p>
              Algumas conexões merecem
              <br />
              ir além do sinal de celular.
            </p>
          </div>
          <div className="field-coordinate" aria-hidden="true">
            <span /> ENTRE O CÉU E O PRÓXIMO PASSO
          </div>
          <div
            className="field-message"
            role="tabpanel"
            id="field-panel"
            aria-labelledby={`field-tab-${moment}`}
            tabIndex={0}
          >
            <div className="field-message-top">
              <span>
                <Radio size={14} /> CONVERSA ILUSTRATIVA
              </span>
              <span>0{moment + 1} / 03</span>
            </div>
            <motion.div
              key={moment}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="field-moment-label">
                <Icon size={15} /> {current.label}
              </span>
              <blockquote>“{current.message}”</blockquote>
              <p>{current.description}</p>
            </motion.div>
            <a href="#ptt" className="field-ptt-link">
              Experimente o PTT <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
        <div className="field-tabs-shell">
          <div
            className="container field-tabs"
            role="tablist"
            aria-label="Momentos da expedição"
          >
            {moments.map((item, index) => (
              <button
                key={item.title}
                ref={(node) => {
                  tabs.current[index] = node;
                }}
                role="tab"
                id={`field-tab-${index}`}
                aria-controls="field-panel"
                aria-selected={moment === index}
                tabIndex={moment === index ? 0 : -1}
                onClick={() => setMoment(index)}
                onKeyDown={(e) => {
                  if (
                    !["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                  )
                    return;
                  e.preventDefault();
                  const next =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? 2
                        : (moment + (e.key === "ArrowRight" ? 1 : 2)) % 3;
                  setMoment(next);
                  tabs.current[next]?.focus();
                }}
              >
                <span className="field-tab-index">0{index + 1}</span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.label}</small>
                </span>
                <ArrowUpRight size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="container field-footnote">
        <span>UMA EXPEDIÇÃO. MUITOS MOTIVOS PARA ESTAR PERTO.</span>
        <span>Cenário e mensagens ilustrativos.</span>
      </div>
    </section>
  );
}
