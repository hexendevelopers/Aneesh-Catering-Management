
import { orderService, OrderData } from './orderService';

export interface DashboardKPIs {
  todayOrders: number;
  cookedOrders: number;
  completedOrders: number;
  tomorrowOrders: number;
}

export interface OrderWithStatus extends OrderData {
  orderId: string;
  displayStatus: string;
  timeAgo: string;
}

export const dashboardService = {
  // Get today's date in YYYY-MM-DD format
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  },

  // Get tomorrow's date in YYYY-MM-DD format
  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  },

  // Calculate time ago from timestamp
  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const orderTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  },

  // Get dashboard KPIs
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    try {
      const allOrders = await orderService.getAllOrders();
      const today = this.getTodayDate();
      const tomorrow = this.getTomorrowDate();

      const todayOrders = allOrders.filter(order => order.date === today);
      const tomorrowOrders = allOrders.filter(order => order.date === tomorrow);
      
      const cookedOrders = allOrders.filter(order => 
        order.cookStatus === 'preparing' || order.cookStatus === 'ready'
      );
      
      const completedOrders = allOrders.filter(order => 
        order.cookStatus === 'delivered'
      );

      return {
        todayOrders: todayOrders.length,
        cookedOrders: cookedOrders.length,
        completedOrders: completedOrders.length,
        tomorrowOrders: tomorrowOrders.length
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching dashboard KPIs:', error);
      return {
        todayOrders: 0,
        cookedOrders: 0,
        completedOrders: 0,
        tomorrowOrders: 0
      };
    }
  },

  // Get today's orders
  async getTodayOrders(): Promise<OrderWithStatus[]> {
    try {
      const allOrders = await orderService.getAllOrders();
      const today = this.getTodayDate();
      
      return allOrders
        .filter(order => order.date === today && order.orderId)
        .map(order => ({
          ...order,
          orderId: order.orderId!,
          displayStatus: this.getDisplayStatus(order.cookStatus || 'pending'),
          timeAgo: order.createdAt ? this.getTimeAgo(order.createdAt) : 'Unknown'
        }))
        .sort((a, b) => {
          // Sort by creation time, newest first
          const timeA = new Date(a.createdAt || '').getTime();
          const timeB = new Date(b.createdAt || '').getTime();
          return timeB - timeA;
        });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching today orders:', error);
      return [];
    }
  },

  // Get tomorrow's orders
  async getTomorrowOrders(): Promise<OrderWithStatus[]> {
    try {
      const allOrders = await orderService.getAllOrders();
      const tomorrow = this.getTomorrowDate();
      
      return allOrders
        .filter(order => order.date === tomorrow && order.orderId)
        .map(order => ({
          ...order,
          orderId: order.orderId!,
          displayStatus: this.getDisplayStatus(order.cookStatus || 'pending'),
          timeAgo: order.createdAt ? this.getTimeAgo(order.createdAt) : 'Unknown'
        }))
        .sort((a, b) => {
          // Sort by creation time, newest first
          const timeA = new Date(a.createdAt || '').getTime();
          const timeB = new Date(b.createdAt || '').getTime();
          return timeB - timeA;
        });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching tomorrow orders:', error);
      return [];
    }
  },

  // Get display status for orders
  getDisplayStatus(cookStatus: string): string {
    switch (cookStatus) {
      case 'pending':
        return 'Pending';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'delivered':
        return 'Delivered';
      default:
        return 'Pending';
    }
  },

  // Get status badge variant
  getStatusBadgeVariant(cookStatus: string): "default" | "secondary" | "outline" | "destructive" {
    switch (cookStatus) {
      case 'pending':
        return 'secondary';
      case 'preparing':
        return 'default';
      case 'ready':
        return 'outline';
      case 'delivered':
        return 'default';
      default:
        return 'secondary';
    }
  }
}; 