import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function verifyAdminToken(authHeader: string | null): { userId: string; email: string } {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token de autenticação não fornecido');
  }

  const token = authHeader.substring(7);
  
  try {
    const payload = JSON.parse(atob(token));
    
    if (payload.type !== 'admin') {
      throw new Error('Token inválido');
    }

    if (payload.exp < Date.now()) {
      throw new Error('Token expirado');
    }

    return { userId: payload.userId, email: payload.email };
  } catch (error) {
    throw new Error('Token inválido');
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    const adminUser = verifyAdminToken(authHeader);

    console.log('Admin user:', adminUser.email);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Verificar se é admin
    const { data: isAdmin } = await supabaseClient.rpc('is_platform_admin', {
      _user_id: adminUser.userId,
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { action, userId, role, newRole } = await req.json();

    console.log('Action:', action, 'User:', adminUser.email);

    // LIST: Listar todos os admins
    if (action === 'list') {
      console.log('Listando admins...');
      
      // Primeiro buscar os admins
      const { data: admins, error: adminsError } = await supabaseClient
        .from('platform_admins')
        .select('*')
        .order('granted_at', { ascending: false });

      if (adminsError) {
        console.error('Erro ao buscar admins:', adminsError);
        throw adminsError;
      }

      // Buscar profiles para todos os user_ids
      const userIds = admins?.map(a => a.user_id) || [];
      const granterIds = admins?.map(a => a.granted_by).filter(Boolean) || [];
      const allIds = [...new Set([...userIds, ...granterIds])];

      const { data: profiles } = await supabaseClient
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', allIds);

      // Criar mapa de profiles
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Enriquecer admins com dados dos profiles
      const enrichedAdmins = admins?.map(admin => ({
        ...admin,
        profile: profilesMap.get(admin.user_id) || null,
        granter: admin.granted_by ? profilesMap.get(admin.granted_by) : null,
      })) || [];

      return new Response(
        JSON.stringify({ admins: enrichedAdmins }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // ADD: Adicionar novo admin
    if (action === 'add') {
      if (!userId || !role) {
        return new Response(
          JSON.stringify({ error: 'userId e role são obrigatórios' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data, error } = await supabaseClient.rpc('add_platform_admin', {
        _user_id: userId,
        _role: role,
        _granted_by: adminUser.userId,
      });

      if (error) {
        console.error('Erro ao adicionar admin:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, adminId: data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // REMOVE: Remover admin
    if (action === 'remove') {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId é obrigatório' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { error } = await supabaseClient.rpc('remove_platform_admin', {
        _user_id: userId,
        _removed_by: adminUser.userId,
      });

      if (error) {
        console.error('Erro ao remover admin:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // UPDATE_ROLE: Atualizar role
    if (action === 'update_role') {
      if (!userId || !newRole) {
        return new Response(
          JSON.stringify({ error: 'userId e newRole são obrigatórios' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { error } = await supabaseClient.rpc('update_platform_admin_role', {
        _user_id: userId,
        _new_role: newRole,
        _updated_by: adminUser.userId,
      });

      if (error) {
        console.error('Erro ao atualizar role:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Ação inválida' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Erro no admin-platform-admins:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno' }),
      {
        status: error.message === 'Acesso negado' ? 403 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
