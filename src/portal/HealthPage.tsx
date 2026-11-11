"use client";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Check,
  ChevronDown,
  Coffee,
  ExternalLink,
  Globe2,
  HeartPulse,
  Info,
  MessageCircle,
  Monitor,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import "./health.css";

const sources = {
  ministry: {
    title: "Ministério da Saúde",
    label: "Entenda LER/DORT",
    description:
      "Definição e informações sobre as condições relacionadas ao trabalho.",
    url: "https://www.gov.br/saude/pt-br/composicao/svsa/saude-do-trabalhador/vigilancia-em-saude-do-trabalhador-vigisat/doencas-e-agravos-relacionados-ao-trabalho/lesoes-por-esforcos-repetitivos-ler-disturbios-osteomusculares-relacionadas-ao-trabalho-dort",
  },
  regulation: {
    title: "Ministério do Trabalho e Emprego",
    label: "NR-17 · Ergonomia",
    description: "Página oficial com a norma e seus anexos vigentes.",
    url: "https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/norma-regulamentadora-no-17-nr-17",
  },
  organization: {
    title: "Fundacentro",
    label: "Prevenção e organização do trabalho",
    description:
      "O papel das condições, das demandas e da participação dos trabalhadores.",
    url: "https://www.gov.br/fundacentro/pt-br/comunicacao/noticias/noticias/2022/marco/prevencao-as-ler-dort-requer-olhar-para-organizacao-do-trabalho",
  },
  support: {
    title: "Fundacentro",
    label: "Acolhimento e prevenção de LER/DORT",
    description:
      "Por que ouvir os trabalhadores faz parte das ações preventivas.",
    url: "https://www.gov.br/fundacentro/pt-br/comunicacao/noticias/noticias/2023/marco/especialistas-debatem-superacao-e-prevencao-das-ler-dort-1",
  },
};

const topics = [
  {
    id: "entenda",
    icon: Activity,
    tag: "CONHECIMENTO",
    title: "Entenda LER/DORT",
    summary:
      "Conhecer os fatores do trabalho é o primeiro passo para conversar sobre prevenção.",
    body: "LER significa Lesões por Esforços Repetitivos. DORT são Distúrbios Osteomusculares Relacionados ao Trabalho. Essas condições podem ser causadas, mantidas ou agravadas pelo trabalho e envolvem vários fatores. Dor, formigamento e fadiga muscular não confirmam um diagnóstico por si só.",
    action:
      "Conheça as condições da sua atividade e procure orientação quando necessário.",
    source: sources.ministry,
  },
  {
    id: "posto",
    icon: Monitor,
    tag: "ERGONOMIA",
    title: "O posto se adapta a você",
    summary:
      "Mobiliário, telas e ferramentas devem favorecer a atividade que você realiza.",
    body: "Observe a posição de telas, ferramentas e materiais, o espaço disponível e a facilidade de ajuste do mobiliário. Evite precisar alcançar objetos distantes ou manter posições extremas para trabalhar.",
    action:
      "Relate necessidades de ajuste ao responsável pela ergonomia na empresa.",
    source: sources.regulation,
  },
  {
    id: "pausas",
    icon: Coffee,
    tag: "RECUPERAÇÃO",
    title: "Pausa também é cuidado",
    summary:
      "Descanso precisa caber na rotina, sem acelerar o trabalho para compensá-lo.",
    body: "A duração e a organização das pausas dependem da atividade, da avaliação ergonômica e das regras aplicáveis. Não existe aqui uma recomendação única de tempo para todas as pessoas e funções.",
    action:
      "Siga a orientação definida para o seu trabalho. Um cronômetro genérico não substitui essa avaliação.",
    source: sources.regulation,
  },
  {
    id: "alternancia",
    icon: Users,
    tag: "ROTINA",
    title: "Varie com planejamento",
    summary:
      "Alternar atividades faz sentido quando muda, de fato, as exigências do trabalho.",
    body: "Repetição, força e posições mantidas merecem atenção conjunta. Trocar de tarefa só ajuda quando a mudança realmente permite variar as exigências do trabalho, considerando sua execução e os recursos disponíveis.",
    action:
      "Converse com a equipe sobre alternativas seguras e compatíveis com a atividade.",
    source: sources.organization,
  },
  {
    id: "escuta",
    icon: MessageCircle,
    tag: "ORGANIZAÇÃO",
    title: "Prevenir também é ouvir",
    summary:
      "A experiência de quem realiza as tarefas precisa fazer parte das melhorias.",
    body: "Metas, ritmo, volume de tarefas e recursos disponíveis influenciam as condições de trabalho. Melhorias precisam considerar a experiência dos trabalhadores e suas dificuldades reais.",
    action:
      "Use os canais da empresa para discutir condições de trabalho. Preserve informações clínicas em espaços coletivos.",
    source: sources.organization,
  },
  {
    id: "apoio",
    icon: HeartPulse,
    tag: "ORIENTAÇÃO",
    title: "Saiba quando buscar apoio",
    summary:
      "Desconfortos recorrentes merecem atenção e uma conversa com um profissional.",
    body: "Se sintomas persistirem ou prejudicarem suas atividades, procure a equipe de saúde ocupacional ou um serviço de saúde. Interrompa movimentos que provoquem dor e peça orientação individual.",
    action:
      "Busque atendimento. Esta página não identifica doenças nem recomenda tratamentos.",
    source: sources.support,
  },
];

const checklist = [
  "O mobiliário permite ajustes para a tarefa?",
  "Os materiais frequentes ficam ao alcance?",
  "Há espaço para movimentação e mudança de posição?",
  "Telas e iluminação permitem leitura confortável?",
  "Existem tarefas com força ou repetição que precisam ser revistas?",
  "A rotina permite descanso e alternância planejados?",
  "As demandas são compatíveis com os recursos disponíveis?",
  "Existe um canal para propor melhorias nas condições de trabalho?",
];

const questions = [
  {
    question: "LER e DORT são a mesma coisa?",
    answer:
      "São denominações usadas para condições musculoesqueléticas relacionadas ao trabalho. DORT destaca essa relação e não restringe a explicação à repetição. A identificação de uma condição exige avaliação profissional.",
    source: sources.ministry,
  },
  {
    question: "Existe um intervalo de pausa válido para todo trabalho?",
    answer:
      "Não adote uma regra única para todas as funções. A definição depende da atividade, da avaliação ergonômica e das regras aplicáveis. Consulte a orientação estabelecida para seu trabalho.",
    source: sources.regulation,
  },
  {
    question: "Alongamento resolve sozinho?",
    answer:
      "A prevenção não se limita a uma atividade individual. Também envolve tarefas, mobiliário, ritmo, recursos e organização do trabalho. Orientações de movimento precisam respeitar as condições de cada pessoa; não force movimentos dolorosos.",
    source: sources.organization,
  },
  {
    question: "O roteiro desta página faz uma avaliação ergonômica?",
    answer:
      "Não. Ele apenas ajuda a observar o ambiente e levantar questões para uma avaliação adequada. Não é um diagnóstico, uma análise profissional ou uma comprovação de atendimento à NR-17.",
    source: sources.regulation,
  },
  {
    question: "Onde posso buscar orientação?",
    answer:
      "Procure a equipe de saúde ocupacional da empresa ou um serviço de saúde. Se precisar discutir condições da atividade com a liderança, use os canais apropriados e evite expor informações clínicas em espaços coletivos.",
    source: sources.support,
  },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function WorkstationIllustration() {
  return (
    <div className="wt-health-illustration" aria-hidden="true">
      <div className="wt-health-scene-label">
        <span /> UM AMBIENTE QUE ACOLHE
      </div>
      <svg viewBox="0 0 460 310" fill="none">
        <defs>
          <linearGradient
            id="wt-health-screen"
            x1="194"
            y1="75"
            x2="342"
            y2="185"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#123348" />
            <stop offset="1" stopColor="#0a1d32" />
          </linearGradient>
          <linearGradient
            id="wt-health-desk"
            x1="95"
            y1="180"
            x2="375"
            y2="205"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#3b6e86" />
            <stop offset="1" stopColor="#173447" />
          </linearGradient>
        </defs>
        <circle cx="252" cy="144" r="119" fill="#0c263b" />
        <circle
          cx="252"
          cy="144"
          r="141"
          stroke="#2a526c"
          strokeDasharray="3 8"
        />
        <path d="M58 270H404" stroke="#5c829c" strokeWidth="1.5" />
        <path
          d="M108 198L102 269M352 198L358 269"
          stroke="#638ca6"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <rect
          x="89"
          y="184"
          width="285"
          height="14"
          rx="6"
          fill="url(#wt-health-desk)"
        />
        <path
          d="M250 151V181M229 182H272"
          stroke="#4d7590"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <rect x="177" y="64" width="157" height="101" rx="10" fill="#47738b" />
        <rect
          x="183"
          y="70"
          width="145"
          height="85"
          rx="5"
          fill="url(#wt-health-screen)"
        />
        <rect x="197" y="85" width="51" height="6" rx="3" fill="#67e8f9" />
        <rect x="197" y="99" width="81" height="4" rx="2" fill="#4d8ba2" />
        <rect x="197" y="109" width="67" height="4" rx="2" fill="#4d8ba2" />
        <path
          d="M198 137H218L226 126L237 142L249 123L257 137H291"
          stroke="#22d3ee"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="304" cy="89" r="9" fill="#173a4e" />
        <path
          d="M300 89L303 92L308 86"
          stroke="#22d3ee"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="207" y="177" width="78" height="5" rx="2.5" fill="#70a1b8" />
        <rect x="293" y="175" width="17" height="8" rx="4" fill="#70a1b8" />
        <path
          d="M127 181V151M127 161C111 159 104 148 105 139C119 139 126 148 127 161ZM127 167C141 165 149 154 147 146C135 147 127 157 127 167Z"
          stroke="#49b8a7"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M115 169H139L135 184H119L115 169Z" fill="#bd865e" />
        <path
          d="M324 162H343V178C343 181 324 181 324 178V162Z"
          fill="#e8a066"
        />
        <path
          d="M344 164H348C355 164 355 174 348 174H344"
          stroke="#b77b47"
          strokeWidth="3"
        />
        <path
          d="M332 151C328 147 336 144 332 140"
          stroke="#5c829c"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M137 209H198V223C198 228 137 228 137 223V209Z"
          fill="#28596e"
        />
        <path
          d="M143 154C143 146 151 142 160 142H170C179 142 184 146 184 154V203H143V154Z"
          fill="#39748a"
        />
        <path
          d="M149 154V194"
          stroke="#6099b0"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M167 227V255M145 268L167 255L191 268"
          stroke="#567f98"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="144" cy="268" r="4" fill="#47738b" />
        <circle cx="192" cy="268" r="4" fill="#47738b" />
        <path
          d="M146 194H131V209M182 194H204V209"
          stroke="#4c7891"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="377" cy="106" r="20" fill="#103048" stroke="#315f77" />
        <path
          d="M369 106L375 112L385 100"
          stroke="#22d3ee"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M366 124L349 143" stroke="#416d85" strokeDasharray="3 4" />
      </svg>
      <div className="wt-health-scene-tags">
        <span>
          <Monitor size={13} /> Posto
        </span>
        <span>
          <Coffee size={13} /> Rotina
        </span>
        <span>
          <MessageCircle size={13} /> Escuta
        </span>
      </div>
    </div>
  );
}

export function HealthPage({ standalone = false }: { standalone?: boolean }) {
  const Content = standalone ? "main" : "div";
  const [query, setQuery] = useState("");
  const [observed, setObserved] = useState<Set<number>>(() => new Set());
  const filteredTopics = useMemo(() => {
    const term = normalize(query.trim());
    return topics.filter((topic) =>
      normalize(
        `${topic.tag} ${topic.title} ${topic.summary} ${topic.body} ${topic.action}`,
      ).includes(term),
    );
  }, [query]);
  const toggleObservation = (index: number) => {
    setObserved((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className={`wt-health ${standalone ? "wt-health-standalone" : ""}`}>
      {standalone && (
        <header className="wt-health-topbar">
          <a href="/" className="wt-health-brand">
            <Globe2 size={28} strokeWidth={1.5} />
            <span>
              WALK<span>TALK</span>
              <small>COMUNICAÇÃO QUE CUIDA</small>
            </span>
          </a>
          <nav aria-label="Navegação de saúde ocupacional">
            <a href="/produto">Produto</a>
            <a href="/solucoes">Soluções</a>
            <a href="/ajuda">Ajuda</a>
            <a href="/portal" className="wt-health-portal-link">
              Portal da empresa <ArrowUpRight size={15} />
            </a>
          </nav>
        </header>
      )}
      <Content className="wt-health-content">
        <section className="wt-health-hero" aria-labelledby="wt-health-title">
          <div className="wt-health-hero-copy">
            <div className="wt-health-eyebrow">
              <span /> SAÚDE OCUPACIONAL
            </div>
            <h1 id="wt-health-title">
              CUIDAR DA ROTINA.
              <br />
              <span>PROTEGER O FUTURO.</span>
            </h1>
            <p>
              Um trabalho melhor começa com informação. Conheça cuidados gerais
              para prevenir LER/DORT e tornar a rotina mais confortável.
            </p>
            <div className="wt-health-hero-actions">
              <a href="#wt-health-topics" className="wt-health-button">
                Explorar orientações <ArrowUpRight size={16} />
              </a>
              <span className="wt-health-education">
                <ShieldCheck size={15} /> CONTEÚDO EDUCATIVO
              </span>
            </div>
          </div>
          <WorkstationIllustration />
        </section>

        <div className="wt-health-intro">
          <Info size={20} />
          <p>
            A prevenção envolve{" "}
            <strong>o posto, as tarefas e a organização do trabalho</strong>,
            com participação de quem realiza as atividades. Esta página informa;
            não substitui orientação profissional.
          </p>
        </div>

        <section
          id="wt-health-topics"
          className="wt-health-topics"
          aria-labelledby="wt-health-topics-title"
        >
          <div className="wt-health-section-heading">
            <div>
              <span className="wt-health-kicker">
                PEQUENAS LEITURAS. CONVERSAS IMPORTANTES.
              </span>
              <h2 id="wt-health-topics-title">
                Conhecimento para o dia a dia.
              </h2>
            </div>
            <div className="wt-health-search">
              <label htmlFor="wt-health-search">Buscar orientações</label>
              <div>
                <Search size={17} />
                <input
                  id="wt-health-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ex.: pausas, ergonomia..."
                  autoComplete="off"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label="Limpar busca"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
          <p
            className="wt-health-search-status"
            role="status"
            aria-live="polite"
          >
            {query
              ? `${filteredTopics.length} ${filteredTopics.length === 1 ? "orientação encontrada" : "orientações encontradas"}.`
              : "Abra um tema para conhecer orientações e fontes."}
          </p>
          <div className="wt-health-topic-grid">
            {filteredTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <details key={topic.id} className="wt-health-topic-card">
                  <summary>
                    <span className="wt-health-topic-top">
                      <span className="wt-health-topic-icon">
                        <Icon size={23} strokeWidth={1.6} />
                      </span>
                      <span className="wt-health-topic-tag">{topic.tag}</span>
                    </span>
                    <h3>{topic.title}</h3>
                    <p>{topic.summary}</p>
                    <span className="wt-health-read">
                      <span>Explorar orientação</span>
                      <ChevronDown size={17} />
                    </span>
                  </summary>
                  <div className="wt-health-topic-body">
                    <p>{topic.body}</p>
                    <div className="wt-health-action">
                      <span>NA PRÁTICA</span>
                      <p>{topic.action}</p>
                    </div>
                    <a
                      href={topic.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Fonte: {topic.source.title} <ExternalLink size={13} />
                      <span className="wt-health-sr-only">
                        {" "}
                        (abre em nova aba)
                      </span>
                    </a>
                  </div>
                </details>
              );
            })}
          </div>
          {filteredTopics.length === 0 && (
            <div className="wt-health-empty">
              <Search size={29} />
              <h3>Nenhum tema encontrado.</h3>
              <p>Tente buscar por “rotina”, “pausas” ou “apoio”.</p>
              <button
                className="wt-health-text-button"
                onClick={() => setQuery("")}
              >
                Ver todas as orientações <ArrowUpRight size={15} />
              </button>
            </div>
          )}
        </section>

        <section
          className="wt-health-checklist-section"
          aria-labelledby="wt-health-checklist-title"
        >
          <div className="wt-health-checklist-copy">
            <span className="wt-health-kicker">UM OLHAR PARA O AMBIENTE</span>
            <h2 id="wt-health-checklist-title">
              O que vale
              <br />
              <span>observar hoje?</span>
            </h2>
            <p>
              Use este roteiro para iniciar uma conversa sobre as condições de
              trabalho. Marque apenas o que você já observou.
            </p>
            <div className="wt-health-local-note">
              <ShieldCheck size={18} />
              <p>
                Suas marcações ficam apenas nesta tela e desaparecem ao
                recarregar. Nenhuma resposta é enviada.
              </p>
            </div>
            <button
              className="wt-health-text-button"
              onClick={() => setObserved(new Set())}
              disabled={observed.size === 0}
            >
              Limpar marcações <X size={14} />
            </button>
          </div>
          <div className="wt-health-checklist">
            <div className="wt-health-checklist-label">
              <span>ROTEIRO EDUCATIVO</span>
              <span>JÁ OBSERVEI</span>
            </div>
            {checklist.map((item, index) => (
              <label
                key={item}
                className={`wt-health-check-item ${observed.has(index) ? "is-observed" : ""}`}
              >
                <span>{item}</span>
                <input
                  type="checkbox"
                  checked={observed.has(index)}
                  onChange={() => toggleObservation(index)}
                />
                <span className="wt-health-check-box" aria-hidden="true">
                  {observed.has(index) && <Check size={15} />}
                </span>
              </label>
            ))}
            <p className="wt-health-checklist-disclaimer">
              Este roteiro não é uma avaliação ergonômica, um diagnóstico ou uma
              comprovação de atendimento à NR-17.
            </p>
          </div>
        </section>

        <section
          className="wt-health-faq-section"
          aria-labelledby="wt-health-faq-title"
        >
          <div className="wt-health-section-heading">
            <div>
              <span className="wt-health-kicker">
                INFORMAÇÃO SEM COMPLICAÇÃO
              </span>
              <h2 id="wt-health-faq-title">Dúvidas que merecem atenção.</h2>
            </div>
            <MessageCircle size={27} strokeWidth={1.4} />
          </div>
          <div className="wt-health-faq">
            {questions.map((item) => (
              <details key={item.question}>
                <summary>
                  <h3>{item.question}</h3>
                  <ChevronDown size={18} />
                </summary>
                <div>
                  <p>{item.answer}</p>
                  <a
                    href={item.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Consultar fonte oficial <ExternalLink size={13} />
                    <span className="wt-health-sr-only">
                      {" "}
                      (abre em nova aba)
                    </span>
                  </a>
                </div>
              </details>
            ))}
          </div>
        </section>

        <aside
          className="wt-health-support"
          aria-labelledby="wt-health-support-title"
        >
          <div className="wt-health-support-icon">
            <HeartPulse size={29} strokeWidth={1.5} />
          </div>
          <div>
            <span className="wt-health-kicker">
              VOCÊ NÃO PRECISA LIDAR COM ISSO SOZINHO
            </span>
            <h2 id="wt-health-support-title">Persistiu? Procure orientação.</h2>
            <p>
              Se o desconforto persistir ou dificultar suas atividades, procure
              a equipe de saúde ocupacional ou um serviço de saúde. Interrompa
              movimentos que provoquem dor e peça orientação individual.
            </p>
          </div>
        </aside>

        <section
          className="wt-health-sources-section"
          aria-labelledby="wt-health-sources-title"
        >
          <div className="wt-health-section-heading">
            <div>
              <span className="wt-health-kicker">
                PARA CONTINUAR APRENDENDO
              </span>
              <h2 id="wt-health-sources-title">
                Informação de fontes oficiais.
              </h2>
            </div>
            <span className="wt-health-reviewed">
              Referências consultadas em 04/11/2026
            </span>
          </div>
          <div className="wt-health-sources">
            {Object.values(sources).map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="wt-health-source-org">{source.title}</span>
                <h3>{source.label}</h3>
                <p>{source.description}</p>
                <span className="wt-health-source-link">
                  Consultar publicação <ArrowUpRight size={16} />
                  <span className="wt-health-sr-only"> (abre em nova aba)</span>
                </span>
              </a>
            ))}
          </div>
        </section>
      </Content>
      {standalone && (
        <footer className="wt-health-footer">
          <span>
            WALK TALK{" "}
            <span>· Comunicação que aproxima. Informação que cuida.</span>
          </span>
          <a href="/portal">
            Voltar à plataforma <ArrowUpRight size={14} />
          </a>
        </footer>
      )}
    </div>
  );
}
