
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Mail, Clock } from 'lucide-react';
import { UserInvite } from '@/types/data';
import { userService } from '@/services/userService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ConvitesPendentesProps {
  invites: UserInvite[];
  onRefresh: () => void;
  onResendInvite: (email: string, nome: string, perfil: 'admin' | 'gestor' | 'cuidador') => void;
}

const ConvitesPendentes: React.FC<ConvitesPendentesProps> = ({ invites, onRefresh, onResendInvite }) => {
  const { toast } = useToast();
  const [deletingEmail, setDeletingEmail] = React.useState<string | null>(null);

  const handleDeleteInvite = async (email: string) => {
    try {
      setDeletingEmail(email);
      await userService.deleteInvite(email);
      
      toast({
        title: 'Convite removido',
        description: `O convite para ${email} foi removido.`,
      });
      
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao deletar convite:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível remover o convite.',
      });
    } finally {
      setDeletingEmail(null);
    }
  };

  const getPerfilBadge = (perfil: string) => {
    switch (perfil) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'gestor':
        return <Badge variant="default">Gestor</Badge>;
      case 'cuidador':
        return <Badge variant="secondary">Cuidador</Badge>;
      default:
        return <Badge variant="outline">{perfil}</Badge>;
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (invites.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Convites Pendentes ({invites.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.map((invite) => (
              <TableRow key={invite.id}>
                <TableCell className="font-medium">{invite.nome}</TableCell>
                <TableCell>{invite.email}</TableCell>
                <TableCell>{getPerfilBadge(invite.perfil)}</TableCell>
                <TableCell>
                  <Badge variant={isExpired(invite.expires_at || '') ? "destructive" : "secondary"}>
                    {isExpired(invite.expires_at || '') ? "Expirado" : "Pendente"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {invite.expires_at ? formatDate(invite.expires_at) : 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onResendInvite(invite.email, invite.nome, invite.perfil as 'admin' | 'gestor' | 'cuidador')}
                      title="Reenviar convite"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deletingEmail === invite.email}
                          title="Remover convite"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover convite</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover o convite para <strong>{invite.email}</strong>? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteInvite(invite.email)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ConvitesPendentes;
