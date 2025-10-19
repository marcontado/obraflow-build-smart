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

    // Buscar estatísticas
    const [workspaces, users, projects, subscriptions] = await Promise.all([
      supabase.from('workspaces').select('subscription_plan', { count: 'exact', head: false }),
      supabase.from('profiles').select('created_at', { count: 'exact', head: false }),
      supabase.from('projects').select('status', { count: 'exact', head: false }),
      supabase.from('subscriptions').select('stripe_price_id, status', { count: 'exact', head: false }),
    ]);

    // Agrupar workspaces por plano
    const workspacesByPlan = workspaces.data?.reduce((acc: any, ws: any) => {
      acc[ws.subscription_plan] = (acc[ws.subscription_plan] || 0) + 1;
      return acc;
    }, {}) || {};

    // Projetos ativos
    const activeProjects = projects.data?.filter((p: any) => 
      p.status === 'planning' || p.status === 'in_progress'
    ).length || 0;

    // Assinaturas ativas
    const activeSubscriptions = subscriptions.data?.filter((s: any) => 
      s.status === 'active'
    ).length || 0;

    // Receita mensal estimada (Studio: R$149, Dommus: R$399)
    const monthlyRevenue = subscriptions.data?.reduce((acc: number, sub: any) => {
      if (sub.status === 'active') {
        // Identificar pelo price_id ou subscription_plan do workspace
        const amount = sub.stripe_price_id?.includes('studio') ? 149 : 
                      sub.stripe_price_id?.includes('dommus') ? 399 : 0;
        return acc + amount;
      }
      return acc;
    }, 0) || 0;

    // Usuários cadastrados nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = users.data?.filter((u: any) => 
      new Date(u.created_at) > thirtyDaysAgo
    ).length || 0;

    const stats = {
      totalWorkspaces: workspaces.count || 0,
      workspacesByPlan,
      totalUsers: users.count || 0,
      newUsers,
      totalProjects: projects.count || 0,
      activeProjects,
      totalSubscriptions: subscriptions.count || 0,
      activeSubscriptions,
      monthlyRevenue,
    };

    console.log('Admin stats retrieved:', stats);

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in admin-stats:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
