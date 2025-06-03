
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const CalendarioPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { tarefas, clientes, cuidadores } = useData();

  // Simular eventos do dia
  const eventosHoje = [
    {
      id: '1',
      titulo: 'Visita domiciliar - João da Silva',
      horario: '09:00',
      cuidador: 'Fernanda Lima',
      tipo: 'visita'
    },
    {
      id: '2',
      titulo: 'Sessão de fisioterapia - Maria Oliveira',
      horario: '14:30',
      cuidador: 'Ricardo Gomes',
      tipo: 'terapia'
    },
    {
      id: '3',
      titulo: 'Consulta médica - Carlos Santos',
      horario: '16:00',
      cuidador: 'Fernanda Lima',
      tipo: 'consulta'
    }
  ];

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'visita':
        return 'bg-blue-100 text-blue-800';
      case 'terapia':
        return 'bg-green-100 text-green-800';
      case 'consulta':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendário</h1>
          <p className="text-gray-600">Gerencie os agendamentos e eventos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Hoje</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventosHoje.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tarefas.filter(t => t.status !== 'done').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuidadores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cuidadores.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Eventos de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventosHoje.map((evento) => (
                <div key={evento.id} className="flex items-center p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{evento.titulo}</h4>
                    <p className="text-sm text-gray-500">Cuidador: {evento.cuidador}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(evento.tipo)}`}>
                      {evento.tipo}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{evento.horario}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarioPage;
