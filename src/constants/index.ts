export const APP_NAME = "Archestra";
export const APP_DESCRIPTION = "Plataforma SaaS de Gestão de Obras para Designers de Interiores";

export const ROUTES = {
  LANDING: "/",
  PLANS: "/plans",
  AUTH: "/auth",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  APP: "/app",
  PROJECTS: "/app/projects",
  CLIENTS: "/app/clients",
  REPORTS: "/app/reports",
} as const;

export const PROJECT_STATUS = {
  PLANNING: "planning",
  IN_PROGRESS: "in_progress",
  ON_HOLD: "on_hold",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  DONE: "done",
} as const;

export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export const WORKSPACE_ROLE = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
} as const;
