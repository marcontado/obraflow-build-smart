// Serviço para checar vencimentos e acionar webhook do n8n
import { supabase } from "./supabase.server";

const N8N_WEBHOOK_URL = "https://matweber.app.n8n.cloud/webhook/42891fac-ae9c-4160-83a5-4f468007cae6";

export async function checkAndNotifyExpiringProjectsAndTasks({ projectId, taskId }: { projectId?: string, taskId?: string } = {}) {
  console.log('[Notificações] Função checkAndNotifyExpiringProjectsAndTasks chamada');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  console.log('[Notificações] Data buscada (amanhã):', tomorrowStr);

  if (projectId) {
    // Notifica apenas o projeto
    const { data } = await supabase
      .from("projects")
      .select("id, name, end_date, created_by")
      .eq("id", projectId)
      .eq("end_date", tomorrowStr);
    const projects = data || [];
    console.log('[Notificações] Projeto específico:', projects);
    for (const project of projects) {
      let payload: any = {
        tipo: "projeto",
        projeto: project.name,
        data_vencimento: project.end_date,
      };
      if (project.created_by) {
        const { data: architect } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", project.created_by)
          .single();
        if (architect) {
          payload.arquiteto = architect.full_name;
          payload.email = architect.email;
        }
      }
      console.log('[Notificações] Enviando webhook para projeto:', payload);
      try {
        const resp = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        console.log('[Notificações] Resposta webhook projeto:', resp.status, await resp.text());
      } catch (err) {
        console.error('[Notificações] Erro ao enviar webhook projeto:', err);
      }
    }
    return;
  }

  if (taskId) {
    // Notifica apenas a tarefa
    const { data } = await supabase
      .from("tasks")
      .select("id, title, due_date, project_id")
      .eq("id", taskId)
      .eq("due_date", tomorrowStr);
    const tasks = data || [];
    console.log('[Notificações] Tarefa específica:', tasks);
    for (const task of tasks) {
      const { data: project } = await supabase
        .from("projects")
        .select("id, name, created_by")
        .eq("id", task.project_id)
        .single();
      let payload: any = {
        tipo: "tarefa",
        tarefa: task.title,
        projeto: project?.name,
        data_vencimento: task.due_date,
      };
      if (project?.created_by) {
        const { data: architect } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", project.created_by)
          .single();
        if (architect) {
          payload.arquiteto = architect.full_name;
          payload.email = architect.email;
        }
      }
      console.log('[Notificações] Enviando webhook para tarefa:', payload);
      try {
        const resp = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        console.log('[Notificações] Resposta webhook tarefa:', resp.status, await resp.text());
      } catch (err) {
        console.error('[Notificações] Erro ao enviar webhook tarefa:', err);
      }
    }
    return;
  }

  // Sweep geral (cron): notifica todos projetos e tarefas que vencem amanhã
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, end_date, created_by")
    .eq("end_date", tomorrowStr);
  console.log('[Notificações] Projetos encontrados:', projects?.length, projects);
  for (const project of projects || []) {
    let payload: any = {
      tipo: "projeto",
      projeto: project.name,
      data_vencimento: project.end_date,
    };
    if (project.created_by) {
      const { data: architect } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", project.created_by)
        .single();
      if (architect) {
        payload.arquiteto = architect.full_name;
        payload.email = architect.email;
      }
    }
    console.log('[Notificações] Enviando webhook para projeto:', payload);
    try {
      const resp = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log('[Notificações] Resposta webhook projeto:', resp.status, await resp.text());
    } catch (err) {
      console.error('[Notificações] Erro ao enviar webhook projeto:', err);
    }
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, due_date, project_id")
    .eq("due_date", tomorrowStr);
  console.log('[Notificações] Tarefas encontradas:', tasks?.length, tasks);
  for (const task of tasks || []) {
    const { data: project } = await supabase
      .from("projects")
      .select("id, name, created_by")
      .eq("id", task.project_id)
      .single();
    let payload: any = {
      tipo: "tarefa",
      tarefa: task.title,
      projeto: project?.name,
      data_vencimento: task.due_date,
    };
    if (project?.created_by) {
      const { data: architect } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", project.created_by)
        .single();
      if (architect) {
        payload.arquiteto = architect.full_name;
        payload.email = architect.email;
      }
    }
    console.log('[Notificações] Enviando webhook para tarefa:', payload);
    try {
      const resp = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log('[Notificações] Resposta webhook tarefa:', resp.status, await resp.text());
    } catch (err) {
      console.error('[Notificações] Erro ao enviar webhook tarefa:', err);
    }
  }
}
