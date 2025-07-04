import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { HelpCircle, MessageCircle, User, Calendar, Bell, FileText, Send, Loader2 } from 'lucide-react';

const formSchema = z.object({
  nome: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  assunto: z.string().min(5, { message: 'Assunto deve ter pelo menos 5 caracteres' }),
  mensagem: z.string().min(10, { message: 'Mensagem deve ter pelo menos 10 caracteres' }),
});

type FormData = z.infer<typeof formSchema>;

const faqData = [
  {
    id: 'cadastrar-paciente',
    category: 'Pacientes',
    icon: <User className="h-5 w-5" />,
    question: 'Como cadastrar um novo paciente?',
    answer: 'Para cadastrar um novo paciente, acesse a aba "Pacientes" no menu lateral, clique no botão "Novo Paciente" e preencha todas as informações obrigatórias como nome, cliente responsável e histórico médico (opcional). Depois clique em "Adicionar" para salvar.'
  },
  {
    id: 'criar-tarefa',
    category: 'Tarefas',
    icon: <FileText className="h-5 w-5" />,
    question: 'Como criar uma nova tarefa?',
    answer: 'Vá até a seção "Tarefas", clique em "Nova Tarefa" e preencha os campos obrigatórios: título, descrição, cliente e cuidador responsável. Você pode definir o status inicial como "A Fazer". A tarefa será automaticamente visível para o cuidador designado.'
  },
  {
    id: 'usar-calendario',
    category: 'Calendário',
    icon: <Calendar className="h-5 w-5" />,
    question: 'Como usar o sistema de calendário e lembretes?',
    answer: 'No calendário, você pode criar lembretes clicando em qualquer data. Preencha o título, selecione a residência, defina se é urgente e configure o tempo de antecedência para notificação. Os lembretes aparecerão no calendário e você receberá notificações automáticas.'
  },
  {
    id: 'notificacoes',
    category: 'Notificações',
    icon: <Bell className="h-5 w-5" />,
    question: 'Como funciona o sistema de notificações?',
    answer: 'O sistema envia notificações automáticas para lembretes, novas mensagens e atualizações de tarefas. Você pode ver todas as notificações no ícone de sino no topo da tela. As notificações de lembretes são enviadas conforme o tempo de antecedência configurado.'
  },
  {
    id: 'permissoes',
    category: 'Usuários',
    icon: <User className="h-5 w-5" />,
    question: 'Quais são as diferenças entre Admin e Gestor?',
    answer: 'Administradores têm acesso completo ao sistema, incluindo transações financeiras e gerenciamento de todos os usuários. Gestores podem gerenciar clientes, pacientes, cuidadores, tarefas e mensagens, mas não têm acesso às transações financeiras. Ambos podem convidar novos usuários para o sistema.'
  },
  {
    id: 'mensagens',
    category: 'Mensagens',
    icon: <MessageCircle className="h-5 w-5" />,
    question: 'Como usar o sistema de mensagens?',
    answer: 'Na seção "Mensagens", você pode enviar mensagens individuais ou criar grupos de conversa. Digite o assunto e conteúdo, selecione o destinatário ou grupo, e clique em "Enviar". As mensagens são entregues em tempo real e você pode acompanhar o status de leitura.'
  }
];

const SuportePage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      assunto: '',
      mensagem: '',
    },
  });

  const filteredFAQ = faqData.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-support-email', {
        body: values
      });

      if (error) throw error;

      toast({
        title: 'Mensagem enviada!',
        description: 'Sua solicitação de suporte foi enviada com sucesso. Entraremos em contato em breve.',
      });

      form.reset();
    } catch (error: any) {
      console.error('Erro ao enviar mensagem de suporte:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar',
        description: 'Não foi possível enviar sua mensagem. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const categoryColors = {
    'Pacientes': 'bg-blue-100 text-blue-700',
    'Tarefas': 'bg-green-100 text-green-700',
    'Calendário': 'bg-purple-100 text-purple-700',
    'Notificações': 'bg-orange-100 text-orange-700',
    'Usuários': 'bg-red-100 text-red-700',
    'Mensagens': 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Central de Suporte</h1>
        <p className="text-gray-600">Encontre respostas rápidas ou entre em contato conosco</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQ Section */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Perguntas Frequentes
            </CardTitle>
            <div className="space-y-2">
              <Input
                placeholder="Buscar nas perguntas frequentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQ.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <div>
                        <div className="font-medium">{item.question}</div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          categoryColors[item.category as keyof typeof categoryColors]
                        }`}>
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pl-8">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            {filteredFAQ.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma pergunta encontrada para "{searchTerm}"</p>
                <p className="text-sm mt-2">Tente usar outros termos ou entre em contato conosco</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Falar com Suporte
            </CardTitle>
            <p className="text-sm text-gray-600">
              Não encontrou o que procurava? Envie sua dúvida e entraremos em contato.
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Seu nome completo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="seu@email.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="assunto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assunto</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Resumo da sua dúvida ou problema" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mensagem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Descreva sua dúvida ou problema com detalhes..."
                          rows={6}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Links Úteis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <User className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <h3 className="font-medium">Gerenciar Usuários</h3>
                <p className="text-sm text-gray-600">Convidar e gerenciar usuários do sistema</p>
              </div>
            </div>
            <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <h3 className="font-medium">Calendário</h3>
                <p className="text-sm text-gray-600">Criar lembretes e organizar agenda</p>
              </div>
            </div>
            <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <Bell className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <h3 className="font-medium">Notificações</h3>
                <p className="text-sm text-gray-600">Configurar alertas e lembretes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuportePage;