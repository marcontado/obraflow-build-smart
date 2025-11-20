import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    console.log('🚀 Iniciando setup de credenciais admin...');

    // Buscar todos os admins em platform_admins
    const { data: platformAdmins, error: fetchError } = await supabaseClient
      .from('platform_admins')
      .select('user_id, role');

    if (fetchError) {
      console.error('Erro ao buscar platform_admins:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar admins' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!platformAdmins || platformAdmins.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhum admin encontrado em platform_admins' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`📋 Encontrados ${platformAdmins.length} admins`);

    const results = [];

    for (const admin of platformAdmins) {
      try {
        // Buscar email do perfil
        const { data: profile, error: profileError } = await supabaseClient
          .from('profiles')
          .select('email')
          .eq('id', admin.user_id)
          .single();

        if (profileError || !profile) {
          console.error(`❌ Perfil não encontrado para user_id: ${admin.user_id}`);
          results.push({
            user_id: admin.user_id,
            status: 'error',
            message: 'Perfil não encontrado'
          });
          continue;
        }

        // Verificar se já tem credenciais
        const { data: existingCreds } = await supabaseClient
          .from('admin_credentials')
          .select('id')
          .eq('user_id', admin.user_id)
          .single();

        if (existingCreds) {
          console.log(`⏭️  Credenciais já existem para: ${profile.email}`);
          results.push({
            user_id: admin.user_id,
            email: profile.email,
            status: 'skipped',
            message: 'Credenciais já existem'
          });
          continue;
        }

        // Gerar senha temporária (12 caracteres aleatórios)
        const tempPassword = Array.from(crypto.getRandomValues(new Uint8Array(12)))
          .map(b => b.toString(36))
          .join('')
          .slice(0, 12);

        // Hash da senha
        const passwordHash = await bcrypt.hash(tempPassword, await bcrypt.genSalt(10));

        // Criar credenciais
        const { error: insertError } = await supabaseClient
          .from('admin_credentials')
          .insert({
            user_id: admin.user_id,
            admin_email: profile.email.toLowerCase(),
            password_hash: passwordHash,
            first_login: true
          });

        if (insertError) {
          console.error(`❌ Erro ao criar credenciais para ${profile.email}:`, insertError);
          results.push({
            user_id: admin.user_id,
            email: profile.email,
            status: 'error',
            message: insertError.message
          });
          continue;
        }

        // Enviar email com senha temporária
        try {
          await resend.emails.send({
            from: 'Admin <onboarding@resend.dev>',
            to: [profile.email],
            subject: 'Suas Credenciais de Admin - Ação Necessária',
            html: `
              <h1>Bem-vindo ao Painel Admin</h1>
              <p>Suas credenciais de administrador foram criadas.</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Email:</strong> ${profile.email}</p>
                <p><strong>Senha Temporária:</strong> <code style="background: white; padding: 5px 10px; border-radius: 3px; font-size: 16px;">${tempPassword}</code></p>
              </div>
              <p style="color: #dc2626; font-weight: bold;">⚠️ IMPORTANTE:</p>
              <ul>
                <li>Esta é uma senha temporária</li>
                <li>Você será forçado a trocar a senha no primeiro login</li>
                <li>Não compartilhe esta senha com ninguém</li>
                <li>Acesse em: <a href="${Deno.env.get('SUPABASE_URL')?.replace('ecbpqmlsizmfteudionw.supabase.co', 'f07d6f7d-4b0d-4937-86d7-d4806ed4aa16.lovableproject.com')}/admin/login">Painel Admin</a></li>
              </ul>
            `,
          });

          console.log(`✅ Credenciais criadas e email enviado para: ${profile.email}`);
          results.push({
            user_id: admin.user_id,
            email: profile.email,
            status: 'success',
            message: 'Credenciais criadas e email enviado'
          });
        } catch (emailError) {
          console.error(`⚠️  Credenciais criadas mas erro ao enviar email para ${profile.email}:`, emailError);
          results.push({
            user_id: admin.user_id,
            email: profile.email,
            status: 'partial',
            message: 'Credenciais criadas mas falha ao enviar email'
          });
        }
      } catch (error: any) {
        console.error(`❌ Erro ao processar admin ${admin.user_id}:`, error);
        results.push({
          user_id: admin.user_id,
          status: 'error',
          message: error?.message || 'Erro desconhecido'
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Setup concluído',
        results 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('❌ Erro fatal:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);
