import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/sqlite-core";

export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});
export const teams = sqliteTable(
  "teams",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    name: text("name").notNull(),
    location: text("location").notNull().default(""),
    color: text("color").notNull().default("#22d3ee"),
    isExample: integer("is_example", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("teams_workspace_idx").on(t.workspaceId),
    uniqueIndex("teams_workspace_name_idx").on(t.workspaceId, t.name),
  ],
);
export const invitations = sqliteTable(
  "invitations",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    tokenHash: text("token_hash").notNull(),
    role: text("role", { enum: ["manager", "collaborator"] }).notNull(),
    email: text("email"),
    teamId: text("team_id").references(() => teams.id),
    createdBy: text("created_by").notNull(),
    createdAt: text("created_at").notNull(),
    expiresAt: text("expires_at").notNull(),
    acceptedAt: text("accepted_at"),
    acceptedBy: text("accepted_by"),
    revokedAt: text("revoked_at"),
  },
  (t) => [
    uniqueIndex("invitations_token_idx").on(t.tokenHash),
    index("invitations_workspace_idx").on(t.workspaceId),
    check(
      "invitation_role_check",
      sql`${t.role} in ('manager', 'collaborator')`,
    ),
  ],
);
export const members = sqliteTable(
  "members",
  {
    userId: text("user_id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    role: text("role", {
      enum: ["admin", "manager", "collaborator"],
    }).notNull(),
    teamId: text("team_id").references(() => teams.id),
    invitationId: text("invitation_id").references(() => invitations.id),
    joinedAt: text("joined_at").notNull(),
  },
  (t) => [
    index("members_workspace_idx").on(t.workspaceId),
    uniqueIndex("members_invitation_idx").on(t.invitationId),
    check(
      "member_role_check",
      sql`${t.role} in ('admin', 'manager', 'collaborator')`,
    ),
  ],
);
export const devices = sqliteTable(
  "devices",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    name: text("name").notNull(),
    serial: text("serial").notNull(),
    model: text("model").notNull(),
    status: text("status", { enum: ["available", "in_use", "maintenance"] })
      .notNull()
      .default("available"),
    teamId: text("team_id").references(() => teams.id),
    assignedTo: text("assigned_to").references(() => members.userId),
    notes: text("notes").notNull().default(""),
    lastCheckAt: text("last_check_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    archivedAt: text("archived_at"),
    isExample: integer("is_example", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (t) => [
    index("devices_workspace_idx").on(t.workspaceId),
    uniqueIndex("devices_workspace_serial_idx").on(t.workspaceId, t.serial),
    check(
      "device_status_check",
      sql`${t.status} in ('available', 'in_use', 'maintenance')`,
    ),
  ],
);
export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    teamId: text("team_id").references(() => teams.id),
    authorId: text("author_id")
      .notNull()
      .references(() => members.userId),
    body: text("body").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("messages_workspace_date_idx").on(t.workspaceId, t.createdAt),
    index("messages_channel_idx").on(t.workspaceId, t.teamId, t.createdAt),
  ],
);
export const activity = sqliteTable(
  "activity",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    actorId: text("actor_id")
      .notNull()
      .references(() => members.userId),
    teamId: text("team_id").references(() => teams.id),
    type: text("type").notNull(),
    description: text("description").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("activity_workspace_date_idx").on(t.workspaceId, t.createdAt)],
);
