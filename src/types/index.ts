import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectArea = Database["public"]["Tables"]["project_areas"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type Partner = Database["public"]["Tables"]["partners"]["Row"];

export type ProjectStatus = Database["public"]["Enums"]["project_status"];
export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type TaskPriority = Database["public"]["Enums"]["task_priority"];
export type UserRole = Database["public"]["Enums"]["user_role"];

export interface ProjectWithClient extends Project {
  clients: Pick<Client, "name"> | null;
}

export interface ProjectWithDetails extends Project {
  clients: Client | null;
  project_areas: ProjectArea[];
}

export interface ClientWithProjects extends Client {
  projects: Project[];
}
