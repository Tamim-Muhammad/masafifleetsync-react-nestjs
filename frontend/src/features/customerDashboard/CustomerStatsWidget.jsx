import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle2, Truck, Wallet } from 'lucide-react';
import api from '../../api';

const CustomerStatsWidget = () => {
  const [counts, setCounts] = useState({
    activeOrders: 0,
    completedOrders: 0,
    activeRentals: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    const fetchOrderCounts = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const customerId = storedUser.id || "cmslp0iy30000xcuoff9hgxr7";

        const response = await api.get(`/orders?customerId=${customerId}`);
        const orders = Array.isArray(response.data) ? response.data : (response.data.orders || []);

        // 1. Active Orders: Tracked strictly as Dispatched/Accepted/En Route
        const active = orders.filter(o => ['accepted', 'en route', 'approved'].includes(o.status?.toLowerCase())).length;
        
        // 2. Completed Orders: Tracked as completed or delivered
        const completed = orders.filter(o => ['completed', 'delivered'].includes(o.status?.toLowerCase())).length;
        
        // 3. Active Rentals: Count records where service type includes lease or rental
        const rentals = orders.filter(o => o.serviceType?.toLowerCase().includes('lease') || o.serviceType?.toLowerCase().includes('rental')).length;
        
        // 4. Pending Payments: Tracks active/dispatched COD orders awaiting final settlement or review
        const pendingPay = orders.filter(o => ['accepted', 'en route', 'pending'].includes(o.status?.toLowerCase())).length;

        setCounts({
          activeOrders: active,
          completedOrders: completed,
          activeRentals: rentals,
          pendingPayments: pendingPay
        });
      } catch (error) {
        console.error("Failed to load stats widget counts:", error);
      }
    };

    fetchOrderCounts();
  }, []);

  const stats = [
    { 
      label: 'Active Orders', 
      value: counts.activeOrders.toString(), 
      sub: 'Currently dispatched', 
      icon: <ClipboardList className="w-6 h-6 text-blue-600" />, 
      bg: 'bg-blue-50', 
      path: '/customer/dashboard/my-orders' 
    },
    { 
      label: 'Completed Orders', 
      value: counts.completedOrders.toString(), 
      sub: 'All time', 
      icon: <CheckCircle2 className="w-6 h-6 text-green-600" />, 
      bg: 'bg-green-50', 
      path: '/customer/dashboard/my-orders' 
    },
    { 
      label: 'Active Rentals', 
      value: counts.activeRentals.toString(), 
      sub: 'Currently', 
      icon: <Truck className="w-6 h-6 text-indigo-600" />, 
      bg: 'bg-indigo-50', 
      path: '/customer/dashboard/my-orders' 
    },
    { 
      label: 'Pending Payments', 
      value: counts.pendingPayments.toString(), 
      sub: 'COD settlement due', 
      icon: <Wallet className="w-6 h-6 text-orange-500" />, 
      bg: 'bg-orange-50', 
      path: '/customer/dashboard/history' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Link 
          key={index} 
          to={stat.path}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          {/* Icon Container */}
          <div className={`p-3 rounded-full ${stat.bg}`}>
            {stat.icon}
          </div>
          
          {/* Text Content */}
          <div className="flex-1">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <h4 className="text-2xl font-bold text-gray-800">{stat.value}</h4>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </div>
          
          {/* Arrow Icon */}
          <span className="text-gray-300">→</span>
        </Link>
      ))}
    </div>
  );
};

export default CustomerStatsWidget;