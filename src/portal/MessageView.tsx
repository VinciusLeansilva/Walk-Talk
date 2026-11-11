import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Globe,
  Hash,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  Send,
} from "lucide-react";
import type {
  MessagesResponse,
  Session,
  TeamsResponse,
} from "../../server/types";
import { api, notify, useResource } from "./api";
import { Avatar, EmptyState, ErrorNotice } from "./ui";
import "./portal-views.css";

const roleNames = {
  admin: "Administrador",
  manager: "Gestor",
  collaborator: "Colaborador",
};
const messageDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export function MessageView({ session }: { session: Session }) {
  const teams = useResource<TeamsResponse>("/teams");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const channelKey = teamId ?? "general";
  const body = drafts[channelKey] ?? "";
  const channelName = teamId
    ? (teams.data?.teams.find((team) => team.id === teamId)?.name ?? "Equipe")
    : "Geral";
  const messages = useResource<MessagesResponse>(
    teamId ? `/messages?teamId=${encodeURIComponent(teamId)}` : "/messages",
  );
  const orderedMessages = useMemo(
    () =>
      [...(messages.data?.messages ?? [])].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      ),
    [messages.data],
  );
  const reloadMessages = messages.reload;
  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) void reloadMessages();
    };
    const timer = window.setInterval(refresh, 30000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [reloadMessages]);
  const chooseChannel = (id: string | null) => {
    if (sending) return;
    setTeamId(id);
    setSendError("");
  };
  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    setSendError("");
    try {
      await api("/messages", {
        method: "POST",
        body: JSON.stringify({ body: body.trim(), teamId }),
      });
      setDrafts((current) => ({ ...current, [channelKey]: "" }));
      await messages.reload();
      notify("Mensagem publicada no canal.");
    } catch (cause) {
      setSendError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível enviar a mensagem. Seu texto foi preservado.",
      );
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="wt-messages-view">
      <div className="wt-view-intro">
        <div>
          <span className="wt-kicker">CONVERSAS QUE CONECTAM</span>
          <h2>O próximo passo, em conjunto.</h2>
          <p>Compartilhe atualizações e mantenha sua equipe na mesma página.</p>
        </div>
        <span className="wt-internet-label">
          <Globe size={15} />
          Mensagens do portal · via internet
        </span>
      </div>
      <div className="wt-messaging-shell">
        <aside className="wt-channels" aria-label="Canais de comunicação">
          <div className="wt-channel-heading">
            <span>CANAIS</span>
            <span>{1 + (teams.data?.teams.length ?? 0)}</span>
          </div>
          <button
            className={teamId === null ? "selected" : ""}
            aria-pressed={teamId === null}
            onClick={() => chooseChannel(null)}
            disabled={sending}
          >
            <Globe size={17} />
            <span>
              Geral<small>Toda a empresa</small>
            </span>
          </button>
          {teams.loading && !teams.data && (
            <p className="wt-channel-state" role="status">
              Carregando equipes…
            </p>
          )}
          {teams.data?.teams.map((team) => (
            <button
              key={team.id}
              className={teamId === team.id ? "selected" : ""}
              aria-pressed={teamId === team.id}
              disabled={sending}
              onClick={() => chooseChannel(team.id)}
            >
              <Hash size={17} />
              <span>
                {team.name}
                <small>{team.location || "Canal da equipe"}</small>
              </span>
            </button>
          ))}
          {teams.error && (
            <div className="wt-channel-state">
              <ErrorNotice message={teams.error} onRetry={teams.reload} />
            </div>
          )}
          <p className="wt-channel-help">
            Um espaço para assuntos da operação. Compartilhe somente informações
            adequadas à equipe.
          </p>
        </aside>
        <section className="wt-conversation" aria-labelledby="wt-channel-title">
          <header className="wt-conversation-header">
            <span className="wt-channel-icon">
              {teamId ? <Hash size={22} /> : <Globe size={22} />}
            </span>
            <div>
              <h3 id="wt-channel-title">{channelName}</h3>
              <p>
                {teamId
                  ? "Atualizações desta equipe"
                  : "Comunicados para toda a empresa"}
              </p>
            </div>
            <button
              className="wt-message-refresh"
              aria-label="Atualizar mensagens"
              title="Atualizar mensagens"
              disabled={messages.loading}
              onClick={() => void messages.reload()}
            >
              <RefreshCw
                size={17}
                className={messages.loading ? "wt-spin" : ""}
              />
            </button>
          </header>
          <div
            className="wt-message-history"
            role="log"
            aria-label={`Mensagens do canal ${channelName}`}
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.error ? (
              <ErrorNotice message={messages.error} onRetry={messages.reload} />
            ) : messages.loading && !messages.data ? (
              <p className="wt-loading" role="status">
                Carregando mensagens…
              </p>
            ) : orderedMessages.length ? (
              orderedMessages.map((message) => (
                <article
                  key={message.id}
                  className={`wt-message ${message.authorId === session.user.id ? "wt-message-own" : ""}`}
                >
                  <Avatar name={message.authorName} />
                  <div className="wt-message-content">
                    <div className="wt-message-author">
                      <strong>{message.authorName}</strong>
                      <span>{roleNames[message.authorRole]}</span>
                      <time dateTime={message.createdAt}>
                        {messageDate(message.createdAt)}
                      </time>
                    </div>
                    <p>{message.body}</p>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                icon={MessageSquare}
                title="Toda conversa começa com uma mensagem"
                description={`Compartilhe a primeira atualização no canal ${channelName}.`}
              />
            )}
          </div>
          <form className="wt-message-composer" onSubmit={sendMessage}>
            <label className="wt-label" htmlFor="wt-message-body">
              Mensagem para {channelName}
            </label>
            <textarea
              id="wt-message-body"
              className="wt-input"
              placeholder="Escreva uma atualização para a equipe…"
              rows={3}
              value={body}
              maxLength={2000}
              disabled={sending}
              onChange={(event) =>
                setDrafts((current) => ({
                  ...current,
                  [channelKey]: event.target.value,
                }))
              }
            />
            {sendError && (
              <p className="wt-error" role="alert">
                {sendError}
              </p>
            )}
            <div className="wt-composer-bottom">
              <span>
                {body.length}/2.000 caracteres <span>· envio pelo portal</span>
              </span>
              <button
                className="wt-button"
                type="submit"
                disabled={sending || !body.trim()}
              >
                {sending ? (
                  <LoaderCircle size={16} className="wt-spin" />
                ) : (
                  <Send size={16} />
                )}
                {sending ? "Enviando…" : "Enviar mensagem"}
              </button>
            </div>
          </form>
        </section>
      </div>
      <p className="wt-message-footnote">
        As mensagens são atualizadas periodicamente e precisam de acesso à
        internet. Este canal não realiza transmissões via satélite e não é um
        serviço de emergência.
      </p>
    </div>
  );
}
