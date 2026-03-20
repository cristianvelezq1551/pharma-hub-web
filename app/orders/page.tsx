'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils';
import type { Order } from '@/lib/types';
import { toast } from 'sonner';

function OrdersList() {
  const searchParams = useSearchParams();
  const newOrderId = searchParams.get('new');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(newOrderId);

  useEffect(() => {
    api.get('/orders/my-orders')
      .then((res) => {
        setOrders(res.data);
        if (newOrderId) toast.success('Tu pedido fue registrado correctamente');
      })
      .finally(() => setLoading(false));
  }, [newOrderId]);

  if (loading) {
    return (
      <div className="space-y-3 max-w-2xl">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="font-medium">Aún no tienes pedidos</p>
          <p className="text-sm mt-1">Cuando realices tu primera compra aparecerá aquí</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl border transition-all ${order.id === newOrderId ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'}`}
              >
                {/* Cabecera del pedido */}
                <button
                  className="w-full p-4 flex items-center gap-3 text-left"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package size={18} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Pedido #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 hidden sm:block">{formatPrice(order.total)}</p>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {/* Detalle expandido */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.product.name} <span className="text-gray-400">x{item.quantity}</span>
                        </span>
                        <span className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2 mt-2">
                      <span>Total pagado</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                    {order.adminNote && (
                      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 mt-2">
                        <span className="font-medium">Nota del admin:</span> {order.adminNote}
                      </div>
                    )}
                    {/* Badge de estado con color */}
                    <Badge className={`${ORDER_STATUS_COLORS[order.status]} border-0 w-fit`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersList />
    </Suspense>
  );
}
