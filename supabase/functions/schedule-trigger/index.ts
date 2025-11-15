import { checkAndNotifyExpiringProjectsAndTasks } from "@/services/notificationsCron.service";

Deno.serve(async (req) => {
  await checkAndNotifyExpiringProjectsAndTasks();
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});