'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconChefHat, IconRefresh } from '@tabler/icons-react';
import { orderService, OrderData } from '@/services/orderService';
import { useLanguage } from '@/contexts/language-context';

export default function CookPage() {
  const [activeOrders, setActiveOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchKitchenData = async () => {
      try {
        setLoading(true);
        const allOrders = await orderService.getAllOrders();
        
        // Filter active orders (pending, preparing, ready)
        const active = allOrders.filter(order => 
          order.cookStatus === 'pending' || 
          order.cookStatus === 'preparing' || 
          order.cookStatus === 'ready'
        );

        setActiveOrders(active);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching kitchen data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKitchenData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchKitchenData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (cookStatus: string) => {
    switch (cookStatus) {
      case 'pending':
        return <Badge variant="secondary">{t('status.pending')}</Badge>;
      case 'preparing':
        return <Badge variant="default">{t('status.preparing')}</Badge>;
      case 'ready':
        return <Badge variant="outline">{t('status.ready')}</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-green-100 text-green-800">{t('status.delivered')}</Badge>;
      default:
        return <Badge variant="outline">{t('status.unknown')}</Badge>;
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: 'preparing' | 'ready' | 'delivered') => {
    try {
      // Find the current order to preserve all data
      const currentOrder = activeOrders.find(order => order.orderId === orderId);
      if (!currentOrder) {
        // eslint-disable-next-line no-console
        console.error('Order not found:', orderId);
        return;
      }

      // Update the order with all existing data plus new status
      const updatedOrder = {
        ...currentOrder,
        cookStatus: newStatus
      };

      await orderService.updateOrder(orderId, updatedOrder);
      
      // Update local state immediately for better UX
      setActiveOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId 
            ? { ...order, cookStatus: newStatus }
            : order
        )
      );

      // Also refresh from server to ensure consistency
      const allOrders = await orderService.getAllOrders();
      const active = allOrders.filter(order => 
        order.cookStatus === 'pending' || 
        order.cookStatus === 'preparing' || 
        order.cookStatus === 'ready'
      );
      setActiveOrders(active);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('message.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('page.cook')}</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <IconRefresh className="mr-2 h-4 w-4" />
            {t('action.refresh')}
          </Button>
        </div>
      </div>

      {/* Orders as Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeOrders.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <IconChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t('cook.noOrders')}</p>
          </div>
        ) : (
          activeOrders.map((order) => (
            <Card key={order.orderId} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{order.name}</CardTitle>
                    <CardDescription>#{order.receiptNo}</CardDescription>
                  </div>
                  {getStatusBadge(order.cookStatus || 'pending')}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Details */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('cook.orderDetails')}</p>
                  <p className="text-sm bg-muted p-3 rounded border">
                    {order.orderDetails || t('message.noOrderDetails')}
                  </p>
                </div>

                {/* Order Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('info.customer')}:</span>
                    <span>{order.name || t('info.unknownCustomer')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('info.date')}:</span>
                    <span>{order.date || t('info.noDate')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('info.time')}:</span>
                    <span>{order.time || t('info.noTime')}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {order.cookStatus === 'pending' && (
                    <Button 
                      className="flex-1"
                      onClick={() => handleStatusUpdate(order.orderId!, 'preparing')}
                    >
                      {t('button.startPreparing')}
                    </Button>
                  )}
                  {order.cookStatus === 'preparing' && (
                    <Button 
                      className="flex-1"
                      onClick={() => handleStatusUpdate(order.orderId!, 'ready')}
                    >
                      {t('button.markReady')}
                    </Button>
                  )}
                  {order.cookStatus === 'ready' && (
                    <Button 
                      className="flex-1"
                      variant="outline"
                      onClick={() => handleStatusUpdate(order.orderId!, 'delivered')}
                    >
                      {t('button.markDelivered')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}