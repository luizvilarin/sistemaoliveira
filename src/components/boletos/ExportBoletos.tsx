import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

export default function ExportBoletos() {
  const { boletos, clientes } = useData();
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = () => {
    if (!dateFrom || !dateTo) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione o período para exportação',
      });
      return;
    }

    setIsExporting(true);

    try {
      // Filtrar boletos pagos no período selecionado
      const boletosFiltrados = boletos.filter(boleto => {
        if (boleto.status !== 'pago' || !boleto.data_pagamento) return false;
        
        const dataPagamento = new Date(boleto.data_pagamento);
        return dataPagamento >= dateFrom && dataPagamento <= dateTo;
      });

      // Agrupar por cliente e somar valores
      const dadosAgrupados = boletosFiltrados.reduce((acc, boleto) => {
        const cliente = clientes.find(c => c.id === boleto.cliente_id);
        if (!cliente) return acc;

        const clienteKey = cliente.id;
        if (!acc[clienteKey]) {
          acc[clienteKey] = {
            nomeCompleto: cliente.nome_completo_cliente || cliente.nome,
            cpf: cliente.cpf_completo || 'Não informado',
            valorTotal: 0,
            quantidadeBoletos: 0
          };
        }

        acc[clienteKey].valorTotal += boleto.valor_personalizado || boleto.valor;
        acc[clienteKey].quantidadeBoletos += 1;

        return acc;
      }, {} as Record<string, any>);

      // Converter para array para Excel
      const dadosExcel = Object.values(dadosAgrupados).map((cliente: any) => ({
        'Nome Completo': cliente.nomeCompleto,
        'CPF': cliente.cpf,
        'Valor Total Recebido (R$)': cliente.valorTotal.toFixed(2).replace('.', ','),
        'Quantidade de Boletos': cliente.quantidadeBoletos,
        'Período': `${format(dateFrom, 'dd/MM/yyyy', { locale: ptBR })} a ${format(dateTo, 'dd/MM/yyyy', { locale: ptBR })}`
      }));

      if (dadosExcel.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Nenhum dado encontrado',
          description: 'Não há boletos pagos no período selecionado',
        });
        return;
      }

      // Criar planilha Excel
      const ws = XLSX.utils.json_to_sheet(dadosExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Relatório Notas Fiscais');

      // Aplicar formatação básica
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      
      // Ajustar largura das colunas
      const colWidths = [
        { wch: 30 }, // Nome Completo
        { wch: 15 }, // CPF
        { wch: 20 }, // Valor Total
        { wch: 18 }, // Quantidade
        { wch: 25 }  // Período
      ];
      ws['!cols'] = colWidths;

      // Gerar arquivo
      const nomeArquivo = `relatorio_notas_fiscais_${format(dateFrom, 'ddMMyyyy')}_${format(dateTo, 'ddMMyyyy')}.xlsx`;
      XLSX.writeFile(wb, nomeArquivo);

      toast({
        title: 'Exportação concluída',
        description: `Arquivo ${nomeArquivo} baixado com sucesso!`,
      });

    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na exportação',
        description: 'Ocorreu um erro ao gerar o arquivo Excel',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Exportar Relatório de Notas Fiscais</h3>
      <p className="text-sm text-muted-foreground">
        Gere um relatório em Excel com os valores recebidos por cliente no período selecionado.
      </p>
      
      <div className="flex gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium">Data Inicial</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "PPP", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Data Final</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "PPP", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button 
          onClick={exportToExcel}
          disabled={!dateFrom || !dateTo || isExporting}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exportando...' : 'Exportar Excel'}
        </Button>
      </div>
    </div>
  );
}