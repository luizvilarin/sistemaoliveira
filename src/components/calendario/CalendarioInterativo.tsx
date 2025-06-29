
import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Plus, Eye, AlertTriangle } from 'lucide-react';
import { Lembrete } from '@/types/data';
import LembreteForm from '@/components/lembretes/LembreteForm';

// Configurar moment em português
moment.locale('pt-br');
const localizer = momentLocalizer(moment);

interface CalendarioInterativoProps {
  lembretes: Lembrete[];
  onCreateLembrete?: (data: Date) => void;
}

// Feriados nacionais e de Goiânia para 2024
const feriados2024 = [
  { date: '2024-01-01', name: 'Confraternização Universal' },
  { date: '2024-02-12', name: 'Carnaval' },
  { date: '2024-02-13', name: 'Carnaval' },
  { date: '2024-03-29', name: 'Paixão de Cristo' },
  { date: '2024-04-21', name: 'Tiradentes' },
  { date: '2024-05-01', name: 'Dia do Trabalhador' },
  { date: '2024-05-30', name: 'Corpus Christi' },
  { date: '2024-07-09', name: 'Revolução Constitucionalista (GO)' },
  { date: '2024-09-07', name: 'Independência do Brasil' },
  { date: '2024-10-05', name: 'Fundação de Goiânia' },
  { date: '2024-10-12', name: 'Nossa Senhora Aparecida' },
  { date: '2024-10-24', name: 'Servidor Público (GO)' },
  { date: '2024-11-02', name: 'Finados' },
  { date: '2024-11-15', name: 'Proclamação da República' },
  { date: '2024-12-25', name: 'Natal' }
];

const CalendarioInterativo: React.FC<CalendarioInterativoProps> = ({ 
  lembretes, 
  onCreateLembrete 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLembrete, setSelectedLembrete] = useState<Lembrete | null>(null);
  const [showLembreteDialog, setShowLembreteDialog] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Converter lembretes para eventos do calendário
  const eventos = lembretes.map(lembrete => {
    const startDate = lembrete.hora 
      ? moment(`${lembrete.dia} ${lembrete.hora}`).toDate()
      : moment(lembrete.dia).toDate();
    
    const endDate = lembrete.hora 
      ? moment(`${lembrete.dia} ${lembrete.hora}`).add(1, 'hour').toDate()
      : moment(lembrete.dia).add(1, 'day').toDate();

    return {
      id: lembrete.id,
      title: lembrete.titulo,
      start: startDate,
      end: endDate,
      resource: lembrete,
      allDay: !lembrete.hora
    };
  });

  // Adicionar feriados como eventos
  const feriadosEventos = feriados2024.map(feriado => ({
    id: `feriado-${feriado.date}`,
    title: `🎉 ${feriado.name}`,
    start: moment(feriado.date).toDate(),
    end: moment(feriado.date).toDate(),
    allDay: true,
    resource: { tipo: 'feriado', ...feriado }
  }));

  const todosEventos = [...eventos, ...feriadosEventos];

  const handleSelectEvent = (event: any) => {
    if (event.resource.tipo === 'feriado') {
      return; // Não fazer nada para feriados
    }
    setSelectedLembrete(event.resource);
    setShowLembreteDialog(true);
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setShowCreateForm(true);
    if (onCreateLembrete) {
      onCreateLembrete(start);
    }
  };

  const eventStyleGetter = (event: any) => {
    if (event.resource.tipo === 'feriado') {
      return {
        style: {
          backgroundColor: '#fbbf24',
          border: '1px solid #f59e0b',
          color: '#92400e'
        }
      };
    }

    const lembrete = event.resource as Lembrete;
    let backgroundColor = '#3b82f6';
    
    if (lembrete.urgente) {
      backgroundColor = '#ef4444';
    } else if (lembrete.tipo === 'consulta') {
      backgroundColor = '#10b981';
    } else if (lembrete.tipo === 'medicamento') {
      backgroundColor = '#8b5cf6';
    }

    return {
      style: {
        backgroundColor,
        border: `1px solid ${backgroundColor}`,
        color: 'white'
      }
    };
  };

  const messages = {
    allDay: 'Dia inteiro',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há eventos neste período',
    showMore: (total: number) => `+ ${total} mais`
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendário de Lembretes
            </h3>
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline" className="bg-blue-50">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                Geral
              </Badge>
              <Badge variant="outline" className="bg-green-50">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                Consulta
              </Badge>
              <Badge variant="outline" className="bg-purple-50">
                <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                Medicamento
              </Badge>
              <Badge variant="outline" className="bg-red-50">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                Urgente
              </Badge>
              <Badge variant="outline" className="bg-yellow-50">
                <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                Feriado
              </Badge>
            </div>
          </div>
          
          <div className="w-full bg-white border rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={todosEventos}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              eventPropGetter={eventStyleGetter}
              messages={messages}
              views={['month', 'week', 'day', 'agenda']}
              defaultView="month"
              popup
              style={{ height: '100%', padding: '10px' }}
              className="calendario-custom"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog para visualizar lembrete */}
      <Dialog open={showLembreteDialog} onOpenChange={setShowLembreteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detalhes do Lembrete
            </DialogTitle>
          </DialogHeader>
          {selectedLembrete && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{selectedLembrete.titulo}</h3>
                {selectedLembrete.urgente && (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>
              
              <div className="space-y-2">
                <p><strong>Data:</strong> {moment(selectedLembrete.dia).format('DD/MM/YYYY')}</p>
                {selectedLembrete.hora && (
                  <p><strong>Hora:</strong> {selectedLembrete.hora}</p>
                )}
                <p><strong>Tipo:</strong> {selectedLembrete.tipo}</p>
                <p><strong>Local:</strong> {selectedLembrete.residencia}</p>
                {selectedLembrete.descricao && (
                  <p><strong>Descrição:</strong> {selectedLembrete.descricao}</p>
                )}
              </div>

              {selectedLembrete.tags && selectedLembrete.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedLembrete.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Form para criar lembrete */}
      {showCreateForm && (
        <LembreteForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

export default CalendarioInterativo;
