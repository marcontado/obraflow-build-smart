import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateTemporaryPassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

serve(async (req) => {
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

  try {
    const { userId, adminEmail, systemEmail } = await req.json();

    // Verificar se já existe credencial admin para este usuário
    const { data: existing } = await supabaseClient
      .from('admin_credentials')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Este usuário já possui credenciais admin' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gerar senha temporária
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword);

    // Criar credenciais admin
    const { error: credError } = await supabaseClient
      .from('admin_credentials')
      .insert({
        user_id: userId,
        admin_email: adminEmail,
        password_hash: passwordHash,
        first_login: true
      });

    if (credError) {
      console.error('Erro ao criar credenciais:', credError);
      throw new Error('Erro ao criar credenciais admin');
    }

    // Enviar email com senha temporária
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Archestra Admin <onboarding@resend.dev>',
          to: [systemEmail || adminEmail],
          subject: 'Bem-vindo ao Painel Administrativo',
          html: `
            <h1>Acesso ao Painel Administrativo</h1>
            <p>Você foi adicionado como administrador do sistema Archestra.</p>
            <p><strong>Suas credenciais de acesso:</strong></p>
            <ul>
              <li><strong>Email Admin:</strong> ${adminEmail}</li>
              <li><strong>Senha Temporária:</strong> ${temporaryPassword}</li>
            </ul>
            <p><strong>IMPORTANTE:</strong></p>
            <ul>
              <li>Esta é uma senha temporária que deve ser alterada no primeiro acesso</li>
              <li>Acesse: ${Deno.env.get('SUPABASE_URL')?.replace('https://ecbpqmlsizmfteudionw.supabase.co', 'https://f07d6f7d-4b0d-4937-86d7-d4806ed4aa16.lovableproject.com')}/admin/login</li>
              <li>As credenciais do painel admin são DIFERENTES das credenciais do sistema principal</li>
            </ul>
            <p>Guarde estas informações em local seguro.</p>
          `,
        }),
      });

      if (!emailResponse.ok) {
        console.error('Erro ao enviar email:', await emailResponse.text());
        // Não falhar se o email não for enviado - admin foi criado com sucesso
      }
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      // Não falhar se o email não for enviado
    }

    console.log('Admin criado com sucesso:', adminEmail);
    return new Response(
      JSON.stringify({ 
        message: 'Administrador criado com sucesso! Email com credenciais enviado.',
        temporaryPassword // Retornar também para exibir na UI como fallback
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro em admin-create:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
