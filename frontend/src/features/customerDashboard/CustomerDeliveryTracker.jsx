import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { Phone, Truck, Droplets, MapPin, CreditCard, Clock, Package } from 'lucide-react';
import api from '../../api';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const CustomerDeliveryTracker = () => {
  const navigate = useNavigate();
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestOrder = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const customerId = storedUser.id || "cmslp0iy30000xcuoff9hgxr7";

        const response = await api.get(`/orders?customerId=${customerId}`);
        const orders = Array.isArray(response.data) ? response.data : (response.data.orders || []);
        
        if (orders.length > 0) {
          // Prioritize Accepted/Active orders first, otherwise fallback to latest order
          const prioritizedOrder = orders.find(o => o.status === 'Accepted' || o.status === 'En Route') || orders[orders.length - 1];
          setActiveOrder(prioritizedOrder);
        }
      } catch (error) {
        console.error("Failed to fetch active customer delivery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestOrder();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center py-12">
        <p className="text-xs text-gray-400 font-semibold animate-pulse">Loading live delivery telemetry...</p>
      </div>
    );
  }

  if (!activeOrder) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center py-10 space-y-3">
        <Package className="w-10 h-10 text-blue-600 mx-auto" />
        <h3 className="font-bold text-gray-800 text-lg">No Active Deliveries</h3>
        <p className="text-xs text-gray-500">You haven't placed any bulk water orders yet.</p>
        <button 
          onClick={() => navigate('/customer/dashboard/order')}
          className="bg-[#0B2A4D] text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-900 transition cursor-pointer mt-2"
        >
          Order Water Now →
        </button>
      </div>
    );
  }

  const mapCoords = [
    activeOrder.locationLat ? Number(activeOrder.locationLat) : 25.2861,
    activeOrder.locationLng ? Number(activeOrder.locationLng) : 56.3314
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-800 text-lg">Active Delivery</h3>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded-md">
            #{activeOrder.id.slice(-6).toUpperCase()}
          </span>
        </div>
        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {activeOrder.status || 'Pending'}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
          <div className="w-12 h-12 bg-blue-100 text-[#0B2A4D] rounded-full flex items-center justify-center font-bold">
            {activeOrder.driver?.fullName ? activeOrder.driver.fullName.substring(0, 2).toUpperCase() : 'DP'}
          </div>
          <div>
            <p className="font-bold text-gray-800">{activeOrder.driver?.fullName || 'Driver Assignment Pending'}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {activeOrder.driver?.phone || 'Awaiting Dispatch'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-around bg-gray-50 p-4 rounded-xl">
           <div className="flex items-center gap-2">
             <Truck className="w-5 h-5 text-gray-400" />
             <div>
               <p className="text-[10px] uppercase text-gray-400 font-bold">Truck No.</p>
               <p className="text-sm font-bold text-gray-800">{activeOrder.vehicle?.plateNumber || 'Pending'}</p>
             </div>
           </div>
           <div className="flex items-center gap-2">
             <Droplets className="w-5 h-5 text-gray-400" />
             <div>
               <p className="text-[10px] uppercase text-gray-400 font-bold">Capacity</p>
               <p className="text-sm font-bold text-gray-800">{activeOrder.volumeGallons || 5000} Gallons</p>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
           <div className="flex gap-3">
             <MapPin className="w-5 h-5 text-blue-600 mt-1" />
             <div>
               <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Delivery Address</p>
               <p className="text-sm font-medium text-gray-800 leading-tight">{activeOrder.deliveryAddress}</p>
             </div>
           </div>
           <div className="flex gap-3">
             <CreditCard className="w-5 h-5 text-blue-600 mt-1" />
             <div>
               <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">COD Amount</p>
               <p className="text-sm font-bold text-gray-800">AED {activeOrder.price}.00</p>
             </div>
           </div>
           <div className="flex gap-3">
             <Clock className="w-5 h-5 text-blue-600 mt-1" />
             <div>
               <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Status / Timeline</p>
               <p className="text-sm font-bold text-gray-800">{activeOrder.status || 'Pending Dispatch'}</p>
             </div>
           </div>
        </div>

        <div className="h-64 lg:h-48 w-full rounded-xl overflow-hidden border border-gray-100 shadow-inner">
          <MapContainer center={mapCoords} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={mapCoords} />
          </MapContainer>
        </div>
      </div>

      <button 
        onClick={() => navigate('/customer/dashboard/track')}
        className="w-full bg-[#0B2A4D] text-white py-3 rounded-xl font-bold hover:bg-[#153e6d] transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
      >
        Track Live →
      </button>
    </div>
  );
};

export default CustomerDeliveryTracker;