'use client';

/**
 * Checkout — flujo de compra en pasos:
 * 1. Revisión del pedido
 * 2. (Opcional) Subir certificado si algún producto lo requiere
 * 3. Confirmación con saldo disponible
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertTriangle, Wallet, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { api, imageUrl } from '@/lib/api';
import { formatPrice, getFinalPrice } from '@/lib/utils';
import type { Wallet as WalletType } from '@/lib/types';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, setCart, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [certFile, setCertFile] = useState<File | null>(null);

  const needsCertificate = cart?.items.some((i) => i.product.requiresCertificate) ?? false;

  useEffect(() => {
    const loadData = async () => {
      const [cartRes, walletRes] = await Promise.all([
        api.get('/cart'),
        api.get('/wallet/my'),
      ]);
      setCart(cartRes.data);
      setWallet(walletRes.data);
      setLoading(false);
    };
    loadData().catch(() => setLoading(false));
  }, [setCart]);

  const handlePlaceOrder = async () => {
    try {
      setPlacing(true);
      const res = await api.post('/orders');
      const orderId = res.data.id;

      // Si hay certificado, subirlo vinculado a la orden
      if (certFile) {
        const formData = new FormData();
        formData.append('certificate', certFile);
        formData.append('orderId', orderId);
        await api.post('/certificates/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      clearCart();
      toast.success('Pedido realizado con éxito');
      router.push(`/orders?new=${orderId}`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? 'No se pudo realizar el pedido');
    } finally {
      setPlacing(false);
      setConfirmOpen(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Cargando...</div>;
  }

  if (!cart || cart.items.length === 0) {
    router.push('/products');
    return null;
  }

  const hasSufficientBalance = wallet ? wallet.balance >= cart.total : false;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Confirmar pedido</h1>

      {/* Ítems del pedido */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 mb-4">
        <h2 className="font-semibold text-gray-800">Productos</h2>
        {cart.items.map((item) => {
          const final = getFinalPrice(item.product.price, item.product.discount);
          const img = imageUrl(item.product.imageUrl);
          return (
            <div key={item.id} className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={item.product.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.product.name}</p>
                <p className="text-xs text-gray-400">x{item.quantity}</p>
              </div>
              <p className="text-sm font-semibold">{formatPrice(final * item.quantity)}</p>
            </div>
          );
        })}
        <Separator />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{formatPrice(cart.total)}</span>
        </div>
      </div>

      {/* Saldo disponible */}
      <div className={`rounded-xl border p-5 mb-4 ${hasSufficientBalance ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center gap-2">
          <Wallet size={18} className={hasSufficientBalance ? 'text-green-700' : 'text-red-700'} />
          <p className={`font-semibold ${hasSufficientBalance ? 'text-green-700' : 'text-red-700'}`}>
            {hasSufficientBalance ? 'Saldo suficiente' : 'Saldo insuficiente'}
          </p>
        </div>
        <p className="text-sm mt-1 text-gray-600">
          Saldo actual: <span className="font-bold">{formatPrice(wallet?.balance ?? 0)}</span>
          {!hasSufficientBalance && (
            <span className="ml-2 text-red-600">
              (faltan {formatPrice(cart.total - (wallet?.balance ?? 0))})
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Hola {user?.name?.split(' ')[0]}, contacta al administrador para recargar tu saldo.
        </p>
      </div>

      {/* Certificado médico (si aplica) */}
      {needsCertificate && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-orange-600" />
            <p className="font-semibold text-orange-800">Se requiere receta médica</p>
          </div>
          <p className="text-sm text-orange-700 mb-3">
            Uno o más productos de tu pedido requieren receta médica. Puedes subirla ahora o presentarla al momento de la entrega.
          </p>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-orange-700 hover:text-orange-900">
            <Upload size={16} />
            {certFile ? certFile.name : 'Subir receta (imagen o PDF)'}
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => setCertFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      )}

      {/* Botón confirmar */}
      <Button
        className="w-full"
        size="lg"
        disabled={!hasSufficientBalance}
        onClick={() => setConfirmOpen(true)}
      >
        <CheckCircle size={18} className="mr-2" />
        {hasSufficientBalance ? 'Confirmar pedido' : 'Saldo insuficiente'}
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar compra?</AlertDialogTitle>
            <AlertDialogDescription>
              Se deducirán <strong>{formatPrice(cart.total)}</strong> de tu saldo.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handlePlaceOrder} disabled={placing}>
              {placing ? 'Procesando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
