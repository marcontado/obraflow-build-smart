export const APP_NAME = "Archestra";
export const APP_DESCRIPTION = "Plataforma SaaS de Gestão de Obras para Designers de Interiores";

export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  PROJECTS: "/projects",
  CLIENTS: "/clients",
  REPORTS: "/reports",
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
