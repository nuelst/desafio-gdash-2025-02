import { type CreateUserDto, type UpdateUserDto } from '../../core/validation';
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from '../../hooks/use-users';

export const useUsersViewModel = () => {
  const usersQuery = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const createUser = async (data: CreateUserDto) => {
    try {
      await createMutation.mutateAsync(data);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao criar usuário' };
    }
  };

  const updateUser = async (id: string, data: UpdateUserDto) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao atualizar usuário' };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao excluir usuário' };
    }
  };

  return {
    users: usersQuery.data || [],
    loading: usersQuery.isLoading,
    error: usersQuery.error,
    reload: () => usersQuery.refetch(),
    createUser,
    updateUser,
    deleteUser,
  };
};

