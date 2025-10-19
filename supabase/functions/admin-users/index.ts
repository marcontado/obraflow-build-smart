import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verificar se é admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: isAdmin } = await supabase.rpc('is_platform_admin', { _user_id: user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const page = parseInt(body.page || '1');
    const limit = parseInt(body.limit || '20');
    const search = body.search;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Buscar perfis com paginação e busca
    let query = supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, phone, role, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    // Filtro de busca
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: usersRaw, error: usersError, count } = await query;

    if (usersError) throw usersError;

    // Pegar IDs dos usuários
    const userIds = (usersRaw || []).map((u: any) => u.id);

    // Buscar memberships desses usuários
    const { data: members } = userIds.length > 0
      ? await supabase.from('workspace_members').select('user_id, workspace_id').in('user_id', userIds)
      : { data: [] };

    // Coletar workspaces únicos e buscar seus nomes
    const wsIds = [...new Set((members || []).map((m: any) => m.workspace_id))];
    const { data: workspaces } = wsIds.length > 0
      ? await supabase.from('workspaces').select('id, name').in('id', wsIds)
      : { data: [] };

    // Montar mapas
    const wsMap = new Map((workspaces || []).map((w: any) => [w.id, w.name]));
    const userWsMap = new Map();
    
    for (const m of members || []) {
      const arr = userWsMap.get(m.user_id) || [];
      arr.push({ id: m.workspace_id, name: wsMap.get(m.workspace_id) });
      userWsMap.set(m.user_id, arr);
    }

    // Enriquecer usuários
    const enrichedUsers = (usersRaw || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      avatar_url: u.avatar_url,
      phone: u.phone,
      role: u.role,
      created_at: u.created_at,
      workspaces: userWsMap.get(u.id) || [],
      workspaceCount: (userWsMap.get(u.id) || []).length,
    }));

    console.log(`Admin users retrieved: ${enrichedUsers.length} users, ${members?.length || 0} memberships processed`);

    return new Response(
      JSON.stringify({
        users: enrichedUsers,
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in admin-users:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
