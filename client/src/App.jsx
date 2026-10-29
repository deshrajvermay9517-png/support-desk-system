import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ id: 'usr_cust1', name: 'Adarsh Sharma', email: 'customer@gmail.com', role: 'customer' });
  const loginAs = (role) => {
    if (role === 'agent') {
      setUser({ id: 'usr_agent1', name: 'Rahul Verma', email: 'agent@comhard.com', role: 'agent', department: 'Cloud & Infrastructure' });
    } else {
      setUser({ id: 'usr_cust1', name: 'Adarsh Sharma', email: 'customer@gmail.com', role: 'customer' });
    }
  };
  return <AuthContext.Provider value={{ user, loginAs }}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);

export default function App() {
  return <AuthProvider><MainApp /></AuthProvider>;
}

function MainApp() {
  const { user, loginAs } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState('Cloud Infrastructure');
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/tickets`);
      const data = await res.json();
      setTickets(user.role === 'customer' ? data.filter(t => t.customer_id === user.id) : data);
      const aRes = await fetch(`${API_BASE}/analytics`);
      setAnalytics(await aRes.json());
    } catch (e) { console.error(e); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, description: newDesc, category: newCat, customer_id: user.id, customer_name: user.name, customer_email: user.email })
    });
    setNewTitle(''); setNewDesc(''); setShowCreate(false);
    fetchData();
  };

  const openTicket = async (t) => {
    setSelectedTicket(t);
    const res = await fetch(`${API_BASE}/tickets/${t.id}`);
    setTicketDetails(await res.json());
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await fetch(`${API_BASE}/tickets/${selectedTicket.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: user.id, sender_name: user.name, sender_role: user.role, message: replyText, is_internal_note: user.role === 'agent' ? isInternal : false })
    });
    setReplyText(''); setIsInternal(false);
    openTicket(selectedTicket);
  };

  const handleStatusChange = async (status) => {
    await fetch(`${API_BASE}/tickets/${selectedTicket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    openTicket(selectedTicket);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">C</div>
          <span className="font-bold text-lg">Comhard Support Desk</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-slate-300">Logged in as: <strong>{user.name}</strong> ({user.role})</span>
          <button onClick={() => loginAs(user.role === 'customer' ? 'agent' : 'customer')} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded">
            Switch to {user.role === 'customer' ? 'Agent View' : 'Customer View'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {user.role === 'agent' && analytics && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200"><div className="text-xs font-bold text-slate-500 uppercase">Total Tickets</div><div className="text-2xl font-black">{analytics.total}</div></div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200"><div className="text-xs font-bold text-blue-700 uppercase">Open</div><div className="text-2xl font-black text-blue-800">{analytics.open}</div></div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200"><div className="text-xs font-bold text-amber-700 uppercase">In Progress</div><div className="text-2xl font-black text-amber-800">{analytics.in_progress}</div></div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200"><div className="text-xs font-bold text-emerald-700 uppercase">Resolved</div><div className="text-2xl font-black text-emerald-800">{analytics.resolved}</div></div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{user.role === 'customer' ? 'My Support Tickets' : 'Support Queue'}</h2>
          {user.role === 'customer' && <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg">+ Raise Ticket</button>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map(t => (
            <div key={t.id} onClick={() => openTicket(t)} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-500 cursor-pointer shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span>{t.ticket_number}</span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase ${t.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>{t.priority}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">{t.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{t.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                <span>Category: {t.category}</span>
                <span className="font-bold capitalize text-blue-600">{t.status.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-bold text-lg mb-4">Create Support Ticket</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input type="text" placeholder="Subject" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full p-2 border rounded text-sm" />
              <select value={newCat} onChange={e => setNewCat(e.target.value)} className="w-full p-2 border rounded text-sm">
                <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                <option value="TallyBridge Sync">TallyBridge Sync</option>
                <option value="HRMS & Attendance">HRMS & Attendance</option>
                <option value="Billing & Subscriptions">Billing & Subscriptions</option>
              </select>
              <textarea placeholder="Description" required rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full p-2 border rounded text-sm" />
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-xs text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTicket && ticketDetails && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-mono text-slate-400">{ticketDetails.ticket_number}</span>
                <h3 className="text-lg font-bold">{ticketDetails.title}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="font-bold text-slate-400">✕</button>
            </div>

            {user.role === 'agent' && (
              <div className="bg-blue-50 p-3 rounded-lg mb-4 flex items-center justify-between text-xs">
                <span className="font-bold text-blue-900">Update Status:</span>
                <select value={ticketDetails.status} onChange={e => handleStatusChange(e.target.value)} className="p-1 border rounded bg-white font-bold">
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            )}

            <p className="text-xs bg-slate-50 p-3 rounded border mb-4 text-slate-700">{ticketDetails.description}</p>

            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Conversation Thread</h4>
            <div className="space-y-2 mb-4">
              {ticketDetails.messages?.map(m => {
                if (m.is_internal_note && user.role !== 'agent') return null;
                return (
                  <div key={m.id} className={`p-3 rounded-lg text-xs ${m.is_internal_note ? 'bg-amber-50 border border-amber-300' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>{m.sender_name} ({m.sender_role})</span>
                      {m.is_internal_note && <span className="text-amber-800 font-bold">🔒 Internal Note</span>}
                    </div>
                    <p className="text-slate-700">{m.message}</p>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleReply} className="space-y-2 border-t pt-3">
              {user.role === 'agent' && (
                <label className="flex items-center space-x-2 text-xs text-amber-800 font-bold cursor-pointer">
                  <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} />
                  <span>🔒 Mark as Private Internal Note</span>
                </label>
              )}
              <textarea placeholder="Write message..." rows={2} value={replyText} onChange={e => setReplyText(e.target.value)} className="w-full p-2 border rounded text-xs" />
              <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded float-right">Send Reply</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
