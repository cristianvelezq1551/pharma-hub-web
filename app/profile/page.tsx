'use client';

/**
 * Perfil del usuario — datos personales, saldo y movimientos del wallet.
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { formatPrice, formatDate, getApiErrorMessage } from '@/lib/utils';
import type { Wallet as WalletType } from '@/lib/types';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name, phone: user.phone ?? '', address: user.address ?? '' });
    }
    api.get('/wallet/my')
      .then((res) => setWallet(res.data))
      .finally(() => setLoading(false));
  }, [user, reset]);

  const onSave = async (data: ProfileForm) => {
    try {
      setSaving(true);
      const res = await api.patch('/users/me', data);
      updateUser(res.data);
      toast.success('Perfil actualizado');
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>

      {/* Datos personales */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <User size={18} className="text-blue-600" />
          <h2 className="font-semibold text-gray-800">Datos personales</h2>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="space-y-1">
            <Label>Nombre completo</Label>
            <Input {...register('name')} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Teléfono</Label>
              <Input {...register('phone')} placeholder="300 123 4567" />
            </div>
            <div className="space-y-1">
              <Label>Dirección</Label>
              <Input {...register('address')} placeholder="Calle 123..." />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={user?.email ?? ''} disabled className="bg-gray-50" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </div>

      {/* Wallet */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={18} className="text-green-600" />
          <h2 className="font-semibold text-gray-800">Mi monedero</h2>
        </div>

        {loading ? (
          <Skeleton className="h-16 w-full rounded-lg" />
        ) : (
          <>
            <div className="bg-green-50 rounded-xl p-5 mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Saldo disponible</p>
                <p className="text-3xl font-bold text-green-900">{formatPrice(wallet?.balance ?? 0)}</p>
              </div>
              <Wallet size={40} className="text-green-200" />
            </div>

            {wallet && wallet.transactions.length > 0 && (
              <>
                <p className="text-sm font-semibold text-gray-700 mb-3">Últimos movimientos</p>
                <div className="space-y-2">
                  {wallet.transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3">
                      {tx.type === 'CREDIT' ? (
                        <ArrowUpCircle size={18} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <ArrowDownCircle size={18} className="text-red-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{tx.description}</p>
                        <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                      </div>
                      <p className={`text-sm font-semibold ${tx.type === 'CREDIT' ? 'text-green-700' : 'text-red-600'}`}>
                        {tx.type === 'CREDIT' ? '+' : '-'}{formatPrice(tx.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
