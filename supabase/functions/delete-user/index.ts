
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteUserRequest {
  userId: string;
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

    const { userId }: DeleteUserRequest = await req.json();

    // Verificar se é admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização necessário');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: user } = await supabase.auth.getUser(token);
    
    if (!user.user) {
      throw new Error('Usuário não autenticado');
    }

    console.log('Usuário autenticado:', user.user.id, user.user.email);

    // Verificar se o usuário atual é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('perfil')
      .eq('id', user.user.id)
      .single();

    console.log('Profile do usuário:', profile);

    if (profileError) {
      console.error('Erro ao buscar profile:', profileError);
      throw new Error('Erro ao verificar permissões');
    }

    if (profile?.perfil !== 'admin') {
      console.log('Usuário não é admin:', profile?.perfil);
      throw new Error('Apenas administradores podem deletar usuários');
    }

    // Buscar dados do usuário a ser deletado
    const { data: targetProfile, error: targetError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (targetError) {
      console.error('Erro ao buscar usuário alvo:', targetError);
      throw new Error('Usuário não encontrado');
    }

    // Proteger o usuário proprietário
    if (targetProfile?.email === 'luizvilarinho.nave@gmail.com') {
      throw new Error('O usuário proprietário não pode ser deletado');
    }

    console.log('Deletando usuário:', userId, targetProfile?.email);

    // Limpar dados relacionados antes de deletar o usuário
    console.log('Limpando convites relacionados...');
    await supabase
      .from('user_invites')
      .delete()
      .eq('invited_by', userId);

    console.log('Limpando mensagens como remetente...');
    await supabase
      .from('mensagens')
      .delete()
      .eq('remetente_id', userId);

    console.log('Atualizando mensagens como destinatário...');
    await supabase
      .from('mensagens')
      .update({ destinatario_id: null })
      .eq('destinatario_id', userId);

    console.log('Limpando membros de grupo...');
    await supabase
      .from('membros_grupo')
      .delete()
      .eq('usuario_id', userId);

    console.log('Limpando grupos criados...');
    await supabase
      .from('grupos_chat')
      .delete()
      .eq('criado_por', userId);

    console.log('Limpando notificações...');
    await supabase
      .from('notificacoes_sistema')
      .delete()
      .eq('usuario_id', userId);

    console.log('Limpando lembretes...');
    await supabase
      .from('lembretes')
      .delete()
      .eq('responsavel_id', userId);

    // Deletar usuário do auth usando service key
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.error('Erro ao deletar do auth:', authError);
      throw authError;
    }

    console.log('Usuário deletado com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário deletado com sucesso' 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Erro ao deletar usuário:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
