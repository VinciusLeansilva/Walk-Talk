import { useRef, useState } from "react";
import {
  Plus,
  X,
  Satellite,
  Radio,
  AudioLines,
  ArrowUpRight,
  Mountain,
} from "lucide-react";
import { Globe } from "./Globe";
import { useExperience } from "../store/useExperience";
const details = [
  {
    title: "Conexão que vai além",
    label: "Antena satelital",
    icon: Satellite,
    text: "A sua voz encontra um caminho pela rede de satélites, mesmo longe das redes de celular.",
  },
  {
    title: "Uma ação. A sua voz.",
    label: "Comando PTT",
    icon: Radio,
    text: "Pressione para falar. Solte para enviar. Experimente o botão laranja logo abaixo.",
  },
  {
    title: "Perto, em cada palavra",
    label: "Áudio de volta",
    icon: AudioLines,
    text: "No outro aparelho, os dados voltam a ser voz. É assim que a conversa continua.",
  },
];
export function ProductStage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [scene, setScene] = useState<"orbit" | "field">("orbit");
  const active = useExperience((s) => s.ptt);
  const stage = useRef<HTMLDivElement>(null);
  const hotspots = useRef<Array<HTMLButtonElement | null>>([]);
  const detail = selected === null ? null : details[selected];
  const closeDetail = () => {
    if (selected !== null)
      hotspots.current[selected]?.focus({ preventScroll: true });
    setSelected(null);
  };
  return (
    <div
      id="aparelho"
      className={`product-stage product-scene-${scene} ${active ? "is-transmitting" : ""}`}
      ref={stage}
      onKeyDown={(event) => {
        if (event.key === "Escape" && selected !== null) {
          event.preventDefault();
          closeDetail();
        }
      }}
      onPointerMove={(e) => {
        if (
          e.pointerType !== "mouse" ||
          matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const box = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty(
          "--product-x",
          `${(e.clientX - box.left - box.width / 2) * 0.018}px`,
        );
        e.currentTarget.style.setProperty(
          "--product-y",
          `${(e.clientY - box.top - box.height / 2) * 0.012}px`,
        );
      }}
      onPointerLeave={() => {
        stage.current?.style.setProperty("--product-x", "0px");
        stage.current?.style.setProperty("--product-y", "0px");
      }}
    >
      <div className="product-halo" />
      {scene === "orbit" ? (
        <div className="hero-orbital">
          <Globe />
        </div>
      ) : (
        <div className="product-landscape">
          <img
            src="/landscapes/expedition-mobile.webp"
            alt=""
            width="768"
            height="512"
          />
        </div>
      )}
      <div className="product-orbit-label">
        <span className="status-dot" />{" "}
        {scene === "orbit" ? "CONEXÃO SEM FRONTEIRAS" : "PRONTO PARA EXPLORAR"}
      </div>
      <div
        className="product-scene-switch"
        role="group"
        aria-label="Cenário do aparelho"
      >
        <button
          aria-pressed={scene === "orbit"}
          onClick={() => setScene("orbit")}
        >
          <Satellite size={13} /> Órbita
        </button>
        <button
          aria-pressed={scene === "field"}
          onClick={() => setScene("field")}
        >
          <Mountain size={13} /> Expedição
        </button>
      </div>
      <img
        className="product-image"
        src="/product/walk-talk.webp"
        srcSet="/product/walk-talk-mobile.webp 480w, /product/walk-talk.webp 800w"
        sizes="(max-width: 600px) 360px, 480px"
        width="800"
        height="1200"
        fetchPriority="high"
        alt="Conceito do WALK TALK: comunicador via satélite em grafite, com antena e botão PTT laranja"
      />
      <div className="product-ground" />
      {details.map((item, index) => (
        <button
          key={item.label}
          ref={(node) => {
            hotspots.current[index] = node;
          }}
          className={`product-hotspot hotspot-${index} ${selected === index ? "selected" : ""}`}
          aria-label={`Explorar ${item.label}`}
          aria-expanded={selected === index}
          aria-controls="product-detail"
          onClick={() => setSelected(selected === index ? null : index)}
        >
          <span className="hotspot-dot">
            {selected === index ? <X size={13} /> : <Plus size={13} />}
          </span>
          <span className="hotspot-label">
            {item.label}
            <ArrowUpRight size={11} />
          </span>
        </button>
      ))}
      <div
        id="product-detail"
        className={`product-detail ${detail ? "visible" : ""}`}
        aria-live="polite"
      >
        {detail && (
          <>
            <detail.icon size={20} />
            <div>
              <span className="product-detail-index">
                0{(selected ?? 0) + 1} / EXPLORE O APARELHO
              </span>
              <strong>{detail.title}</strong>
              <p>{detail.text}</p>
              <a
                className="product-detail-action"
                href={selected === 1 ? "#ptt" : "#jornada"}
                onClick={() => setSelected(null)}
              >
                {selected === 1 ? "Experimentar PTT" : "Acompanhar o sinal"}{" "}
                <ArrowUpRight size={14} />
              </a>
            </div>
            <button
              className="detail-close"
              aria-label="Fechar detalhe do aparelho"
              onClick={closeDetail}
            >
              <X size={16} />
            </button>
          </>
        )}
      </div>
      <div className="product-caption">
        <span>
          WALK TALK <span>/ SATELLITE COMMUNICATOR</span>
        </span>
        <small>Design conceitual</small>
      </div>
    </div>
  );
}
