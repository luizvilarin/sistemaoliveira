
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { UserPlus, Trash2, Users, KeyRound, Loader2 } from 'lucide-react';
import { Usuario } from '@/types/data';
import { userService } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import UserStatusIndicator from './UserStatusIndicator';
import UserRoleEditor from './UserRoleEditor';

interface UsersListProps {
  users: Usuario[];
  onRefresh: () => void;
  onNewUser: () => void;
  isGestor?: boolean;
}

const UsuariosList: React.FC<UsersListProps> = ({ 
  users, 
  onRefresh, 
  onNewUser, 
  isGestor = false 
}) => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [resettingUser, setResettingUser] = useState<Usuario | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPassword = async () => {
    if (!resettingUser) return;
    if (newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Senha fraca',
        description: 'A senha deve ter pelo menos 6 caracteres.',
      });
      return;
    }
    
    setIsResetting(true);
    try {
      await userService.resetPassword(resettingUser.id, newPassword);
      
      toast({
        title: 'Senha alterada',
        description: `A senha de ${resettingUser.nome} foi alterada com sucesso!`,
      });
      
      setResettingUser(null);
      setNewPassword('');
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao alterar senha',
        description: error.message || 'Não foi possível alterar a senha. Tente novamente.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string, userProfile: string) => {
    setDeletingUserId(userId);
    
    try {
      await userService.deleteUser(userId);
      
      toast({
        title: 'Usuário removido',
        description: `${userName} foi removido do sistema com sucesso.`,
      });
      
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao remover usuário',
        description: error.message || 'Não foi possível remover o usuário. Tente novamente.',
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const canDeleteUser = (targetUserPerfil: string) => {
    return userService.canGestorDeleteUser(userProfile?.perfil || '', targetUserPerfil);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'gestor':
        return 'bg-blue-100 text-blue-700';
      case 'cuidador':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPerfilLabel = (perfil: string) => {
    switch (perfil) {
      case 'admin':
        return 'Admin';
      case 'gestor':
        return 'Gestor';
      case 'cuidador':
        return 'Cuidador';
      default:
        return perfil;
    }
  };

  const isAdminOrAdminPlus = userProfile?.perfil === 'admin' || userProfile?.perfil === 'admin_plus';

  return (
    <>
      <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <CardTitle>Usuários ({users.length})</CardTitle>
          </div>
          <Button onClick={onNewUser} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Convidar Usuário
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || ''} alt={user.nome} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.nome)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{user.nome}</h4>
                      <UserStatusIndicator 
                        status={user.status_online as 'online' | 'offline' | 'ausente' | 'ocupado' | 'invisivel' || 'offline'} 
                        size="sm" 
                      />
                      {user.email === 'luizvilarinho.nave@gmail.com' && (
                        <Badge variant="outline" className="text-xs">
                          Técnico
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getPerfilColor(user.perfil)}>
                        {getPerfilLabel(user.perfil)}
                      </Badge>
                      {user.ultima_atividade && (
                        <span className="text-xs text-gray-400">
                          Última atividade: {new Date(user.ultima_atividade).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <UserRoleEditor 
                    user={user} 
                    onRoleUpdated={onRefresh}
                  />

                  {isAdminOrAdminPlus && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      onClick={() => setResettingUser(user)}
                      title="Alterar Senha"
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {user.canDelete && canDeleteUser(user.perfil) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deletingUserId === user.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover usuário</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover <strong>{user.nome}</strong> do sistema?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.id, user.nome, user.perfil)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhum usuário encontrado</p>
            <p className="text-sm">Comece convidando o primeiro usuário para o sistema.</p>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Reset Password Dialog */}
    <Dialog open={resettingUser !== null} onOpenChange={(open) => { if (!open) { setResettingUser(null); setNewPassword(''); } }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Alterar Senha de {resettingUser?.nome}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nova Senha</label>
            <Input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="Mínimo 6 caracteres" 
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setResettingUser(null); setNewPassword(''); }} disabled={isResetting}>
              Cancelar
            </Button>
            <Button onClick={handleResetPassword} disabled={isResetting || newPassword.length < 6}>
              {isResetting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Alterar Senha
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </>
  );
};

export default UsuariosList;
