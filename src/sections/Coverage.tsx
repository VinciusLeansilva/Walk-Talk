import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Radio,
  RefreshCw,
} from "lucide-react";
import { cities } from "../assets/content";
import paths from "../assets/world-paths.json";
const point = (i: number) => ({
  x: (cities[i].lng + 180) * 2.5,
  y: (90 - cities[i].lat) * 2.5,
});
export function Coverage() {
  const [origin, setOrigin] = useState(0);
  const [destination, setDestination] = useState(1);
  const [selecting, setSelecting] = useState<"origin" | "destination">(
    "destination",
  );
  const distance = Math.round(
    6371 *
      2 *
      Math.asin(
        Math.sqrt(
          Math.sin(
            ((cities[destination].lat - cities[origin].lat) * Math.PI) / 360,
          ) **
            2 +
            Math.cos((cities[origin].lat * Math.PI) / 180) *
              Math.cos((cities[destination].lat * Math.PI) / 180) *
              Math.sin(
                ((cities[destination].lng - cities[origin].lng) * Math.PI) /
                  360,
              ) **
                2,
        ),
      ),
  );
  const a = point(origin),
    b = point(destination);
  const curve = `M${a.x},${a.y} Q${(a.x + b.x) / 2},${Math.min(a.y, b.y) - 85} ${b.x},${b.y}`;
  const choose = (i: number) => {
    if (selecting === "origin") {
      if (i === destination) setDestination(origin);
      setOrigin(i);
      setSelecting("destination");
    } else {
      if (i === origin) setOrigin(destination);
      setDestination(i);
      setSelecting("origin");
    }
  };
  return (
    <section className="section coverage-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="section-index">02 /</span> SEM FRONTEIRAS
            </div>
            <h2>
              LONGE É SÓ
              <br />
              <span>UM PONTO NO MAPA.</span>
            </h2>
          </div>
          <p className="heading-aside">
            De um continente a outro.
            <br />A mesma vontade de estar perto.
          </p>
        </div>
        <div className="map-card glass">
          <div className="map-toolbar">
            <span>
              <i className="status-dot" /> REDE GLOBAL WALK TALK
            </span>
            <span className="map-demo">
              ROTA ILUSTRATIVA <ArrowUpRight size={14} />
            </span>
          </div>
          <div className="world-map">
            <svg
              viewBox="0 0 900 450"
              role="group"
              aria-label={`Rota ilustrativa de ${cities[origin].name} para ${cities[destination].name}`}
            >
              <defs>
                <pattern
                  id="map-grid"
                  width="45"
                  height="45"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 45 0 L 0 0 0 45"
                    fill="none"
                    stroke="#194352"
                    strokeWidth="0.5"
                  />
                </pattern>
                <filter id="route-glow">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
              </defs>
              <rect
                width="900"
                height="450"
                fill="url(#map-grid)"
                opacity="0.4"
              />
              <g className="continents">
                {paths.map((d, i) => (
                  <path d={d} key={i} />
                ))}
              </g>
              <path
                d={curve}
                className="map-route-glow"
                filter="url(#route-glow)"
              />
              <path
                d={curve}
                className="map-route"
                key={`${origin}-${destination}`}
              />
              {cities.map((city, i) => {
                const p = point(i);
                const selected = i === origin || i === destination;
                return (
                  <g
                    key={city.name}
                    className={`map-point ${selected ? "selected" : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Selecionar ${city.name} como ${selecting === "origin" ? "origem" : "destino"}`}
                    onClick={() => choose(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        choose(i);
                      }
                    }}
                  >
                    <circle cx={p.x} cy={p.y} r="18" fill="transparent" />
                    <circle className="point-halo" cx={p.x} cy={p.y} r="11" />
                    <circle className="point-core" cx={p.x} cy={p.y} r="4" />
                    <text
                      x={p.x}
                      y={p.y + (i === 1 ? -18 : 27)}
                      textAnchor="middle"
                    >
                      {city.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="map-distance">
            <span>UMA CONVERSA ENTRE</span>
            <strong>
              {cities[origin].name} <span>↔</span> {cities[destination].name}
            </strong>
            <small>
              ≈ {new Intl.NumberFormat("pt-BR").format(distance)} km em linha
              reta · rota ilustrativa
            </small>
          </div>
          <div className="route-panel">
            <button
              className={
                selecting === "origin" ? "route-place selected" : "route-place"
              }
              onClick={() => setSelecting("origin")}
              aria-pressed={selecting === "origin"}
            >
              <MapPin size={19} />
              <span>
                <small>ORIGEM</small>
                {cities[origin].name}
                <em>{cities[origin].country}</em>
              </span>
            </button>
            <button
              className="route-switch icon-button"
              aria-label="Inverter origem e destino"
              onClick={() => {
                setOrigin(destination);
                setDestination(origin);
              }}
            >
              <RefreshCw size={18} />
            </button>
            <button
              className={
                selecting === "destination"
                  ? "route-place selected"
                  : "route-place"
              }
              onClick={() => setSelecting("destination")}
              aria-pressed={selecting === "destination"}
            >
              <Radio size={19} />
              <span>
                <small>DESTINO</small>
                {cities[destination].name}
                <em>{cities[destination].country}</em>
              </span>
            </button>
            <div className="route-status" aria-live="polite">
              <span>
                <i className="status-dot" /> ROTA CONECTADA
              </span>
              <small>
                Escolha {selecting === "origin" ? "a origem" : "o destino"} no
                mapa <ArrowRight size={13} />
              </small>
            </div>
          </div>
        </div>
        <div
          className="city-options"
          role="group"
          aria-label="Selecionar cidade"
        >
          {cities.map((city, i) => (
            <button
              key={city.name}
              onClick={() => choose(i)}
              aria-pressed={i === origin || i === destination}
            >
              {city.name}
              <ArrowUpRight size={12} />
            </button>
          ))}
        </div>
        <p className="map-caption">
          Uma demonstração de conexão entre aparelhos compatíveis. Cobertura e
          disponibilidade dependem da rede contratada.
        </p>
      </div>
    </section>
  );
}
