import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, DollarSign, Edit, Trash2, FileSpreadsheet, Filter } from 'lucide-react';
import BoletoForm from '@/components/boletos/BoletoForm';
import ExportBoletos from '@/components/boletos/ExportBoletos';
import { Boleto } from '@/types/data';

export default function BoletosPage() {
  const { boletos, clientes, isLoading, deleteBoleto } = useData();
  const [isBoletoFormOpen, setIsBoletoFormOpen] = useState(false);
  const [boletoToEdit, setBoletoToEdit] = useState<Boleto | undefined>(undefined);
  const [filtroFrequencia, setFiltroFrequencia] = useState<string>('todos');

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Carregando boletos...</div>;
  }

  const handleEditBoleto = (boleto: Boleto) => {
    setBoletoToEdit(boleto);
    setIsBoletoFormOpen(true);
  };

  const handleDeleteBoleto = async (boletoId: string) => {
    if (confirm('Tem certeza que deseja excluir este boleto?')) {
      try {
        await deleteBoleto(boletoId);
      } catch (error) {
        console.error('Erro ao excluir boleto:', error);
      }
    }
  };

  const handleCloseBoletoForm = () => {
    setIsBoletoFormOpen(false);
    setBoletoToEdit(undefined);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pendente': '#f59e0b',
      'solicitado': '#3b82f6',
      'enviado': '#8b5cf6',
      'pago': '#10b981',
      'vencido': '#ef4444',
      'cancelado': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pendente': 'Pendente',
      'solicitado': 'Solicitado',
      'enviado': 'Boleto Enviado',
      'pago': 'Pago',
      'vencido': 'Vencido',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  };

  const boletosFiltrados = boletos.filter(boleto => {
    if (filtroFrequencia === 'todos') return true;
    return boleto.frequencia_recorrencia === filtroFrequencia;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Boletos</h1>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsBoletoFormOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Novo Boleto
        </Button>
      </div>

      <Tabs defaultValue="lista" className="space-y-6">
        <TabsList>
          <TabsTrigger value="lista">Lista de Boletos</TabsTrigger>
          <TabsTrigger value="relatorios">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filtroFrequencia} onValueChange={setFiltroFrequencia}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por frequência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os boletos</SelectItem>
                <SelectItem value="unico">Único</SelectItem>
                <SelectItem value="quinzenal">Quinzenal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {boletosFiltrados.map((boleto) => (
              <Card key={boleto.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {boleto.cliente?.nome || 'Cliente não encontrado'}
                    {boleto.recorrente && (
                      <Badge variant="outline" className="ml-2">Recorrente</Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      style={{ 
                        backgroundColor: getStatusColor(boleto.status),
                        color: 'white'
                      }}
                    >
                      {getStatusLabel(boleto.status)}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBoleto(boleto)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBoleto(boleto.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <DollarSign className="mr-1 h-4 w-4" />
                        R$ {(boleto.valor_personalizado || boleto.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        Vence dia {boleto.dia_vencimento}
                      </div>
                      <div>
                        {boleto.tipo_plantao}
                      </div>
                    </div>
                    
                    {boleto.recorrente && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Recorrência:</span> {boleto.frequencia_recorrencia}
                        {boleto.proxima_data_cobranca && (
                          <span className="ml-2">• Próxima: {new Date(boleto.proxima_data_cobranca).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                    
                    {boleto.cuidadoras && boleto.cuidadoras.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Cuidadoras:</span> {boleto.cuidadoras.join(', ')}
                      </div>
                    )}
                    
                    {boleto.observacoes && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Obs:</span> {boleto.observacoes}
                      </div>
                    )}
                    
                    {(boleto.data_envio || boleto.data_pagamento || boleto.data_solicitacao || boleto.data_envio_boleto || boleto.data_confirmacao_pago) && (
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {boleto.data_solicitacao && (
                          <span>Solicitado: {new Date(boleto.data_solicitacao).toLocaleDateString()}</span>
                        )}
                        {(boleto.data_envio_boleto || boleto.data_envio) && (
                          <span>Enviado: {new Date(boleto.data_envio_boleto || boleto.data_envio!).toLocaleDateString()}</span>
                        )}
                        {(boleto.data_confirmacao_pago || boleto.data_pagamento) && (
                          <span>Pago: {new Date(boleto.data_confirmacao_pago || boleto.data_pagamento!).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="relatorios">
          <ExportBoletos />
        </TabsContent>
      </Tabs>

      {boletosFiltrados.length === 0 && boletos.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum boleto encontrado com o filtro selecionado.</p>
        </div>
      )}

      {boletos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum boleto cadastrado ainda.</p>
        </div>
      )}

      <BoletoForm
        isOpen={isBoletoFormOpen}
        onClose={handleCloseBoletoForm}
        boletoToEdit={boletoToEdit}
      />
    </div>
  );
}