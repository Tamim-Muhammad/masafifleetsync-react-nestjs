import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Navigation, 
  Clock, 
  Wallet, 
  Calendar, 
  ArrowRight,
  Bell,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { driverDashboardService } from './DriverDashboard.service';
import api from '../../api';

// Fix Leaflet default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DriverDashboardHome = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        let driverId = 'driver-1'; 
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed && parsed.id) {
              driverId = parsed.id;
            }
          } catch (e) {
            // ignore JSON parse error
          }
        }
        const data = await driverDashboardService.getAssignedOrders(driverId);
        setOrders(Array.isArray(data) ? data : (data.orders || []));
      } catch (err) {
        console.error('Failed to fetch assigned orders:', err);
        setError('Failed to load assigned orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const response = await api.get('/announcements');
        setAnnouncements(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchOrders();
    fetchAnnouncements();
  }, []);

  const driverPosition = [25.3048, 56.1265]; 
  const customerPosition = [25.1222, 56.3415]; 
  const routeCoordinates = [driverPosition, [25.2100, 56.2300], customerPosition];

  const currentOrder = orders.length > 0 ? orders[0] : null;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. Compliance Status Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-500 text-white p-3 rounded-xl shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-emerald-800 font-bold text-lg tracking-tight">STATUS: CLEARED FOR DISPATCH</h3>
            <p className="text-gray-500 text-sm mt-0.5">All your documents are valid. You are good to go!</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/driver/compliance')}
          className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-2xs flex items-center space-x-2 cursor-pointer"
        >
          <span>View Compliance Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Document Expiry Grid Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Driving License</h4>
                <p className="text-xs text-gray-400 mt-0.5">Expiry: 17 Dec 2026</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600">42</span>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Days Left</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center space-x-1.5 text-emerald-600 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Valid</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Insurance</h4>
                <p className="text-xs text-gray-400 mt-0.5">Expiry: 28 Jan 2026</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-blue-600">84</span>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Days Left</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center space-x-1.5 text-emerald-600 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Valid</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Vehicle Registration</h4>
                <p className="text-xs text-gray-400 mt-0.5">Expiry: 05 Feb 2026</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-amber-600">92</span>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Days Left</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center space-x-1.5 text-emerald-600 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Valid</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base">Current Assignment</h3>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
                {currentOrder ? `JOB #${currentOrder.id.slice(0, 8).toUpperCase()}` : 'NO ACTIVE JOB'}
              </span>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-xs text-gray-500 font-medium">Loading assigned orders...</p>
              </div>
            ) : error ? (
              <div className="py-8 px-4 bg-red-50 rounded-xl border border-red-100 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                <p className="text-xs text-red-700 font-semibold">{error}</p>
              </div>
            ) : !currentOrder ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">No Assigned Orders</h4>
                  <p className="text-xs text-gray-400 mt-1">You currently have no active orders assigned to you.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Customer</p>
                  <h4 className="font-extrabold text-gray-800 text-base mt-0.5">{currentOrder.customer?.fullName || 'Valued Customer'}</h4>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Service Type</p>
                  <p className="font-semibold text-gray-700 text-sm mt-0.5">Water Tanker Delivery</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Volume</p>
                  <p className="font-semibold text-gray-900 text-base mt-0.5">{currentOrder.volume?.toLocaleString()} Gallons</p>
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate('/driver/assignments')}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm cursor-pointer"
          >
            View Assignment Details
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base">Job Progress</h3>
              <div className="flex items-center space-x-1.5 text-blue-600 text-xs font-bold">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
                <span>Live Tracking</span>
              </div>
            </div>
          </div>
          <div className="relative h-44 rounded-xl overflow-hidden border border-gray-200 z-10 mt-4">
            <MapContainer 
              center={driverPosition} 
              zoom={10} 
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={driverPosition}><Popup>Your Tanker Location</Popup></Marker>
              <Marker position={customerPosition}><Popup>Delivery Destination</Popup></Marker>
              <Polyline positions={routeCoordinates} color="#2563eb" weight={4} dashArray="5, 5" />
            </MapContainer>
          </div>
        </div>

        {/* Right Column: Notifications & Announcements */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900 text-sm">Notifications</h4>
              <button onClick={() => navigate('/driver/notifications')} className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">View All</button>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-gray-500">No new alerts.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900 text-sm">Announcements</h4>
              <button onClick={() => alert("System Notice: All active logistics alerts displayed.")} className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">View All</button>
            </div>
            <div className="space-y-3">
              {announcements.length > 0 ? (
                announcements.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="bg-blue-50 p-2 rounded-lg h-fit">
                      <Bell className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{item.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{item.message}</p>
                      <span className="text-[10px] text-amber-600 font-bold uppercase mt-1 block">{item.priority}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No active broadcast feeds found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboardHome;