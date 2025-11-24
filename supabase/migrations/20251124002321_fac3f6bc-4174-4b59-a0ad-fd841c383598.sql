-- Adicionar novos campos ao briefing dos projetos
-- Campo para registro fotográfico
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS site_photos jsonb DEFAULT '[]'::jsonb;

-- Comentário explicativo
COMMENT ON COLUMN public.projects.site_photos IS 'Registro fotográfico do local antes da reforma. Array de objetos: {url, date, area, labels, description, file_name}';

-- Atualizar a coluna briefing para incluir novos campos expandidos
-- Como briefing já é jsonb, não precisa alterar a estrutura, apenas documentar os novos campos esperados:
-- client_profile: perfil detalhado do cliente
-- client_desires: desejos do cliente
-- client_pains: dores/problemas do cliente
-- client_essence: essência/identidade do cliente
-- client_objectives: objetivos e prioridades
-- field_research: pesquisa de campo/visita técnica
-- styles: array de estilos (substituindo style singular)

COMMENT ON COLUMN public.projects.briefing IS 'Briefing completo do projeto incluindo: goal, styles (array), audience, needs, restrictions, preferred_materials, references_links, client_profile, client_desires, client_pains, client_essence, client_objectives, field_research';

-- Atualizar a coluna moodboard para suportar categorias
COMMENT ON COLUMN public.projects.moodboard IS 'Moodboard/Referências visuais organizadas. Array de objetos: {url, description, tags, file_name, category}';