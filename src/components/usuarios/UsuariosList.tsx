
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, UserPlus, Loader2, User } from 'lucide-react';
import { Usuario } from '@/types/data';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
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

interface UsuariosListProps {
  users: Usuario[];
  onRefresh: () => void;
  onNewUser: () => void;
  isGestor?: boolean;
}

const UsuariosList: React.FC<UsuariosListProps> = ({ users, onRefresh, onNewUser, isGestor = false }) => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [deletingUserId, setDeletingUserId] = React.useState<string | null>(null);

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    try {
      setDeletingUserId(userId);
      await userService.deleteUser(userId);
      
      toast({
        title: 'Usuário deletado',
        description: `O usuário ${userEmail} foi removido do sistema.`,
      });
      
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível deletar o usuário.',
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const canDeleteUser = (targetUser: Usuario) => {
    if (!userProfile) return false;
    
    // Se o usuário alvo é o técnico, não pode deletar
    if (targetUser.email === 'luizvilarinho.nave@gmail.com') return false;
    
    return userService.canGestorDeleteUser(userProfile.perfil, targetUser.perfil);
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Filtrar usuários que o gestor pode ver
  const filteredUsers = isGestor 
    ? users.filter(user => user.email !== 'luizvilarinho.nave@gmail.com')
    : users;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Gestão de Usuários
          </CardTitle>
          <Button onClick={onNewUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Convidar Usuário
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredUsers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || ''} alt={user.nome} />
                        <AvatarFallback className="text-xs">
                          {user.nome ? getInitials(user.nome) : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getPerfilBadge(user.perfil)}</TableCell>
                  <TableCell>
                    <Badge variant={user.ativo ? "default" : "secondary"}>
                      {user.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.email === 'luizvilarinho.nave@gmail.com' ? (
                      <Badge variant="outline" className="text-xs">
                        Técnico
                      </Badge>
                    ) : canDeleteUser(user) ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={deletingUserId === user.id}
                          >
                            {deletingUserId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar usuário</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja deletar o usuário <strong>{user.nome}</strong>? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem permissão</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Nenhum usuário encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsuariosList;
