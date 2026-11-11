import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, ArrowUpRight, Download } from "lucide-react";
import { benefits } from "../assets/content";
import type { useInstall } from "../hooks/useInstall";
export function Benefits({
  installState,
}: {
  installState: ReturnType<typeof useInstall>;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const { install, available, installed, message } = installState;
  return (
    <section className="section benefits-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="section-index">03 /</span> FEITO PARA IR ALÉM
            </div>
            <h2>
              MENOS LIMITES.
              <br />
              <span>MAIS POSSIBILIDADES.</span>
            </h2>
          </div>
          <p className="heading-aside">
            Tecnologia que aproxima.
            <br />
            Liberdade que acompanha.
          </p>
        </div>
        <div className="benefit-grid grid grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map(({ icon: Icon, title, label, description }, i) => (
            <article
              key={title}
              className={`benefit-card ${expanded === i ? "expanded" : ""}`}
            >
              <button
                aria-expanded={expanded === i}
                aria-controls={`benefit-${i}`}
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <div className="benefit-top">
                  <Icon size={28} strokeWidth={1.4} />
                  <span>0{i + 1}</span>
                </div>
                <span className="micro-label">{label}</span>
                <h3>{title}</h3>
                <span className="benefit-more">
                  {expanded === i ? "Menos detalhes" : "Explore o benefício"}
                  {expanded === i ? <Minus size={18} /> : <Plus size={18} />}
                </span>
              </button>
              <div id={`benefit-${i}`}>
                <AnimatePresence>
                  {expanded === i && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      {description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </article>
          ))}
        </div>
        <div className="closing">
          <span className="eyebrow">
            <span className="status-dot" /> A DISTÂNCIA MUDOU DE SIGNIFICADO
          </span>
          <h2>
            O PRÓXIMO DESTINO?
            <br />
            <span>VOCÊ ESCOLHE.</span>
          </h2>
          <p>Leve a sua voz aonde a vida levar você.</p>
          <div className="closing-actions">
            <a
              href="#ptt"
              className="primary-button"
              onClick={() => document.getElementById("ptt")?.focus()}
            >
              Experimente a conexão <ArrowUpRight size={18} />
            </a>
            <button
              className="secondary-button"
              onClick={install}
              disabled={installed}
            >
              <Download size={17} />
              {installed
                ? "Aplicativo instalado"
                : available
                  ? "Instalar WALK TALK"
                  : "Como instalar"}
            </button>
          </div>
          {message && (
            <p className="install-message" role="status">
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
