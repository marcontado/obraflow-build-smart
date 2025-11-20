import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionMetrics {
  totalMRR: number;
  atelierCount: number;
  studioCount: number;
  domusCount: number;
  activeSubscriptions: number;
}

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

    console.log('Admin user requesting subscriptions:', adminUser.email);

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

    // Buscar todas as assinaturas com informações do workspace
    const { data: subscriptions, error: subsError } = await supabaseClient
      .from('subscriptions')
      .select(`
        *,
        workspace:workspaces (
          id,
          name,
          subscription_plan
        )
      `)
      .order('created_at', { ascending: false });

    if (subsError) {
      console.error('Erro ao buscar assinaturas:', subsError);
      throw subsError;
    }

    // Buscar todas as organizações para calcular métricas
    const { data: workspaces, error: workspacesError } = await supabaseClient
      .from('workspaces')
      .select('subscription_plan');

    if (workspacesError) {
      console.error('Erro ao buscar workspaces:', workspacesError);
      throw workspacesError;
    }

    // Calcular métricas
    const atelierCount = workspaces?.filter((w) => w.subscription_plan === 'atelier').length || 0;
    const studioCount = workspaces?.filter((w) => w.subscription_plan === 'studio').length || 0;
    const domusCount = workspaces?.filter((w) => w.subscription_plan === 'domus').length || 0;

    // MRR = (Studio × 149) + (Domus × 399)
    const totalMRR = (studioCount * 149) + (domusCount * 399);

    // Assinaturas ativas (apenas planos pagos com status active)
    const activeSubscriptions = subscriptions?.filter(
      (s) => s.status === 'active' && (s.workspace?.subscription_plan === 'studio' || s.workspace?.subscription_plan === 'domus')
    ).length || 0;

    const metrics: SubscriptionMetrics = {
      totalMRR,
      atelierCount,
      studioCount,
      domusCount,
      activeSubscriptions,
    };

    return new Response(
      JSON.stringify({
        subscriptions: subscriptions || [],
        metrics,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Erro no admin-subscriptions:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno' }),
      {
        status: error.message === 'Acesso negado' ? 403 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
