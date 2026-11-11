import { ArrowUpRight, HeartPulse, Users } from "lucide-react";
export function Enterprise() {
  return (
    <section className="enterprise-section">
      <div className="container">
        <div className="enterprise-intro">
          <span className="eyebrow">
            <span className="tiny-square" /> WALK TALK EMPRESAS
          </span>
          <h2>
            CONEXÃO PARA A EQUIPE.
            <br />
            <span>CUIDADO COM A ROTINA.</span>
          </h2>
          <p>Uma experiência que vai além do aparelho.</p>
        </div>
        <div className="enterprise-links">
          <a href="/portal">
            <span className="enterprise-link-icon">
              <Users size={25} />
            </span>
            <div>
              <small>SEU ESPAÇO DE TRABALHO</small>
              <h3>Portal da empresa</h3>
              <p>
                Organize equipes e equipamentos. Compartilhe atualizações nos
                canais do portal.
              </p>
              <strong>
                Acessar portal <ArrowUpRight size={17} />
              </strong>
            </div>
          </a>
          <a href="/saude">
            <span className="enterprise-link-icon health">
              <HeartPulse size={25} />
            </span>
            <div>
              <small>SAÚDE OCUPACIONAL</small>
              <h3>Cuidar também é prevenir</h3>
              <p>
                Informações sobre LER/DORT, ergonomia, pausas e organização do
                trabalho.
              </p>
              <strong>
                Conhecer orientações <ArrowUpRight size={17} />
              </strong>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
