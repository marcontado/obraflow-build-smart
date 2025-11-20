import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ecbpqmlsizmfteudionw.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYnBxbWxzaXptZnRldWRpb253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODczMTcsImV4cCI6MjA3NjM2MzMxN30.xcUDalAZ7vWZBCLXHPH86DpRpMMIbe6xR-an49VsmHk";

console.log("SUPABASE_URL:", SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? SUPABASE_SERVICE_ROLE_KEY.slice(0, 8) + "..." : "undefined");

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

// Teste de conexão: busca 1 projeto
(async () => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Erro ao conectar no Supabase:", error.message);
  } else if (data && Array.isArray(data) && data.length > 0) {
    console.log("Conexão bem-sucedida! Projeto encontrado:", data[0]);
  } else {
    console.log("Conexão feita, mas nenhum projeto encontrado.");
  }
})();