import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, DollarSign } from 'lucide-react';

export default function BoletosPage() {
  const { boletos, clientes, isLoading } = useData();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Carregando boletos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Boletos</h1>
        <Button className="flex items-center gap-2">
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
              <Badge variant={
                boleto.status === 'pago' ? 'default' : 
                boleto.status === 'vencido' ? 'destructive' : 'secondary'
              }>
                {boleto.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <DollarSign className="mr-1 h-4 w-4" />
                  R$ {boleto.valor}
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  Vence dia {boleto.dia_vencimento}
                </div>
                <div>
                  {boleto.tipo_plantao}
                </div>
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
    </div>
  );
}