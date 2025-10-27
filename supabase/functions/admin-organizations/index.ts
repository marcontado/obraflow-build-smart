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

    // Get admin role for authorization
    const { data: adminRole } = await supabase.rpc('get_platform_admin_role', { _user_id: user.id });
    
    // Only support and super_admin can view organization details
    if (adminRole !== 'support' && adminRole !== 'super_admin') {
      console.warn(`Access denied for role: ${adminRole}`);
      return new Response(JSON.stringify({ error: 'Insufficient permissions - Support or Super Admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const page = parseInt(body.page || '1');
    const limit = parseInt(body.limit || '20');
    const plan = body.plan;
    const search = body.search;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Query base
    let query = supabase
      .from('workspaces')
      .select(`
        *,
        members:workspace_members(count),
        projects(count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    // Filtros
    if (plan) {
      query = query.eq('subscription_plan', plan);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    const { data: organizations, error, count } = await query;

    if (error) throw error;

    // Buscar dados adicionais para cada workspace
    const enrichedOrganizations = await Promise.all(
      (organizations || []).map(async (org: any) => {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status, current_period_end')
          .eq('workspace_id', org.id)
          .single();

        return {
          ...org,
          memberCount: org.members?.[0]?.count || 0,
          projectCount: org.projects?.[0]?.count || 0,
          subscription,
        };
      })
    );

    console.log(`Admin organizations retrieved: ${enrichedOrganizations.length} organizations`);

    return new Response(
      JSON.stringify({
        organizations: enrichedOrganizations,
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
    console.error('Error in admin-organizations:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
