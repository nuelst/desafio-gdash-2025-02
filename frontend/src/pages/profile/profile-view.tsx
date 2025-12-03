import { Edit, Trash2, User } from 'lucide-react';
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
import { useProfile } from '../../hooks';

export default function ProfileView() {
  const {
    user,
    showEditModal,
    showDeleteDialog,
    formData,
    setShowEditModal,
    setShowDeleteDialog,
    setFormData,
    handleEditClick,
    handleSubmit,
    handleDelete,
    getInitials,
  } = useProfile();

  return (
    <div className="px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                  <AvatarImage src="" alt={user?.name} />
                  <AvatarFallback className="text-base sm:text-lg">
                    {user?.name ? getInitials(user.name) : <User className="h-6 w-6 sm:h-8 sm:w-8" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg sm:text-xl">Meu Perfil</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Gerencie suas informações pessoais e configurações da conta
                  </CardDescription>
                </div>
              </div>
              <Button onClick={handleEditClick} className="w-full sm:w-auto">
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
              <Button type="button" variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="w-[95vw] sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
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
                          onChange={(e) =>
                            setFormData({ ...formData, confirmPassword: e.target.value })
                          }
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
              Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá
              todos os seus dados de nossos servidores.
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
