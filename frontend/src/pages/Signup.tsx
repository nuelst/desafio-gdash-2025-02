import { Cloud } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupForm } from '../components/signup-form';
import { usersApi } from '../core/api';
import { handleApiError } from '../core/utils';
import { createUserSchema } from '../core/validation';

export default function Signup() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (name: string, email: string, password: string) => {
    setError('');
    setLoading(true);

    try {
      // Validar com Zod e garantir que role seja 'user'
      const validated = createUserSchema.parse({
        name,
        email,
        password,
        role: 'user' // Sempre criar com role user no signup
      });

      await usersApi.create(validated);

      // Redirecionar para login após criar conta
      navigate('/login', {
        state: { message: 'Conta criada com sucesso! Faça login para continuar.' }
      });
    } catch (err: any) {
      if (err.errors) {
        // Erro de validação Zod
        setError(err.errors.map((e: any) => e.message).join(', '));
      } else {
        setError(handleApiError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Cloud className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Weather Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Crie sua conta para começar
          </p>
        </div>
        <SignupForm onSubmit={handleSubmit} loading={loading} error={error} />
      </div>
    </div>
  );
}

