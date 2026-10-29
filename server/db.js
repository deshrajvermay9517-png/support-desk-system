const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, 'database.json');

const initialData = {
  users: [
    { id: "usr_agent1", name: "Rahul Verma", email: "agent@comhard.com", password: "password123", role: "agent", department: "Cloud & Infrastructure" },
    { id: "usr_agent2", name: "Priya Sharma", email: "priya@comhard.com", password: "password123", role: "agent", department: "TallyBridge & ERP" },
    { id: "usr_cust1", name: "Adarsh Sharma", email: "customer@gmail.com", password: "password123", role: "customer", company: "Apex Tech Solutions" },
    { id: "usr_cust2", name: "Vikram Mehta", email: "vikram@logistics.in", password: "password123", role: "customer", company: "Express Logistics" }
  ],
  categories: [
    { id: "cat_1", name: "Cloud Infrastructure", description: "VMs, Storage, Bandwidth, VPC" },
    { id: "cat_2", name: "TallyBridge Sync", description: "Tally ERP data synchronization issues" },
    { id: "cat_3", name: "HRMS & Attendance", description: "Payroll, GPS Check-in, Leaves" },
    { id: "cat_4", name: "Billing & Subscriptions", description: "Invoices, Payments, Upgrades" },
    { id: "cat_5", name: "General Support", description: "Account access, queries, settings" }
  ],
  tickets: [
    {
      id: "tkt_1001",
      ticket_number: "TKT-2026-1001",
      title: "CoCloud VM High CPU Usage & Timeout in Sector 62 Data Center",
      description: "Our primary web application VM is experiencing 98% CPU load continuously since 10:00 AM today. HTTP requests are timing out for end-users.",
      category: "Cloud Infrastructure",
      priority: "urgent",
      status: "in_progress",
      customer_id: "usr_cust1",
      customer_name: "Adarsh Sharma",
      customer_email: "customer@gmail.com",
      assigned_agent_id: "usr_agent1",
      assigned_agent_name: "Rahul Verma",
      created_at: "2026-10-29T09:15:00.000Z",
      updated_at: "2026-10-29T10:30:00.000Z"
    },
    {
      id: "tkt_1002",
      ticket_number: "TKT-2026-1002",
      title: "TallyBridge Data Sync Failing for Financial Year 2026-27",
      description: "GST ledgers are not syncing from local Tally Prime software to Comsky Books cloud interface. Sync error log shows HTTP 502 Bad Gateway during bulk voucher sync.",
      category: "TallyBridge Sync",
      priority: "high",
      status: "open",
      customer_id: "usr_cust2",
      customer_name: "Vikram Mehta",
      customer_email: "vikram@logistics.in",
      assigned_agent_id: "usr_agent2",
      assigned_agent_name: "Priya Sharma",
      created_at: "2026-10-29T11:00:00.000Z",
      updated_at: "2026-10-29T11:00:00.000Z"
    },
    {
      id: "tkt_1003",
      ticket_number: "TKT-2026-1003",
      title: "Comsky HRMS GPS Attendance Geofencing Radius Query",
      description: "We want to expand the GPS check-in radius from 50 meters to 200 meters for our Noida Sector 62 office campus. Please provide configuration steps.",
      category: "HRMS & Attendance",
      priority: "medium",
      status: "resolved",
      customer_id: "usr_cust1",
      customer_name: "Adarsh Sharma",
      customer_email: "customer@gmail.com",
      assigned_agent_id: "usr_agent1",
      assigned_agent_name: "Rahul Verma",
      created_at: "2026-10-28T14:20:00.000Z",
      updated_at: "2026-10-28T16:45:00.000Z"
    }
  ],
  messages: [
    { id: "msg_1", ticket_id: "tkt_1001", sender_id: "usr_cust1", sender_name: "Adarsh Sharma", sender_role: "customer", message: "Please look into this urgently. Our clients are complaining about application sluggishness.", is_internal_note: false, created_at: "2026-10-29T09:15:00.000Z" },
    { id: "msg_2", ticket_id: "tkt_1001", sender_id: "usr_agent1", sender_name: "Rahul Verma", sender_role: "agent", message: "Investigating data center metrics. Noticed high I/O wait on storage pool 3. Re-allocating IOPS limit.", is_internal_note: true, created_at: "2026-10-29T10:15:00.000Z" },
    { id: "msg_3", ticket_id: "tkt_1001", sender_id: "usr_agent1", sender_name: "Rahul Verma", sender_role: "agent", message: "Hello Adarsh, we have identified the root cause in the storage controller and initiated a live migration. CPU load is dropping back to 15%.", is_internal_note: false, created_at: "2026-10-29T10:30:00.000Z" }
  ],
  audit_logs: [
    { id: "log_1", ticket_id: "tkt_1001", actor_name: "Rahul Verma", action: "Status updated from 'open' to 'in_progress'", created_at: "2026-10-29T10:15:00.000Z" }
  ]
};

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = { readDb, writeDb, generateId: (prefix = 'id') => `${prefix}_${crypto.randomBytes(4).toString('hex')}` };
