"use client";
import { useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowUpRight,
  Building2,
  Check,
  ClipboardCheck,
  HardHat,
  HeartPulse,
  MessagesSquare,
  Mountain,
  Radio,
  Truck,
  UserCog,
  Users,
} from "lucide-react";
import { PageHeading, PortalCTA, PublicShell } from "./PublicShell";

const sectors = [
  {
    id: "campo",
    label: "Equipes em campo",
    icon: Mountain,
    title: "Prepare a equipe antes de sair.",
    description:
      "Organize a base da operação: quem participa, quais aparelhos estão disponíveis e o que precisa ser alinhado antes da atividade.",
    steps: [
      "Crie uma equipe para a frente de trabalho.",
      "Associe os aparelhos e os responsáveis.",
      "Registre uma conferência manual e compartilhe orientações no canal da equipe.",
    ],
    note: "O portal precisa de internet. As conferências registradas são manuais e não representam localização ou telemetria dos aparelhos.",
    code: "FIELD OPERATIONS",
    image: true,
  },
  {
    id: "logistica",
    label: "Logística",
    icon: Truck,
    title: "Uma visão organizada dos aparelhos.",
    description:
      "Mantenha um inventário comum para as pessoas que coordenam a movimentação e a distribuição dos equipamentos.",
    steps: [
      "Cadastre os aparelhos com sua identificação.",
      "Atualize o status e a pessoa responsável.",
      "Filtre a listagem e exporte os dados autorizados em CSV.",
    ],
    note: "O inventário é atualizado pela equipe. O sistema não rastreia veículos, entregas, posição ou disponibilidade física em tempo real.",
    code: "LOGISTICS",
  },
  {
    id: "obras",
    label: "Obras e manutenção",
    icon: HardHat,
    title: "Cada frente de trabalho, seu espaço.",
    description:
      "Separe as equipes da empresa e reúna os alinhamentos de cada frente em canais de texto com acesso por perfil.",
    steps: [
      "Organize as frentes de serviço em equipes.",
      "Use convites para incluir gestores e colaboradores.",
      "Compartilhe alinhamentos no canal Geral ou no canal da equipe.",
    ],
    note: "As mensagens são comunicação administrativa pela internet. Não use o portal como canal de emergência ou substituto dos procedimentos de segurança.",
    code: "WORKSITE",
  },
];

export function SolutionsPage() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const current = sectors[selected];
  const changeTab = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % sectors.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + sectors.length) % sectors.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = sectors.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  };
  return (
    <PublicShell active="/solucoes">
      <section className="wp-wrap wp-intro wp-solutions-intro">
        <PageHeading
          eyebrow="WALK TALK / PARA EMPRESAS"
          title={
            <>
              GENTE CONECTADA.
              <br />
              <em>OPERAÇÃO ORGANIZADA.</em>
            </>
          }
          description="Um espaço para reunir as pessoas, os equipamentos e as conversas da sua empresa. Com clareza sobre quem pode acessar cada informação."
        />
        <a className="wp-button" href="/portal">
          Criar espaço da empresa <ArrowUpRight size={18} />
        </a>
        <div className="wp-capability-strip">
          <span>
            <Users size={17} />
            Equipes e perfis
          </span>
          <span>
            <Radio size={17} />
            Inventário de aparelhos
          </span>
          <span>
            <MessagesSquare size={17} />
            Mensagens por canal
          </span>
        </div>
      </section>
      <section className="wp-wrap wp-sector-section">
        <div className="wp-section-heading">
          <span className="wp-eyebrow">DO SEU JEITO DE TRABALHAR</span>
          <h2>Uma base. Diferentes rotinas.</h2>
          <p>Explore exemplos de como organizar o portal para sua operação.</p>
        </div>
        <div
          className="wp-sector-tabs"
          role="tablist"
          aria-label="Cenários de uso"
        >
          {sectors.map(({ id, label, icon: Icon }, index) => (
            <button
              key={id}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              role="tab"
              id={`sector-${id}`}
              aria-selected={selected === index}
              aria-controls="sector-panel"
              tabIndex={selected === index ? 0 : -1}
              onKeyDown={(event) => changeTab(event, index)}
              onClick={() => setSelected(index)}
            >
              <Icon size={19} />
              {label}
            </button>
          ))}
        </div>
        <div
          className="wp-sector-panel"
          role="tabpanel"
          id="sector-panel"
          aria-labelledby={`sector-${current.id}`}
          tabIndex={0}
        >
          <div
            className={`wp-sector-visual ${current.image ? "has-photo" : ""}`}
          >
            {current.image && (
              <img
                src="/landscapes/expedition.webp"
                alt="Paisagem montanhosa para ilustrar equipes em campo"
                width="1536"
                height="1024"
                loading="lazy"
              />
            )}
            <div className="wp-sector-overlay">
              <span>{current.code}</span>
              <current.icon size={58} strokeWidth={1} />
              <strong>{current.label}</strong>
              <small>Cenário ilustrativo de organização</small>
            </div>
          </div>
          <div className="wp-sector-copy">
            <span className="wp-eyebrow">FLUXO SUGERIDO / 0{selected + 1}</span>
            <h3>{current.title}</h3>
            <p>{current.description}</p>
            <ol>
              {current.steps.map((step, index) => (
                <li key={step}>
                  <span>0{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="wp-sector-note">{current.note}</p>
          </div>
        </div>
      </section>
      <section className="wp-wrap wp-section">
        <div className="wp-section-heading">
          <span className="wp-eyebrow">ACESSO COM CONTEXTO</span>
          <h2>Cada pessoa, seu papel.</h2>
          <p>
            As permissões são verificadas no servidor e limitadas à empresa.
          </p>
        </div>
        <div className="wp-three-grid wp-roles">
          <article>
            <UserCog />
            <h3>Administrador</h3>
            <p>Cria e organiza o espaço da empresa.</p>
            <ul>
              <li>
                <Check />
                Gerencia convites e perfis
              </li>
              <li>
                <Check />
                Organiza equipes e aparelhos
              </li>
              <li>
                <Check />
                Acessa os canais da empresa
              </li>
            </ul>
          </article>
          <article>
            <Building2 />
            <h3>Gestor</h3>
            <p>Acompanha a rotina e os equipamentos.</p>
            <ul>
              <li>
                <Check />
                Gerencia equipes e aparelhos
              </li>
              <li>
                <Check />
                Consulta o inventário da empresa
              </li>
              <li>
                <Check />
                Participa dos canais de comunicação
              </li>
            </ul>
          </article>
          <article>
            <Users />
            <h3>Colaborador</h3>
            <p>Participa com acesso ao seu contexto.</p>
            <ul>
              <li>
                <Check />
                Consulta aparelhos próprios e da equipe
              </li>
              <li>
                <Check />
                Confere aparelhos atribuídos a si
              </li>
              <li>
                <Check />
                Acessa Geral e o canal da sua equipe
              </li>
            </ul>
          </article>
        </div>
        <p className="wp-fineprint wp-role-note">
          O convite do portal e o acesso à hospedagem são controles separados.
          Para participar, a pessoa também precisa estar autorizada a abrir o
          site.
        </p>
      </section>
      <section className="wp-wrap wp-health-band">
        <div className="wp-health-band-icon">
          <HeartPulse size={37} strokeWidth={1.2} />
        </div>
        <div>
          <span className="wp-eyebrow">UMA ROTINA QUE TAMBÉM CUIDA</span>
          <h2>Saúde ocupacional é informação.</h2>
          <p>
            Uma página dedicada à prevenção de LER/DORT, ergonomia e organização
            do trabalho. Para consultar, conversar e buscar orientação.
          </p>
          <a className="wp-text-link" href="/saude">
            Explorar saúde ocupacional <ArrowUpRight size={17} />
          </a>
        </div>
        <ClipboardCheck
          className="wp-health-decoration"
          size={115}
          strokeWidth={0.7}
        />
      </section>
      <PortalCTA />
    </PublicShell>
  );
}
