import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function verifyAdminToken(token: string): { userId: string; email: string } | null {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.type !== 'admin' || payload.exp < Date.now()) {
      return null;
    }
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate custom admin token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Admin action failed: Missing authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized - Missing token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const adminData = verifyAdminToken(token);
    
    if (!adminData) {
      console.error('Admin action failed: Invalid or expired token');
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin status in database
    const { data: adminRole, error: roleError } = await supabase.rpc('get_platform_admin_role', { _user_id: adminData.userId });
    if (roleError) {
      console.error('Failed to get admin role:', roleError);
    }
    if (!adminRole) {
      console.error(`Admin action failed: User ${adminData.email} is not a platform admin`);
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, workspaceId, newPlan, userId } = await req.json();

    let result;

    switch (action) {
      case 'change_plan':
        // Apenas super_admin pode mudar planos
        if (adminRole !== 'super_admin') {
          return new Response(JSON.stringify({ error: 'Only super admins can change plans' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Usar service role para bypass do RLS de forma segura
        const { error: updateError } = await supabase
          .from('workspaces')
          .update({ subscription_plan: newPlan })
          .eq('id', workspaceId);

        if (updateError) throw updateError;

        result = { success: true, message: `Plan changed to ${newPlan}` };
        console.log(`Admin ${adminData.email} changed workspace ${workspaceId} plan to ${newPlan}`);
        break;

      case 'delete_workspace':
        // Apenas super_admin pode deletar
        if (adminRole !== 'super_admin') {
          return new Response(JSON.stringify({ error: 'Only super admins can delete workspaces' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error: deleteWsError } = await supabase
          .from('workspaces')
          .delete()
          .eq('id', workspaceId);

        if (deleteWsError) throw deleteWsError;
        
        result = { success: true, message: 'Workspace deleted successfully' };
        console.log(`Admin ${adminData.email} deleted workspace ${workspaceId}`);
        break;

      case 'delete_user':
        // Apenas super_admin pode deletar
        if (adminRole !== 'super_admin') {
          return new Response(JSON.stringify({ error: 'Only super admins can delete users' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Primeiro, atualizar referências que não têm CASCADE
        await supabase
          .from('document_templates')
          .update({ created_by: null })
          .eq('created_by', userId);
        
        await supabase
          .from('generated_documents')
          .update({ created_by: null })
          .eq('created_by', userId);

        // Deletar o usuário do auth (isso vai cascatear para profiles)
        const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId);
        
        if (deleteUserError) throw deleteUserError;

        result = { success: true, message: 'User deleted successfully' };
        console.log(`Admin ${adminData.email} deleted user ${userId}`);
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in admin-actions:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
