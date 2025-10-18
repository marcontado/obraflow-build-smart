import { supabase } from "@/integrations/supabase/client";

export const projectStatsService = {
  async getProjectStats(projectId: string) {
    // Buscar informações do projeto
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    // Buscar tarefas do projeto
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId);

    // Buscar áreas do projeto com orçamentos
    const { data: areas } = await supabase
      .from("project_areas")
      .select("*")
      .eq("project_id", projectId);

    // Calcular estatísticas de tarefas
    const totalTasks = tasks?.length || 0;
    const tasksByStatus = {
      todo: tasks?.filter((t) => t.status === "todo").length || 0,
      in_progress: tasks?.filter((t) => t.status === "in_progress").length || 0,
      review: tasks?.filter((t) => t.status === "review").length || 0,
      done: tasks?.filter((t) => t.status === "done").length || 0,
    };

    const completionRate = totalTasks > 0 
      ? Math.round((tasksByStatus.done / totalTasks) * 100) 
      : 0;

    // Tarefas atrasadas (due_date passou e status != done)
    const now = new Date();
    const overdueTasks = tasks?.filter(
      (t) => t.due_date && new Date(t.due_date) < now && t.status !== "done"
    ).length || 0;

    // Calcular orçamento total das áreas
    const totalAreaBudget = areas?.reduce(
      (sum, area) => sum + (Number(area.budget) || 0),
      0
    ) || 0;

    // Orçamento por área (para gráfico)
    const budgetByArea = areas?.map((area) => ({
      name: area.name,
      budget: Number(area.budget) || 0,
    })) || [];

    return {
      project,
      totalTasks,
      tasksByStatus,
      completionRate,
      overdueTasks,
      totalAreaBudget,
      budgetByArea,
      projectBudget: Number(project?.budget) || 0,
      projectSpent: Number(project?.spent) || 0,
    };
  },
};
