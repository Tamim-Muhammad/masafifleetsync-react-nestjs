import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  AlertTriangle, 
  DollarSign, 
  FileText, 
  Users, 
  Settings,
  Megaphone
} from 'lucide-react';
import logoCustomer from '../../assets/logo/logo-customer.png';

const AdminSidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Dispatch Center', path: '/admin/dispatch', icon: MapPin },
    { name: 'Compliance', path: '/admin/compliance', icon: ShieldCheck },
    { name: 'Fleet Management', path: '/admin/inventory', icon: Truck },
    { name: 'Recovery Dispatch', path: '/admin/recovery', icon: AlertTriangle },
    { name: 'Financials', path: '/admin/financials', icon: DollarSign },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'Users & Roles', path: '/admin/users', icon: Users },
    { name: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B2A4D] text-white flex flex-col h-full shadow-lg">
      {/* Full Logo Image Container */}
      <div className="p-6 border-b border-blue-900/50 flex items-center justify-center">
        <img src={logoCustomer} alt="Al-Waqar Transport Logo" className="w-full max-w-[160px] object-contain" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-blue-100/70 hover:bg-blue-900/40 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-blue-900/50 text-xs text-blue-300 text-center">
        <span>Admin Console v1.0.0</span>
      </div>
    </aside>
  );
};

export default AdminSidebar;