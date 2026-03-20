'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { useState } from 'react';
import { Pill } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', data);
      const { user, accessToken, refreshToken } = res.data;

      // Solo CUSTOMER puede usar la web de usuario final
      if (user.role !== 'CUSTOMER') {
        toast.error('Esta plataforma es solo para clientes');
        return;
      }

      setAuth(user, accessToken, refreshToken);

      // Guardar token en cookie para el middleware (15 min)
      const expires = new Date(Date.now() + 15 * 60 * 1000).toUTCString();
      document.cookie = `pharma-web-token=${accessToken}; expires=${expires}; path=/`;

      toast.success(`Bienvenido, ${user.name.split(' ')[0]}`);
      router.push(callbackUrl);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Pill size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
          <p className="text-gray-500 text-sm mt-1">Accede a tu cuenta de Pharma Hub</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input {...register('email')} type="email" placeholder="cliente@email.com" />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Contraseña</Label>
            <Input {...register('password')} type="password" placeholder="••••••••" />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-blue-600 font-medium hover:underline">
            Regístrate
          </Link>
        </p>

        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
          <p className="font-medium mb-1">Credencial de prueba:</p>
          <p>cliente@pharmahub.com / customer123</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
