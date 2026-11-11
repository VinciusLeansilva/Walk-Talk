"use client";
import {
  ArrowDown,
  ArrowUpRight,
  AudioLines,
  Fingerprint,
  Radio,
  Satellite,
  Route,
  Users,
} from "lucide-react";
import { PageHeading, PortalCTA, PublicShell } from "./PublicShell";

const principles = [
  {
    icon: Radio,
    number: "01",
    title: "Um gesto. Uma mensagem.",
    text: "O conceito Push To Talk parte de uma interação simples: pressionar para falar, soltar para enviar. Explore esse gesto na demonstração.",
  },
  {
    icon: Satellite,
    number: "02",
    title: "Uma conexão além do horizonte.",
    text: "A experiência explica como uma mensagem poderia percorrer uma rede de satélites, da origem ao aparelho de destino.",
  },
  {
    icon: Users,
    number: "03",
    title: "Pessoas no centro da operação.",
    text: "No portal, sua empresa já pode organizar equipes, cadastrar aparelhos e trocar mensagens de texto pela internet.",
  },
];

export function ProductPage() {
  return (
    <PublicShell active="/produto">
      <section className="wp-wrap wp-product-hero">
        <div className="wp-product-copy">
          <PageHeading
            eyebrow="WALK TALK / CONCEITO DE PRODUTO"
            title={
              <>
                SUA VOZ.
                <br />
                UM NOVO
                <br />
                <em>HORIZONTE.</em>
              </>
            }
            description="Uma visão de comunicação para quem trabalha além dos caminhos habituais. Conheça o aparelho que inspira a experiência WALK TALK."
          />
          <div className="wp-actions">
            <a className="wp-button" href="/#ptt">
              Experimentar o PTT <ArrowUpRight size={18} />
            </a>
            <a className="wp-text-link" href="#design">
              Explorar o design <ArrowDown size={16} />
            </a>
          </div>
          <p className="wp-fineprint">
            Visualização conceitual. O site não realiza transmissões via
            satélite e não apresenta especificações comerciais verificadas.
          </p>
        </div>
        <figure className="wp-device-stage">
          <div className="wp-orbit wp-orbit-one" />
          <div className="wp-orbit wp-orbit-two" />
          <span className="wp-stage-top">
            WALK TALK <span>CONCEPT / 01</span>
          </span>
          <picture>
            <source
              media="(max-width: 600px)"
              srcSet="/product/walk-talk-mobile.webp"
            />
            <img
              src="/product/walk-talk.webp"
              alt="Conceito do rádio WALK TALK preto, com antena e botão lateral PTT laranja"
              width="584"
              height="920"
              fetchPriority="high"
            />
          </picture>
          <figcaption>
            <span className="wp-stage-dot" /> DESENHADO PARA APROXIMAR
          </figcaption>
        </figure>
      </section>
      <section id="design" className="wp-wrap wp-section">
        <div className="wp-section-heading">
          <span className="wp-eyebrow">INTENÇÃO EM CADA DETALHE</span>
          <h2>A interação vem primeiro.</h2>
          <p>
            Uma linguagem visual que coloca a comunicação ao alcance da mão.
          </p>
        </div>
        <div className="wp-three-grid">
          {principles.map(({ icon: Icon, number, title, text }) => (
            <article className="wp-feature-card" key={number}>
              <div>
                <Icon size={25} />
                <span>{number}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="wp-wrap wp-story-panel">
        <div
          className="wp-signal-diagram"
          aria-label="Representação do percurso: voz, aparelho, satélite e destino"
          role="img"
        >
          <div>
            <AudioLines />
            <span>VOZ</span>
          </div>
          <i />
          <div>
            <Radio />
            <span>APARELHO</span>
          </div>
          <i />
          <div>
            <Satellite />
            <span>SATÉLITE</span>
          </div>
          <i />
          <div>
            <Users />
            <span>DESTINO</span>
          </div>
        </div>
        <div>
          <span className="wp-eyebrow">DA SUA MÃO AO OUTRO LADO</span>
          <h2>
            Veja a mensagem
            <br />
            ganhar o mundo.
          </h2>
          <p>
            Uma jornada interativa em seis etapas transforma a ideia de
            comunicação via satélite em uma experiência que você pode explorar
            no seu ritmo.
          </p>
          <a className="wp-text-link" href="/#jornada">
            Conhecer as seis etapas <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
      <section className="wp-wrap wp-section wp-two-grid">
        <article className="wp-detail-card">
          <Fingerprint />
          <h2>Explore sem gravar sua voz.</h2>
          <p>
            O PTT demonstrativo responde a mouse, toque e teclado. As ondas e os
            sons são sintetizados pelo navegador; o microfone não é usado.
          </p>
          <a className="wp-text-link" href="/privacidade">
            Entender o uso de dados <ArrowUpRight size={16} />
          </a>
        </article>
        <article className="wp-detail-card">
          <Route />
          <h2>Do conceito à rotina da equipe.</h2>
          <p>
            A apresentação é uma simulação educativa. O portal empresarial é
            funcional e armazena cadastros e mensagens, com acesso conforme o
            perfil.
          </p>
          <a className="wp-text-link" href="/solucoes">
            Explorar soluções para empresas <ArrowUpRight size={16} />
          </a>
        </article>
      </section>
      <PortalCTA />
    </PublicShell>
  );
}
