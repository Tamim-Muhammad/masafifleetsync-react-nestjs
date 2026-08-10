import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api';
import { ShieldCheck, Search, Eye, X } from 'lucide-react';

const AdminComplianceApproval = () => {
  const { darkMode } = useOutletContext();
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [enlargedImage, setEnlargedImage] = useState(null);

  const baselineMockItems = [
    { 
      id: 'DRV-304', 
      name: 'Salim Al-Ketbi', 
      assetType: 'Driver + 5,000 Gal Tanker (KT-49201)', 
      submittedDate: 'Aug 3, 2026', 
      status: 'Pending Review', 
      ocrStatus: 'Parsed Successfully', 
      category: 'pending', 
      documents: [
        { label: 'Driving License Document', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800' },
        { label: 'Mulkiya Registration', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800' }
      ] 
    },
    { 
      id: 'DRV-882', 
      name: 'Ahmed Al-Mazrouei', 
      assetType: 'Driver + 5,000 Gal Tanker (KT-78452)', 
      submittedDate: 'Aug 4, 2026', 
      status: 'Pending Review', 
      ocrStatus: 'Parsed Successfully', 
      category: 'pending', 
      documents: [
        { label: 'Driving License Document', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800' },
        { label: 'Mulkiya Registration', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800' }
      ] 
    },
    { 
      id: 'DRV-310', 
      name: 'Rashid Al-Kaabi', 
      assetType: 'Driver + 1,000 Gal Tanker (MS-11820)', 
      submittedDate: 'Aug 4, 2026', 
      status: 'Manual Review', 
      ocrStatus: 'OCR Read Failure', 
      category: 'pending', 
      documents: [
        { label: 'Driving License Document', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800' }
      ] 
    },
    { 
      id: 'DRV-045', 
      name: 'Tariq Bin Ziyad', 
      assetType: 'Driver + Heavy Haul Tanker (SH-55431)', 
      submittedDate: 'Jul 15, 2026', 
      status: 'Expired', 
      ocrStatus: 'Flagged Expired', 
      category: 'blocked', 
      documents: [
        { label: 'Driving License Document', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800' },
        { label: 'Mulkiya Registration', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800' }
      ] 
    },
  ];

  const [allAssets, setAllAssets] = useState(baselineMockItems);

  useEffect(() => {
    const syncQueue = () => {
      const savedQueue = JSON.parse(localStorage.getItem('admin_compliance_queue') || '[]');
      if (savedQueue.length > 0) {
        const savedIds = new Set(savedQueue.map(i => i.id));
        const filteredBaseline = baselineMockItems.filter(i => !savedIds.has(i.id));
        setAllAssets([...savedQueue, ...filteredBaseline]);
      } else {
        setAllAssets(baselineMockItems);
      }
    };

    syncQueue();
    const interval = setInterval(syncQueue, 300);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (item) => {
    try {
      // Calls the backend database approval route using the driver's name or ID/email reference
      await api.patch(`/auth/admin/drivers/${item.id}/approve`);
    } catch (err) {
      console.warn("Backend API approval note:", err);
    }

    setAllAssets(prev => prev.map(i => {
      if (i.id === item.id) {
        return { ...i, status: 'Approved / Active', category: 'active', ocrStatus: 'Verified & Cleared' };
      }
      return i;
    }));
    
    localStorage.setItem('driver_compliance_status', 'CLEARED');
    alert(`Driver and Asset package ${item.id} successfully approved and activated for fleet deployment.`);
    setSelectedAsset(null);
  };

  const handleReject = (id) => {
    setAllAssets(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: 'Rejected / Resubmission Required', category: 'rejected' };
      }
      return item;
    }));
    alert(`Driver package ${id} rejected.`);
    setSelectedAsset(null);
  };

  const filteredQueue = allAssets.filter(item => {
    const matchesCategory = activeFilter === 'all' || item.category === activeFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.assetType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`space-y-6 transition-colors duration-200 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      
      {enlargedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setEnlargedImage(null)}>
          <div className="relative max-w-5xl w-full bg-slate-900 p-4 rounded-2xl border border-slate-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-bold text-sm tracking-wide">Document Detailed Inspection View</h3>
              <button 
                onClick={() => setEnlargedImage(null)}
                className="text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex justify-center bg-black/50 rounded-xl overflow-hidden p-2 border border-slate-800">
              <img 
                src={enlargedImage} 
                alt="Enlarged Document" 
                className="max-h-[80vh] max-w-full object-contain rounded-lg" 
              />
            </div>
          </div>
        </div>
      )}

      <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#0B2A4D] border-blue-950'} p-6 rounded-2xl shadow-md text-white border`}>
        <h1 className="text-2xl font-bold tracking-tight">Driver & Asset Registration Approval</h1>
        <p className="text-sm text-blue-200 mt-1">Review live driver onboarding packages and authorize fleet access.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 p-6 rounded-2xl shadow-sm border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Driver Onboarding Verification Queue</h2>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search driver ID or name..." 
              className={`px-3 py-2 border rounded-xl text-xs focus:outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-xs font-semibold uppercase ${darkMode ? 'border-slate-800 text-gray-400' : 'border-gray-100 text-gray-400'}`}>
                  <th className="pb-3">Reference ID</th>
                  <th className="pb-3">Driver & Assigned Asset</th>
                  <th className="pb-3">Package Details</th>
                  <th className="pb-3">OCR Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-sm ${darkMode ? 'divide-slate-800' : 'divide-gray-50'}`}>
                {filteredQueue.length > 0 ? (
                  filteredQueue.map((item, idx) => (
                    <tr key={idx} className={darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50/50'}>
                      <td className="py-3 font-semibold text-blue-500">{item.id}</td>
                      <td className="py-3 font-bold flex items-center gap-2">
                        {item.name}
                        {item.status === 'Pending Review' && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-mono">LIVE UPLOAD</span>
                        )}
                      </td>
                      <td className="py-3 text-xs text-gray-500">{item.assetType}</td>
                      <td className="py-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700">
                          {item.ocrStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button onClick={() => setSelectedAsset(item)} className="inline-flex items-center space-x-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                          <Eye className="w-3.5 h-3.5" /> <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="py-8 text-center text-xs text-gray-400">No registered driver packages found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`p-6 rounded-2xl shadow-sm border flex flex-col justify-between ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
          <div>
            <h2 className="text-lg font-bold mb-4">Onboarding Inspection Portal</h2>
            {selectedAsset ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl border bg-gray-50 dark:bg-slate-800">
                  <h4 className="font-bold text-sm">{selectedAsset.name} ({selectedAsset.id})</h4>
                  <p className="text-xs text-blue-500 mt-1 font-semibold">{selectedAsset.assetType}</p>
                  <p className="text-[11px] text-gray-400 mt-2">Submitted: {selectedAsset.submittedDate}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {selectedAsset.documents && selectedAsset.documents.length > 0 ? (
                    selectedAsset.documents.map((doc, docIdx) => (
                      <div 
                        key={docIdx} 
                        onClick={() => setEnlargedImage(doc.url)}
                        className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 text-center p-2 cursor-pointer group hover:border-blue-500 transition"
                        title="Click to view full size"
                      >
                        <p className="text-[10px] text-slate-400 font-bold mb-1 group-hover:text-blue-400 transition truncate">{doc.label}</p>
                        <img 
                          src={doc.url} 
                          alt={doc.label} 
                          className="h-28 w-full object-cover rounded-lg border border-slate-700 group-hover:opacity-95 transition" 
                        />
                      </div>
                    ))
                  ) : (
                    <p className="col-span-2 text-xs text-gray-400 text-center py-4">No documents available for inspection.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-center p-6 border border-dashed rounded-2xl text-gray-400">
                <p className="text-xs">Select a registered driver from the queue to inspect uploaded credentials.</p>
              </div>
            )}
          </div>

          {selectedAsset && (
            <div className="mt-6 flex space-x-3">
              <button onClick={() => handleReject(selectedAsset.id)} className="flex-1 bg-red-50 text-red-700 py-2.5 rounded-xl text-xs font-bold cursor-pointer border border-red-200">
                Reject
              </button>
              <button onClick={() => handleApprove(selectedAsset)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                Approve Driver
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminComplianceApproval;