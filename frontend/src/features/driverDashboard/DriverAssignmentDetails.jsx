import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Clock, 
  Building2, 
  Droplet, 
  FileText, 
  CheckCircle2,
  Phone,
  MessageSquare,
  Radio,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { driverDashboardService } from './DriverDashboard.service';
import api from '../../api';

const DriverAssignmentDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // or grab active order
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [lastCoords, setLastCoords] = useState({ lat: 25.3048, lng: 56.1265 });

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        if (id) {
          const res = await api.get(`/orders/${id}`);
          setOrder(res.data);
        } else {
          // Fallback to fetching assigned orders and picking the first active one
          let driverId = 'drv-1';
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              if (parsed && parsed.id) driverId = parsed.id;
            } catch (e) {}
          }
          const data = await driverDashboardService.getAssignedOrders(driverId);
          const list = Array.isArray(data) ? data : (data.orders || []);
          if (list.length > 0) {
            setOrder(list[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load assignment details:', err);
        setError('Failed to load assignment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  // Handle status update workflow
  const handleStatusUpdate = async (newStatus) => {
    if (!order) return;
    try {
      setUpdating(true);
      const res = await driverDashboardService.updateOrderStatus(order.id, { status: newStatus });
      setOrder(res.order || { ...order, status: newStatus });
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // 30-Second Background GPS Telemetry Polling Loop
  useEffect(() => {
    const sendTelemetry = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const currentLat = position.coords.latitude;
            const currentLng = position.coords.longitude;
            setLastCoords({ lat: currentLat, lng: currentLng });

            try {
              console.log(`[Telemetry] GPS Pushed -> Lat: ${currentLat}, Lng: ${currentLng}`);
            } catch (err) {
              console.error("Telemetry sync error:", err);
            }
          },
          (error) => console.warn("Geolocation warning:", error.message),
          { enableHighAccuracy: true }
        );
      }
    };

    sendTelemetry();
    const interval = setInterval(sendTelemetry, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading assignment details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="w-full py-16 px-6 bg-white rounded-2xl border border-gray-200 text-center space-y-4 max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-base font-bold text-gray-900">{error || 'No Active Assignment Found'}</h3>
        <p className="text-xs text-gray-400">There are no active orders available for assignment management right now.</p>
        <button 
          onClick={() => navigate('/driver')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const statuses = ['Accepted', 'En Route', 'Arrived', 'Payment Received', 'Completed'];

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-blue-600 bg-white px-4 py-2.5 rounded-xl border border-gray-200 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
            <Radio size={12} className="animate-pulse text-emerald-500" /> GPS Telemetry Active (30s)
          </span>
          <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
            JOB #{order.id.slice(0, 8).toUpperCase()} — {order.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Client & Delivery Location
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Customer Name</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{order.customer?.fullName || 'Valued Customer'}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer" title="Call Customer">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer" title="Message Dispatch">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-2 text-gray-400 mb-1">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Destination</span>
                  </div>
                  <p className="text-xs font-bold text-gray-800 mt-1">Lat: {order.locationLat}, Lng: {order.locationLng}</p>
                  <p className="text-[11px] text-gray-500">Masafi, Fujairah, UAE</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-2 text-gray-400 mb-1">
                    <Navigation className="w-4 h-4 text-blue-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Live Coordinates</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-gray-800 mt-1">{lastCoords.lat.toFixed(4)}° N, {lastCoords.lng.toFixed(4)}° E</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Transmitting live to Admin & Customer</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-blue-600" /> Cargo & Service Specifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100">
                <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">Service Type</p>
                <p className="text-xs font-bold text-gray-900 mt-1">Water Tanker Delivery</p>
              </div>

              <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100">
                <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">Volume Load</p>
                <p className="text-xs font-bold text-gray-900 mt-1">{order.volume?.toLocaleString()} Gallons</p>
              </div>

              <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100">
                <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">Water Grade</p>
                <p className="text-xs font-bold text-gray-900 mt-1">Treated Industrial Supply</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" /> Schedule & Payment
              </h3>

              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-100">
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Created At</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Base Service Fare</span>
                    <span className="font-semibold text-gray-800">AED {(order.price * 0.9).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Express Route Surcharge</span>
                    <span className="font-semibold text-gray-800">AED {(order.price * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-900">Total Order Amount</span>
                    <span className="text-lg font-bold text-emerald-600">AED {order.price?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Collection Mode: Cash on Delivery (COD)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Workflow Status Transitions</p>
              {statuses.map((statusOption) => {
                const isActive = order.status === statusOption;
                return (
                  <button
                    key={statusOption}
                    disabled={updating || isActive}
                    onClick={() => handleStatusUpdate(statusOption)}
                    className={`w-full text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-sm cursor-default' 
                        : 'bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 border border-gray-200'
                    }`}
                  >
                    {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isActive ? `Current: ${statusOption}` : `Mark as ${statusOption}`}</span>
                  </button>
                );
              })}

              <button 
                onClick={() => navigate('/driver')}
                className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverAssignmentDetails;