import { useMemo, useState } from "react";
import {
  Archive,
  ArrowDownToLine,
  Check,
  CheckCircle2,
  ClipboardCheck,
  LoaderCircle,
  Pencil,
  Plus,
  Radio,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type {
  Device,
  DeviceInput,
  DevicesResponse,
  MembersResponse,
  Session,
  TeamsResponse,
} from "../../server/types";
import { api, formatDate, notify, useResource } from "./api";
import { EmptyState, ErrorNotice, Loading, Modal, Panel } from "./ui";
const statusText = {
  available: "Disponível",
  in_use: "Em operação",
  maintenance: "Manutenção",
};
export function DeviceView({ session }: { session: Session }) {
  const devices = useResource<DevicesResponse>("/devices");
  const teams = useResource<TeamsResponse>("/teams");
  const members = useResource<MembersResponse>("/members");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<Device | "new" | null>(null);
  const [archive, setArchive] = useState<Device | null>(null);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState("");
  const [checking, setChecking] = useState<string | null>(null);
  const manage = session.member?.role !== "collaborator";
  const visible = useMemo(
    () =>
      (devices.data?.devices || []).filter(
        (d) =>
          (filter === "all" || d.status === filter) &&
          `${d.name} ${d.serial} ${d.teamName || ""}`
            .toLocaleLowerCase("pt-BR")
            .includes(search.toLocaleLowerCase("pt-BR")),
      ),
    [devices.data, search, filter],
  );
  const check = async (device: Device) => {
    setChecking(device.id);
    try {
      await api(`/devices/${device.id}/check`, { method: "POST", body: "{}" });
      notify("Verificação registrada pela sua conta.");
      await devices.reload();
    } catch (e) {
      notify(
        e instanceof Error ? e.message : "Não foi possível registrar.",
        "error",
      );
    } finally {
      setChecking(null);
    }
  };
  return (
    <>
      <div className="wt-page-heading">
        <div>
          <span className="wt-eyebrow">ORGANIZAÇÃO QUE ACOMPANHA</span>
          <h1>
            Cada aparelho.
            <br />
            No lugar certo.
          </h1>
          <p>
            Acompanhe disponibilidade, responsáveis e verificações da equipe.
          </p>
        </div>
        <div className="wt-heading-actions">
          {manage && (
            <a
              className="wt-button-secondary"
              href="/api/v1/export/devices"
              download
            >
              <ArrowDownToLine size={16} /> Exportar CSV
            </a>
          )}
          {manage && (
            <button className="wt-button" onClick={() => setEditing("new")}>
              <Plus size={17} /> Cadastrar equipamento
            </button>
          )}
        </div>
      </div>
      <div className="wt-equipment-summary">
        <div>
          <Radio size={20} />
          <strong>{devices.data?.devices.length ?? "—"}</strong>
          <span>equipamentos</span>
        </div>
        <div>
          <span className="wt-dot available" />
          <strong>
            {devices.data?.devices.filter((d) => d.status === "available")
              .length ?? "—"}
          </strong>
          <span>disponíveis</span>
        </div>
        <div>
          <span className="wt-dot in-use" />
          <strong>
            {devices.data?.devices.filter((d) => d.status === "in_use")
              .length ?? "—"}
          </strong>
          <span>em operação</span>
        </div>
        <div>
          <span className="wt-dot maintenance" />
          <strong>
            {devices.data?.devices.filter((d) => d.status === "maintenance")
              .length ?? "—"}
          </strong>
          <span>em manutenção</span>
        </div>
      </div>
      <Panel className="wt-equipment-panel">
        <div className="wt-device-toolbar">
          <label className="wt-search">
            <Search size={18} />
            <input
              aria-label="Buscar equipamentos"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, série ou equipe"
            />
            {search && (
              <button aria-label="Limpar busca" onClick={() => setSearch("")}>
                <X size={14} />
              </button>
            )}
          </label>
          <label className="wt-filter">
            <SlidersHorizontal size={16} />
            <span className="wt-sr-only">Filtrar equipamentos por status</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Todos os status</option>
              <option value="available">Disponíveis</option>
              <option value="in_use">Em operação</option>
              <option value="maintenance">Manutenção</option>
            </select>
          </label>
        </div>
        {devices.error ? (
          <ErrorNotice
            message={devices.error}
            onRetry={() => void devices.reload()}
          />
        ) : devices.loading && !devices.data ? (
          <Loading />
        ) : !visible.length ? (
          <EmptyState
            icon={Radio}
            title={
              search || filter !== "all"
                ? "Nenhum aparelho encontrado"
                : "Seu primeiro equipamento está por vir"
            }
            description={
              search || filter !== "all"
                ? "Ajuste a busca ou o filtro para encontrar outro aparelho."
                : "Organize seus aparelhos, responsáveis e equipes em um só lugar."
            }
            action={
              manage && !search && filter === "all" ? (
                <button
                  className="wt-button-secondary"
                  onClick={() => setEditing("new")}
                >
                  Cadastrar primeiro equipamento
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="wt-device-cards">
            {visible.map((device) => (
              <article className="wt-equipment-card" key={device.id}>
                <div className="wt-equipment-top">
                  <span className="wt-equipment-image">
                    <img
                      src="/product/walk-talk-mobile.webp"
                      alt=""
                      width="480"
                      height="720"
                      loading="lazy"
                    />
                  </span>
                  <span className={`wt-status status-${device.status}`}>
                    <i />
                    {statusText[device.status]}
                  </span>
                </div>
                <div className="wt-equipment-title">
                  <h2>{device.name}</h2>
                  {device.isExample && (
                    <span className="wt-example-label">EXEMPLO</span>
                  )}
                </div>
                <p className="wt-device-serial">
                  {device.model} · {device.serial}
                </p>
                <dl>
                  <div>
                    <dt>Equipe</dt>
                    <dd>{device.teamName || "Sem equipe"}</dd>
                  </div>
                  <div>
                    <dt>Responsável</dt>
                    <dd>{device.assigneeName || "Não atribuído"}</dd>
                  </div>
                  <div>
                    <dt>Última verificação</dt>
                    <dd>{formatDate(device.lastCheckAt, true)}</dd>
                  </div>
                </dl>
                {device.notes && (
                  <p className="wt-device-notes">{device.notes}</p>
                )}
                <div className="wt-equipment-actions">
                  {(manage || device.assignedTo === session.user.id) && (
                    <button
                      className="wt-text-button"
                      disabled={checking === device.id}
                      onClick={() => void check(device)}
                    >
                      {checking === device.id ? (
                        <LoaderCircle size={16} />
                      ) : (
                        <ClipboardCheck size={16} />
                      )}{" "}
                      Verificar
                    </button>
                  )}
                  {manage && (
                    <div>
                      <button
                        className="wt-icon-button"
                        aria-label={`Editar ${device.name}`}
                        onClick={() => setEditing(device)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="wt-icon-button"
                        aria-label={`Arquivar ${device.name}`}
                        onClick={() => {
                          setArchive(device);
                          setActionError("");
                        }}
                      >
                        <Archive size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="wt-panel-footnote">
          <CheckCircle2 size={14} />
          <span>
            Verificar registra uma conferência manual. Este portal não mede
            sinal, bateria ou localização.
          </span>
        </div>
      </Panel>
      {editing && (
        <DeviceEditor
          device={editing === "new" ? null : editing}
          teams={teams.data?.teams ?? []}
          members={members.data?.members ?? []}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void devices.reload();
          }}
        />
      )}
      {archive && (
        <Modal
          title="Arquivar equipamento?"
          onClose={() => {
            if (!pending) setArchive(null);
          }}
        >
          <div className="wt-confirm-copy">
            <span className="wt-confirm-icon">
              <Archive size={28} />
            </span>
            <p>
              <strong>{archive.name}</strong> sairá da lista de equipamentos
              ativos. O histórico do registro será preservado.
            </p>
          </div>
          {actionError && <ErrorNotice message={actionError} />}
          <div className="wt-form-actions">
            <button
              className="wt-button-secondary"
              disabled={pending}
              onClick={() => setArchive(null)}
            >
              Cancelar
            </button>
            <button
              className="wt-button wt-button-danger"
              disabled={pending}
              onClick={async () => {
                setPending(true);
                setActionError("");
                try {
                  await api(`/devices/${archive.id}`, { method: "DELETE" });
                  setArchive(null);
                  notify("Equipamento arquivado.");
                  void devices.reload();
                } catch (e) {
                  setActionError(
                    e instanceof Error
                      ? e.message
                      : "Não foi possível arquivar.",
                  );
                } finally {
                  setPending(false);
                }
              }}
            >
              {pending ? "Arquivando…" : "Arquivar equipamento"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function DeviceEditor({
  device,
  teams,
  members,
  onClose,
  onSaved,
}: {
  device: Device | null;
  teams: TeamsResponse["teams"];
  members: MembersResponse["members"];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<DeviceInput>({
    name: device?.name ?? "",
    serial: device?.serial ?? "",
    model: device?.model ?? "WALK TALK",
    status: device?.status ?? "available",
    teamId: device?.teamId ?? null,
    assignedTo: device?.assignedTo ?? null,
    notes: device?.notes ?? "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const update = <K extends keyof DeviceInput>(key: K, value: DeviceInput[K]) =>
    setForm({ ...form, [key]: value });
  return (
    <Modal
      title={device ? "Editar equipamento" : "Cadastrar equipamento"}
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setError("");
          try {
            await api(device ? `/devices/${device.id}` : "/devices", {
              method: device ? "PATCH" : "POST",
              body: JSON.stringify(form),
            });
            notify(
              device ? "Equipamento atualizado." : "Equipamento cadastrado.",
            );
            onSaved();
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Não foi possível salvar.",
            );
          } finally {
            setPending(false);
          }
        }}
      >
        <div className="wt-field">
          <label htmlFor="device-name" className="wt-label">
            Nome do equipamento
          </label>
          <input
            id="device-name"
            className="wt-input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            minLength={2}
            maxLength={100}
            placeholder="Ex.: Rádio da equipe de campo"
          />
        </div>
        <div className="wt-form-grid">
          <div className="wt-field">
            <label htmlFor="device-serial" className="wt-label">
              Número de série / patrimônio
            </label>
            <input
              id="device-serial"
              className="wt-input"
              value={form.serial}
              onChange={(e) => update("serial", e.target.value)}
              required
              maxLength={100}
              placeholder="WT-001"
            />
          </div>
          <div className="wt-field">
            <label htmlFor="device-model" className="wt-label">
              Modelo
            </label>
            <input
              id="device-model"
              className="wt-input"
              value={form.model}
              onChange={(e) => update("model", e.target.value)}
              required
              maxLength={100}
            />
          </div>
        </div>
        <div className="wt-field">
          <label htmlFor="device-status" className="wt-label">
            Status
          </label>
          <select
            id="device-status"
            className="wt-input"
            value={form.status}
            onChange={(e) =>
              update("status", e.target.value as Device["status"])
            }
          >
            <option value="available">Disponível</option>
            <option value="in_use">Em operação</option>
            <option value="maintenance">Manutenção</option>
          </select>
        </div>
        <div className="wt-form-grid">
          <div className="wt-field">
            <label htmlFor="device-team" className="wt-label">
              Equipe
            </label>
            <select
              id="device-team"
              className="wt-input"
              value={form.teamId ?? ""}
              onChange={(e) => update("teamId", e.target.value || null)}
            >
              <option value="">Sem equipe</option>
              {teams.map((team) => (
                <option value={team.id} key={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <div className="wt-field">
            <label htmlFor="device-assignee" className="wt-label">
              Responsável
            </label>
            <select
              id="device-assignee"
              className="wt-input"
              value={form.assignedTo ?? ""}
              onChange={(e) => update("assignedTo", e.target.value || null)}
            >
              <option value="">Não atribuído</option>
              {members.map((member) => (
                <option value={member.id} key={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="wt-field">
          <label htmlFor="device-notes" className="wt-label">
            Observações operacionais <span>(opcional)</span>
          </label>
          <textarea
            id="device-notes"
            className="wt-input"
            rows={3}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            maxLength={500}
            placeholder="Ex.: Guardado no armário da base."
          />
        </div>
        {error && <ErrorNotice message={error} />}
        <div className="wt-form-actions">
          <button
            className="wt-button-secondary"
            type="button"
            onClick={onClose}
            disabled={pending}
          >
            Cancelar
          </button>
          <button className="wt-button" disabled={pending}>
            {pending ? <LoaderCircle size={17} /> : <Check size={17} />}{" "}
            {pending
              ? "Salvando…"
              : device
                ? "Salvar alterações"
                : "Cadastrar equipamento"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
