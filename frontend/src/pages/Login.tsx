import { Cloud } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/login-form';
import { authApi } from '../core/api';
import { handleApiError } from '../core/utils';
import { loginSchema } from '../core/validation';
import { useAuthStore } from '../stores';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (email: string, password: string) => {
    setError('');
    setLoading(true);

    try {
      const validated = loginSchema.parse({ email, password });

      const response = await authApi.login(validated);
      const { access_token, user } = response.data;

      setAuth(user, access_token);

      await new Promise((resolve) => setTimeout(resolve, 100));

      navigate('/');
    } catch (err: any) {
      if (err.errors) {
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
            Faça login para acessar o sistema
          </p>
        </div>
        <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />
      </div>
    </div>
  );
}

