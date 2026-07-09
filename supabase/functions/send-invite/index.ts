
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  nome: string;
  perfil: 'admin' | 'gestor' | 'cuidador';
  resend?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { email, nome, perfil, resend = false }: InviteRequest = await req.json();

    console.log('Processando convite para:', email, resend ? '(reenvio)' : '');

    // Verificar se é admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização necessário');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: user, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user.user) {
      console.error('Erro de autenticação:', userError);
      throw new Error('Usuário não autenticado');
    }

    console.log('Usuário autenticado:', user.user.id, user.user.email);

    // Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('perfil')
      .eq('id', user.user.id)
      .single();

    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError);
      throw new Error('Erro ao verificar permissões do usuário');
    }

    console.log('Profile do usuário:', profile);

    if (profile?.perfil !== 'admin') {
      throw new Error('Apenas administradores podem enviar convites');
    }

    // Verificar se o usuário já existe
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('Este email já possui uma conta no sistema');
    }

    // Verificar se já existe um convite ativo
    const { data: existingInvite } = await supabase
      .from('user_invites')
      .select('*')
      .eq('email', email)
      .eq('accepted', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingInvite && !resend) {
      throw new Error('Já existe um convite ativo para este email. Use a opção de reenvio se necessário.');
    }

    // Remover convites antigos (expirados ou se for reenvio)
    if (resend || existingInvite) {
      console.log('Removendo convites antigos para:', email);
      await supabase
        .from('user_invites')
        .delete()
        .eq('email', email);
    }

    // Criar novo convite na tabela
    const { error: inviteError } = await supabase
      .from('user_invites')
      .insert({
        email,
        nome,
        perfil,
        invited_by: user.user.id
      });

    if (inviteError) {
      console.error('Erro ao criar convite:', inviteError);
      throw new Error('Erro ao criar convite no banco de dados');
    }

    console.log('Convite criado, enviando email...');

    // URL dinâmica baseada no origin da requisição (Vercel, Localhost ou Domínio Personalizado)
    const requestOrigin = req.headers.get('origin');
    const redirectUrl = requestOrigin 
      ? `${requestOrigin}/auth/callback` 
      : 'https://paineloliveira.nexumagencia.com.br/auth/callback';

    // Enviar convite usando a API admin do Supabase
    const { data: inviteData, error: adminError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        nome,
        perfil
      },
      redirectTo: redirectUrl
    });

    if (adminError) {
      console.error('Erro ao enviar email:', adminError);
      
      // Remover o convite que criamos se o email falhar
      await supabase
        .from('user_invites')
        .delete()
        .eq('email', email);
      
      throw new Error('Erro ao enviar email de convite: ' + adminError.message);
    }

    console.log('Email enviado com sucesso para:', email);
    console.log('Redirect URL configurada:', redirectUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: resend ? 'Convite reenviado com sucesso' : 'Convite enviado com sucesso',
        data: inviteData,
        redirectUrl: redirectUrl
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Erro ao enviar convite:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
