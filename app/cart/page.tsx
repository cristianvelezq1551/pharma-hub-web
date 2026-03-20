'use client';

/**
 * Página de carrito — protegida por el middleware.
 * Muestra los ítems del carrito con controles de cantidad.
 */
import { useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/cart.store';
import { api, imageUrl } from '@/lib/api';
import { formatPrice, getFinalPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

export default function CartPage() {
  const { cart, setCart } = useCartStore();
  const [loading, setLoading] = useState(!cart);

  useEffect(() => {
    if (!cart) {
      api.get('/cart')
        .then((res) => setCart(res.data))
        .finally(() => setLoading(false));
    }
  }, [cart, setCart]);

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity === 0) {
        await api.delete(`/cart/${itemId}`);
      } else {
        await api.patch(`/cart/${itemId}`, { quantity });
      }
      const { data } = await api.get('/cart');
      setCart(data);
    } catch {
      toast.error('No se pudo actualizar');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingCart size={56} className="mx-auto mb-4 text-gray-200" />
        <h2 className="text-xl font-bold text-gray-700">Tu carrito está vacío</h2>
        <p className="text-gray-400 mt-1 mb-6">Agrega productos para continuar</p>
        <Link href="/products" className={cn(buttonVariants())}>Ver catálogo</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de ítems */}
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map((item) => {
            const final = getFinalPrice(item.product.price, item.product.discount);
            const img = imageUrl(item.product.imageUrl);
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
                <div className="h-20 w-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={item.product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-300">
                      <ShoppingCart size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-400">{item.product.category.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button className="px-2 py-1 hover:bg-gray-50" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button className="px-2 py-1 hover:bg-gray-50" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900">{formatPrice(final * item.quantity)}</p>
                      <button className="text-red-400 hover:text-red-600" onClick={() => updateQuantity(item.id, 0)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 h-fit sticky top-24">
          <h2 className="font-bold text-gray-900 mb-4">Resumen del pedido</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            {cart.totalSaved > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Descuentos</span>
                <span>-{formatPrice(cart.totalSaved)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-base text-gray-900">
              <span>Total</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
          </div>
          <Link href="/checkout" className={cn(buttonVariants(), 'w-full justify-center mt-4')}>
            Proceder al pago <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
