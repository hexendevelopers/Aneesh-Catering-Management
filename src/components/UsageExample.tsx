import React from 'react';
import { TodaysOrdersTable, TodaysOrdersCompactTable } from './TodaysOrdersTable';
import { OrderWithStatus } from '@/lib/pdf-utils';

// Example usage component
export const UsageExample: React.FC = () => {
  // Sample orders data
  const sampleOrders: OrderWithStatus[] = [
    {
      receiptNo: 'R001',
      orderId: 'ORD001',
      name: 'أحمد محمد', // Arabic name
      orderDetails: 'شاورما دجاج مع بطاطس', // Arabic order details
      phoneNumber: '+966-50-123-4567',
      deliveryType: 'Delivery',
      date: '2024-01-15',
      time: '14:30',
      status: 'completed',
      totalAmount: 45.50,
      address: '123 Main Street, Riyadh'
    },
    {
      receiptNo: 'R002',
      orderId: 'ORD002',
      name: 'John Smith', // English name
      orderDetails: 'Chicken Shawarma with Fries and Drink',
      phoneNumber: '+966-50-987-6543',
      deliveryType: 'Pickup',
      date: '2024-01-15',
      time: '15:45',
      status: 'pending',
      totalAmount: 32.00
    }
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Today's Orders - Full Table View</h2>
        <TodaysOrdersTable orders={sampleOrders} language="en" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Today's Orders - Compact View</h2>
        <TodaysOrdersCompactTable orders={sampleOrders} language="en" />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Key Features:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ <strong>Download Receipt</strong> button for each order (English only)</li>
          <li>✅ Individual PDF receipt with all order details</li>
          <li>✅ Supports both Arabic and English text in orders</li>
          <li>✅ Professional receipt layout with proper formatting</li>
          <li>✅ Automatic filename generation (receipt-{'{receiptNo}'}-{'{customerName}'}.pdf)</li>
        </ul>
      </div>
    </div>
  );
};

export default UsageExample;
