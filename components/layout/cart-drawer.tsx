'use client';

import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { api, imageUrl } from '@/lib/api';
import { formatPrice, getFinalPrice, cn } from '@/lib/utils';
import { toast } from 'sonner';

export function CartDrawer() {
  const { cart, isOpen, closeDrawer, setCart } = useCartStore();
  const { user } = useAuthStore();

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
      toast.error('No se pudo actualizar el carrito');
    }
  };

  if (!user) return null;

  return (
    <Sheet open={isOpen} onOpenChange={closeDrawer}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart size={20} /> Carrito
          </SheetTitle>
        </SheetHeader>

        {!cart || cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <ShoppingCart size={48} className="mb-3 text-gray-200" />
            <p className="text-sm">Tu carrito está vacío</p>
            <Link
              href="/products"
              onClick={closeDrawer}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-4')}
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {cart.items.map((item) => {
                const final = getFinalPrice(item.product.price, item.product.discount);
                const img = imageUrl(item.product.imageUrl);
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-16 w-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-300">
                          <ShoppingCart size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-sm text-blue-700 font-semibold">{formatPrice(final)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={12} />
                        </Button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-400 ml-auto"
                          onClick={() => updateQuantity(item.id, 0)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator />

            <div className="space-y-3 pt-3">
              {cart.totalSaved > 0 && (
                <div className="flex justify-between text-sm text-green-700">
                  <span>Ahorraste</span>
                  <span className="font-medium">-{formatPrice(cart.totalSaved)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className={cn(buttonVariants(), 'w-full justify-center')}
              >
                Ir al checkout
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
