'use client';

/**
 * ProductCard — tarjeta de producto reutilizable en el catálogo.
 *
 * Al hacer clic en "Agregar":
 * - Si no hay sesión → redirige a /login
 * - Si hay sesión → llama POST /cart y abre el drawer
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { api, imageUrl } from '@/lib/api';
import { formatPrice, getFinalPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { toast } from 'sonner';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setCart, openDrawer } = useCartStore();
  const [adding, setAdding] = useState(false);

  const finalPrice = getFinalPrice(product.price, product.discount);
  const img = imageUrl(product.imageUrl);

  const handleAddToCart = async () => {
    if (!user) {
      router.push(`/login?callbackUrl=/products/${product.id}`);
      return;
    }
    try {
      setAdding(true);
      await api.post('/cart', { productId: product.id, quantity: 1 });
      const { data } = await api.get('/cart');
      setCart(data);
      openDrawer();
    } catch {
      toast.error('No se pudo agregar al carrito');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Imagen */}
      <Link href={`/products/${product.id}`}>
        <div className="h-44 bg-gray-100 relative overflow-hidden">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={product.name} className="h-full w-full object-cover hover:scale-105 transition-transform" />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-300">
              <ShoppingCart size={32} />
            </div>
          )}
          {product.discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500">
              -{product.discount}%
            </Badge>
          )}
          {product.requiresCertificate && (
            <div className="absolute top-2 right-2 bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle size={10} /> Receta
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/products/${product.id}`}>
          <p className="font-medium text-sm text-gray-900 leading-tight line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </p>
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">{product.category.name}</p>

        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <div>
            <p className="font-bold text-gray-900">{formatPrice(finalPrice)}</p>
            {product.discount > 0 && (
              <p className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</p>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className="flex-shrink-0"
          >
            {product.stock === 0 ? 'Sin stock' : adding ? '...' : (
              <><ShoppingCart size={14} className="mr-1" /> Agregar</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
