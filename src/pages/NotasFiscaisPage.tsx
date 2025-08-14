import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, FileText, Trash2, Download } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { NotaFiscalForm } from '@/components/notas-fiscais/NotaFiscalForm';
import { NotaFiscal } from '@/hooks/crud/useNotaFiscalCrud';
import * as XLSX from 'xlsx';

export const NotasFiscaisPage: React.FC = () => {
  const { notasFiscais, clientes, deleteNotaFiscal } = useData();
  const { userProfile } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notaFiscalToEdit, setNotaFiscalToEdit] = useState<NotaFiscal | null>(null);

  // Verificar permissão admin+
  if (userProfile?.perfil !== 'admin_plus') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEditNotaFiscal = (notaFiscal: NotaFiscal) => {
    setNotaFiscalToEdit(notaFiscal);
    setIsFormOpen(true);
  };

  const handleDeleteNotaFiscal = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta nota fiscal?')) {
      await deleteNotaFiscal(id);
    }
  };

  const handleCloseNotaFiscalForm = () => {
    setIsFormOpen(false);
    setNotaFiscalToEdit(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-amber-500';
      case 'enviado': return 'bg-blue-500';
      case 'processado': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'enviado': return 'Enviado';
      case 'processado': return 'Processado';
      default: return status;
    }
  };

  const exportToExcel = () => {
    const exportData = notasFiscais.map(nf => {
      const cliente = clientes.find(c => c.id === nf.cliente_id);
      return {
        periodo: nf.periodo,
        cliente: cliente?.nome || 'N/A',
        cpf_tomador: nf.cpf_tomador,
        responsavel_pagador: nf.responsavel_pagador,
        emissor_nf: nf.emissor_nf,
        valor_nf: nf.valor_nf,
        status_envio: nf.status_envio,
        data_emissao: nf.data_emissao,
        observacoes: nf.observacoes || ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Notas Fiscais');
    
    const fileName = `notas_fiscais_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notas Fiscais</h1>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Nova Nota Fiscal
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {notasFiscais.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Nenhuma nota fiscal encontrada. Clique em "Nova Nota Fiscal" para começar.
              </p>
            </CardContent>
          </Card>
        ) : (
          notasFiscais.map((notaFiscal) => {
            const cliente = clientes.find(c => c.id === notaFiscal.cliente_id);
            
            return (
              <Card key={notaFiscal.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{cliente?.nome || 'Cliente não encontrado'}</CardTitle>
                    <Badge className={`${getStatusColor(notaFiscal.status_envio)} text-white`}>
                      {getStatusLabel(notaFiscal.status_envio)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Período</p>
                      <p className="font-medium">{notaFiscal.periodo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Responsável/Pagador</p>
                      <p className="font-medium">{notaFiscal.responsavel_pagador}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor</p>
                      <p className="font-medium">R$ {notaFiscal.valor_nf.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CPF Tomador</p>
                      <p className="font-medium">{notaFiscal.cpf_tomador}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Emissor</p>
                      <p className="font-medium">{notaFiscal.emissor_nf}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data Emissão</p>
                      <p className="font-medium">{new Date(notaFiscal.data_emissao).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  
                  {notaFiscal.observacoes && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">Observações</p>
                      <p className="text-sm">{notaFiscal.observacoes}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditNotaFiscal(notaFiscal)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteNotaFiscal(notaFiscal.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <NotaFiscalForm
        isOpen={isFormOpen}
        onClose={handleCloseNotaFiscalForm}
        notaFiscalToEdit={notaFiscalToEdit}
      />
    </div>
  );
};