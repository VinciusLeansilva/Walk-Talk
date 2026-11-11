"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  Globe2,
  HeartPulse,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Radio,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type {
  Session,
  Overview,
  DevicesResponse,
  Device,
  InvitationCreated,
  InvitationsResponse,
  TeamsResponse,
  Role,
} from "../../server/types";
import {
  api,
  ApiError,
  formatDate,
  notify,
  roleLabel,
  useNotice,
  useResource,
} from "./api";
import { Avatar, EmptyState, ErrorNotice, Loading, Modal, Panel } from "./ui";
import { DeviceView } from "./DeviceView";
import { TeamView } from "./TeamView";
import { MessageView } from "./MessageView";
import { HealthPage } from "./HealthPage";
import "./portal.css";

type View =
  "overview" | "devices" | "teams" | "messages" | "health" | "settings";
const links = [
  { id: "overview" as const, label: "Visão geral", icon: LayoutDashboard },
  { id: "devices" as const, label: "Equipamentos", icon: Radio },
  { id: "teams" as const, label: "Equipes e pessoas", icon: Users },
  { id: "messages" as const, label: "Comunicação", icon: MessageSquare },
  { id: "health" as const, label: "Saúde ocupacional", icon: HeartPulse },
  { id: "settings" as const, label: "Acessos e convites", icon: Settings },
];
export function PortalLogo() {
  return (
    <a href="/" className="wt-logo">
      <Globe2 size={29} strokeWidth={1.3} />
      <span>
        WALK<span>TALK</span>
        <small>EMPRESAS</small>
      </span>
    </a>
  );
}
function Toast() {
  const { notice, dismiss } = useNotice();
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(dismiss, 6000);
    return () => clearTimeout(timer);
  }, [notice, dismiss]);
  return notice ? (
    <div
      className={`wt-toast ${notice.kind}`}
      role={notice.kind === "error" ? "alert" : "status"}
    >
      <Check size={18} />
      <span>{notice.message}</span>
      <button aria-label="Fechar aviso" onClick={dismiss}>
        <X size={16} />
      </button>
    </div>
  ) : null;
}
export function PortalApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [view, setView] = useState<View>("overview");
  const [menu, setMenu] = useState(false);
  const [invite, setInvite] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const loadSession = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSession(await api<Session>("/session"));
      setUnauthorized(false);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401)
        setUnauthorized(true);
      else
        setError(
          cause instanceof Error
            ? cause.message
            : "Falha ao carregar o portal.",
        );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const token = new URL(location.href).searchParams.get("convite");
    if (token) setInvite(token);
    void loadSession();
    const parse = () => {
      const id = location.hash.slice(1);
      if (links.some((l) => l.id === id)) setView(id as View);
    };
    parse();
    window.addEventListener("hashchange", parse);
    return () => window.removeEventListener("hashchange", parse);
  }, [loadSession]);
  useEffect(() => {
    if (!menu) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menu]);
  const select = (next: View) => {
    setView(next);
    setMenu(false);
    history.replaceState(
      null,
      "",
      `${location.pathname}${location.search}#${next}`,
    );
    document.getElementById("portal-content")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  if (loading && !session)
    return (
      <div className="wt-app wt-gate">
        <PortalLogo />
        <Loading label="Preparando seu espaço de trabalho…" />
      </div>
    );
  if (error && !session)
    return (
      <div className="wt-app wt-gate">
        <PortalLogo />
        <ErrorNotice message={error} onRetry={() => void loadSession()} />
        <a href="/">Voltar para WALK TALK</a>
      </div>
    );
  if (unauthorized || !session)
    return (
      <div className="wt-app">
        <EntryScreen invite={invite} />
      </div>
    );
  if (invite && !session.member)
    return (
      <div className="wt-app">
        <JoinInvitation
          token={invite}
          session={session}
          onJoined={() => {
            setInvite(null);
            history.replaceState(null, "", "/portal");
            void loadSession();
          }}
        />
        <Toast />
      </div>
    );
  if (!session.member || !session.workspace)
    return (
      <div className="wt-app">
        <WorkspaceSetup
          session={session}
          onCreated={() => void loadSession()}
        />
        <Toast />
      </div>
    );
  const effectiveView =
    view === "settings" && session.member.role !== "admin" ? "overview" : view;
  return (
    <div className="wt-app">
      <a className="wt-skip" href="#portal-content">
        Pular para o conteúdo
      </a>
      {menu && (
        <button
          className="wt-sidebar-backdrop"
          aria-label="Fechar navegação"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`wt-sidebar ${menu ? "is-open" : ""}`}>
        <PortalLogo />
        <div className="wt-workspace">
          <span className="wt-workspace-icon">
            {session.workspace.name.slice(0, 1).toUpperCase()}
          </span>
          <span>
            <strong>{session.workspace.name}</strong>
            <small>Seu espaço de trabalho</small>
          </span>
          <ShieldCheck size={16} />
        </div>
        <span className="wt-nav-label">ESPAÇO DA EMPRESA</span>
        <nav aria-label="Navegação do portal">
          {links
            .filter(
              (l) => l.id !== "settings" || session.member!.role === "admin",
            )
            .map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => select(id)}
                className={effectiveView === id ? "active" : ""}
                aria-current={effectiveView === id ? "page" : undefined}
              >
                <Icon size={19} />
                <span>{label}</span>
                {id === "health" && <span className="wt-nav-dot" />}
              </button>
            ))}
        </nav>
        <div className="wt-sidebar-resource">
          <span className="wt-mini-orbit">
            <Globe2 size={30} strokeWidth={1} />
          </span>
          <strong>Conexão sem fronteiras.</strong>
          <p>Conheça a experiência WALK TALK.</p>
          <a href="/produto">
            Explorar o produto <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="wt-sidebar-user">
          <Avatar name={session.user.name} />
          <span>
            <strong>{session.user.name}</strong>
            <small>{roleLabel[session.member.role]}</small>
          </span>
          <a
            href="/signout-with-chatgpt?return_to=/portal"
            target="_top"
            aria-label="Sair do portal"
          >
            <LogOut size={17} />
          </a>
        </div>
      </aside>
      <div className="wt-main">
        <header className="wt-topbar">
          <div>
            <button
              ref={menuButton}
              className="wt-icon-button wt-menu-button"
              aria-label="Abrir navegação do portal"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              <Menu size={21} />
            </button>
            <span className="wt-breadcrumb">
              Empresa <ChevronRight size={13} />
              <strong>
                {links.find((l) => l.id === effectiveView)?.label}
              </strong>
            </span>
          </div>
          <div className="wt-topbar-right">
            <span className="wt-access">
              <span /> Acesso {roleLabel[session.member.role].toLowerCase()}
            </span>
            <a
              href="/ajuda"
              className="wt-help-link"
              aria-label="Abrir central de ajuda"
            >
              <CircleHelp size={18} />
            </a>
            <a
              href="/saude"
              className="wt-help-link"
              aria-label="Abrir página de saúde ocupacional"
            >
              <HeartPulse size={18} />
            </a>
            <Avatar name={session.user.name} />
          </div>
        </header>
        <main
          id="portal-content"
          tabIndex={-1}
          className={`wt-content ${effectiveView === "health" ? "wt-content-health" : ""}`}
        >
          {session.workspace.isDemo && (
            <div className="wt-demo-banner">
              <Sparkles size={15} />
              <span>
                Ambiente com exemplos fictícios. Os registros de exemplo estão
                identificados.
              </span>
            </div>
          )}
          {effectiveView === "overview" && (
            <OverviewView session={session} navigate={select} />
          )}
          {effectiveView === "devices" && <DeviceView session={session} />}
          {effectiveView === "teams" && <TeamView session={session} />}
          {effectiveView === "messages" && <MessageView session={session} />}
          {effectiveView === "health" && <HealthPage />}
          {effectiveView === "settings" && <SettingsView session={session} />}
        </main>
        <footer className="wt-app-footer">
          <span>WALK TALK EMPRESAS · COMUNICAÇÃO QUE APROXIMA</span>
          <a href="/privacidade">
            Dados e privacidade <ArrowUpRight size={12} />
          </a>
        </footer>
      </div>
      <Toast />
    </div>
  );
}
function EntryScreen({ invite }: { invite: string | null }) {
  const returnTo = invite
    ? `/portal?convite=${encodeURIComponent(invite)}`
    : "/portal";
  return (
    <div className="wt-entry">
      <div className="wt-entry-visual">
        <PortalLogo />
        <div className="wt-entry-orbit" aria-hidden="true">
          <Globe2 strokeWidth={0.45} />
        </div>
        <div className="wt-entry-copy">
          <span className="wt-eyebrow">WALK TALK EMPRESAS</span>
          <h1>
            BOAS CONEXÕES.
            <br />
            <span>GRANDES EQUIPES.</span>
          </h1>
          <p>
            Seu time, seus equipamentos e suas conversas. Tudo no mesmo espaço.
          </p>
          <div className="wt-entry-features">
            <span>
              <Radio size={17} /> Gestão de aparelhos
            </span>
            <span>
              <Users size={17} /> Equipes conectadas
            </span>
            <span>
              <HeartPulse size={17} /> Informação que cuida
            </span>
          </div>
        </div>
        <small>COMUNICAÇÃO SEM FRONTEIRAS.</small>
      </div>
      <div className="wt-entry-form">
        <span className="wt-entry-icon">
          <ShieldCheck size={27} />
        </span>
        <span className="wt-eyebrow">SEU ESPAÇO DE TRABALHO</span>
        <h2>
          {invite ? "Sua equipe espera por você." : "Pronto para se conectar?"}
        </h2>
        <p>
          {invite
            ? "Entre com a conta associada ao seu convite para participar da empresa."
            : "Acesse o portal para organizar a operação, conversar com a equipe e cuidar da rotina."}
        </p>
        <a
          className="wt-button"
          href={`/signin-with-chatgpt?return_to=${encodeURIComponent(returnTo)}`}
          target="_top"
        >
          Entrar com ChatGPT <ArrowRight size={18} />
        </a>
        <div className="wt-entry-note">
          <ShieldCheck size={16} />
          <span>
            Uma conta, permissões por perfil e dados separados por empresa.
          </span>
        </div>
        <a className="wt-entry-back" href="/">
          Conhecer o WALK TALK <ArrowUpRight size={15} />
        </a>
        <a className="wt-entry-back" href="/saude">
          Informações sobre saúde no trabalho <ArrowUpRight size={15} />
        </a>
      </div>
    </div>
  );
}
function WorkspaceSetup({
  session,
  onCreated,
}: {
  session: Session;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [examples, setExamples] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="wt-setup">
      <PortalLogo />
      <div className="wt-setup-card">
        <span className="wt-entry-icon">
          <Users size={27} />
        </span>
        <span className="wt-eyebrow">COMECE PELA SUA EQUIPE</span>
        <h1>
          Um espaço para
          <br />
          ir mais longe.
        </h1>
        <p>
          Olá, {session.user.name.split(" ")[0]}. Crie sua empresa para
          gerenciar equipamentos e acessos. Você será o administrador.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            setError("");
            try {
              await api("/workspace", {
                method: "POST",
                body: JSON.stringify({ name, withExamples: examples }),
              });
              onCreated();
            } catch (c) {
              setError(
                c instanceof Error
                  ? c.message
                  : "Não foi possível criar a empresa.",
              );
            } finally {
              setPending(false);
            }
          }}
        >
          <label className="wt-label" htmlFor="workspace-name">
            Nome da empresa
          </label>
          <input
            id="workspace-name"
            className="wt-input"
            placeholder="Ex.: Horizonte Operações"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            maxLength={100}
            required
          />
          <label className="wt-checkbox">
            <input
              type="checkbox"
              checked={examples}
              onChange={(e) => setExamples(e.target.checked)}
            />
            <span>
              Incluir equipes e aparelhos fictícios para explorar
              <small>
                Os exemplos ficam identificados; você poderá arquivar os
                aparelhos.
              </small>
            </span>
          </label>
          {error && <ErrorNotice message={error} />}
          <button className="wt-button" disabled={pending}>
            {pending ? <LoaderCircle size={18} /> : <Plus size={18} />}{" "}
            {pending ? "Criando seu espaço…" : "Criar empresa"}
          </button>
        </form>
        <p className="wt-setup-hint">
          Recebeu um convite? Abra o link enviado pelo administrador para entrar
          na empresa existente.
        </p>
      </div>
      <a href="/">← Voltar à apresentação</a>
    </div>
  );
}
function JoinInvitation({
  token,
  session,
  onJoined,
}: {
  token: string;
  session: Session;
  onJoined: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="wt-setup">
      <PortalLogo />
      <div className="wt-setup-card">
        <span className="wt-entry-icon">
          <Users size={28} />
        </span>
        <h1>Vamos trabalhar juntos.</h1>
        <p>
          Você está conectado como <strong>{session.user.email}</strong>. Aceite
          o convite para entrar na empresa com o perfil definido pelo
          administrador.
        </p>
        {error && <ErrorNotice message={error} />}
        <button
          className="wt-button"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            setError("");
            try {
              await api("/invitations/accept", {
                method: "POST",
                body: JSON.stringify({ token }),
              });
              onJoined();
            } catch (c) {
              setError(
                c instanceof Error ? c.message : "Convite indisponível.",
              );
            } finally {
              setPending(false);
            }
          }}
        >
          {pending ? "Validando convite…" : "Aceitar convite"}
          <ArrowRight size={17} />
        </button>
        <a
          href="/signout-with-chatgpt?return_to=/portal"
          target="_top"
          className="wt-entry-back"
        >
          Entrar com outra conta
        </a>
      </div>
    </div>
  );
}
function OverviewView({
  session,
  navigate,
}: {
  session: Session;
  navigate: (view: View) => void;
}) {
  const { data, loading, error, reload } = useResource<Overview>("/overview");
  const inventory = useResource<DevicesResponse>("/devices");
  if (loading && !data) return <Loading />;
  if (error)
    return <ErrorNotice message={error} onRetry={() => void reload()} />;
  if (!data) return null;
  const stats = [
    {
      label: "Equipamentos",
      value: data.devices.total,
      detail: "no seu alcance de acesso",
      icon: Radio,
      color: "blue",
    },
    {
      label: "Disponíveis",
      value: data.devices.available,
      detail: "prontos para atribuição",
      icon: CircleCheck,
      color: "teal",
    },
    {
      label: "Em operação",
      value: data.devices.inUse,
      detail: "com uso registrado",
      icon: Activity,
      color: "orange",
    },
    {
      label: "Pessoas conectadas",
      value: data.members,
      detail: `em ${data.teams} ${data.teams === 1 ? "equipe" : "equipes"}`,
      icon: Users,
      color: "purple",
    },
  ];
  return (
    <>
      <div className="wt-page-heading">
        <div>
          <span className="wt-eyebrow">SUA OPERAÇÃO, MAIS PERTO</span>
          <h1>
            Olá, {session.user.name.split(" ")[0]}.{" "}
            <span className="wt-greeting-dot" />
          </h1>
          <p>Uma visão clara para começar o próximo movimento.</p>
        </div>
        <button
          className="wt-button-secondary"
          onClick={() => {
            void reload();
            void inventory.reload();
          }}
        >
          <RefreshCw size={15} /> Atualizar
        </button>
      </div>
      <section className="wt-welcome-banner">
        <div>
          <span className="wt-pill">
            <span /> CONECTE. ORGANIZE. CUIDE.
          </span>
          <h2>
            O próximo passo
            <br />
            começa com a sua equipe.
          </h2>
          <p>
            Equipamentos organizados. Conversas próximas.
            <br />
            Mais espaço para fazer um bom trabalho.
          </p>
          <button
            onClick={() => navigate("devices")}
            className="wt-banner-action"
          >
            Explorar equipamentos <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="wt-banner-product">
          <span className="wt-banner-ring ring-one" />
          <span className="wt-banner-ring ring-two" />
          <Globe2 className="wt-banner-globe" strokeWidth={0.5} />
          <img
            src="/product/walk-talk-mobile.webp"
            alt="Conceito visual do comunicador WALK TALK"
            width="480"
            height="720"
          />
          <span className="wt-banner-product-label">
            <span /> WALK TALK · DESIGN CONCEITUAL
          </span>
        </div>
      </section>
      <div className="wt-stat-grid">
        {stats.map(({ label, value, detail, icon: Icon, color }) => (
          <article className="wt-stat" key={label}>
            <div>
              <span>{label}</span>
              <span className={`wt-stat-icon ${color}`}>
                <Icon size={19} />
              </span>
            </div>
            <strong>{value.toString().padStart(2, "0")}</strong>
            <small>{detail}</small>
          </article>
        ))}
      </div>
      <div className="wt-dashboard-columns">
        <Panel
          title="Seus equipamentos"
          action={
            <button
              className="wt-text-button"
              onClick={() => navigate("devices")}
            >
              Ver todos <ArrowUpRight size={15} />
            </button>
          }
        >
          {inventory.data?.devices.length ? (
            <div className="wt-device-preview">
              {inventory.data.devices.slice(0, 4).map((device) => (
                <button
                  onClick={() => navigate("devices")}
                  className="wt-preview-row"
                  key={device.id}
                >
                  <span className="wt-device-symbol">
                    <Radio size={22} />
                  </span>
                  <span>
                    <strong>{device.name}</strong>
                    <small>
                      {device.teamName || "Sem equipe"} · {device.serial}
                    </small>
                  </span>
                  <DeviceBadge status={device.status} />
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Radio}
              title="Tudo começa com o primeiro aparelho"
              description="Cadastre seus equipamentos para acompanhar a disponibilidade e as verificações."
              action={
                session.member?.role !== "collaborator" ? (
                  <button
                    className="wt-button-secondary"
                    onClick={() => navigate("devices")}
                  >
                    Cadastrar equipamento
                  </button>
                ) : undefined
              }
            />
          )}
          <div className="wt-panel-footnote">
            <ShieldCheck size={14} /> Status atualizados pela equipe. Não
            representam telemetria do aparelho.
          </div>
        </Panel>
        <section className="wt-health-promo">
          <div className="wt-health-promo-top">
            <span className="wt-health-icon">
              <HeartPulse size={24} />
            </span>
            <span>SAÚDE OCUPACIONAL</span>
            <ArrowUpRight size={20} />
          </div>
          <h2>
            Uma boa rotina
            <br />
            também é cuidado.
          </h2>
          <p>
            Entenda LER/DORT e conheça práticas de prevenção, ergonomia e
            organização do trabalho.
          </p>
          <div className="wt-topic-pills">
            <span>Ergonomia</span>
            <span>Prevenção</span>
            <span>Pausas</span>
          </div>
          <button
            className="wt-button-secondary"
            onClick={() => navigate("health")}
          >
            Explorar orientações <ArrowRight size={17} />
          </button>
        </section>
      </div>
      <div className="wt-dashboard-columns wt-lower-columns">
        <Panel
          title="Atividade recente"
          action={<span className="wt-small-note">Registros da empresa</span>}
        >
          {data.activity.length ? (
            <ol className="wt-activity-list">
              {data.activity.slice(0, 5).map((event) => (
                <li key={event.id}>
                  <span className="wt-activity-dot" />
                  <div>
                    <strong>{event.description}</strong>
                    <small>
                      {event.actorName} · {formatDate(event.createdAt, true)}
                    </small>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              icon={Activity}
              title="Sua operação começa aqui"
              description="Cadastros e verificações aparecerão nesta linha do tempo."
            />
          )}
        </Panel>
        <Panel
          title="Conversa da equipe"
          action={
            <button
              className="wt-text-button"
              onClick={() => navigate("messages")}
            >
              Abrir canal <ArrowUpRight size={15} />
            </button>
          }
        >
          {data.recentMessages.length ? (
            <div className="wt-recent-messages">
              {data.recentMessages.slice(0, 3).map((message) => (
                <div key={message.id}>
                  <Avatar name={message.authorName} />
                  <div>
                    <strong>
                      {message.authorName}
                      <small>{formatDate(message.createdAt, true)}</small>
                    </strong>
                    <p>{message.body}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Aproxime sua equipe"
              description="Envie a primeira mensagem no canal geral. A comunicação do portal usa internet."
              action={
                <button
                  className="wt-text-button"
                  onClick={() => navigate("messages")}
                >
                  Começar uma conversa <ArrowRight size={15} />
                </button>
              }
            />
          )}
        </Panel>
      </div>
    </>
  );
}
export function DeviceBadge({ status }: { status: Device["status"] }) {
  return (
    <span className={`wt-status status-${status}`}>
      <i />
      {
        {
          available: "Disponível",
          in_use: "Em operação",
          maintenance: "Manutenção",
        }[status]
      }
    </span>
  );
}
function SettingsView({ session }: { session: Session }) {
  const invites = useResource<InvitationsResponse>("/invitations");
  const teams = useResource<TeamsResponse>("/teams");
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<InvitationCreated | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <div className="wt-page-heading">
        <div>
          <span className="wt-eyebrow">GESTÃO DE ACESSOS</span>
          <h1>
            As pessoas certas.
            <br />O acesso certo.
          </h1>
          <p>
            Crie convites para {session.workspace?.name} com o perfil adequado.
          </p>
        </div>
        <button
          className="wt-button"
          onClick={() => {
            setCreated(null);
            setError("");
            setOpen(true);
          }}
        >
          <Plus size={17} /> Criar convite
        </button>
      </div>
      <div className="wt-role-grid">
        {(
          [
            {
              role: "admin",
              title: "Administrador",
              text: "Configura a empresa, controla convites e gerencia perfis, equipes e aparelhos.",
            },
            {
              role: "manager",
              title: "Gestor",
              text: "Organiza equipes, cadastra aparelhos e acompanha as conversas da empresa.",
            },
            {
              role: "collaborator",
              title: "Colaborador",
              text: "Acessa os canais da sua equipe e registra a verificação dos aparelhos atribuídos.",
            },
          ] as { role: Role; title: string; text: string }[]
        ).map((item) => (
          <Panel key={item.role}>
            <span className={`wt-role-mark ${item.role}`}>
              <ShieldCheck size={22} />
            </span>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </Panel>
        ))}
      </div>
      <Panel
        title="Convites da empresa"
        action={
          <button
            className="wt-text-button"
            onClick={() => void invites.reload()}
          >
            <RefreshCw size={14} /> Atualizar
          </button>
        }
      >
        {invites.error ? (
          <ErrorNotice
            message={invites.error}
            onRetry={() => void invites.reload()}
          />
        ) : invites.loading && !invites.data ? (
          <Loading />
        ) : invites.data?.invitations.length ? (
          <div className="wt-table-wrap">
            <table className="wt-table">
              <thead>
                <tr>
                  <th>Destino</th>
                  <th>Perfil</th>
                  <th>Equipe</th>
                  <th>Validade</th>
                  <th>Status</th>
                  <th>
                    <span className="wt-sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {invites.data.invitations.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <strong>{inv.email || "Link de convite"}</strong>
                    </td>
                    <td>{roleLabel[inv.role]}</td>
                    <td>{inv.teamName || "Sem equipe"}</td>
                    <td>{formatDate(inv.expiresAt)}</td>
                    <td>
                      <span className="wt-badge">
                        {
                          {
                            pending: "Pendente",
                            accepted: "Aceito",
                            revoked: "Revogado",
                            expired: "Expirado",
                          }[inv.status]
                        }
                      </span>
                    </td>
                    <td>
                      {inv.status === "pending" && (
                        <button
                          className="wt-text-button wt-danger-text"
                          onClick={async () => {
                            try {
                              await api(`/invitations/${inv.id}`, {
                                method: "DELETE",
                              });
                              notify("Convite revogado.");
                              void invites.reload();
                            } catch (c) {
                              notify(
                                c instanceof Error
                                  ? c.message
                                  : "Não foi possível revogar.",
                                "error",
                              );
                            }
                          }}
                        >
                          Revogar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="Sua equipe começa com um convite"
            description="Gere um link e compartilhe com a pessoa que fará parte da empresa."
          />
        )}
      </Panel>
      <div className="wt-access-note">
        <ShieldCheck size={20} />
        <p>
          O convite libera o perfil no portal. A pessoa também precisa ter
          acesso à hospedagem do site. Nenhum e-mail é enviado automaticamente.
        </p>
      </div>
      {open && (
        <Modal
          title={
            created
              ? "Convite pronto para compartilhar"
              : "Convidar para a empresa"
          }
          onClose={() => setOpen(false)}
        >
          {created ? (
            <div className="wt-invite-created">
              <span className="wt-success-circle">
                <Check size={26} />
              </span>
              <p>
                Este link é de uso único e vale até{" "}
                <strong>{formatDate(created.expiresAt, true)}</strong>.
                Compartilhe somente com a pessoa convidada.
              </p>
              <label className="wt-label" htmlFor="invite-url">
                Link do convite
              </label>
              <input
                id="invite-url"
                className="wt-input"
                readOnly
                value={created.url}
                onFocus={(e) => e.currentTarget.select()}
              />
              <button
                className="wt-button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(created.url);
                    notify("Link copiado.");
                  } catch {
                    notify("Selecione e copie o link no campo acima.", "error");
                  }
                }}
              >
                Copiar link <ArrowUpRight size={16} />
              </button>
              <small>
                O link só é exibido nesta criação. Se perder o link, revogue o
                convite e crie outro.
              </small>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError("");
                const values = new FormData(e.currentTarget);
                try {
                  const result = await api<InvitationCreated>("/invitations", {
                    method: "POST",
                    body: JSON.stringify({
                      role: values.get("role"),
                      email: values.get("email") || null,
                      teamId: values.get("teamId") || null,
                    }),
                  });
                  setCreated(result);
                  void invites.reload();
                } catch (c) {
                  setError(
                    c instanceof Error
                      ? c.message
                      : "Não foi possível criar o convite.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div className="wt-field">
                <label className="wt-label" htmlFor="invite-email">
                  E-mail da pessoa <span>(opcional)</span>
                </label>
                <input
                  id="invite-email"
                  name="email"
                  className="wt-input"
                  type="email"
                  maxLength={254}
                  placeholder="pessoa@empresa.com"
                />
                <small>Se informado, apenas essa conta poderá aceitar.</small>
              </div>
              <div className="wt-form-grid">
                <div className="wt-field">
                  <label className="wt-label" htmlFor="invite-role">
                    Perfil
                  </label>
                  <select
                    id="invite-role"
                    name="role"
                    className="wt-input"
                    defaultValue="collaborator"
                  >
                    <option value="collaborator">Colaborador</option>
                    <option value="manager">Gestor</option>
                  </select>
                </div>
                <div className="wt-field">
                  <label className="wt-label" htmlFor="invite-team">
                    Equipe
                  </label>
                  <select id="invite-team" name="teamId" className="wt-input">
                    <option value="">Sem equipe</option>
                    {teams.data?.teams.map((team) => (
                      <option value={team.id} key={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {error && <ErrorNotice message={error} />}
              <div className="wt-form-actions">
                <button
                  type="button"
                  className="wt-button-secondary"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </button>
                <button className="wt-button" disabled={busy}>
                  {busy ? "Criando…" : "Gerar convite"}
                  <ArrowRight size={17} />
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
