import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  HelpCircle, 
  PhoneCall, 
  Mail, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2,
  Headphones,
  MapPin,
  Clock,
  CheckCheck
} from 'lucide-react';

const DriverSupport = () => {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [msgSent, setMsgSent] = useState(false);
  const [formData, setFormData] = useState({ 
    category: 'Driver General Support', 
    subject: '', 
    message: '' 
  });
  const [myTickets, setMyTickets] = useState([]);

  useEffect(() => {
    const loadMyTickets = () => {
      const tickets = JSON.parse(localStorage.getItem('admin_driver_tickets') || '[]');
      setMyTickets(tickets);
    };

    loadMyTickets();
    const interval = setInterval(loadMyTickets, 500);
    return () => clearInterval(interval);
  }, []);

  const faqs = [
    {
      q: 'What should I do if my compliance documents are expiring soon?',
      a: 'You will receive automated system warnings at 30, 15, and 7 days prior to document expiration. You can upload renewed certificates directly through your Compliance screen.'
    },
    {
      q: 'How do I report a roadside vehicle breakdown or emergency?',
      a: 'Tap the prominent red "SOS" button floating at the bottom right of your screen. You can use Push-to-Call for an immediate voice link or Push-to-Log to transmit your live GPS coordinates to the recovery desk instantly.'
    },
    {
      q: 'How are my daily earnings and commission calculated?',
      a: 'The system automatically logs cash-on-delivery collections and deducts the pre-defined company commission percentage configured by the Super Admin, displaying your net payout on your Earnings summary page.'
    },
    {
      q: 'Can I complete an active job if my license expires mid-delivery?',
      a: 'Yes, the system enforces a mid-job grace period allowing you to complete your current active delivery, but it will automatically block you from receiving new assignments until your documents are renewed.'
    }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) return;

    const newTicket = {
      id: `DRV-TKT-${Math.floor(100 + Math.random() * 900)}`,
      senderName: 'Muhammad Tamim',
      senderRole: 'Driver',
      category: formData.category,
      subject: formData.subject,
      message: formData.message,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Open'
    };

    const existingTickets = JSON.parse(localStorage.getItem('admin_driver_tickets') || '[]');
    localStorage.setItem('admin_driver_tickets', JSON.stringify([newTicket, ...existingTickets]));

    setMsgSent(true);
    setTimeout(() => {
      setMsgSent(false);
      setFormData({ category: 'Driver General Support', subject: '', message: '' });
    }, 2000);
  };

  return (
    <div className="w-full space-y-6 pb-12 relative">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-blue-600 bg-white px-4 py-2.5 rounded-xl border border-gray-200 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-1.5">
          <Headphones className="w-3.5 h-3.5" /> 24/7 DRIVER ASSISTANCE DESK
        </span>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-xs border border-blue-200 flex items-center space-x-4">
        <div className="bg-blue-600 text-white p-3.5 rounded-xl shadow-sm">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-blue-900 font-bold text-lg">Driver Help Center & Support</h3>
          <p className="text-gray-500 text-xs mt-0.5">Our dedicated support team is available around the clock to assist with emergency recovery dispatch, order inquiries, and compliance documentation support.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex items-center space-x-4">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400">Support Hotline</h4>
            <a href="tel:+971508821944" className="text-sm font-bold text-blue-600 hover:underline mt-1 inline-block">
              +971-50-882-1944
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex items-center space-x-4">
          <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400">Email Support</h4>
            <span className="text-xs font-bold text-gray-800 mt-1 block truncate">
              support@masafifleetsync.com
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex items-center space-x-4">
          <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400">Our Location</h4>
            <p className="text-xs font-semibold text-gray-800 mt-1">
              Al-Waqar Transport L.L.C., Masafi/Fujairah Region, UAE
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <h4 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">
            Send Message to Support Desk
          </h4>

          {msgSent ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h5 className="font-bold text-emerald-900 text-xs">Ticket Sent Successfully!</h5>
              <p className="text-[11px] text-emerald-600">Our dispatch team will review your ticket and reply shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Inquiry Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="Driver General Support">Driver General Support</option>
                  <option value="Compliance & License Renewal">Compliance & License Renewal</option>
                  <option value="Earnings & Commission Inquiry">Earnings & Commission Inquiry</option>
                  <option value="Fleet Equipment & Vehicle Issue">Fleet Equipment & Vehicle Issue</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subject / Issue Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Earnings Reconciliation Inquiry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Detailed Message *</label>
                <textarea 
                  rows="4" 
                  required
                  placeholder="Describe your issue clearly..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <h4 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">
            Frequently Asked Questions (FAQs)
          </h4>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden transition-all">
                  <button 
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-3.5 text-left bg-gray-50 hover:bg-gray-100/70 transition-colors font-bold text-xs text-gray-800 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-3.5 bg-white text-xs text-gray-600 border-t border-gray-100 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Driver Ticket Tracker */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
        <h4 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3 flex items-center justify-between">
          <span>My Submitted Support Tickets & Status</span>
          <span className="text-xs font-normal text-gray-400">Real-time Admin Sync</span>
        </h4>

        {myTickets.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">You have not submitted any helpdesk tickets yet.</p>
        ) : (
          <div className="space-y-3">
            {myTickets.map((t) => (
              <div key={t.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{t.id}</span>
                      <span className="text-xs font-bold text-gray-800">• {t.subject}</span>
                    </div>
                    <p className="text-xs text-gray-500">{t.message}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1"><Clock size={12} /> {t.date}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {t.status === 'Resolved' ? <CheckCheck size={14} /> : <Clock size={14} />}
                      {t.status}
                    </span>
                  </div>
                </div>

                {t.status === 'Resolved' && t.adminResponse && (
                  <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-emerald-800">
                      <CheckCheck size={14} /> Official Admin Response:
                    </div>
                    <p className="text-emerald-700 leading-relaxed">{t.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverSupport;