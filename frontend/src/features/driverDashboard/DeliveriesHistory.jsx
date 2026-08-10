import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  History, 
  CheckCircle2, 
  MapPin, 
  Droplet, 
  Download, 
  FileText, 
  Search, 
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { driverDashboardService } from './DriverDashboard.service';

const DeliveriesHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        let driverId = 'drv-1';
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed && parsed.id) driverId = parsed.id;
          } catch (e) {}
        }
        const data = await driverDashboardService.getDeliveriesHistory(driverId);
        const list = Array.isArray(data) ? data : (data.orders || data.deliveries || []);
        setDeliveries(list);
      } catch (err) {
        console.error('Failed to fetch deliveries history:', err);
        setError('Failed to load completed deliveries history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredHistory = deliveries.filter(item => {
    const clientName = item.customer?.fullName || item.client || '';
    const locationStr = item.location || `Lat: ${item.locationLat}, Lng: ${item.locationLng}`;
    const idStr = item.id || '';
    return (
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      locationStr.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="w-full space-y-6 pb-12 relative">

      {/* Top Header & Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-blue-600 bg-white px-4 py-2.5 rounded-xl border border-gray-200 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
          COMPLETED RUNS ARCHIVE
        </span>
      </div>

      {/* History Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-blue-200 flex items-center space-x-4">
        <div className="bg-blue-600 text-white p-3.5 rounded-xl shadow-sm">
          <History className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-blue-900 font-bold text-lg">Deliveries History Ledger</h3>
          <p className="text-gray-500 text-xs mt-0.5">Comprehensive audit log of all completed delivery runs, timestamps, and receipt copies.</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by client, job ID, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <span className="text-xs font-semibold text-gray-500 shrink-0">
          Showing {filteredHistory.length} Records
        </span>
      </div>

      {/* History Ledger List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden divide-y divide-gray-100">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading history records...</p>
          </div>
        ) : error ? (
          <div className="py-12 px-4 text-center space-y-2 bg-red-50/50">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-xs text-red-700 font-semibold">{error}</p>
          </div>
        ) : filteredHistory.length > 0 ? (
          filteredHistory.map((item, index) => {
            const clientName = item.customer?.fullName || 'Valued Client';
            const amountVal = item.price ? Number(item.price).toFixed(2) : '350.00';
            const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recently Completed';
            const locationStr = item.location || `Lat: ${item.locationLat}, Lng: ${item.locationLng}`;

            return (
              <div
                key={index}
                onClick={() => setSelectedReceipt(item)}
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50/70 transition-all cursor-pointer group"
              >

                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl shrink-0 mt-0.5 group-hover:bg-emerald-100 transition-colors">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{clientName}</h4>
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">JOB #{item.id.slice(0, 8).toUpperCase()}</span>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md">{item.status || 'Completed'}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 mt-1 flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-blue-500" />
                      Water Tanker Delivery ({item.volume || 5000} Gallons)
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {locationStr}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                  <div className="text-left md:text-right">
                    <span className="text-sm font-extrabold text-emerald-600">+ AED {amountVal}</span>
                    <p className="text-[11px] text-gray-400 mt-0.5">{dateStr}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReceipt(item);
                    }}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-xl border border-gray-200 transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    <span>Receipt</span>
                  </button>
                </div>

              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-gray-400 text-xs">
            No completed delivery history records found matching your search query.
          </div>
        )}
      </div>

      {/* Receipt Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in duration-200">

            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Delivery Receipt</h3>
                  <p className="text-[11px] text-gray-400 font-mono">ID: #{selectedReceipt.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 border border-gray-100">
                <p className="text-gray-400 font-semibold uppercase text-[10px]">Client Name</p>
                <p className="font-bold text-gray-900 text-sm">{selectedReceipt.customer?.fullName || 'Valued Client'}</p>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 border border-gray-100">
                <p className="text-gray-400 font-semibold uppercase text-[10px]">Service Rendered</p>
                <p className="font-bold text-gray-800">Water Tanker Delivery ({selectedReceipt.volume || 5000} Gallons)</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 border border-gray-100">
                  <p className="text-gray-400 text-[10px] uppercase font-semibold">Completion Time</p>
                  <p className="font-bold text-gray-800">{new Date(selectedReceipt.createdAt).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 border border-gray-100">
                  <p className="text-gray-400 text-[10px] uppercase font-semibold">Cash Collected</p>
                  <p className="font-bold text-emerald-600">AED {selectedReceipt.price ? Number(selectedReceipt.price).toFixed(2) : '350.00'}</p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center text-emerald-800 font-semibold">
                Status: Verified & Settled Hand-to-Hand (COD)
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => {
                  alert(`Downloading receipt #${selectedReceipt.id.slice(0, 8)} PDF...`);
                  setSelectedReceipt(null);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Receipt</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DeliveriesHistory;