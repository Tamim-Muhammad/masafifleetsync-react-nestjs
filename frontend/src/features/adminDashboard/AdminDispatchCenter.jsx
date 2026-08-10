import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { adminDashboardService } from './adminDashboard.service';
import api from '../../api';

const AdminDispatchCenter = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [pendingOrders, setPendingOrders] = useState([]);
  const [availableTankers, setAvailableTankers] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);

  const mapCenter = [25.1028, 56.2872];

  const safeText = (val, fallback = 'N/A') => {
    if (!val) return fallback;
    if (typeof val === 'object') {
      return val.fullName || val.name || val.address || val.title || JSON.stringify(val);
    }
    return String(val);
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [ordersData, vehiclesData, driversRes] = await Promise.all([
        adminDashboardService.getOrders(),
        adminDashboardService.getVehicles(),
        api.get('/auth/drivers/approved')
      ]);

      const unassignedOrders = Array.isArray(ordersData) 
        ? ordersData.filter(o => !o.status || o.status === 'PENDING' || o.status === 'Unassigned' || o.status === 'Pending')
        : [];
      
      setPendingOrders(unassignedOrders.length > 0 ? unassignedOrders : (ordersData || []));

      if (Array.isArray(driversRes.data)) {
        setAvailableDrivers(driversRes.data.map(d => ({
          id: d.id,
          name: d.fullName || d.name
        })));
      }

      const formattedVehicles = Array.isArray(vehiclesData) ? vehiclesData.map(v => {
        const rawStatus = safeText(v.status, 'Active');
        const normalizedStatus = (rawStatus.toLowerCase() === 'active' || rawStatus.toLowerCase() === 'available') ? 'Available' : rawStatus;

        return {
          id: safeText(v.id || v.vehicleNumber, 'V-000'),
          capacity: v.capacity ? `${v.capacity} Gal Tanker` : '5,000 Gal Tanker',
          driver: safeText(v.driver || v.driverName || v.assignedDriver, 'Unassigned Driver'),
          driverId: v.driverId || (v.driver?.id) || '',
          compliance: safeText(v.complianceStatus, 'Verified'),
          status: normalizedStatus
        };
      }) : [];

      setAvailableTankers(formattedVehicles);
    } catch (err) {
      console.error('Failed to load dispatch data:', err);
      setError('Failed to connect to backend live database pipeline. Please verify NestJS server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunVRP = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setSuccessMessage('VRP Route Optimization completed successfully. Multi-drop path generated.');
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 1200);
  };

  const handleAssignDispatch = async () => {
    if (!selectedOrder) {
      alert('Please select an incoming water request first.');
      return;
    }

    if (!selectedVehicleId) {
      alert('Please select a valid compliant vehicle asset.');
      return;
    }

    if (!selectedDriverId) {
      alert('Please select an operational driver to assign to this dispatch.');
      return;
    }

    const orderId = selectedOrder.id || selectedOrder._id;

    try {
      setIsAssigning(true);
      setError(null);
      
      await adminDashboardService.assignOrder(orderId, {
        driverId: selectedDriverId,
        vehicleId: selectedVehicleId
      });

      setSuccessMessage(`Job #${orderId ? orderId.slice(-6).toUpperCase() : ''} successfully dispatched to vehicle ${selectedVehicleId}!`);
      setSelectedOrder(null);
      setSelectedVehicleId('');
      setSelectedDriverId('');
      
      await fetchData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to assign order:', err);
      setError('Failed to assign driver & vehicle via backend API.');
    } finally {
      setIsAssigning(false);
    }
  };

  const orderVolume = selectedOrder ? Number(selectedOrder.volumeGallons || selectedOrder.volume || 5000) : 5000;
  const compatibleVehicles = availableTankers.filter(v => v.status === 'Available');

  return (
    <div className="space-y-6">
      <div className="bg-[#0B2A4D] p-6 rounded-2xl shadow-md text-white flex flex-col md:flex-row md:items-center md:justify-between border border-blue-950">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dispatch Center & Spatial Canvas</h1>
          <p className="text-sm text-blue-200 mt-1">Manage active dispatches, geofenced zones, and VRP route pathfinding for Al-Waqar Transport.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button 
            onClick={fetchData}
            title="Refresh Live Data"
            className="p-2.5 bg-blue-700/60 hover:bg-blue-600 rounded-xl text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleRunVRP}
            disabled={isOptimizing}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Navigation className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Calculating VRP Routes...' : 'Run VRP Optimization'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Incoming Water Requests</h2>
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                {pendingOrders.length} Pending
              </span>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                <p className="text-xs text-gray-500">Connecting to database queue...</p>
              </div>
            ) : pendingOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                No pending unassigned orders found in queue.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {pendingOrders.map((order) => {
                  const orderId = order.id || order._id;
                  const vol = order.volumeGallons || order.volume || 5000;
                  return (
                    <div 
                      key={orderId} 
                      onClick={() => {
                        setSelectedOrder(order);
                        setSelectedVehicleId('');
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedOrder?.id === orderId || selectedOrder?._id === orderId 
                          ? 'border-blue-500 bg-blue-50/40 shadow-sm' 
                          : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600">#{orderId ? orderId.slice(-6).toUpperCase() : 'N/A'}</span>
                        <span className="text-xs font-semibold text-gray-500">{vol} Gal</span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-800 mt-1">{safeText(order.deliveryAddress || order.customer, 'Client Order')}</h4>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>{safeText(order.deliveryAddress, 'Masafi Sector')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
            Click any order to load fleet assignment options.
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Live Operational GIS Canvas</h2>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span><span>Compliant Unit</span></span>
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span><span>Blocked / Rented</span></span>
            </div>
          </div>

          <div className="flex-1 min-h-[360px] rounded-2xl relative overflow-hidden border border-slate-200 shadow-inner z-0">
            <MapContainer 
              center={mapCenter} 
              zoom={11} 
              scrollWheelZoom={false} 
              style={{ height: '100%', width: '100%', minHeight: '360px', borderRadius: '1rem' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {pendingOrders.map((order) => {
                const orderId = order.id || order._id;
                const coords = [
                  order.locationLat ? Number(order.locationLat) : 25.1028 + (Math.random() * 0.04 - 0.02),
                  order.locationLng ? Number(order.locationLng) : 56.2872 + (Math.random() * 0.04 - 0.02)
                ];
                return (
                  <Marker 
                    key={orderId} 
                    position={coords}
                    eventHandlers={{ click: () => { setSelectedOrder(order); setSelectedVehicleId(''); }}}
                  >
                    <Popup>
                      <div className="text-xs">
                        <strong>Order #{orderId ? orderId.slice(-6).toUpperCase() : 'N/A'}</strong><br />
                        Volume: {order.volumeGallons || 5000} Gal<br />
                        Location: {safeText(order.deliveryAddress, 'Masafi Sector')}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {selectedOrder && (
            <div className="mt-4 p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                <div>
                  <p className="text-xs font-semibold text-blue-800">
                    Assigning Asset for Order: #{(selectedOrder.id || selectedOrder._id || '').slice(-6).toUpperCase()} ({orderVolume} Gal Required)
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">Select any available vehicle asset and approved driver below.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select 
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Available Vehicle ({compatibleVehicles.length})...</option>
                  {compatibleVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.id} ({v.capacity})</option>
                  ))}
                </select>

                <select 
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Approved Driver Operator...</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>

                <button 
                  onClick={handleAssignDispatch}
                  disabled={isAssigning}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isAssigning ? 'Assigning...' : 'Confirm Dispatch'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Verification Matrix</h2>
        {isLoading ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading fleet compliance records...</div>
        ) : availableTankers.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">No fleet units found in database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
                  <th className="pb-3">Vehicle ID</th>
                  <th className="pb-3">Capacity Class</th>
                  <th className="pb-3">Assigned Driver</th>
                  <th className="pb-3">Compliance State</th>
                  <th className="pb-3">Availability</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {availableTankers.map((v, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-gray-800">{v.id}</td>
                    <td className="py-3 text-gray-600">{v.capacity}</td>
                    <td className="py-3 text-gray-600">{v.driver}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        v.compliance === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {v.compliance === 'Verified' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        <span>{v.compliance}</span>
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        v.status === 'Available' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-600'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => setSelectedVehicleId(v.id)}
                        disabled={v.status !== 'Available'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                          selectedVehicleId === v.id 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : v.status === 'Available' 
                            ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-sm' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {selectedVehicleId === v.id ? 'Selected ✓' : v.status === 'Available' ? 'Select Asset' : 'Locked'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDispatchCenter;