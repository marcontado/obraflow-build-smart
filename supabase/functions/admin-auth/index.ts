import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

interface VerifyResetRequest {
  token: string;
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
    // VERIFY TOKEN (quando não há path específico, verificar body.action)
    if ((path === '' || path === '/') && req.method === 'POST') {
      const body = await req.json();
      
      if (body.action === 'verify') {
        const authHeader = req.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(
            JSON.stringify({ error: 'Token não fornecido' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const token = authHeader.substring(7);
        const tokenData = verifyAdminToken(token);

        if (!tokenData) {
          return new Response(
            JSON.stringify({ error: 'Token inválido ou expirado' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Buscar informações completas do admin
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('full_name, avatar_url, email')
          .eq('id', tokenData.userId)
          .single();

        const { data: adminData } = await supabaseClient
          .from('platform_admins')
          .select('role')
          .eq('user_id', tokenData.userId)
          .single();

        return new Response(
          JSON.stringify({
            userId: tokenData.userId,
            email: profile?.email || tokenData.email,
            fullName: profile?.full_name || null,
            avatarUrl: profile?.avatar_url || null,
            role: adminData?.role || 'analyst',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

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

      // Verificar senha usando função do Postgres
      const { data: passwordCheck, error: passwordError } = await supabaseClient
        .rpc('verify_admin_password', {
          _admin_email: email,
          _password: password
        });

      if (passwordError || !passwordCheck) {
        console.log('Senha incorreta para:', email, passwordError);
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
      try {
        const { email }: ResetPasswordRequest = await req.json();

        if (!email || typeof email !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Email é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // VERIFICAÇÃO 1: Buscar admin pelo email em admin_credentials
        const { data: adminData, error: adminError } = await supabaseClient
          .from('admin_credentials')
          .select('id, user_id, admin_email')
          .eq('admin_email', email.toLowerCase().trim())
          .single();

        // Retornar sempre a mesma mensagem para evitar enumeration
        const successMessage = 'Se você é um administrador autorizado, receberá um email com instruções para redefinir sua senha.';

        if (adminError || !adminData) {
          console.log('Email não encontrado em admin_credentials:', email);
          return new Response(
            JSON.stringify({ message: successMessage }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // VERIFICAÇÃO 2: Confirmar que user_id está em platform_admins (SEGURANÇA EXTRA)
        const { data: platformAdmin, error: platformError } = await supabaseClient
          .from('platform_admins')
          .select('user_id, role')
          .eq('user_id', adminData.user_id)
          .single();

        if (platformError || !platformAdmin) {
          console.log('user_id não autorizado em platform_admins:', adminData.user_id);
          return new Response(
            JSON.stringify({ message: successMessage }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Gerar token de reset
        const resetToken = generateResetToken();
        const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
        
        // Salvar token no banco
        const { error: updateError } = await supabaseClient
          .from('admin_credentials')
          .update({ 
            reset_token: resetToken, 
            reset_token_expires_at: resetTokenExpiresAt.toISOString() 
          })
          .eq('id', adminData.id);

        if (updateError) {
          console.error('Erro ao salvar token:', updateError);
          return new Response(
            JSON.stringify({ message: successMessage }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // URL de reset
        const resetUrl = `https://f07d6f7d-4b0d-4937-86d7-d4806ed4aa16.lovableproject.com/admin/reset-password-confirm?token=${resetToken}`;
        
        // Enviar email via Resend
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
                <p><a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Redefinir Senha</a></p>
                <p style="color: #dc2626; font-weight: bold;">⚠️ Este link expira em 1 hora.</p>
                <p style="color: #6b7280;">Se você não solicitou este reset, ignore este email.</p>
              `,
            }),
          });

          if (!emailResponse.ok) {
            console.error('Erro ao enviar email:', await emailResponse.text());
          }
        } catch (emailError) {
          console.error('Erro ao enviar email de reset:', emailError);
        }

        console.log('Email de reset processado para:', email);
        return new Response(
          JSON.stringify({ message: successMessage }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('Erro em /reset-password:', error);
        return new Response(
          JSON.stringify({ error: 'Erro ao processar solicitação' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

  // Rota: /verify-reset (POST) - Verifica token e atualiza senha
  if (path === '/verify-reset' && req.method === 'POST') {
    try {
      const { token, newPassword }: VerifyResetRequest = await req.json();

      if (!token || !newPassword) {
        return new Response(
          JSON.stringify({ error: 'Token e nova senha são obrigatórios' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (newPassword.length < 8) {
        return new Response(
          JSON.stringify({ error: 'A senha deve ter no mínimo 8 caracteres' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Buscar admin pelo token de reset válido
      const { data: adminData, error: adminError } = await supabaseClient
        .from('admin_credentials')
        .select('id, user_id, admin_email, reset_token, reset_token_expires_at')
        .eq('reset_token', token)
        .single();

      if (adminError || !adminData) {
        return new Response(
          JSON.stringify({ error: 'Token inválido ou expirado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verificar se o token expirou
      if (!adminData.reset_token_expires_at || new Date(adminData.reset_token_expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Token expirado. Solicite um novo reset de senha.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Atualizar senha usando função do Postgres
      const { error: updateError } = await supabaseClient
        .rpc('update_admin_password', {
          _user_id: adminData.user_id,
          _new_password: newPassword
        });

      if (updateError) {
        console.error('Erro ao atualizar senha:', updateError);
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar senha' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Senha atualizada com sucesso via reset para:', adminData.admin_email);

      return new Response(
        JSON.stringify({ message: 'Senha atualizada com sucesso!' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error: any) {
      console.error('Erro em /verify-reset:', error);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar reset de senha' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
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

      // Buscar credenciais com admin_email
      const { data: credentials, error: credError } = await supabaseClient
        .from('admin_credentials')
        .select('id, user_id, admin_email')
        .eq('user_id', tokenData.userId)
        .single();

      if (credError || !credentials) {
        return new Response(
          JSON.stringify({ error: 'Credenciais não encontradas' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verificar senha antiga usando função do Postgres
      const { data: passwordCheck, error: passwordError } = await supabaseClient
        .rpc('verify_admin_password', {
          _admin_email: credentials.admin_email,
          _password: oldPassword
        });

      if (passwordError || !passwordCheck) {
        return new Response(
          JSON.stringify({ error: 'Senha atual incorreta' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Atualizar senha usando função do Postgres
      const { error: updateError } = await supabaseClient
        .rpc('update_admin_password', {
          _user_id: tokenData.userId,
          _new_password: newPassword
        });

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
