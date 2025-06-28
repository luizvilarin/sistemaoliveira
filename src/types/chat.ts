
export interface GrupoChat {
  id: string;
  nome: string;
  descricao?: string;
  imagem_url?: string;
  criado_por: string;
  created_at: string;
  updated_at: string;
}

export interface MembroGrupo {
  id: string;
  grupo_id: string;
  usuario_id: string;
  papel: 'admin' | 'membro';
  adicionado_em: string;
}

export interface MensagensAvancada {
  id: string;
  assunto: string;
  conteudo: string;
  remetente_id: string;
  destinatario_id?: string;
  grupo_id?: string;
  tipo_mensagem: 'texto' | 'imagem' | 'video' | 'audio' | 'arquivo';
  arquivo_url?: string;
  arquivo_nome?: string;
  duracao_audio?: number;
  mencoes?: string[];
  emoji_reacoes?: Record<string, string[]>; // emoji -> array de user_ids
  lida: boolean;
  created_at: string;
}

export interface ArquivoMensagem {
  id: string;
  mensagem_id: string;
  nome_arquivo: string;
  tipo_arquivo: string;
  tamanho: number;
  url: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  avatar_url?: string;
  ativo: boolean;
}
