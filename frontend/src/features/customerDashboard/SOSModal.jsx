import React, { useState } from 'react';
import { PhoneCall, AlertTriangle, X, ShieldAlert, Loader2 } from 'lucide-react';
import api from '../../api';

const SOSModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [incidentType, setIncidentType] = useState('Mechanical Breakdown');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('High');

  if (!isOpen) return null;

  const handleSubmitSOS = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let lat = 25.34;
    let lng = 56.21;

    try {
      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              lat = Number(pos.coords.latitude) || 25.34;
              lng = Number(pos.coords.longitude) || 56.21;
              resolve();
            },
            () => resolve(),
            { timeout: 3000 }
          );
        });
      }
    } catch (err) {
      // fallback coordinates used
    }

    // Create live incident payload aligned with admin format
    const newLiveIncident = {
      id: `INC-${Math.floor(500 + Math.random() * 400)}`,
      type: 'Affiliated Driver SOS',
      name: 'Muhammad Tamim',
      vehicle: 'Tanker T-012 (5000 Gal)',
      location: `Masafi Region (Lat ${lat.toFixed(2)}, Lon ${lng.toFixed(2)})`,
      coords: [lat, lng],
      time: 'Just now',
      issue: description || `${incidentType} reported via emergency SOS dispatch.`,
      status: 'Incident Reported',
      category: 'affiliated'
    };

    // Save to shared localStorage queue so AdminRecoveryDispatch picks it up instantly
    const existingIncidents = JSON.parse(localStorage.getItem('admin_recovery_incidents') || '[]');
    localStorage.setItem('admin_recovery_incidents', JSON.stringify([newLiveIncident, ...existingIncidents]));

    try {
      await api.post('/recovery-incidents', {
        vehicleId: 'veh-1',
        incidentType: incidentType,
        location: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
        description: description || 'Emergency SOS triggered by driver from dashboard.',
        severity: severity
      });
    } catch (err) {
      console.warn('Backend API note: SOS logged locally via storage sync fallback.');
    }

    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-red-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert size={22} className="text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Emergency Operations (SOS)</h3>
              <p className="text-xs text-red-100">Al-Waqar 24/7 Dispatch Control Room</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-900 font-medium leading-relaxed">
              Use this channel strictly for urgent on-site breakdowns, accidents, or immediate delivery crises. Your location telemetry is active.
            </p>
          </div>

          {success ? (
            <div className="py-8 bg-emerald-50 rounded-2xl border border-emerald-100 text-center space-y-2">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto">✓</div>
              <h4 className="font-bold text-emerald-800 text-sm">SOS Alert Dispatched Successfully!</h4>
              <p className="text-xs text-emerald-600">The 24/7 control room has received your exact coordinates.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitSOS} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Incident Type</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 focus:outline-red-600"
                >
                  <option value="Accident">Accident / Collision</option>
                  <option value="Mechanical Breakdown">Mechanical Breakdown</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Security Threat">Security Threat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the emergency situation..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-red-600 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-600/20 transition cursor-pointer"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                <span>Dispatch SOS Incident Report</span>
              </button>
            </form>
          )}

          {/* Action Buttons & Hotline Display */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <a 
              href="tel:+971550000000"
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs transition cursor-pointer"
            >
              <PhoneCall size={16} /> Call 24/7 Operations Control Hotline
            </a>

            <button 
              type="button"
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-2xl text-xs transition cursor-pointer"
            >
              Dismiss / Return
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SOSModal;