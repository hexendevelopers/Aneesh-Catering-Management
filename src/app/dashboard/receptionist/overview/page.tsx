'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconClipboardList, IconClock, IconCircleCheck, IconCalendar, IconPlus } from '@tabler/icons-react';
import { dashboardService, DashboardKPIs, OrderWithStatus } from '@/services/dashboardService';
import { useLanguage } from '@/contexts/language-context';
import Link from 'next/link';

export default function ReceptionistOverviewPage() {
  const [kpis, setKpis] = useState<DashboardKPIs>({
    todayOrders: 0,
    cookedOrders: 0,
    completedOrders: 0,
    tomorrowOrders: 0
  });
  const [todayOrders, setTodayOrders] = useState<OrderWithStatus[]>([]);
  const [tomorrowOrders, setTomorrowOrders] = useState<OrderWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [kpisData, todayData, tomorrowData] = await Promise.all([
          dashboardService.getDashboardKPIs(),
          dashboardService.getTodayOrders(),
          dashboardService.getTomorrowOrders()
        ]);
        
        setKpis(kpisData);
        setTodayOrders(todayData);
        setTomorrowOrders(tomorrowData);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: t('dashboard.todayOrders'),
      value: kpis.todayOrders.toString(),
      description: t('dashboard.ordersForToday'),
      icon: IconClipboardList,
      color: 'text-blue-600'
    },
    {
      title: t('dashboard.cookedOrders'),
      value: kpis.cookedOrders.toString(),
      description: t('dashboard.currentlyCooking'),
      icon: IconClock,
      color: 'text-orange-600'
    },
    {
      title: t('dashboard.completedOrders'),
      value: kpis.completedOrders.toString(),
      description: t('dashboard.deliveredToday'),
      icon: IconCircleCheck,
      color: 'text-green-600'
    },
    {
      title: t('dashboard.tomorrowOrders'),
      value: kpis.tomorrowOrders.toString(),
      description: t('dashboard.ordersForTomorrow'),
      icon: IconCalendar,
      color: 'text-purple-600'
    }
  ];

  const getStatusBadge = (cookStatus: string) => {
    const variant = dashboardService.getStatusBadgeVariant(cookStatus);
    const status = dashboardService.getDisplayStatus(cookStatus);
    
    return <Badge variant={variant}>{t(`status.${status.toLowerCase()}`)}</Badge>;
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    
    if (language === 'en') {
      return `OMR ${num.toFixed(3)}`;
    } else {
      // Arabic format: show as "‏٢٬١٢٢٫٠٠٠ ر.ع."
      return new Intl.NumberFormat('ar-OM', {
        style: 'currency',
        currency: 'OMR',
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      }).format(num);
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
        <h2 className="text-3xl font-bold tracking-tight">{t('page.receptionistDashboard')}</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/dashboard/receptionist/create-order">
              <IconPlus className="mr-2 h-4 w-4" />
              {t('button.createOrder')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today and Tomorrow Orders */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Today Orders */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.todayOrders')}</CardTitle>
            <CardDescription>
              {t('dashboard.ordersScheduledForToday')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayOrders.length === 0 ? (
              <div className="text-center py-8">
                <IconCalendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t('message.noOrdersForToday')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayOrders.map((order) => (
                  <div key={order.orderId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {order.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.orderDetails}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.receiptNo} • {order.timeAgo}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium">{formatCurrency(order.totalPayment)}</span>
                      {getStatusBadge(order.cookStatus || 'pending')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tomorrow Orders */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.tomorrowOrders')}</CardTitle>
            <CardDescription>
              {t('dashboard.ordersScheduledForTomorrow')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tomorrowOrders.length === 0 ? (
              <div className="text-center py-8">
                <IconCalendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t('message.noOrdersForTomorrow')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tomorrowOrders.map((order) => (
                  <div key={order.orderId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {order.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.orderDetails}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.receiptNo} • {order.timeAgo}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium">{formatCurrency(order.totalPayment)}</span>
                      {getStatusBadge(order.cookStatus || 'pending')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 