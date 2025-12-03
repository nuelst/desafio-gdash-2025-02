import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { usersApi } from '../core/api';
import type { UpdateUserDto } from '../core/validation';
import { useAuthStore } from '../stores';

export const useProfile = () => {
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

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    const userId = user?.id || user?._id;
    if (!userId) {
      toast.error('Usuário não encontrado');
      return;
    }

    const updateData: UpdateUserDto = {
      name: formData.name,
      email: formData.email,
    };

    if (formData.password && formData.password.trim() !== '') {
      updateData.password = formData.password;
    }

    const updatePromise = usersApi.update(userId, updateData).then(() => {
      const updatedUser = { ...user, ...updateData };
      setUser(updatedUser);
      setShowEditModal(false);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    });

    toast.promise(updatePromise, {
      loading: 'Atualizando perfil...',
      success: 'Perfil atualizado com sucesso!',
      error: (error) => (error instanceof Error ? error.message : 'Erro ao atualizar perfil'),
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
      error: (error) => (error instanceof Error ? error.message : 'Erro ao excluir conta'),
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

  return {
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
  };
};

