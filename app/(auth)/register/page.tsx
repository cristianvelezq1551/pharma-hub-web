'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';
import { Pill } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  phone: z.string().optional(),
  address: z.string().optional(),
});
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);
      await api.post('/auth/register', data);
      toast.success('Cuenta creada. Inicia sesión para continuar');
      router.push('/login');
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Pill size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">Regístrate para comprar en Pharma Hub</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Nombre completo</Label>
            <Input {...register('name')} placeholder="Juan Pérez" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input {...register('email')} type="email" placeholder="tu@email.com" />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Contraseña</Label>
            <Input {...register('password')} type="password" placeholder="Mínimo 6 caracteres" />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Teléfono (opcional)</Label>
            <Input {...register('phone')} type="tel" placeholder="300 123 4567" />
          </div>
          <div className="space-y-1">
            <Label>Dirección (opcional)</Label>
            <Input {...register('address')} placeholder="Calle 123 #45-67" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
