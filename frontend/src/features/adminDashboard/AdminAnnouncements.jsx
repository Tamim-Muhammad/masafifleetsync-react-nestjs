import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Bell, Send, Megaphone, CheckCircle2, Trash2, Radio, LifeBuoy, CheckCheck, Clock, MessageCircle } from 'lucide-react';

const AdminAnnouncements = () => {
  const { darkMode } = useOutletContext();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Users');
  const [priority, setPriority] = useState('Normal');
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [driverTickets, setDriverTickets] = useState([]);
  const [customerTickets, setCustomerTickets] = useState([]);
  const [adminReplies, setAdminReplies] = useState({});

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('http://localhost:3000/announcements');
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(data);
      }
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    const loadTickets = () => {
      setDriverTickets(JSON.parse(localStorage.getItem('admin_driver_tickets') || '[]'));
      setCustomerTickets(JSON.parse(localStorage.getItem('admin_customer_tickets') || '[]'));
    };

    loadTickets();
    const interval = setInterval(loadTickets, 500);
    return () => clearInterval(interval);
  }, []);

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, audience: targetAudience, priority }),
      });

      if (res.ok) {
        setTitle('');
        setMessage('');
        fetchAnnouncements();
        alert('System announcement successfully pushed across active notification feeds.');
      }
    } catch (err) {
      console.error('Error broadcasting announcement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBroadcast = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBroadcasts(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  const handleResolveTicket = (ticketId, type) => {
    const replyText = adminReplies[ticketId] || 'Your inquiry has been reviewed and resolved by operations dispatch.';
    
    if (type === 'driver') {
      const updated = driverTickets.map(t => t.id === ticketId ? { ...t, status: 'Resolved', adminResponse: replyText } : t);
      setDriverTickets(updated);
      localStorage.setItem('admin_driver_tickets', JSON.stringify(updated));
    } else {
      const updated = customerTickets.map(t => t.id === ticketId ? { ...t, status: 'Resolved', adminResponse: replyText } : t);
      setCustomerTickets(updated);
      localStorage.setItem('admin_customer_tickets', JSON.stringify(updated));
    }
    alert(`Response transmitted and ticket ${ticketId} marked as resolved.`);
  };

  const allTickets = [
    ...driverTickets.map(t => ({ ...t, portalType: 'driver' })),
    ...customerTickets.map(t => ({ ...t, portalType: 'customer' }))
  ];

  return (
    <div className={`space-y-6 transition-colors duration-200 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#0B2A4D] border-blue-950'} p-6 rounded-2xl shadow-md text-white flex flex-col md:flex-row md:items-center md:justify-between border transition-colors`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Announcements & Support Operations</h1>
          <p className="text-sm text-blue-200 mt-1">Manage global broadcasts and reply to live inbound support tickets submitted by customers and drivers.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-blue-950/60 px-4 py-2 rounded-xl border border-blue-900 text-xs font-semibold text-blue-200">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Active Client Sync Channels: Online</span>
        </div>
      </div>

      {/* Inbound Support Tickets Section */}
      <div className={`${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'} p-6 rounded-2xl shadow-sm border space-y-4`}>
        <div className={`flex items-center justify-between border-b pb-3 ${darkMode ? 'border-slate-800' : 'border-gray-100'}`}>
          <div className="flex items-center space-x-2">
            <LifeBuoy className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold">Inbound Helpdesk Support Tickets</h2>
          </div>
          <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
            Active Tickets: {allTickets.filter(t => t.status === 'Open').length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allTickets.length === 0 ? (
            <p className="text-xs text-gray-400 col-span-full text-center py-6">No support tickets submitted from customer or driver portals yet.</p>
          ) : (
            allTickets.map((t) => (
              <div key={t.id} className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono">{t.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    t.portalType === 'driver' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {t.portalType === 'driver' ? 'Driver Portal' : 'Customer Portal'}: {t.senderName}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{t.category}</div>
                  <h4 className="text-sm font-bold">{t.subject}</h4>
                  <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>{t.message}</p>
                </div>

                {t.status === 'Open' ? (
                  <div className="space-y-2 pt-2 border-t border-gray-200/50">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                      <MessageCircle size={13} /> Dispatcher Response / Resolution Note:
                    </div>
                    <input 
                      type="text"
                      placeholder="Type reply or resolution notes..."
                      value={adminReplies[t.id] || ''}
                      onChange={(e) => setAdminReplies({ ...adminReplies, [t.id]: e.target.value })}
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-blue-500"
                    />
                    <button 
                      onClick={() => handleResolveTicket(t.id, t.portalType)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Send Response & Resolve
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-gray-200/50 space-y-1">
                    <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs"><CheckCheck size={14} /> Resolved</span>
                    <p className="text-[11px] bg-emerald-50 text-emerald-900 p-2 rounded-lg border border-emerald-100">
                      <strong>Admin Reply:</strong> {t.adminResponse}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Broadcast Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'} p-6 rounded-2xl shadow-sm border lg:col-span-1 space-y-4`}>
          <div className="flex items-center space-x-2 border-b pb-3">
            <Megaphone className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold">Compose Broadcast Alert</h2>
          </div>
          <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold mb-1">Broadcast Title</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Operational Update" className="w-full p-3 border rounded-xl font-semibold bg-gray-50 text-gray-800" />
            </div>
            <div>
              <label className="block font-bold mb-1">Target Recipient Group</label>
              <select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="w-full p-3 border rounded-xl font-semibold bg-gray-50 text-gray-800">
                <option value="All Users">All Connected Users</option>
                <option value="Active Tanker Drivers">Active Fleet Drivers Only</option>
                <option value="Water Customers">Bulk Water Customers Only</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Priority Classification</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full p-3 border rounded-xl font-semibold bg-gray-50 text-gray-800">
                <option value="Normal">Normal Advisory</option>
                <option value="High">High Priority Warning</option>
                <option value="Critical">Critical Emergency Alert</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Announcement Message Body</label>
              <textarea rows="4" required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type notification details..." className="w-full p-3 border rounded-xl bg-gray-50 text-gray-800" />
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold transition cursor-pointer">
              <Send className="w-4 h-4" /><span>Push Broadcast</span>
            </button>
          </form>
        </div>

        <div className={`${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'} p-6 rounded-2xl shadow-sm border lg:col-span-2 space-y-4`}>
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold">Active Broadcast Feeds & History</h2>
            </div>
            <span className="text-xs font-semibold text-gray-500">Total: {broadcasts.length}</span>
          </div>
          <div className="space-y-3">
            {broadcasts.map((ann) => (
              <div key={ann.id} className="p-4 rounded-xl border bg-gray-50 space-y-2">
                <div className="flex justify-between text-xs font-bold text-blue-500">
                  <span>{ann.title}</span>
                  <button onClick={() => handleDeleteBroadcast(ann.id)} className="text-red-500 flex items-center gap-1 cursor-pointer"><Trash2 size={13} /> Revoke</button>
                </div>
                <p className="text-xs text-gray-600">{ann.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements;