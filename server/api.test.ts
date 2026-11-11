import test from "node:test";
import type { TestContext } from "node:test";
import assert from "node:assert/strict";
import { handleApi } from "./api.ts";
import { TestDatabase } from "./test-db.ts";
import type {
  DeviceInput,
  Device,
  Team,
  Session,
  InvitationCreated,
} from "./types.ts";

const origin = "http://localhost:4173";
const identity = (id: string) => ({
  id,
  email: `${id}@example.test`,
  name: `Pessoa ${id}`,
});
class Client {
  constructor(
    readonly db: TestDatabase,
    readonly id: string | null = null,
  ) {}
  async request(
    path: string,
    method = "GET",
    body?: unknown,
    headers: Record<string, string> = {},
  ) {
    const user = this.id ? identity(this.id) : null;
    return handleApi(
      new Request(`${origin}/api/v1${path}`, {
        method,
        headers: {
          ...(user
            ? {
                "oai-authenticated-user-id": user.id,
                "oai-authenticated-user-email": user.email,
                "oai-authenticated-user-full-name": encodeURIComponent(
                  user.name,
                ),
                "oai-authenticated-user-full-name-encoding":
                  "percent-encoded-utf-8",
              }
            : {}),
          ...(body === undefined
            ? {}
            : { "content-type": "application/json", origin }),
          ...headers,
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      }),
      { DB: this.db },
    );
  }
  async data<T>(path: string, method = "GET", body?: unknown): Promise<T> {
    const response = await this.request(path, method, body);
    const result = await response.json();
    assert.ok(
      response.ok,
      `${method} ${path}: ${response.status} ${JSON.stringify(result)}`,
    );
    return result as T;
  }
  async bootstrap(name = "Empresa de teste") {
    await this.data("/workspace", "POST", { name });
    return this.data<Session>("/session");
  }
  async team(name = "Equipe de teste") {
    const result = await this.data<{ team: Team }>("/teams", "POST", {
      name,
      location: "Unidade de teste",
      color: "#22d3ee",
    });
    return result.team;
  }
  async device(extra: Partial<DeviceInput> = {}) {
    const result = await this.data<{ device: Device }>("/devices", "POST", {
      name: "Rádio de teste",
      serial: crypto.randomUUID(),
      model: "WALK TALK",
      status: "available",
      teamId: null,
      assignedTo: null,
      notes: "",
      ...extra,
    });
    return result.device;
  }
  async invite(
    role: "manager" | "collaborator",
    userId?: string,
    teamId: string | null = null,
  ) {
    return this.data<InvitationCreated>("/invitations", "POST", {
      role,
      email: userId ? identity(userId).email : null,
      teamId,
    });
  }
}

function fixture(t: TestContext) {
  const db = new TestDatabase();
  t.after(() => db.close());
  return db;
}

async function denied(response: Response, statuses: number[]) {
  assert.ok(
    statuses.includes(response.status),
    `Expected ${statuses.join("/")}, received ${response.status}: ${await response.clone().text()}`,
  );
  const body = (await response.json()) as {
    error?: { code?: string; message?: string };
  };
  assert.equal(typeof body.error?.code, "string");
  assert.equal(typeof body.error?.message, "string");
  assert.equal(
    response.headers.get("cache-control")?.includes("no-store"),
    true,
  );
}

test("identity is required and missing identity never bootstraps a workspace", async (t) => {
  const db = fixture(t);
  const anonymous = new Client(db);
  await denied(await anonymous.request("/session"), [401]);
  await denied(
    await anonymous.request("/workspace", "POST", { name: "Não autorizado" }),
    [401],
  );
  const response = await new Client(db, "owner-a").request("/session");
  assert.equal(response.status, 200);
  const session = (await response.json()) as Session;
  assert.equal(session.member, null);
  assert.equal(session.workspace, null);
  assert.equal(session.user.name, "Pessoa owner-a");
  assert.match(response.headers.get("cache-control") ?? "", /no-store/);
});

test("workspace bootstrap is atomic, unique per account and isolated between tenants", async (t) => {
  const db = fixture(t),
    a = new Client(db, "owner-a"),
    b = new Client(db, "owner-b");
  const sa = await a.bootstrap("Empresa A"),
    sb = await b.bootstrap("Empresa B");
  assert.notEqual(sa.workspace?.id, sb.workspace?.id);
  assert.equal(sa.member?.role, "admin");
  assert.equal(sa.workspace?.isDemo, false);
  await denied(
    await a.request("/workspace", "POST", { name: "Empresa duplicada" }),
    [409],
  );
  const device = await a.device();
  const bDevices = await b.data<{ devices: Device[] }>("/devices");
  assert.deepEqual(bDevices.devices, []);
  await denied(
    await b.request(`/devices/${device.id}`, "PATCH", { name: "Sequestro" }),
    [403, 404],
  );
  assert.equal(
    (await a.data<{ devices: Device[] }>("/devices")).devices[0].name,
    "Rádio de teste",
  );
  assert.equal(
    db.sqlite.prepare("SELECT count(*) AS total FROM workspaces").get()?.total,
    2,
  );
});

test("collaborator permissions are enforced server-side and do not trust role fields", async (t) => {
  const db = fixture(t),
    admin = new Client(db, "admin"),
    user = new Client(db, "colleague");
  await admin.bootstrap();
  const invite = await admin.invite("collaborator", "colleague");
  await user.data("/invitations/accept", "POST", { token: invite.token });
  assert.equal(
    (await user.data<Session>("/session")).member?.role,
    "collaborator",
  );
  for (const [path, method, body] of [
    [
      "/devices",
      "POST",
      {
        name: "Invasão",
        serial: "42",
        model: "Rádio",
        status: "available",
        role: "admin",
      },
    ],
    [
      "/teams",
      "POST",
      { name: "Não permitido", location: "X", color: "#22d3ee" },
    ],
    ["/invitations", "POST", { role: "manager" }],
    ["/members/admin", "PATCH", { role: "collaborator" }],
    ["/export/devices", "GET", undefined],
  ] as const)
    await denied(await user.request(path, method, body), [403]);
  const device = await admin.device();
  await denied(
    await user.request(`/devices/${device.id}/check`, "POST", {}),
    [403, 404],
  );
  const own = await admin.device({ assignedTo: "colleague" });
  const check = await user.request(`/devices/${own.id}/check`, "POST", {});
  assert.equal(check.ok, true, await check.clone().text());
});

test("cross-tenant team and assignee references cannot be written", async (t) => {
  const db = fixture(t),
    a = new Client(db, "admin-a"),
    b = new Client(db, "admin-b");
  await a.bootstrap();
  await b.bootstrap();
  const otherTeam = await b.team();
  const base = {
    name: "Rádio",
    serial: "one",
    model: "WALK TALK",
    status: "available",
    teamId: null,
    assignedTo: null,
    notes: "",
  };
  await denied(
    await a.request("/devices", "POST", { ...base, teamId: otherTeam.id }),
    [400, 403, 404],
  );
  await denied(
    await a.request("/devices", "POST", { ...base, assignedTo: "admin-b" }),
    [400, 403, 404],
  );
  await denied(
    await a.request("/invitations", "POST", {
      role: "manager",
      teamId: otherTeam.id,
    }),
    [400, 403, 404],
  );
  await denied(
    await a.request("/messages", "POST", {
      body: "Canal incorreto",
      teamId: otherTeam.id,
    }),
    [400, 403, 404],
  );
  assert.deepEqual(
    (await a.data<{ devices: Device[] }>("/devices")).devices,
    [],
  );
});

test("invitations are email-bound, one-time, revocable and never expose stored hashes", async (t) => {
  const db = fixture(t),
    admin = new Client(db, "admin"),
    right = new Client(db, "right"),
    wrong = new Client(db, "wrong");
  await admin.bootstrap();
  const created = await admin.invite("manager", "right");
  assert.match(created.token, /^[a-zA-Z0-9_-]{32,}$/);
  assert.ok(new Date(created.expiresAt).getTime() > Date.now());
  await denied(
    await wrong.request("/invitations/accept", "POST", {
      token: created.token,
    }),
    [403],
  );
  await right.data("/invitations/accept", "POST", { token: created.token });
  await denied(
    await right.request("/invitations/accept", "POST", {
      token: created.token,
    }),
    [409],
  );
  await denied(
    await wrong.request("/invitations/accept", "POST", {
      token: created.token,
    }),
    [409],
  );
  const listed = await admin.request("/invitations");
  const text = await listed.text();
  assert.equal(text.includes(created.token), false);
  assert.equal(/tokenHash|token_hash/i.test(text), false);
  const stored = db.sqlite
    .prepare("SELECT token_hash FROM invitations WHERE id = ?")
    .get(created.invitation.id);
  assert.notEqual(stored?.token_hash, created.token);
  assert.equal(typeof stored?.token_hash, "string");
  const revoked = await admin.invite("collaborator");
  assert.equal(
    (await admin.request(`/invitations/${revoked.invitation.id}`, "DELETE")).ok,
    true,
  );
  await denied(
    await wrong.request("/invitations/accept", "POST", {
      token: revoked.token,
    }),
    [409, 410],
  );
});

test("request boundary rejects cross-origin writes, malformed JSON and excessive bodies", async (t) => {
  const db = fixture(t),
    admin = new Client(db, "admin");
  await admin.bootstrap();
  await denied(
    await admin.request(
      "/teams",
      "POST",
      { name: "CSRF" },
      { origin: "https://attacker.example" },
    ),
    [403],
  );
  await denied(
    await admin.request(
      "/teams",
      "POST",
      { name: "CSRF" },
      { "content-type": "text/plain" },
    ),
    [400, 415],
  );
  const headers = {
    "oai-authenticated-user-id": "admin",
    "oai-authenticated-user-email": "admin@example.test",
    "content-type": "application/json",
    origin,
  };
  const malformed = await handleApi(
    new Request(`${origin}/api/v1/teams`, {
      method: "POST",
      headers,
      body: "{bad json",
    }),
    { DB: db },
  );
  await denied(malformed, [400]);
  const oversized = await handleApi(
    new Request(`${origin}/api/v1/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({ body: "x".repeat(150_000) }),
    }),
    { DB: db },
  );
  await denied(oversized, [400, 413]);
  await denied(
    await admin.request("/messages", "POST", {
      body: "x".repeat(2001),
      teamId: null,
    }),
    [400],
  );
});

test("team messages stay private to their intended membership and are plain text", async (t) => {
  const db = fixture(t),
    admin = new Client(db, "admin"),
    first = new Client(db, "first"),
    second = new Client(db, "second");
  await admin.bootstrap();
  const teamA = await admin.team("Equipe A"),
    teamB = await admin.team("Equipe B");
  const ia = await admin.invite("collaborator", "first", teamA.id),
    ib = await admin.invite("collaborator", "second", teamB.id);
  await first.data("/invitations/accept", "POST", { token: ia.token });
  await second.data("/invitations/accept", "POST", { token: ib.token });
  await first.data("/messages", "POST", {
    body: "<script>alert('texto')</script>",
    teamId: teamA.id,
  });
  await denied(
    await second.request(`/messages?teamId=${teamA.id}`),
    [403, 404],
  );
  await denied(
    await second.request("/messages", "POST", {
      body: "Invasão",
      teamId: teamA.id,
    }),
    [403, 404],
  );
  const messages = await first.data<{ messages: { body: string }[] }>(
    `/messages?teamId=${teamA.id}`,
  );
  assert.equal(messages.messages[0].body, "<script>alert('texto')</script>");
  assert.deepEqual(
    (await first.data<{ messages: unknown[] }>("/messages")).messages,
    [],
  );
});

test("device CSV export defuses spreadsheet formulas and archive removes active records", async (t) => {
  const db = fixture(t),
    admin = new Client(db, "admin");
  await admin.bootstrap();
  const device = await admin.device({
    name: '=HYPERLINK("https://example.test")',
    serial: "+SUM(1,2)",
    notes: "@dangerous",
  });
  const response = await admin.request("/export/devices");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /text\/csv/);
  const csv = await response.text();
  assert.match(csv, /'=HYPERLINK/);
  assert.match(csv, /'\+SUM/);
  await admin.data(`/devices/${device.id}`, "DELETE");
  assert.deepEqual(
    (await admin.data<{ devices: Device[] }>("/devices")).devices,
    [],
  );
  assert.equal(
    db.sqlite
      .prepare("SELECT archived_at FROM devices WHERE id = ?")
      .get(device.id)?.archived_at !== null,
    true,
  );
});

test("manager can operate inventory but cannot administer access or change the owner", async (t) => {
  const db = fixture(t),
    admin = new Client(db, "admin"),
    manager = new Client(db, "manager");
  await admin.bootstrap();
  const invite = await admin.invite("manager", "manager");
  await manager.data("/invitations/accept", "POST", { token: invite.token });
  const team = await manager.team("Operações");
  const device = await manager.device({ teamId: team.id });
  await manager.data(`/devices/${device.id}`, "PATCH", {
    status: "maintenance",
  });
  assert.equal((await manager.request("/export/devices")).status, 200);
  await denied(await manager.request("/invitations"), [403]);
  await denied(
    await manager.request("/members/admin", "PATCH", { role: "collaborator" }),
    [403],
  );
  await denied(
    await admin.request("/members/admin", "PATCH", { role: "manager" }),
    [403],
  );
  await denied(
    await admin.request("/invitations", "POST", { role: "admin" }),
    [400],
  );
});

test("expired and concurrent invitations do not create extra memberships", async (t) => {
  const db = fixture(t),
    admin = new Client(db, "admin"),
    one = new Client(db, "one"),
    two = new Client(db, "two");
  await admin.bootstrap();
  const expired = await admin.invite("collaborator");
  db.sqlite
    .prepare("UPDATE invitations SET expires_at=? WHERE id=?")
    .run("2000-01-01T00:00:00.000Z", expired.invitation.id);
  await denied(
    await one.request("/invitations/accept", "POST", { token: expired.token }),
    [409],
  );
  assert.equal((await one.data<Session>("/session")).member, null);
  const shared = await admin.invite("collaborator");
  const results = await Promise.all([
    one.request("/invitations/accept", "POST", { token: shared.token }),
    two.request("/invitations/accept", "POST", { token: shared.token }),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
  assert.equal(
    db.sqlite
      .prepare("SELECT COUNT(*) AS total FROM members WHERE invitation_id=?")
      .get(shared.invitation.id)?.total,
    1,
  );
  assert.equal(
    db.sqlite
      .prepare(
        "SELECT COUNT(*) AS total FROM activity WHERE type='member_joined'",
      )
      .get()?.total,
    1,
  );
});

test("overview and activity obey team scope and membership updates clear inconsistent assignments", async (t) => {
  const db = fixture(t),
    admin = new Client(db, "admin"),
    colleague = new Client(db, "colleague"),
    outsider = new Client(db, "other-company");
  const owner = await admin.bootstrap();
  await outsider.bootstrap();
  const ownTeam = await admin.team("Visível"),
    hiddenTeam = await admin.team("Privada");
  const invitation = await admin.invite(
    "collaborator",
    "colleague",
    ownTeam.id,
  );
  await colleague.data("/invitations/accept", "POST", {
    token: invitation.token,
  });
  const assigned = await admin.device({
    teamId: ownTeam.id,
    assignedTo: "colleague",
  });
  await admin.device({ teamId: hiddenTeam.id, name: "Aparelho confidencial" });
  await admin.data("/messages", "POST", {
    teamId: hiddenTeam.id,
    body: "Mensagem restrita",
  });
  await admin.data("/messages", "POST", {
    teamId: null,
    body: "Mensagem geral",
  });
  const response = await colleague.request("/overview");
  const text = await response.text();
  const overview = JSON.parse(text);
  assert.equal(overview.devices.total, 1);
  assert.equal(overview.teams, 1);
  assert.equal(overview.members, 1);
  assert.equal(overview.messages, 1);
  assert.equal(text.includes("Aparelho confidencial"), false);
  assert.equal(text.includes("Mensagem restrita"), false);
  await denied(
    await outsider.request("/members/colleague", "PATCH", { teamId: null }),
    [404],
  );
  await admin.data("/members/colleague", "PATCH", { teamId: hiddenTeam.id });
  const updated = db.sqlite
    .prepare("SELECT assigned_to FROM devices WHERE id=? AND workspace_id=?")
    .get(assigned.id, owner.workspace!.id);
  assert.equal(updated?.assigned_to, null);
});

test("large inventory metrics and CSV are not truncated by the list page limit", async (t) => {
  const db = fixture(t),
    admin = new Client(db, "admin");
  const session = await admin.bootstrap();
  const insert = db.sqlite.prepare(
    "INSERT INTO devices(id,workspace_id,name,serial,model,status,created_at,updated_at) VALUES(?,?,?,?,?,'available',?,?)",
  );
  const timestamp = "2025-01-01T00:00:00.000Z";
  for (let i = 0; i < 1005; i++)
    insert.run(
      `device-${String(i).padStart(5, "0")}`,
      session.workspace!.id,
      `Aparelho ${i}`,
      `SERIAL-${i}`,
      "WALK TALK",
      timestamp,
      timestamp,
    );
  const overview = await admin.data<{
    devices: { total: number; available: number };
  }>("/overview");
  assert.equal(overview.devices.total, 1005);
  assert.equal(overview.devices.available, 1005);
  const csv = await (await admin.request("/export/devices")).text();
  assert.equal(csv.split("\r\n").length, 1006);
  assert.match(csv, /SERIAL-1004/);
});

test("a collaborator cannot complete a check after the device was concurrently reassigned", async (t) => {
  const db = fixture(t),
    admin = new Client(db, "admin"),
    user = new Client(db, "colleague");
  await admin.bootstrap();
  const invite = await admin.invite("collaborator", "colleague");
  await user.data("/invitations/accept", "POST", { token: invite.token });
  const device = await admin.device({ assignedTo: "colleague" });
  const batch = db.batch.bind(db);
  let reassign = true;
  db.batch = async (statements) => {
    if (reassign) {
      reassign = false;
      db.sqlite
        .prepare("UPDATE devices SET assigned_to=NULL WHERE id=?")
        .run(device.id);
    }
    return batch(statements);
  };
  await denied(
    await user.request(`/devices/${device.id}/check`, "POST", {}),
    [409],
  );
  assert.equal(
    db.sqlite
      .prepare("SELECT last_check_at FROM devices WHERE id=?")
      .get(device.id)?.last_check_at,
    null,
  );
  assert.equal(
    db.sqlite
      .prepare(
        "SELECT COUNT(*) AS total FROM activity WHERE type='device_checked'",
      )
      .get()?.total,
    0,
  );
});
