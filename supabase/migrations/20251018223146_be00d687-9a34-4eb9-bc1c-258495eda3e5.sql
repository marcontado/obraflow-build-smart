-- Criar cron job para limpar convites expirados (roda diariamente às 3am)
-- Nota: pg_cron e pg_net já estão habilitados no Supabase
SELECT cron.schedule(
  'cleanup-expired-invites-daily',
  '0 3 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://ecbpqmlsizmfteudionw.supabase.co/functions/v1/cleanup-expired-invites',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYnBxbWxzaXptZnRldWRpb253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODczMTcsImV4cCI6MjA3NjM2MzMxN30.xcUDalAZ7vWZBCLXHPH86DpRpMMIbe6xR-an49VsmHk"}'::jsonb
    ) as request_id;
  $$
);