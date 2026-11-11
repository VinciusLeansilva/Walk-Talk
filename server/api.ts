import type { ApiEnvironment, D1PreparedStatement } from "./d1.ts";
import type {
  User,
  Member,
  Workspace,
  Device,
  Team,
  Invitation,
  Message,
  Activity,
  DeviceStatus,
  Role,
} from "./types.ts";

class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
type RecordBody = Record<string, unknown>;
type Membership = Member & { workspaceId: string };
type Context = {
  env: ApiEnvironment;
  user: User;
  member: Membership;
  workspace: Workspace;
  now: string;
};
const MAX_BODY = 8192;
const responseHeaders = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "same-origin",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      ...responseHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
const fail = (status: number, code: string, message: string): never => {
  throw new ApiError(status, code, message);
};
const uuid = () => crypto.randomUUID();
const stringValue = (
  value: unknown,
  label: string,
  max: number,
  required = true,
) => {
  if (value === undefined && !required) return "";
  if (typeof value !== "string")
    return fail(400, "VALIDATION", `${label} deve ser um texto.`);
  const text = value.trim();
  if (
    (required && !text) ||
    text.length > max ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)
  )
    return fail(
      400,
      "VALIDATION",
      `${label} deve conter ${required ? "de 1 a " : "até "}${max} caracteres válidos.`,
    );
  return text;
};
const optionalId = (value: unknown, label: string): string | null =>
  value === undefined || value === null || value === ""
    ? null
    : stringValue(value, label, 300);
const allow = (body: RecordBody, keys: string[]) => {
  if (Object.keys(body).some((key) => !keys.includes(key)))
    fail(400, "VALIDATION", "O formulário contém um campo não permitido.");
};
const roleValue = (value: unknown): "manager" | "collaborator" => {
  if (value !== "manager" && value !== "collaborator")
    return fail(400, "VALIDATION", "Escolha gestor ou colaborador.");
  return value;
};
const elevated = (c: Context) => {
  if (c.member.role === "collaborator")
    fail(403, "FORBIDDEN", "Esta ação exige um administrador ou gestor.");
};
const admin = (c: Context) => {
  if (c.member.role !== "admin")
    fail(403, "FORBIDDEN", "Esta ação exige um administrador.");
};
function identity(request: Request): User {
  const id = request.headers.get("oai-authenticated-user-id")?.trim();
  const email = request.headers
    .get("oai-authenticated-user-email")
    ?.trim()
    .toLowerCase();
  if (
    !id ||
    !email ||
    id.length > 300 ||
    email.length > 254 ||
    !email.includes("@")
  )
    return fail(401, "UNAUTHENTICATED", "Entre na sua conta para continuar.");
  let name = request.headers.get("oai-authenticated-user-full-name") || "";
  if (
    request.headers.get("oai-authenticated-user-full-name-encoding") ===
    "percent-encoded-utf-8"
  ) {
    try {
      name = decodeURIComponent(name);
    } catch {
      name = "";
    }
  }
  name =
    name
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .trim()
      .slice(0, 120) || email.split("@")[0];
  return { id, email, name };
}
async function bodyOf(request: Request): Promise<RecordBody> {
  if (
    !/^application\/json(?:\s*;|$)/i.test(
      request.headers.get("content-type") || "",
    )
  )
    return fail(415, "CONTENT_TYPE", "Use um corpo JSON para esta operação.");
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BODY)
    return fail(
      413,
      "BODY_TOO_LARGE",
      "O formulário excede o tamanho permitido.",
    );
  const reader = request.body?.getReader();
  if (!reader) return fail(400, "VALIDATION", "O corpo JSON é obrigatório.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) {
        await reader.cancel();
        return fail(
          413,
          "BODY_TOO_LARGE",
          "O formulário excede o tamanho permitido.",
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  let data: unknown;
  try {
    data = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return fail(
      400,
      "VALIDATION",
      "O corpo da requisição não é um JSON válido.",
    );
  }
  if (!data || typeof data !== "object" || Array.isArray(data))
    return fail(400, "VALIDATION", "Envie um objeto JSON.");
  return data as RecordBody;
}
function csrf(request: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;
  const origin = request.headers.get("origin");
  if (
    (origin && origin !== new URL(request.url).origin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    fail(403, "ORIGIN", "A origem desta solicitação não foi autorizada.");
}
const memberSql = `SELECT m.user_id AS id,m.workspace_id AS workspaceId,m.email,m.display_name AS name,m.role,m.team_id AS teamId,t.name AS teamName,m.joined_at AS joinedAt FROM members m LEFT JOIN teams t ON t.id=m.team_id AND t.workspace_id=m.workspace_id`;
const deviceSql = `SELECT d.id,d.name,d.serial,d.model,d.status,d.team_id AS teamId,t.name AS teamName,d.assigned_to AS assignedTo,m.display_name AS assigneeName,d.notes,d.last_check_at AS lastCheckAt,d.created_at AS createdAt,d.updated_at AS updatedAt,d.is_example AS isExample FROM devices d LEFT JOIN teams t ON t.id=d.team_id AND t.workspace_id=d.workspace_id LEFT JOIN members m ON m.user_id=d.assigned_to AND m.workspace_id=d.workspace_id`;
const messageSql = `SELECT msg.id,msg.body,msg.team_id AS teamId,msg.author_id AS authorId,m.display_name AS authorName,m.role AS authorRole,msg.created_at AS createdAt FROM messages msg JOIN members m ON m.user_id=msg.author_id AND m.workspace_id=msg.workspace_id`;
const inviteSql = `SELECT i.id,i.role,i.email,i.team_id AS teamId,t.name AS teamName,i.expires_at AS expiresAt,i.created_at AS createdAt,CASE WHEN i.revoked_at IS NOT NULL THEN 'revoked' WHEN i.accepted_at IS NOT NULL THEN 'accepted' WHEN i.expires_at<=? THEN 'expired' ELSE 'pending' END AS status FROM invitations i LEFT JOIN teams t ON t.id=i.team_id AND t.workspace_id=i.workspace_id`;
const publicMember = (m: Membership): Member => ({
  id: m.id,
  email: m.email,
  name: m.name,
  role: m.role,
  teamId: m.teamId,
  teamName: m.teamName,
  joinedAt: m.joinedAt,
});
async function getMembership(env: ApiEnvironment, user: User) {
  return env.DB.prepare(`${memberSql} WHERE m.user_id=?`)
    .bind(user.id)
    .first<Membership>();
}
async function getWorkspace(
  env: ApiEnvironment,
  id: string,
): Promise<Workspace> {
  const row = await env.DB.prepare(
    "SELECT id,name,is_demo AS isDemo FROM workspaces WHERE id=?",
  )
    .bind(id)
    .first<Workspace>();
  if (!row)
    return fail(404, "WORKSPACE_NOT_FOUND", "A empresa não foi encontrada.");
  return { ...row, isDemo: Boolean(row.isDemo) };
}
async function context(
  env: ApiEnvironment,
  user: User,
  member: Membership | null,
): Promise<Context> {
  if (!member)
    return fail(
      403,
      "NO_MEMBERSHIP",
      "Crie uma empresa ou aceite um convite para continuar.",
    );
  return {
    env,
    user,
    member,
    workspace: await getWorkspace(env, member.workspaceId),
    now: new Date().toISOString(),
  };
}
function activity(
  c: Context,
  type: string,
  description: string,
  teamId: string | null = null,
): D1PreparedStatement {
  return c.env.DB.prepare(
    "INSERT INTO activity(id,workspace_id,actor_id,team_id,type,description,created_at) VALUES(?,?,?,?,?,?,?)",
  ).bind(uuid(), c.workspace.id, c.user.id, teamId, type, description, c.now);
}
async function validTeam(c: Context, id: string | null) {
  if (!id) return;
  const row = await c.env.DB.prepare(
    "SELECT id FROM teams WHERE id=? AND workspace_id=?",
  )
    .bind(id, c.workspace.id)
    .first();
  if (!row) fail(403, "INVALID_TEAM", "A equipe não pertence a esta empresa.");
}
async function validAssignee(
  c: Context,
  id: string | null,
  teamId: string | null,
) {
  if (!id) return;
  const row = await c.env.DB.prepare(
    "SELECT team_id AS teamId FROM members WHERE user_id=? AND workspace_id=?",
  )
    .bind(id, c.workspace.id)
    .first<{ teamId: string | null }>();
  if (!row)
    fail(403, "INVALID_ASSIGNEE", "O responsável não pertence a esta empresa.");
  if (teamId && row?.teamId !== teamId)
    fail(
      400,
      "TEAM_MISMATCH",
      "O responsável deve pertencer à equipe selecionada.",
    );
}
function deviceScope(c: Context) {
  return c.member.role === "collaborator"
    ? {
        sql: " AND (d.assigned_to=? OR (d.team_id IS NOT NULL AND d.team_id=?))",
        args: [c.user.id, c.member.teamId],
      }
    : { sql: "", args: [] };
}
async function devices(c: Context) {
  const scope = deviceScope(c);
  const rows = await c.env.DB.prepare(
    `${deviceSql} WHERE d.workspace_id=? AND d.archived_at IS NULL${scope.sql} ORDER BY d.created_at DESC,d.id DESC LIMIT 1000`,
  )
    .bind(c.workspace.id, ...scope.args)
    .all<Device>();
  return rows.results.map((row) => ({
    ...row,
    isExample: Boolean(row.isExample),
  }));
}
async function deviceById(c: Context, id: string, scoped = true) {
  const scope = scoped ? deviceScope(c) : { sql: "", args: [] };
  const row = await c.env.DB.prepare(
    `${deviceSql} WHERE d.id=? AND d.workspace_id=? AND d.archived_at IS NULL${scope.sql}`,
  )
    .bind(id, c.workspace.id, ...scope.args)
    .first<Device>();
  if (!row) return fail(404, "NOT_FOUND", "Aparelho não encontrado.");
  return { ...row, isExample: Boolean(row.isExample) };
}
async function teams(c: Context) {
  const sql = `SELECT t.id,t.name,t.location,t.color,t.created_at AS createdAt,t.is_example AS isExample,(SELECT COUNT(*) FROM members m WHERE m.team_id=t.id AND m.workspace_id=t.workspace_id) AS members,(SELECT COUNT(*) FROM devices d WHERE d.team_id=t.id AND d.workspace_id=t.workspace_id AND d.archived_at IS NULL) AS devices FROM teams t WHERE t.workspace_id=?${c.member.role === "collaborator" ? " AND t.id=?" : ""} ORDER BY t.name LIMIT 250`;
  const rows = await c.env.DB.prepare(sql)
    .bind(
      c.workspace.id,
      ...(c.member.role === "collaborator" ? [c.member.teamId] : []),
    )
    .all<Team>();
  return rows.results.map((row) => ({
    ...row,
    isExample: Boolean(row.isExample),
  }));
}
async function members(c: Context) {
  const rows = await c.env.DB.prepare(
    `${memberSql} WHERE m.workspace_id=?${c.member.role === "collaborator" ? " AND (m.user_id=? OR (m.team_id IS NOT NULL AND m.team_id=?))" : ""} ORDER BY m.display_name LIMIT 500`,
  )
    .bind(
      c.workspace.id,
      ...(c.member.role === "collaborator" ? [c.user.id, c.member.teamId] : []),
    )
    .all<Membership>();
  return rows.results.map(publicMember);
}
async function visibleMessages(
  c: Context,
  teamId?: string | null,
  limit = 100,
) {
  let filter = "",
    args: unknown[] = [];
  if (teamId === undefined) {
    if (c.member.role === "collaborator") {
      filter = " AND (msg.team_id IS NULL OR msg.team_id=?)";
      args = [c.member.teamId];
    }
  } else if (teamId === null) filter = " AND msg.team_id IS NULL";
  else {
    await validTeam(c, teamId);
    if (c.member.role === "collaborator" && c.member.teamId !== teamId)
      fail(403, "CHANNEL_FORBIDDEN", "Este canal é restrito à equipe.");
    filter = " AND msg.team_id=?";
    args = [teamId];
  }
  const rows = await c.env.DB.prepare(
    `${messageSql} WHERE msg.workspace_id=?${filter} ORDER BY msg.created_at DESC,msg.id DESC LIMIT ?`,
  )
    .bind(c.workspace.id, ...args, limit)
    .all<Message>();
  return rows.results;
}
async function createWorkspace(
  env: ApiEnvironment,
  user: User,
  existing: Membership | null,
  body: RecordBody,
) {
  if (existing)
    return fail(409, "ALREADY_MEMBER", "Sua conta já pertence a uma empresa.");
  allow(body, ["name", "withExamples"]);
  const name = stringValue(body.name, "Nome da empresa", 100);
  if (body.withExamples !== undefined && typeof body.withExamples !== "boolean")
    fail(
      400,
      "VALIDATION",
      "A opção de exemplos deve ser verdadeira ou falsa.",
    );
  const demo = body.withExamples === true,
    id = uuid(),
    now = new Date().toISOString();
  const teamOne = demo ? uuid() : null,
    teamTwo = demo ? uuid() : null;
  const statements = [
    env.DB.prepare(
      "INSERT INTO workspaces(id,name,is_demo,created_at) VALUES(?,?,?,?)",
    ).bind(id, name, demo ? 1 : 0, now),
  ];
  if (demo)
    for (const [teamId, teamName, location, color] of [
      [
        teamOne,
        "Operações de campo · exemplo",
        "Base Norte · exemplo",
        "#22d3ee",
      ],
      [teamTwo, "Logística · exemplo", "Base Sul · exemplo", "#ff8a1f"],
    ])
      statements.push(
        env.DB.prepare(
          "INSERT INTO teams(id,workspace_id,name,location,color,is_example,created_at) VALUES(?,?,?,?,?,1,?)",
        ).bind(teamId, id, teamName, location, color, now),
      );
  statements.push(
    env.DB.prepare(
      "INSERT INTO members(user_id,workspace_id,email,display_name,role,team_id,joined_at) VALUES(?,?,?,?,?,?,?)",
    ).bind(user.id, id, user.email, user.name, "admin", teamOne, now),
  );
  if (demo)
    for (const [index, status, teamId, assignee] of [
      [1, "available", teamOne, null],
      [2, "in_use", teamOne, user.id],
      [3, "maintenance", teamTwo, null],
    ] as const)
      statements.push(
        env.DB.prepare(
          "INSERT INTO devices(id,workspace_id,name,serial,model,status,team_id,assigned_to,notes,created_at,updated_at,is_example) VALUES(?,?,?,?,?,?,?,?,?,?,?,1)",
        ).bind(
          uuid(),
          id,
          `WALK TALK ${index} · exemplo`,
          `EXEMPLO-00${index}`,
          "Modelo conceitual",
          status,
          teamId,
          assignee,
          "Registro fictício para explorar a plataforma.",
          now,
          now,
        ),
      );
  statements.push(
    env.DB.prepare(
      "INSERT INTO activity(id,workspace_id,actor_id,type,description,created_at) VALUES(?,?,?,?,?,?)",
    ).bind(
      uuid(),
      id,
      user.id,
      "workspace_created",
      demo
        ? "Empresa criada com equipes e aparelhos de exemplo."
        : "Empresa criada. Bem-vindo ao WALK TALK.",
      now,
    ),
  );
  await env.DB.batch(statements);
  const member = await getMembership(env, user);
  return json(
    {
      user,
      member: member ? publicMember(member) : null,
      workspace: { id, name, isDemo: demo },
    },
    201,
  );
}
async function overview(c: Context) {
  // Aggregates cover the full authorized dataset, independently of list limits.
  const scope = deviceScope(c);
  const deviceCounts = await c.env.DB.prepare(
    `SELECT COUNT(*) AS total,
      COALESCE(SUM(CASE WHEN d.status='available' THEN 1 ELSE 0 END),0) AS available,
      COALESCE(SUM(CASE WHEN d.status='in_use' THEN 1 ELSE 0 END),0) AS inUse,
      COALESCE(SUM(CASE WHEN d.status='maintenance' THEN 1 ELSE 0 END),0) AS maintenance,
      COALESCE(SUM(CASE WHEN substr(d.last_check_at,1,10)=? THEN 1 ELSE 0 END),0) AS checkedToday
     FROM devices d WHERE d.workspace_id=? AND d.archived_at IS NULL${scope.sql}`,
  )
    .bind(c.now.slice(0, 10), c.workspace.id, ...scope.args)
    .first<{
      total: number;
      available: number;
      inUse: number;
      maintenance: number;
      checkedToday: number;
    }>();
  const teamCount = await c.env.DB.prepare(
    `SELECT COUNT(*) AS total FROM teams t WHERE t.workspace_id=?${c.member.role === "collaborator" ? " AND t.id=?" : ""}`,
  )
    .bind(
      c.workspace.id,
      ...(c.member.role === "collaborator" ? [c.member.teamId] : []),
    )
    .first<{ total: number }>();
  const memberCount = await c.env.DB.prepare(
    `SELECT COUNT(*) AS total FROM members m WHERE m.workspace_id=?${c.member.role === "collaborator" ? " AND (m.user_id=? OR (m.team_id IS NOT NULL AND m.team_id=?))" : ""}`,
  )
    .bind(
      c.workspace.id,
      ...(c.member.role === "collaborator" ? [c.user.id, c.member.teamId] : []),
    )
    .first<{ total: number }>();
  const filter =
    c.member.role === "collaborator"
      ? " AND (a.actor_id=? OR (a.team_id IS NOT NULL AND a.team_id=?))"
      : "";
  const activityRows = await c.env.DB.prepare(
    `SELECT a.id,a.type,a.description,m.display_name AS actorName,a.created_at AS createdAt FROM activity a JOIN members m ON m.user_id=a.actor_id AND m.workspace_id=a.workspace_id WHERE a.workspace_id=?${filter} ORDER BY a.created_at DESC,a.id DESC LIMIT 12`,
  )
    .bind(
      c.workspace.id,
      ...(c.member.role === "collaborator" ? [c.user.id, c.member.teamId] : []),
    )
    .all<Activity>();
  const count = await c.env.DB.prepare(
    `SELECT COUNT(*) AS total FROM messages WHERE workspace_id=?${c.member.role === "collaborator" ? " AND (team_id IS NULL OR team_id=?)" : ""}`,
  )
    .bind(
      c.workspace.id,
      ...(c.member.role === "collaborator" ? [c.member.teamId] : []),
    )
    .first<{ total: number }>();
  return json({
    workspace: c.workspace,
    devices: deviceCounts ?? {
      total: 0,
      available: 0,
      inUse: 0,
      maintenance: 0,
      checkedToday: 0,
    },
    teams: teamCount?.total ?? 0,
    members: memberCount?.total ?? 0,
    messages: count?.total ?? 0,
    activity: activityRows.results,
    recentMessages: await visibleMessages(c, undefined, 5),
  });
}
async function createTeam(c: Context, body: RecordBody) {
  elevated(c);
  allow(body, ["name", "location", "color"]);
  const name = stringValue(body.name, "Nome da equipe", 80),
    location = stringValue(body.location, "Localização", 120, false),
    color =
      body.color === undefined ? "#22d3ee" : stringValue(body.color, "Cor", 7);
  if (!/^#[\da-f]{6}$/i.test(color))
    fail(400, "VALIDATION", "Use uma cor hexadecimal válida.");
  const id = uuid();
  await c.env.DB.batch([
    c.env.DB.prepare(
      "INSERT INTO teams(id,workspace_id,name,location,color,created_at) VALUES(?,?,?,?,?,?)",
    ).bind(id, c.workspace.id, name, location, color, c.now),
    activity(c, "team_created", `Equipe ${name} criada.`, id),
  ]);
  return json({ team: (await teams(c)).find((t) => t.id === id) }, 201);
}
async function saveDevice(c: Context, body: RecordBody, id?: string) {
  elevated(c);
  allow(body, [
    "name",
    "serial",
    "model",
    "status",
    "teamId",
    "assignedTo",
    "notes",
  ]);
  if (id && Object.keys(body).length === 0)
    fail(400, "VALIDATION", "Informe ao menos um campo para alterar.");
  const current = id ? await deviceById(c, id, false) : null;
  const input: RecordBody = {
    ...(current ?? {
      status: "available",
      teamId: null,
      assignedTo: null,
      notes: "",
    }),
    ...body,
  };
  const name = stringValue(input.name, "Nome do aparelho", 80),
    serial = stringValue(input.serial, "Número de série", 64),
    model = stringValue(input.model, "Modelo", 80),
    notes = stringValue(input.notes, "Observações", 500, false);
  if (!["available", "in_use", "maintenance"].includes(input.status as string))
    fail(400, "VALIDATION", "Escolha uma situação válida para o aparelho.");
  const status = input.status as DeviceStatus,
    teamId = optionalId(input.teamId, "Equipe"),
    assignedTo = optionalId(input.assignedTo, "Responsável");
  await validTeam(c, teamId);
  await validAssignee(c, assignedTo, teamId);
  const deviceId = id ?? uuid();
  const statement = id
    ? c.env.DB.prepare(
        "UPDATE devices SET name=?,serial=?,model=?,status=?,team_id=?,assigned_to=?,notes=?,updated_at=? WHERE id=? AND workspace_id=? AND archived_at IS NULL",
      ).bind(
        name,
        serial,
        model,
        status,
        teamId,
        assignedTo,
        notes,
        c.now,
        deviceId,
        c.workspace.id,
      )
    : c.env.DB.prepare(
        "INSERT INTO devices(id,workspace_id,name,serial,model,status,team_id,assigned_to,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
      ).bind(
        deviceId,
        c.workspace.id,
        name,
        serial,
        model,
        status,
        teamId,
        assignedTo,
        notes,
        c.now,
        c.now,
      );
  await c.env.DB.batch([
    statement,
    activity(
      c,
      id ? "device_updated" : "device_created",
      `Aparelho ${name} ${id ? "atualizado" : "cadastrado"}.`,
      teamId,
    ),
  ]);
  return json({ device: await deviceById(c, deviceId, false) }, id ? 200 : 201);
}
async function archiveDevice(c: Context, id: string) {
  elevated(c);
  const device = await deviceById(c, id, false);
  await c.env.DB.batch([
    c.env.DB.prepare(
      "UPDATE devices SET archived_at=?,updated_at=? WHERE id=? AND workspace_id=? AND archived_at IS NULL",
    ).bind(c.now, c.now, id, c.workspace.id),
    activity(
      c,
      "device_archived",
      `Aparelho ${device.name} arquivado.`,
      device.teamId,
    ),
  ]);
  return json({ ok: true });
}
async function checkDevice(c: Context, id: string) {
  const device = await deviceById(c, id);
  if (c.member.role === "collaborator" && device.assignedTo !== c.user.id)
    fail(
      403,
      "FORBIDDEN",
      "Você só pode registrar a conferência de um aparelho atribuído a você.",
    );
  const results = await c.env.DB.batch([
    c.env.DB.prepare(
      "UPDATE devices SET last_check_at=?,updated_at=? WHERE id=? AND workspace_id=? AND archived_at IS NULL AND (?<>'collaborator' OR assigned_to=?)",
    ).bind(c.now, c.now, id, c.workspace.id, c.member.role, c.user.id),
    c.env.DB.prepare(
      "INSERT INTO activity(id,workspace_id,actor_id,team_id,type,description,created_at) SELECT ?,workspace_id,?,team_id,'device_checked',?,? FROM devices WHERE id=? AND workspace_id=? AND archived_at IS NULL AND last_check_at=? AND (?<>'collaborator' OR assigned_to=?)",
    ).bind(
      uuid(),
      c.user.id,
      `Conferência manual registrada: ${device.name}.`,
      c.now,
      id,
      c.workspace.id,
      c.now,
      c.member.role,
      c.user.id,
    ),
  ]);
  if (results[0].meta.changes !== 1)
    fail(
      409,
      "DEVICE_CHANGED",
      "O aparelho foi alterado por outra pessoa. Atualize a lista antes de continuar.",
    );
  return json({ device: await deviceById(c, id) });
}
async function updateMember(c: Context, id: string, body: RecordBody) {
  admin(c);
  allow(body, ["role", "teamId"]);
  if (Object.keys(body).length === 0)
    fail(400, "VALIDATION", "Informe ao menos um campo para alterar.");
  const target = await c.env.DB.prepare(
    `${memberSql} WHERE m.user_id=? AND m.workspace_id=?`,
  )
    .bind(id, c.workspace.id)
    .first<Membership>();
  if (!target) fail(404, "NOT_FOUND", "Pessoa não encontrada.");
  if (id === c.user.id || target?.role === "admin")
    fail(
      403,
      "ADMIN_PROTECTED",
      "A conta administradora não pode ser alterada por esta operação.",
    );
  const role = body.role === undefined ? target!.role : roleValue(body.role),
    teamId =
      body.teamId === undefined
        ? target!.teamId
        : optionalId(body.teamId, "Equipe");
  await validTeam(c, teamId);
  // Clear assignments that would become inconsistent with the new team.
  await c.env.DB.batch([
    c.env.DB.prepare(
      "UPDATE members SET role=?,team_id=? WHERE user_id=? AND workspace_id=? AND role<>'admin'",
    ).bind(role, teamId, id, c.workspace.id),
    c.env.DB.prepare(
      "UPDATE devices SET assigned_to=NULL,updated_at=? WHERE workspace_id=? AND assigned_to=? AND team_id IS NOT NULL AND (team_id<>? OR ? IS NULL)",
    ).bind(c.now, c.workspace.id, id, teamId, teamId),
    activity(
      c,
      "member_updated",
      `Acesso de ${target!.name} atualizado.`,
      teamId,
    ),
  ]);
  const updated = await c.env.DB.prepare(
    `${memberSql} WHERE m.user_id=? AND m.workspace_id=?`,
  )
    .bind(id, c.workspace.id)
    .first<Membership>();
  return json({ member: publicMember(updated!) });
}
async function createMessage(c: Context, body: RecordBody) {
  allow(body, ["body", "teamId"]);
  const text = stringValue(body.body, "Mensagem", 2000),
    teamId = optionalId(body.teamId, "Canal");
  await validTeam(c, teamId);
  if (teamId && c.member.role === "collaborator" && teamId !== c.member.teamId)
    fail(403, "CHANNEL_FORBIDDEN", "Este canal é restrito à equipe.");
  const id = uuid();
  await c.env.DB.batch([
    c.env.DB.prepare(
      "INSERT INTO messages(id,workspace_id,team_id,author_id,body,created_at) VALUES(?,?,?,?,?,?)",
    ).bind(id, c.workspace.id, teamId, c.user.id, text, c.now),
    activity(
      c,
      "message_posted",
      teamId
        ? "Uma mensagem foi publicada no canal da equipe."
        : "Uma mensagem foi publicada no canal geral.",
      teamId,
    ),
  ]);
  const message = await c.env.DB.prepare(
    `${messageSql} WHERE msg.id=? AND msg.workspace_id=?`,
  )
    .bind(id, c.workspace.id)
    .first<Message>();
  return json({ message }, 201);
}
async function hashToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
async function invitations(c: Context) {
  admin(c);
  const rows = await c.env.DB.prepare(
    `${inviteSql} WHERE i.workspace_id=? ORDER BY i.created_at DESC LIMIT 250`,
  )
    .bind(c.now, c.workspace.id)
    .all<Invitation>();
  return rows.results;
}
async function createInvitation(c: Context, body: RecordBody, origin: string) {
  admin(c);
  allow(body, ["role", "email", "teamId"]);
  const role = roleValue(body.role),
    teamId = optionalId(body.teamId, "Equipe");
  await validTeam(c, teamId);
  const email =
    body.email === undefined || body.email === null || body.email === ""
      ? null
      : stringValue(body.email, "E-mail", 254).toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fail(400, "VALIDATION", "Informe um e-mail válido.");
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  const tokenHash = await hashToken(token),
    id = uuid(),
    expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await c.env.DB.batch([
    c.env.DB.prepare(
      "INSERT INTO invitations(id,workspace_id,token_hash,role,email,team_id,created_by,created_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?)",
    ).bind(
      id,
      c.workspace.id,
      tokenHash,
      role,
      email,
      teamId,
      c.user.id,
      c.now,
      expiresAt,
    ),
    activity(
      c,
      "invitation_created",
      `Convite de ${role === "manager" ? "gestor" : "colaborador"} criado.`,
      teamId,
    ),
  ]);
  const invitation = await c.env.DB.prepare(
    `${inviteSql} WHERE i.id=? AND i.workspace_id=?`,
  )
    .bind(c.now, id, c.workspace.id)
    .first<Invitation>();
  return json(
    { invitation, token, url: `${origin}/portal?convite=${token}`, expiresAt },
    201,
  );
}
async function acceptInvitation(
  env: ApiEnvironment,
  user: User,
  existing: Membership | null,
  body: RecordBody,
) {
  allow(body, ["token"]);
  const token = stringValue(body.token, "Convite", 64);
  if (!/^[\da-f]{64}$/.test(token))
    fail(400, "INVALID_INVITATION", "O convite não é válido.");
  if (existing)
    fail(409, "ALREADY_MEMBER", "Sua conta já pertence a uma empresa.");
  const hash = await hashToken(token),
    now = new Date().toISOString();
  const invitation = await env.DB.prepare(
    "SELECT id,workspace_id AS workspaceId,email,expires_at AS expiresAt,accepted_at AS acceptedAt,revoked_at AS revokedAt FROM invitations WHERE token_hash=?",
  )
    .bind(hash)
    .first<{
      id: string;
      workspaceId: string;
      email: string | null;
      expiresAt: string;
      acceptedAt: string | null;
      revokedAt: string | null;
    }>();
  if (!invitation)
    fail(404, "INVALID_INVITATION", "Este convite não foi encontrado.");
  if (
    invitation!.acceptedAt ||
    invitation!.revokedAt ||
    invitation!.expiresAt <= now
  )
    fail(
      409,
      "INVITATION_UNAVAILABLE",
      "Este convite expirou, foi revogado ou já foi utilizado.",
    );
  if (invitation!.email && invitation!.email !== user.email)
    fail(
      403,
      "INVITATION_EMAIL",
      "Entre com o e-mail destinatário deste convite.",
    );
  const results = await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO members(user_id,workspace_id,email,display_name,role,team_id,invitation_id,joined_at) SELECT ?,workspace_id,?,?,role,team_id,id,? FROM invitations WHERE token_hash=? AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at>? AND (email IS NULL OR email=?)",
    ).bind(user.id, user.email, user.name, now, hash, now, user.email),
    env.DB.prepare(
      "UPDATE invitations SET accepted_at=?,accepted_by=? WHERE token_hash=? AND accepted_at IS NULL AND EXISTS(SELECT 1 FROM members WHERE user_id=? AND invitation_id=invitations.id)",
    ).bind(now, user.id, hash, user.id),
    env.DB.prepare(
      "INSERT INTO activity(id,workspace_id,actor_id,team_id,type,description,created_at) SELECT ?,workspace_id,user_id,team_id,'member_joined',?,? FROM members WHERE user_id=? AND invitation_id=?",
    ).bind(
      uuid(),
      `${user.name} entrou na empresa.`,
      now,
      user.id,
      invitation!.id,
    ),
  ]);
  if (results[0].meta.changes !== 1)
    fail(
      409,
      "INVITATION_UNAVAILABLE",
      "Este convite não está mais disponível.",
    );
  const member = await getMembership(env, user);
  return json(
    {
      user,
      member: member ? publicMember(member) : null,
      workspace: await getWorkspace(env, invitation!.workspaceId),
    },
    201,
  );
}
async function revokeInvitation(c: Context, id: string) {
  admin(c);
  const row = await c.env.DB.prepare(
    "SELECT id,accepted_at AS acceptedAt FROM invitations WHERE id=? AND workspace_id=?",
  )
    .bind(id, c.workspace.id)
    .first<{ id: string; acceptedAt: string | null }>();
  if (!row) fail(404, "NOT_FOUND", "Convite não encontrado.");
  if (row?.acceptedAt)
    fail(409, "INVITATION_USED", "Um convite utilizado não pode ser revogado.");
  await c.env.DB.batch([
    c.env.DB.prepare(
      "UPDATE invitations SET revoked_at=? WHERE id=? AND workspace_id=? AND accepted_at IS NULL",
    ).bind(c.now, id, c.workspace.id),
    activity(c, "invitation_revoked", "Convite revogado."),
  ]);
  return json({ ok: true });
}
function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[\s]*[=+\-@\t\r]/.test(text)) text = "'" + text;
  return `"${text.replaceAll('"', '""')}"`;
}
async function exportDevices(c: Context) {
  elevated(c);
  const labels = {
    available: "Disponível",
    in_use: "Em uso",
    maintenance: "Manutenção",
  };
  const heading = [
    "Nome",
    "Número de série",
    "Modelo",
    "Situação",
    "Equipe",
    "Responsável",
    "Última conferência",
    "Observações",
  ];
  const encoder = new TextEncoder();
  // Stream bounded pages so large exports are complete without loading the
  // entire company's inventory into the Worker's limited memory.
  let cursor: { createdAt: string; id: string } | null = null;
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(
        encoder.encode("\uFEFF" + heading.map(csvCell).join(";")),
      );
    },
    async pull(controller) {
      try {
        const rows = await c.env.DB.prepare(
          `${deviceSql} WHERE d.workspace_id=? AND d.archived_at IS NULL AND d.created_at<=?${cursor ? " AND (d.created_at>? OR (d.created_at=? AND d.id>?))" : ""} ORDER BY d.created_at ASC,d.id ASC LIMIT 250`,
        )
          .bind(
            c.workspace.id,
            c.now,
            ...(cursor ? [cursor.createdAt, cursor.createdAt, cursor.id] : []),
          )
          .all<Device>();
        if (cancelled) return;
        if (rows.results.length) {
          const lines = rows.results.map((d) =>
            [
              d.name,
              d.serial,
              d.model,
              labels[d.status],
              d.teamName ?? "",
              d.assigneeName ?? "",
              d.lastCheckAt ?? "",
              d.notes,
            ]
              .map(csvCell)
              .join(";"),
          );
          controller.enqueue(encoder.encode("\r\n" + lines.join("\r\n")));
          const last = rows.results[rows.results.length - 1];
          cursor = { createdAt: last.createdAt, id: last.id };
        }
        if (rows.results.length < 250) controller.close();
      } catch (error) {
        if (!cancelled) controller.error(error);
      }
    },
    cancel() {
      cancelled = true;
    },
  });
  return new Response(stream, {
    headers: {
      ...responseHeaders,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="walk-talk-aparelhos.csv"',
    },
  });
}

export async function handleApi(
  request: Request,
  env: ApiEnvironment,
): Promise<Response> {
  try {
    const url = new URL(request.url),
      path = url.pathname.replace(/\/$/, ""),
      method = request.method;
    if (!path.startsWith("/api/v1/"))
      return json(
        { error: { code: "NOT_FOUND", message: "Rota não encontrada." } },
        404,
      );
    csrf(request);
    const user = identity(request);
    if (!env.DB)
      fail(
        503,
        "DATABASE_UNAVAILABLE",
        "O serviço de dados está temporariamente indisponível.",
      );
    const member = await getMembership(env, user);
    if (path === "/api/v1/session" && method === "GET")
      return json({
        user,
        member: member ? publicMember(member) : null,
        workspace: member ? await getWorkspace(env, member.workspaceId) : null,
      });
    if (path === "/api/v1/workspace" && method === "POST")
      return await createWorkspace(env, user, member, await bodyOf(request));
    if (path === "/api/v1/invitations/accept" && method === "POST")
      return await acceptInvitation(env, user, member, await bodyOf(request));
    const c = await context(env, user, member);
    if (path === "/api/v1/overview" && method === "GET")
      return await overview(c);
    if (path === "/api/v1/teams") {
      if (method === "GET") return json({ teams: await teams(c) });
      if (method === "POST") return await createTeam(c, await bodyOf(request));
    }
    if (path === "/api/v1/devices") {
      if (method === "GET") return json({ devices: await devices(c) });
      if (method === "POST") return await saveDevice(c, await bodyOf(request));
    }
    const deviceMatch = path.match(/^\/api\/v1\/devices\/([^/]+)(\/check)?$/);
    if (deviceMatch) {
      const id = decodeURIComponent(deviceMatch[1]);
      if (deviceMatch[2] && method === "POST") {
        const body = await bodyOf(request);
        allow(body, []);
        return await checkDevice(c, id);
      }
      if (!deviceMatch[2] && method === "PATCH")
        return await saveDevice(c, await bodyOf(request), id);
      if (!deviceMatch[2] && method === "DELETE")
        return await archiveDevice(c, id);
    }
    if (path === "/api/v1/members" && method === "GET")
      return json({ members: await members(c) });
    const memberMatch = path.match(/^\/api\/v1\/members\/([^/]+)$/);
    if (memberMatch && method === "PATCH")
      return await updateMember(
        c,
        decodeURIComponent(memberMatch[1]),
        await bodyOf(request),
      );
    if (path === "/api/v1/messages") {
      if (method === "GET") {
        const teamId = optionalId(url.searchParams.get("teamId"), "Canal");
        return json({ messages: await visibleMessages(c, teamId) });
      }
      if (method === "POST")
        return await createMessage(c, await bodyOf(request));
    }
    if (path === "/api/v1/invitations") {
      if (method === "GET") return json({ invitations: await invitations(c) });
      if (method === "POST")
        return await createInvitation(c, await bodyOf(request), url.origin);
    }
    const invitationMatch = path.match(/^\/api\/v1\/invitations\/([^/]+)$/);
    if (invitationMatch && method === "DELETE")
      return await revokeInvitation(c, decodeURIComponent(invitationMatch[1]));
    if (path === "/api/v1/export/devices" && method === "GET")
      return await exportDevices(c);
    return fail(404, "NOT_FOUND", "Rota ou operação não encontrada.");
  } catch (error) {
    if (error instanceof ApiError)
      return json(
        { error: { code: error.code, message: error.message } },
        error.status,
      );
    if (error instanceof URIError)
      return json(
        {
          error: {
            code: "VALIDATION",
            message: "O identificador informado não é válido.",
          },
        },
        400,
      );
    if (
      error instanceof Error &&
      /UNIQUE constraint|SQLITE_CONSTRAINT_UNIQUE|SQLITE_CONSTRAINT_PRIMARYKEY/i.test(
        error.message,
      )
    )
      return json(
        {
          error: {
            code: "CONFLICT",
            message: "Este registro já existe ou o convite já foi utilizado.",
          },
        },
        409,
      );
    console.error(
      "WALK TALK API request failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Não foi possível concluir a operação. Tente novamente.",
        },
      },
      500,
    );
  }
}
