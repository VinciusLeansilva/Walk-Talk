import { useState } from "react";
import type { FormEvent } from "react";
import {
  Check,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import type {
  Member,
  MembersResponse,
  Session,
  Team,
  TeamsResponse,
} from "../../server/types";
import { api, notify, useResource } from "./api";
import { Avatar, EmptyState, ErrorNotice, Modal, Panel } from "./ui";
import "./portal-views.css";

const roleNames = {
  admin: "Administrador",
  manager: "Gestor",
  collaborator: "Colaborador",
};
const teamColors = [
  "#007e91",
  "#5469b1",
  "#bf6b30",
  "#41715d",
  "#9a5278",
  "#526578",
];

function MemberRow({
  member,
  teams,
  canEdit,
  onSaved,
}: {
  member: Member;
  teams: Team[];
  canEdit: boolean;
  onSaved: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(member.role);
  const [teamId, setTeamId] = useState(member.teamId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api(`/members/${member.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role, teamId: teamId || null }),
      });
      await onSaved();
      setEditing(false);
      notify("Permissões e equipe atualizadas.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível atualizar este membro.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <li className="wt-member-row">
      <div className="wt-member-identity">
        <Avatar name={member.name} />
        <div>
          <strong>{member.name}</strong>
          <span>{member.email}</span>
        </div>
      </div>
      {!editing ? (
        <>
          <span className="wt-member-team">
            {member.teamName || "Sem equipe"}
          </span>
          <span className={`wt-badge wt-role-${member.role}`}>
            {member.role === "admin" && <ShieldCheck size={12} />}
            {roleNames[member.role]}
          </span>
          {canEdit ? (
            <button
              className="wt-member-edit"
              aria-label={`Editar permissões de ${member.name}`}
              onClick={() => {
                setRole(member.role);
                setTeamId(member.teamId ?? "");
                setError("");
                setEditing(true);
              }}
            >
              <Pencil size={15} />
            </button>
          ) : (
            <span className="wt-member-edit-space" />
          )}
        </>
      ) : (
        <form className="wt-member-editor" onSubmit={save}>
          <label className="wt-field">
            <span className="wt-label">Perfil de {member.name}</span>
            <select
              className="wt-input"
              value={role}
              disabled={saving}
              onChange={(event) =>
                setRole(event.target.value as "manager" | "collaborator")
              }
            >
              <option value="manager">Gestor</option>
              <option value="collaborator">Colaborador</option>
            </select>
          </label>
          <label className="wt-field">
            <span className="wt-label">Equipe de {member.name}</span>
            <select
              className="wt-input"
              value={teamId}
              disabled={saving}
              onChange={(event) => setTeamId(event.target.value)}
            >
              <option value="">Sem equipe</option>
              {teams.map((team) => (
                <option value={team.id} key={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
          <div className="wt-member-edit-actions">
            <button className="wt-button" disabled={saving} type="submit">
              {saving ? (
                <LoaderCircle size={14} className="wt-spin" />
              ) : (
                <Check size={14} />
              )}
              Salvar
            </button>
            <button
              className="wt-button-secondary"
              disabled={saving}
              type="button"
              onClick={() => setEditing(false)}
            >
              <X size={14} />
              Cancelar
            </button>
          </div>
          {error && (
            <p className="wt-error" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
    </li>
  );
}

export function TeamView({ session }: { session: Session }) {
  const teams = useResource<TeamsResponse>("/teams");
  const members = useResource<MembersResponse>("/members");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [color, setColor] = useState(teamColors[0]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const canManage =
    session.member?.role === "admin" || session.member?.role === "manager";
  const canEditMembers = session.member?.role === "admin";
  const normalized = query.trim().toLocaleLowerCase("pt-BR");
  const filteredTeams = (teams.data?.teams ?? []).filter((team) =>
    `${team.name} ${team.location}`
      .toLocaleLowerCase("pt-BR")
      .includes(normalized),
  );
  const filteredMembers = (members.data?.members ?? []).filter((member) =>
    `${member.name} ${member.email} ${member.teamName ?? ""}`
      .toLocaleLowerCase("pt-BR")
      .includes(normalized),
  );
  const reloadAll = async () => {
    await Promise.all([teams.reload(), members.reload()]);
  };
  const createTeam = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await api("/teams", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          location: location.trim(),
          color,
        }),
      });
      await teams.reload();
      setCreating(false);
      setName("");
      setLocation("");
      setColor(teamColors[0]);
      notify("Equipe criada. Ela já pode receber aparelhos e membros.");
    } catch (cause) {
      setFormError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível criar a equipe.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="wt-team-view">
      <div className="wt-view-intro">
        <div>
          <span className="wt-kicker">PESSOAS QUE CONECTAM</span>
          <h2>Uma equipe. Muitas possibilidades.</h2>
          <p>
            Organize as frentes de trabalho e saiba quem está em cada operação.
          </p>
        </div>
        {canManage && (
          <button
            className="wt-button"
            onClick={() => {
              setFormError("");
              setCreating(true);
            }}
          >
            <Plus size={17} />
            Nova equipe
          </button>
        )}
      </div>
      <div className="wt-directory-toolbar">
        <label className="wt-directory-search">
          <Search size={17} />
          <span className="wt-sr-only">Buscar equipes ou pessoas</span>
          <input
            className="wt-input"
            type="search"
            placeholder="Buscar equipes ou pessoas…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <span>
          {teams.data?.teams.length ?? 0} equipes ·{" "}
          {members.data?.members.length ?? 0} pessoas
        </span>
      </div>
      {teams.error && (
        <ErrorNotice message={teams.error} onRetry={teams.reload} />
      )}
      {teams.loading && !teams.data ? (
        <p className="wt-loading" role="status">
          Carregando equipes…
        </p>
      ) : (
        !teams.error && (
          <>
            {filteredTeams.length ? (
              <div className="wt-team-grid">
                {filteredTeams.map((team) => (
                  <article className="wt-team-card" key={team.id}>
                    <div className="wt-team-card-top">
                      <span
                        className="wt-team-emblem"
                        style={{
                          color: team.color,
                          backgroundColor: `${team.color}15`,
                        }}
                      >
                        <Users size={23} />
                      </span>
                      {team.isExample && (
                        <span className="wt-example-tag">Exemplo</span>
                      )}
                    </div>
                    <h3>{team.name}</h3>
                    <p className="wt-team-location">
                      <MapPin size={14} />
                      {team.location || "Local não informado"}
                    </p>
                    <div className="wt-team-card-stats">
                      <span>
                        <Users size={15} />
                        <strong>{team.members}</strong> pessoas
                      </span>
                      <span>
                        <Radio size={15} />
                        <strong>{team.devices}</strong> aparelhos
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title={
                  query
                    ? "Nenhuma equipe encontrada"
                    : "Sua próxima operação começa aqui"
                }
                description={
                  query
                    ? "Experimente outro nome ou local."
                    : canManage
                      ? "Crie a primeira equipe para organizar as pessoas e os aparelhos da empresa."
                      : "Quando você for associado a uma equipe, os detalhes aparecerão aqui."
                }
                action={
                  !query && canManage ? (
                    <button
                      className="wt-button-secondary"
                      onClick={() => setCreating(true)}
                    >
                      <Plus size={16} />
                      Criar equipe
                    </button>
                  ) : undefined
                }
              />
            )}
          </>
        )
      )}
      <Panel
        title="Pessoas e permissões"
        action={
          <span className="wt-muted">
            {filteredMembers.length}{" "}
            {filteredMembers.length === 1 ? "pessoa" : "pessoas"}
          </span>
        }
      >
        <p className="wt-member-intro">
          {canEditMembers
            ? "Defina as equipes e os perfis de acesso. Novas pessoas entram pelos convites em Configurações."
            : "Cada perfil tem acesso às funções necessárias para sua rotina."}
        </p>
        {members.error ? (
          <ErrorNotice message={members.error} onRetry={members.reload} />
        ) : members.loading && !members.data ? (
          <p role="status" className="wt-loading">
            Carregando pessoas…
          </p>
        ) : filteredMembers.length ? (
          <ul className="wt-member-list">
            {filteredMembers.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                teams={teams.data?.teams ?? []}
                canEdit={
                  canEditMembers &&
                  member.role !== "admin" &&
                  member.id !== session.user.id
                }
                onSaved={reloadAll}
              />
            ))}
          </ul>
        ) : (
          <p className="wt-muted wt-directory-empty">
            Nenhuma pessoa corresponde à busca.
          </p>
        )}
      </Panel>
      <div className="wt-permission-note">
        <ShieldCheck size={18} />
        <p>
          <strong>Permissões por função.</strong> Administradores gerenciam
          acessos; gestores organizam a operação; colaboradores acompanham sua
          equipe e seus aparelhos.
        </p>
      </div>
      {creating && (
        <Modal
          title="Criar equipe"
          onClose={() => {
            if (!saving) setCreating(false);
          }}
        >
          <form className="wt-team-form" onSubmit={createTeam}>
            <p className="wt-muted">
              Reúna pessoas e equipamentos em uma frente de trabalho.
            </p>
            <label className="wt-field">
              <span className="wt-label">Nome da equipe</span>
              <input
                className="wt-input"
                autoFocus
                required
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Operação de campo"
                disabled={saving}
              />
            </label>
            <label className="wt-field">
              <span className="wt-label">Local de operação</span>
              <input
                className="wt-input"
                maxLength={120}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Ex.: Unidade Norte"
                disabled={saving}
              />
            </label>
            <fieldset className="wt-team-colors">
              <legend className="wt-label">Cor da equipe</legend>
              <div>
                {teamColors.map((option, index) => (
                  <button
                    type="button"
                    aria-label={`Cor ${["petróleo", "azul", "laranja", "verde", "rosa", "cinza"][index]}`}
                    aria-pressed={color === option}
                    key={option}
                    style={{ background: option }}
                    disabled={saving}
                    onClick={() => setColor(option)}
                  >
                    {color === option && <Check size={17} />}
                  </button>
                ))}
              </div>
            </fieldset>
            {formError && (
              <p className="wt-error" role="alert">
                {formError}
              </p>
            )}
            <div className="wt-form-actions">
              <button
                type="button"
                className="wt-button-secondary"
                disabled={saving}
                onClick={() => setCreating(false)}
              >
                Cancelar
              </button>
              <button
                className="wt-button"
                type="submit"
                disabled={saving || !name.trim()}
              >
                {saving ? (
                  <LoaderCircle size={16} className="wt-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {saving ? "Criando…" : "Criar equipe"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
