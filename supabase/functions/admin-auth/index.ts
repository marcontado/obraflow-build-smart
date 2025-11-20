import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoginRequest {
  email: string;
  password: string;
}

interface ResetPasswordRequest {
  email: string;
}

interface VerifyResetRequest {
  token: string;
  newPassword: string;
}

interface ChangePasswordRequest {
  adminToken: string;
  oldPassword: string;
  newPassword: string;
}

// Rate limiting simples (em produção, usar Redis ou similar)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(email);
  
  if (!attempt) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset após 15 minutos
  if (now - attempt.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Máximo 5 tentativas em 15 minutos
  if (attempt.count >= 5) {
    return false;
  }
  
  attempt.count++;
  attempt.lastAttempt = now;
  return true;
}

function generateAdminToken(userId: string, email: string): string {
  const payload = {
    userId,
    email,
    type: 'admin',
    exp: Date.now() + (30 * 60 * 1000) // 30 minutos
  };
  return btoa(JSON.stringify(payload));
}

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

function generateResetToken(): string {
  return crypto.randomUUID();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const url = new URL(req.url);
  const path = url.pathname.replace('/admin-auth', '');

  try {
    // LOGIN
    if (path === '/login' && req.method === 'POST') {
      const { email, password }: LoginRequest = await req.json();

      // Rate limiting
      if (!checkRateLimit(email)) {
        return new Response(
          JSON.stringify({ error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Buscar credenciais
      const { data: credentials, error: credError } = await supabaseClient
        .from('admin_credentials')
        .select('id, user_id, admin_email, password_hash, first_login')
        .eq('admin_email', email)
        .single();

      if (credError || !credentials) {
        console.log('Credenciais não encontradas:', email);
        return new Response(
          JSON.stringify({ error: 'Credenciais inválidas' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verificar senha
      const passwordMatch = await bcrypt.compare(password, credentials.password_hash);
      if (!passwordMatch) {
        console.log('Senha incorreta para:', email);
        return new Response(
          JSON.stringify({ error: 'Credenciais inválidas' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verificar se é admin ativo
      const { data: adminData, error: adminError } = await supabaseClient
        .from('platform_admins')
        .select('role')
        .eq('user_id', credentials.user_id)
        .single();

      if (adminError || !adminData) {
        console.log('Usuário não é admin:', credentials.user_id);
        return new Response(
          JSON.stringify({ error: 'Acesso não autorizado' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Gerar token
      const token = generateAdminToken(credentials.user_id, credentials.admin_email);

      console.log('Login admin bem-sucedido:', email);
      return new Response(
        JSON.stringify({
          token,
          firstLogin: credentials.first_login,
          role: adminData.role
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // RESET PASSWORD
    if (path === '/reset-password' && req.method === 'POST') {
      const { email }: ResetPasswordRequest = await req.json();

      // Buscar admin credentials
      const { data: credentials } = await supabaseClient
        .from('admin_credentials')
        .select('id, user_id, admin_email')
        .eq('admin_email', email)
        .single();

      if (!credentials) {
        // Não revelar se email existe ou não (segurança)
        return new Response(
          JSON.stringify({ message: 'Se o email existir, um link de reset será enviado.' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Gerar token de reset
      const resetToken = generateResetToken();
      
      // Enviar email via fetch para função Resend
      const resetUrl = `${Deno.env.get('SUPABASE_URL')}/admin/reset-password?token=${resetToken}`;
      
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Archestra Admin <onboarding@resend.dev>',
            to: [email],
            subject: 'Reset de Senha - Painel Admin',
            html: `
              <h1>Reset de Senha do Painel Administrativo</h1>
              <p>Você solicitou reset de senha para o painel admin.</p>
              <p>Clique no link abaixo para criar uma nova senha:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p>Este link expira em 1 hora.</p>
              <p>Se você não solicitou este reset, ignore este email.</p>
            `,
          }),
        });

        if (!emailResponse.ok) {
          console.error('Erro ao enviar email:', await emailResponse.text());
        }
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
      }

      console.log('Email de reset enviado para:', email);
      return new Response(
        JSON.stringify({ message: 'Email de reset enviado com sucesso!' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CHANGE PASSWORD
    if (path === '/change-password' && req.method === 'POST') {
      const { adminToken, oldPassword, newPassword }: ChangePasswordRequest = await req.json();

      // Verificar token
      const tokenData = verifyAdminToken(adminToken);
      if (!tokenData) {
        return new Response(
          JSON.stringify({ error: 'Token inválido ou expirado' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Buscar credenciais
      const { data: credentials, error: credError } = await supabaseClient
        .from('admin_credentials')
        .select('id, password_hash')
        .eq('user_id', tokenData.userId)
        .single();

      if (credError || !credentials) {
        return new Response(
          JSON.stringify({ error: 'Credenciais não encontradas' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verificar senha antiga
      const passwordMatch = await bcrypt.compare(oldPassword, credentials.password_hash);
      if (!passwordMatch) {
        return new Response(
          JSON.stringify({ error: 'Senha atual incorreta' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Hash da nova senha
      const newPasswordHash = await bcrypt.hash(newPassword);

      // Atualizar senha e marcar first_login como false
      const { error: updateError } = await supabaseClient
        .from('admin_credentials')
        .update({
          password_hash: newPasswordHash,
          first_login: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', credentials.id);

      if (updateError) {
        console.error('Erro ao atualizar senha:', updateError);
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar senha' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Senha alterada com sucesso para usuário:', tokenData.userId);
      return new Response(
        JSON.stringify({ message: 'Senha alterada com sucesso!' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Rota não encontrada' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no admin-auth:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
