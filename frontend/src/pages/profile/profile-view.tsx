import { Edit, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { usersApi } from '../../core/api';
import type { UpdateUserDto } from '../../core/validation';
import { useAuthStore } from '../../stores';

export default function ProfileView() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState<UpdateUserDto & { password?: string; confirmPassword?: string }>({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });

  const handleEditClick = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      confirmPassword: '',
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar confirmação de senha se uma nova senha foi fornecida
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    const userId = user?.id || user?._id;
    if (!userId) {
      toast.error('Usuário não encontrado');
      return;
    }

    // Preparar dados para atualização (sem confirmPassword)
    const updateData: UpdateUserDto = {
      name: formData.name,
      email: formData.email,
    };

    // Só incluir password se foi fornecido
    if (formData.password && formData.password.trim() !== '') {
      updateData.password = formData.password;
    }

    const updatePromise = usersApi.update(userId, updateData).then(() => {
      // Atualizar o store com os novos dados
      const updatedUser = { ...user, ...updateData };
      setUser(updatedUser);
      setShowEditModal(false);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    });

    toast.promise(updatePromise, {
      loading: 'Atualizando perfil...',
      success: 'Perfil atualizado com sucesso!',
      error: (error) => error instanceof Error ? error.message : 'Erro ao atualizar perfil',
    });
  };

  const handleDelete = async () => {
    const userId = user?.id || user?._id;
    if (!userId) {
      toast.error('Usuário não encontrado');
      return;
    }

    const deletePromise = usersApi.delete(userId).then(() => {
      logout();
      navigate('/login');
    });

    toast.promise(deletePromise, {
      loading: 'Excluindo conta...',
      success: 'Conta excluída com sucesso',
      error: (error) => error instanceof Error ? error.message : 'Erro ao excluir conta',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" alt={user?.name} />
                  <AvatarFallback className="text-lg">
                    {user?.name ? getInitials(user.name) : <User className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Meu Perfil</CardTitle>
                  <CardDescription>
                    Gerencie suas informações pessoais e configurações da conta
                  </CardDescription>
                </div>
              </div>
              <Button onClick={handleEditClick}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
                <p className="text-base font-medium mt-1">{user?.name || '-'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="text-base font-medium mt-1">{user?.email || '-'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Papel</Label>
                <div className="mt-1">
                  <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                    {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Atualize suas informações pessoais e configurações de segurança
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Accordion type="single" collapsible className="w-full" defaultValue="info">
              <AccordionItem value="info">
                <AccordionTrigger>Informações</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="security">
                <AccordionTrigger>Segurança</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      Deixe em branco para manter a senha atual
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Nova Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        minLength={6}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                    {formData.password && (
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          minLength={6}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente sua
              conta e removerá todos os seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

