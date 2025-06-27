
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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, nome, perfil }: InviteRequest = await req.json();

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

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('perfil')
      .eq('id', user.user.id)
      .single();

    if (profile?.perfil !== 'admin') {
      throw new Error('Apenas administradores podem enviar convites');
    }

    // Criar convite
    const { error: inviteError } = await supabase
      .from('user_invites')
      .insert({
        email,
        nome,
        perfil,
        invited_by: user.user.id
      });

    if (inviteError) {
      throw inviteError;
    }

    // Enviar email de convite
    const inviteLink = `${supabaseUrl}/auth/v1/signup?email=${encodeURIComponent(email)}&redirect_to=${encodeURIComponent('https://ijpamnmaldqumunjzfsz.supabase.co')}/auth/callback`;

    // Por enquanto, apenas log do link (você pode integrar com um serviço de email)
    console.log(`Convite enviado para ${email}: ${inviteLink}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Convite enviado com sucesso',
        inviteLink 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Erro ao enviar convite:', error);
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
