const http = require('http');
const url = require('url');
const { readDb, writeDb, generateId } = require('./db');

const PORT = process.env.PORT || 5000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch (err) { reject(err); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, corsHeaders);
    res.end(JSON.stringify(data));
  };

  const sendError = (statusCode, message) => {
    sendJson(statusCode, { error: message });
  };

  try {
    const db = readDb();

    if (pathname === '/api/auth/login' && method === 'POST') {
      const { email, password } = await parseJsonBody(req);
      const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase() && u.password === password);
      if (!user) return sendError(401, 'Invalid email or password');
      const token = `token_${user.id}_${Date.now()}`;
      const { password: _, ...userWithoutPassword } = user;
      return sendJson(200, { token, user: userWithoutPassword });
    }

    if (pathname === '/api/categories' && method === 'GET') return sendJson(200, db.categories);
    if (pathname === '/api/agents' && method === 'GET') return sendJson(200, db.users.filter(u => u.role === 'agent'));

    if (pathname === '/api/analytics' && method === 'GET') {
      const total = db.tickets.length;
      const open = db.tickets.filter(t => t.status === 'open').length;
      const in_progress = db.tickets.filter(t => t.status === 'in_progress').length;
      const resolved = db.tickets.filter(t => t.status === 'resolved').length;
      return sendJson(200, { total, open, in_progress, resolved });
    }

    if (pathname === '/api/tickets' && method === 'GET') {
      let filtered = [...db.tickets];
      if (query.customer_id) filtered = filtered.filter(t => t.customer_id === query.customer_id);
      if (query.status && query.status !== 'all') filtered = filtered.filter(t => t.status === query.status);
      return sendJson(200, filtered);
    }

    if (pathname === '/api/tickets' && method === 'POST') {
      const body = await parseJsonBody(req);
      const newTicket = {
        id: generateId('tkt'),
        ticket_number: `TKT-2026-${db.tickets.length + 1001}`,
        title: body.title,
        description: body.description,
        category: body.category,
        priority: body.priority || 'medium',
        status: 'open',
        customer_id: body.customer_id || 'usr_cust1',
        customer_name: body.customer_name || 'Adarsh Sharma',
        customer_email: body.customer_email || 'customer@gmail.com',
        created_at: new Date().toISOString()
      };
      db.tickets.unshift(newTicket);
      writeDb(db);
      return sendJson(201, newTicket);
    }

    const ticketMatch = pathname.match(/^\/api\/tickets\/([^\/]+)$/);
    if (ticketMatch && method === 'GET') {
      const ticket = db.tickets.find(t => t.id === ticketMatch[1]);
      if (!ticket) return sendError(404, 'Ticket not found');
      const messages = db.messages.filter(m => m.ticket_id === ticket.id);
      return sendJson(200, { ...ticket, messages });
    }

    if (ticketMatch && method === 'PATCH') {
      const ticketIndex = db.tickets.findIndex(t => t.id === ticketMatch[1]);
      if (ticketIndex === -1) return sendError(404, 'Ticket not found');
      const updates = await parseJsonBody(req);
      db.tickets[ticketIndex] = { ...db.tickets[ticketIndex], ...updates };
      writeDb(db);
      return sendJson(200, db.tickets[ticketIndex]);
    }

    const messagesMatch = pathname.match(/^\/api\/tickets\/([^\/]+)\/messages$/);
    if (messagesMatch && method === 'POST') {
      const body = await parseJsonBody(req);
      const newMessage = {
        id: generateId('msg'),
        ticket_id: messagesMatch[1],
        sender_id: body.sender_id,
        sender_name: body.sender_name,
        sender_role: body.sender_role,
        message: body.message,
        is_internal_note: Boolean(body.is_internal_note),
        created_at: new Date().toISOString()
      };
      db.messages.push(newMessage);
      writeDb(db);
      return sendJson(201, newMessage);
    }

    sendError(404, 'Route not found');
  } catch (err) {
    sendError(500, err.message);
  }
});

server.listen(PORT, () => { console.log(`🚀 Comhard Support Desk API running on port ${PORT}`); });
