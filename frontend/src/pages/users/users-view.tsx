import { Plus } from 'lucide-react';
import { useState } from 'react';
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
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { UsersDataTable } from '../../components/users/users-data-table';
import { DEFAULT_PASSWORD } from '../../core/config/constants';
import { type CreateUserDto, type UpdateUserDto } from '../../core/validation';
import { useAuthStore } from '../../stores/auth.store';
import { useUsersViewModel } from './users-view-model';

export default function UsersView() {
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsersViewModel();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [editingUser, setEditingUser] = useState<{ id: string; email: string; name: string; role?: string } | null>(null);
  const [resetPassword, setResetPassword] = useState(false);
  const [formData, setFormData] = useState<CreateUserDto & { password?: string }>({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      // Editar: construir UpdateUserDto sem password se resetPassword não estiver marcado
      const updateData: UpdateUserDto = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      // Só incluir password se o checkbox "Reset Password" estiver marcado
      if (resetPassword) {
        updateData.password = DEFAULT_PASSWORD;
      }

      const updatePromise = updateUser(editingUser.id, updateData);

      toast.promise(updatePromise, {
        loading: 'Atualizando usuário...',
        success: (result) => {
          if (result.success) {
            setShowModal(false);
            setEditingUser(null);
            setResetPassword(false);
            setFormData({ name: '', email: '', password: '', role: 'user' });
            return 'Usuário atualizado com sucesso!';
          } else {
            throw new Error(result.error || 'Erro ao atualizar usuário');
          }
        },
        error: (error) => error instanceof Error ? error.message : 'Erro ao atualizar usuário',
      });
    } else {
      // Criar: usar senha padrão
      const createData: CreateUserDto = {
        name: formData.name,
        email: formData.email,
        password: DEFAULT_PASSWORD, // Senha padrão ao criar
        role: formData.role,
      };

      const createPromise = createUser(createData);

      toast.promise(createPromise, {
        loading: 'Criando usuário...',
        success: (result) => {
          if (result.success) {
            setShowModal(false);
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'user' });
            return `Usuário ${formData.name} criado com sucesso!`;
          } else {
            throw new Error(result.error || 'Erro ao criar usuário');
          }
        },
        error: (error) => error instanceof Error ? error.message : 'Erro ao criar usuário',
      });
    }
  };

  const handleEdit = (user: { id: string; email: string; name: string; role?: string }) => {
    setEditingUser(user);
    setResetPassword(false);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: (user.role as 'user' | 'admin') || 'user',
    });
    setShowModal(true);
  };

  const handleDeleteClick = (user: { id: string; name: string }) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    const deletePromise = deleteUser(userToDelete.id);

    toast.promise(deletePromise, {
      loading: 'Excluindo usuário...',
      success: (result) => {
        if (result.success) {
          setShowDeleteDialog(false);
          setUserToDelete(null);
          return 'Usuário excluído com sucesso!';
        } else {
          throw new Error(result.error || 'Erro ao excluir usuário');
        }
      },
      error: (error) => error instanceof Error ? error.message : 'Erro ao excluir usuário',
    });
  };

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Erro: {error instanceof Error ? error.message : String(error)}</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
        {isAdmin && (
          <Button
            onClick={() => {
              setEditingUser(null);
              setResetPassword(false);
              setFormData({ name: '', email: '', password: '', role: 'user' });
              setShowModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden p-6">
        <UsersDataTable
          data={users}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          isAdmin={isAdmin}
        />
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Atualize as informações do usuário' : 'Preencha os dados para criar um novo usuário'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="basic">
                <AccordionTrigger>Informações Básicas</AccordionTrigger>
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
                <AccordionTrigger>Segurança e Permissões</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {!editingUser && (
                      <div className="text-sm text-muted-foreground">
                        A senha padrão será definida automaticamente para este usuário.
                      </div>
                    )}
                    {editingUser && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="resetPassword"
                          checked={resetPassword}
                          onCheckedChange={(checked) => setResetPassword(checked === true)}
                        />
                        <Label
                          htmlFor="resetPassword"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Redefinir senha para a senha padrão
                        </Label>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="role">Papel (Role)</Label>
                      <Select
                        value={formData.role || 'user'}
                        onValueChange={(value) => setFormData({ ...formData, role: value as 'user' | 'admin' })}
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Selecione o papel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

