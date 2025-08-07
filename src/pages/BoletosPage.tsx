import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';
import BoletoForm from '@/components/boletos/BoletoForm';
import { Boleto } from '@/types/data';

export default function BoletosPage() {
  const { boletos, clientes, isLoading, deleteBoleto } = useData();
  const [isBoletoFormOpen, setIsBoletoFormOpen] = useState(false);
  const [boletoToEdit, setBoletoToEdit] = useState<Boleto | undefined>(undefined);

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

      <div className="grid gap-4">
        {boletos.map((boleto) => (
          <Card key={boleto.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {boleto.cliente?.nome || 'Cliente não encontrado'}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={
                  boleto.status === 'pago' ? 'default' : 
                  boleto.status === 'vencido' ? 'destructive' : 'secondary'
                }>
                  {boleto.status}
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
                    R$ {boleto.valor_personalizado || boleto.valor}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    Vence dia {boleto.dia_vencimento}
                  </div>
                  <div>
                    {boleto.tipo_plantao}
                  </div>
                </div>
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
                {(boleto.data_envio || boleto.data_pagamento) && (
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {boleto.data_envio && (
                      <span>Enviado em: {new Date(boleto.data_envio).toLocaleDateString()}</span>
                    )}
                    {boleto.data_pagamento && (
                      <span>Pago em: {new Date(boleto.data_pagamento).toLocaleDateString()}</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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