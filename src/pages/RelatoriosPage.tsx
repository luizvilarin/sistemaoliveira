
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatMoney } from '@/lib/utils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';

const RelatoriosPage = () => {
  const { clientes, transacoes, tarefas, pacientes, cuidadores } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const { toast } = useToast();

  // Calcular estatísticas reais
  const totalReceita = transacoes
    .filter(t => t.status === 'confirmado')
    .reduce((acc, t) => acc + t.valor, 0);

  const tarefasConcluidas = tarefas.filter(t => t.status === 'done').length;
  const clientesAtivos = clientes.filter(c => c.status === 'ativo').length;
  const contratosAtivos = pacientes.filter(p => p.contrato_ativo).length;
  const cuidadoresDisponiveis = cuidadores.filter(c => !c.cliente_id).length;
  
  // Calcular crescimento baseado em dados reais
  const taxaEficiencia = tarefas.length > 0 ? (tarefasConcluidas / tarefas.length) * 100 : 0;
  const valorTotalContratos = pacientes
    .filter(p => p.contrato_ativo)
    .reduce((acc, p) => acc + (p.valor_contrato || 0), 0);

  const exportToExcel = (relatorioId: string) => {
    console.log(`Exportando relatório ${relatorioId} para Excel...`);
    
    let data: any[] = [];
    let filename = '';
    
    switch (relatorioId) {
      case '1': // Relatório Financeiro
        data = transacoes.map(t => ({
          Cliente: clientes.find(c => c.id === t.cliente_id)?.nome || 'N/A',
          Valor: t.valor,
          Status: t.status,
          Data: new Date(t.data).toLocaleDateString('pt-BR')
        }));
        filename = 'relatorio-financeiro.csv';
        break;
      case '2': // Relatório de Clientes
        data = clientes.map(c => ({
          Nome: c.nome,
          Contato: c.contato,
          Tipo: c.tipo,
          Status: c.status,
          'Data Cadastro': new Date(c.created_at).toLocaleDateString('pt-BR')
        }));
        filename = 'relatorio-clientes.csv';
        break;
      case '3': // Relatório de Tarefas
        data = tarefas.map(t => ({
          Título: t.titulo,
          Descrição: t.descricao || 'N/A',
          Status: t.status,
          Cliente: clientes.find(c => c.id === t.cliente_id)?.nome || 'N/A',
          'Data Criação': new Date(t.created_at).toLocaleDateString('pt-BR')
        }));
        filename = 'relatorio-tarefas.csv';
        break;
      case '4': // Relatório de Performance
        data = [
          { Métrica: 'Taxa de Eficiência', Valor: `${taxaEficiencia.toFixed(1)}%` },
          { Métrica: 'Clientes Ativos', Valor: clientesAtivos },
          { Métrica: 'Tarefas Concluídas', Valor: tarefasConcluidas },
          { Métrica: 'Receita Total', Valor: formatMoney(totalReceita) },
          { Métrica: 'Contratos Ativos', Valor: contratosAtivos }
        ];
        filename = 'relatorio-performance.csv';
        break;
    }

    // Converter para CSV
    if (data.length > 0) {
      const csvContent = convertToCSV(data);
      downloadCSV(csvContent, filename);
      
      toast({
        title: 'Relatório exportado',
        description: `O arquivo ${filename} foi baixado com sucesso!`,
      });
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportToPDF = (relatorioId: string) => {
    console.log(`Exportando relatório ${relatorioId} para PDF...`);
    
    // Criar conteúdo HTML para impressão
    let htmlContent = '';
    
    switch (relatorioId) {
      case '1':
        htmlContent = generateFinancialReportHTML();
        break;
      case '2':
        htmlContent = generateClientReportHTML();
        break;
      case '3':
        htmlContent = generateTaskReportHTML();
        break;
      case '4':
        htmlContent = generatePerformanceReportHTML();
        break;
    }

    // Abrir em nova janela para impressão/salvamento como PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }

    toast({
      title: 'Relatório PDF',
      description: 'Uma nova janela foi aberta para impressão/salvamento como PDF.',
    });
  };

  const generateFinancialReportHTML = () => {
    return `
      <html>
        <head>
          <title>Relatório Financeiro</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Relatório Financeiro</h1>
          <p>Período: ${selectedPeriod}</p>
          <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')}</p>
          
          <h2>Resumo</h2>
          <p>Receita Total: ${formatMoney(totalReceita)}</p>
          <p>Transações Confirmadas: ${transacoes.filter(t => t.status === 'confirmado').length}</p>
          
          <h2>Transações</h2>
          <table>
            <tr>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
            ${transacoes.map(t => `
              <tr>
                <td>${clientes.find(c => c.id === t.cliente_id)?.nome || 'N/A'}</td>
                <td>${formatMoney(t.valor)}</td>
                <td>${t.status}</td>
                <td>${new Date(t.data).toLocaleDateString('pt-BR')}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;
  };

  const generateClientReportHTML = () => {
    return `
      <html>
        <head>
          <title>Relatório de Clientes</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Relatório de Clientes</h1>
          <p>Total de clientes: ${clientes.length}</p>
          <p>Clientes ativos: ${clientesAtivos}</p>
          <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')}</p>
          
          <table>
            <tr>
              <th>Nome</th>
              <th>Contato</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Data Cadastro</th>
            </tr>
            ${clientes.map(c => `
              <tr>
                <td>${c.nome}</td>
                <td>${c.contato}</td>
                <td>${c.tipo}</td>
                <td>${c.status}</td>
                <td>${new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;
  };

  const generateTaskReportHTML = () => {
    return `
      <html>
        <head>
          <title>Relatório de Tarefas</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Relatório de Tarefas</h1>
          <p>Total de tarefas: ${tarefas.length}</p>
          <p>Tarefas concluídas: ${tarefasConcluidas}</p>
          <p>Taxa de conclusão: ${taxaEficiencia.toFixed(1)}%</p>
          <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')}</p>
          
          <table>
            <tr>
              <th>Título</th>
              <th>Status</th>
              <th>Cliente</th>
              <th>Data Criação</th>
            </tr>
            ${tarefas.map(t => `
              <tr>
                <td>${t.titulo}</td>
                <td>${t.status}</td>
                <td>${clientes.find(c => c.id === t.cliente_id)?.nome || 'N/A'}</td>
                <td>${new Date(t.created_at).toLocaleDateString('pt-BR')}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;
  };

  const generatePerformanceReportHTML = () => {
    return `
      <html>
        <head>
          <title>Relatório de Performance</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .metric { background-color: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Relatório de Performance</h1>
          <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')}</p>
          
          <div class="metric">
            <h3>Taxa de Eficiência</h3>
            <p>${taxaEficiencia.toFixed(1)}%</p>
          </div>
          
          <div class="metric">
            <h3>Receita Total</h3>
            <p>${formatMoney(totalReceita)}</p>
          </div>
          
          <div class="metric">
            <h3>Clientes Ativos</h3>
            <p>${clientesAtivos} de ${clientes.length} total</p>
          </div>
          
          <div class="metric">
            <h3>Tarefas Concluídas</h3>
            <p>${tarefasConcluidas} de ${tarefas.length} total</p>
          </div>
          
          <div class="metric">
            <h3>Contratos Ativos</h3>
            <p>${contratosAtivos} contratos gerando ${formatMoney(valorTotalContratos)}</p>
          </div>
        </body>
      </html>
    `;
  };

  const relatoriosDisponiveis = [
    {
      id: '1',
      titulo: 'Relatório Financeiro',
      descricao: 'Receitas, despesas e transações do período',
      icon: DollarSign,
      dados: formatMoney(totalReceita)
    },
    {
      id: '2',
      titulo: 'Relatório de Clientes',
      descricao: 'Análise de clientes ativos e inativos',
      icon: Users,
      dados: `${clientesAtivos} de ${clientes.length} ativos`
    },
    {
      id: '3',
      titulo: 'Relatório de Tarefas',
      descricao: 'Produtividade e tarefas concluídas',
      icon: Calendar,
      dados: `${tarefasConcluidas} de ${tarefas.length} concluídas`
    },
    {
      id: '4',
      titulo: 'Relatório de Performance',
      descricao: 'Métricas de desempenho geral',
      icon: TrendingUp,
      dados: `${taxaEficiencia.toFixed(1)}% eficiência`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análises e relatórios do sistema</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mês</SelectItem>
              <SelectItem value="trimestre">Este Trimestre</SelectItem>
              <SelectItem value="ano">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalReceita)}</div>
            <p className="text-xs text-gray-500">
              {transacoes.filter(t => t.status === 'confirmado').length} transações confirmadas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesAtivos}</div>
            <p className="text-xs text-gray-500">De {clientes.length} total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Concluídas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tarefasConcluidas}</div>
            <p className="text-xs text-gray-500">De {tarefas.length} total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxaEficiencia.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">Eficiência operacional</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relatoriosDisponiveis.map((relatorio) => {
          const IconComponent = relatorio.icon;
          return (
            <Card key={relatorio.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{relatorio.titulo}</CardTitle>
                      <p className="text-sm text-gray-600">{relatorio.descricao}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary">{relatorio.dados}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Período: {selectedPeriod === 'mes' ? 'Este Mês' : 
                             selectedPeriod === 'semana' ? 'Esta Semana' :
                             selectedPeriod === 'trimestre' ? 'Este Trimestre' : 'Este Ano'}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportToExcel(relatorio.id)}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportToPDF(relatorio.id)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800">Contratos Ativos</h4>
                <p className="text-2xl font-bold text-blue-600">{contratosAtivos}</p>
                <p className="text-sm text-blue-600">{formatMoney(valorTotalContratos)}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">Cuidadores Disponíveis</h4>
                <p className="text-2xl font-bold text-green-600">{cuidadoresDisponiveis}</p>
                <p className="text-sm text-green-600">De {cuidadores.length} total</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800">Transações Confirmadas</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {transacoes.filter(t => t.status === 'confirmado').length}
                </p>
                <p className="text-sm text-purple-600">De {transacoes.length} total</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Observações do Período</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Receita total de {formatMoney(totalReceita)} confirmada</li>
                <li>• Taxa de conclusão de tarefas em {taxaEficiencia.toFixed(1)}%</li>
                <li>• {clientesAtivos} clientes ativos de um total de {clientes.length}</li>
                <li>• {cuidadores.length} cuidadores cadastrados, {cuidadoresDisponiveis} disponíveis</li>
                <li>• {contratosAtivos} contratos ativos gerando {formatMoney(valorTotalContratos)}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatoriosPage;
