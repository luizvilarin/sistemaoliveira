
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Clock, MapPin, User } from 'lucide-react';
import LembreteForm from '@/components/lembretes/LembreteForm';
import { formatDate } from '@/lib/utils';

const CalendarioPage = () => {
  const { lembretes, isLoading } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Agrupar lembretes por data
  const lembretesPorData = lembretes.reduce((acc, lembrete) => {
    const data = lembrete.dia;
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(lembrete);
    return acc;
  }, {} as Record<string, typeof lembretes>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendário e Lembretes</h1>
          <p className="text-gray-600">Gerencie os lembretes e agendamentos</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lembrete
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Lembretes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lembretes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lembretesPorData[new Date().toISOString().split('T')[0]]?.length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lembretes.filter(l => {
                const lembreteDate = new Date(l.dia);
                const today = new Date();
                const weekFromNow = new Date();
                weekFromNow.setDate(today.getDate() + 7);
                return lembreteDate >= today && lembreteDate <= weekFromNow;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {Object.keys(lembretesPorData)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          .map((data) => (
            <Card key={data}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {formatDate(data)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lembretesPorData[data].map((lembrete) => (
                    <div key={lembrete.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{lembrete.titulo}</h3>
                          {lembrete.descricao && (
                            <p className="text-gray-600">{lembrete.descricao}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {lembrete.residencia}
                            </div>
                            {lembrete.cliente && (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                Cliente: {lembrete.cliente.nome}
                              </div>
                            )}
                            {lembrete.cuidador && (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                Cuidador: {lembrete.cuidador.nome}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        
        {Object.keys(lembretesPorData).length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum lembrete cadastrado</p>
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="mt-4"
              >
                Criar primeiro lembrete
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <LembreteForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};

export default CalendarioPage;
