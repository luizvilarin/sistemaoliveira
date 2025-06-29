
import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Plus, Eye, AlertTriangle, Sparkles } from 'lucide-react';
import { Lembrete } from '@/types/data';
import LembreteForm from '@/components/lembretes/LembreteForm';

// Configurar moment em português
moment.locale('pt-br');
const localizer = momentLocalizer(moment);

interface CalendarioInterativoProps {
  lembretes: Lembrete[];
  onCreateLembrete?: (data: Date) => void;
}

// Feriados nacionais e regionais de Goiânia para 2024 e 2025
const feriados = [
  // 2024
  { date: '2024-01-01', name: 'Confraternização Universal', tipo: 'nacional' },
  { date: '2024-02-12', name: 'Carnaval', tipo: 'nacional' },
  { date: '2024-02-13', name: 'Carnaval', tipo: 'nacional' },
  { date: '2024-03-29', name: 'Paixão de Cristo', tipo: 'nacional' },
  { date: '2024-04-21', name: 'Tiradentes', tipo: 'nacional' },
  { date: '2024-05-01', name: 'Dia do Trabalhador', tipo: 'nacional' },
  { date: '2024-05-30', name: 'Corpus Christi', tipo: 'nacional' },
  { date: '2024-07-09', name: 'Revolução Constitucionalista', tipo: 'goias' },
  { date: '2024-09-07', name: 'Independência do Brasil', tipo: 'nacional' },
  { date: '2024-10-05', name: 'Fundação de Goiânia', tipo: 'goiania' },
  { date: '2024-10-12', name: 'Nossa Senhora Aparecida', tipo: 'nacional' },
  { date: '2024-10-24', name: 'Servidor Público', tipo: 'goias' },
  { date: '2024-11-02', name: 'Finados', tipo: 'nacional' },
  { date: '2024-11-15', name: 'Proclamação da República', tipo: 'nacional' },
  { date: '2024-12-25', name: 'Natal', tipo: 'nacional' },

  // 2025
  { date: '2025-01-01', name: 'Confraternização Universal', tipo: 'nacional' },
  { date: '2025-03-03', name: 'Carnaval', tipo: 'nacional' },
  { date: '2025-03-04', name: 'Carnaval', tipo: 'nacional' },
  { date: '2025-04-18', name: 'Paixão de Cristo', tipo: 'nacional' },
  { date: '2025-04-21', name: 'Tiradentes', tipo: 'nacional' },
  { date: '2025-05-01', name: 'Dia do Trabalhador', tipo: 'nacional' },
  { date: '2025-06-19', name: 'Corpus Christi', tipo: 'nacional' },
  { date: '2025-07-09', name: 'Revolução Constitucionalista', tipo: 'goias' },
  { date: '2025-09-07', name: 'Independência do Brasil', tipo: 'nacional' },
  { date: '2025-10-05', name: 'Fundação de Goiânia', tipo: 'goiania' },
  { date: '2025-10-12', name: 'Nossa Senhora Aparecida', tipo: 'nacional' },
  { date: '2025-10-24', name: 'Servidor Público', tipo: 'goias' },
  { date: '2025-11-02', name: 'Finados', tipo: 'nacional' },
  { date: '2025-11-15', name: 'Proclamação da República', tipo: 'nacional' },
  { date: '2025-12-25', name: 'Natal', tipo: 'nacional' }
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
  const feriadosEventos = feriados.map(feriado => {
    let emoji = '🎉';
    let color = 'yellow';
    
    if (feriado.tipo === 'nacional') {
      emoji = '🇧🇷';
      color = 'blue';
    } else if (feriado.tipo === 'goiania') {
      emoji = '🏙️';
      color = 'purple';
    } else if (feriado.tipo === 'goias') {
      emoji = '🌻';
      color = 'green';
    }

    return {
      id: `feriado-${feriado.date}`,
      title: `${emoji} ${feriado.name}`,
      start: moment(feriado.date).toDate(),
      end: moment(feriado.date).toDate(),
      allDay: true,
      resource: { 
        tipo: 'feriado', 
        ...feriado,
        color,
        emoji
      }
    };
  });

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
      const feriado = event.resource;
      const baseColors = {
        yellow: { bg: '#fbbf24', border: '#f59e0b', text: '#92400e' },
        blue: { bg: '#3b82f6', border: '#2563eb', text: '#ffffff' },
        purple: { bg: '#8b5cf6', border: '#7c3aed', text: '#ffffff' },
        green: { bg: '#10b981', border: '#059669', text: '#ffffff' }
      };
      
      const colors = baseColors[feriado.color as keyof typeof baseColors] || baseColors.yellow;
      
      return {
        style: {
          backgroundColor: colors.bg,
          border: `2px solid ${colors.border}`,
          color: colors.text,
          borderRadius: '8px',
          padding: '4px 8px',
          fontWeight: '600',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }
      };
    }

    const lembrete = event.resource as Lembrete;
    let backgroundColor = '#3b82f6';
    let borderColor = '#2563eb';
    
    if (lembrete.urgente) {
      backgroundColor = '#ef4444';
      borderColor = '#dc2626';
    } else if (lembrete.tipo === 'consulta') {
      backgroundColor = '#10b981';
      borderColor = '#059669';
    } else if (lembrete.tipo === 'medicamento') {
      backgroundColor = '#8b5cf6';
      borderColor = '#7c3aed';
    } else if (lembrete.tipo === 'emergencia') {
      backgroundColor = '#f59e0b';
      borderColor = '#d97706';
    }

    return {
      style: {
        backgroundColor,
        border: `2px solid ${borderColor}`,
        color: 'white',
        borderRadius: '8px',
        padding: '4px 8px',
        fontWeight: '500',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        transition: 'all 0.2s ease'
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
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Calendário de Lembretes
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Gerencie seus compromissos e feriados
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-all">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full mr-2 shadow-sm"></div>
                Geral
              </Badge>
              <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:shadow-md transition-all">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full mr-2 shadow-sm"></div>
                Consulta
              </Badge>
              <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-all">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full mr-2 shadow-sm"></div>
                Medicamento
              </Badge>
              <Badge variant="outline" className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 hover:shadow-md transition-all">
                <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full mr-2 shadow-sm"></div>
                Urgente
              </Badge>
              <Badge variant="outline" className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-md transition-all">
                <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mr-2 shadow-sm"></div>
                🇧🇷 Nacional
              </Badge>
              <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-all">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full mr-2 shadow-sm"></div>
                🏙️ Goiânia
              </Badge>
            </div>
          </div>
          
          <div className="calendario-moderno rounded-2xl overflow-hidden shadow-2xl border border-gray-200/50" style={{ height: '650px' }}>
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
              popupOffset={20}
              style={{ height: '100%', fontFamily: 'Inter, system-ui, sans-serif' }}
              className="calendario-custom-moderno"
              dayPropGetter={(date) => {
                const isToday = moment(date).isSame(moment(), 'day');
                const isWeekend = moment(date).day() === 0 || moment(date).day() === 6;
                
                if (isToday) {
                  return {
                    className: 'rbc-today-modern',
                    style: {
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '8px'
                    }
                  };
                }
                
                if (isWeekend) {
                  return {
                    style: {
                      backgroundColor: 'rgba(156, 163, 175, 0.05)'
                    }
                  };
                }
                
                return {};
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog para visualizar lembrete */}
      <Dialog open={showLembreteDialog} onOpenChange={setShowLembreteDialog}>
        <DialogContent className="max-w-md border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Eye className="h-4 w-4 text-white" />
              </div>
              Detalhes do Lembrete
            </DialogTitle>
          </DialogHeader>
          {selectedLembrete && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{selectedLembrete.titulo}</h3>
                {selectedLembrete.urgente && (
                  <div className="p-1 bg-red-100 rounded-full">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
              
              <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                <p className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Data:</span> 
                  <span className="text-gray-900">{moment(selectedLembrete.dia).format('DD/MM/YYYY')}</span>
                </p>
                {selectedLembrete.hora && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Hora:</span> 
                    <span className="text-gray-900">{selectedLembrete.hora}</span>
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Tipo:</span> 
                  <Badge className="capitalize">{selectedLembrete.tipo}</Badge>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Local:</span> 
                  <span className="text-gray-900">{selectedLembrete.residencia}</span>
                </p>
                {selectedLembrete.descricao && (
                  <div>
                    <span className="font-medium text-gray-700">Descrição:</span>
                    <p className="text-gray-900 mt-1 text-sm leading-relaxed">{selectedLembrete.descricao}</p>
                  </div>
                )}
              </div>

              {selectedLembrete.tags && selectedLembrete.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedLembrete.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
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
