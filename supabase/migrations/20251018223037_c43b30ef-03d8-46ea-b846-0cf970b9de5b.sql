-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar cron job para limpar convites expirados (roda diariamente às 3am)
SELECT cron.schedule(
  'cleanup-expired-invites-daily',
  '0 3 * * *',  -- Todos os dias às 3am
  $$
  SELECT
    net.http_post(
      url:=concat('https://ecbpqmlsizmfteudionw.supabase.co/functions/v1/cleanup-expired-invites'),
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYnBxbWxzaXptZnRldWRpb253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODczMTcsImV4cCI6MjA3NjM2MzMxN30.xcUDalAZ7vWZBCLXHPH86DpRpMMIbe6xR-an49VsmHk"}'::jsonb
    ) as request_id;
  $$
);