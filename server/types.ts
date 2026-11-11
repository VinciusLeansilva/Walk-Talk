/** Shared transport types. No identity or role in a write body grants permission. */
export type Role = "admin" | "manager" | "collaborator";
export type DeviceStatus = "available" | "in_use" | "maintenance";
export interface User {
  id: string;
  email: string;
  name: string;
}
export interface Workspace {
  id: string;
  name: string;
  isDemo: boolean;
}
export interface Member {
  id: string;
  email: string;
  name: string;
  role: Role;
  teamId: string | null;
  teamName: string | null;
  joinedAt: string;
}
export interface Session {
  user: User;
  member: Member | null;
  workspace: Workspace | null;
}
export interface Team {
  id: string;
  name: string;
  location: string;
  color: string;
  members: number;
  devices: number;
  createdAt: string;
  isExample: boolean;
}
export interface Device {
  id: string;
  name: string;
  serial: string;
  model: string;
  status: DeviceStatus;
  teamId: string | null;
  teamName: string | null;
  assignedTo: string | null;
  assigneeName: string | null;
  notes: string;
  lastCheckAt: string | null;
  createdAt: string;
  updatedAt: string;
  isExample: boolean;
}
export interface Activity {
  id: string;
  type: string;
  description: string;
  actorName: string;
  createdAt: string;
}
export interface Message {
  id: string;
  body: string;
  teamId: string | null;
  authorId: string;
  authorName: string;
  authorRole: Role;
  createdAt: string;
}
export interface Invitation {
  id: string;
  role: "manager" | "collaborator";
  email: string | null;
  teamId: string | null;
  teamName: string | null;
  expiresAt: string;
  createdAt: string;
  status: "pending" | "accepted" | "revoked" | "expired";
}
export interface Overview {
  devices: {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    checkedToday: number;
  };
  teams: number;
  members: number;
  messages: number;
  activity: Activity[];
  recentMessages: Message[];
  workspace: Workspace;
}
export interface DeviceInput {
  name: string;
  serial: string;
  model: string;
  status: DeviceStatus;
  teamId: string | null;
  assignedTo: string | null;
  notes: string;
}
export interface TeamInput {
  name: string;
  location: string;
  color: string;
}
export interface ApiErrorBody {
  error: { code: string; message: string };
}
/** Collection endpoints return an object rather than a bare array. */
export interface TeamsResponse {
  teams: Team[];
}
export interface DevicesResponse {
  devices: Device[];
}
export interface MembersResponse {
  members: Member[];
}
export interface MessagesResponse {
  messages: Message[];
}
export interface InvitationsResponse {
  invitations: Invitation[];
}
export interface InvitationCreated {
  invitation: Invitation;
  token: string;
  url: string;
  expiresAt: string;
}
