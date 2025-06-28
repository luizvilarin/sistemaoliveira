
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar 
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

const RelatoriosPage = () => {
  const { clientes, transacoes, tarefas, pacientes, cuidadores } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('mes');

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

  const handleDownloadReport = (relatorioId: string) => {
    console.log(`Baixando relatório ${relatorioId} para o período: ${selectedPeriod}`);
    // Aqui seria implementada a lógica de geração do relatório
  };

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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadReport(relatorio.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
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
