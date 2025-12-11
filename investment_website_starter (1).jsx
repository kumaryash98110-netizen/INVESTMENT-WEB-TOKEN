import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";

// NOTE: This single-file demo is a starting point. For a production app split components into separate files
// and add real backend auth, DB (Postgres / Mongo / Firebase), and secure hosting.

// --------------------- Simple in-memory auth (mock) ---------------------
const fakeAuth = {
  isAuthenticated: !!localStorage.getItem("invest_auth"),
  login(user) {
    localStorage.setItem("invest_auth", JSON.stringify(user));
    this.isAuthenticated = true;
  },
  logout() {
    localStorage.removeItem("invest_auth");
    this.isAuthenticated = false;
  },
  getUser() {
    return JSON.parse(localStorage.getItem("invest_auth"));
  }
};

// --------------------- SEO helper ---------------------
function Seo({ title, description }) {
  useEffect(() => {
    document.title = title || "InvestSmart";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description || "Smart investment platform");
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = description || "Smart investment platform";
      document.head.appendChild(m);
    }
  }, [title, description]);
  return null;
}

// --------------------- Protected Route ---------------------
function PrivateRoute({ children }) {
  return fakeAuth.isAuthenticated ? children : <Navigate to="/login" replace />;
}

// --------------------- Header ---------------------
function Header() {
  const navigate = useNavigate();
  const user = fakeAuth.getUser();
  return (
    <header className="w-full bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">InvestSmart</h1>
      <nav className="space-x-4">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <Link to="/calculators" className="hover:text-blue-600">Calculators</Link>
        <Link to="/crm" className="hover:text-blue-600">Leads</Link>
        {user && user.role === "admin" && <Link to="/admin" className="hover:text-blue-600">Admin</Link>}
        {fakeAuth.isAuthenticated ? (
          <button
            className="ml-2 px-3 py-1 border rounded"
            onClick={() => {
              fakeAuth.logout();
              navigate("/");
            }}
          >
            Logout
          </button>
        ) : (
          <Link to="/login" className="ml-2 px-3 py-1 border rounded">Login</Link>
        )}
      </nav>
    </header>
  );
}

// --------------------- Home ---------------------
function Home() {
  return (
    <main className="p-8">
      <Seo title="InvestSmart — Grow your wealth" description="Smart, secure and personalised investment solutions" />
      <section className="py-12 text-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-12">
        <h2 className="text-4xl font-bold mb-4">Grow your wealth with confidence</h2>
        <p className="max-w-2xl mx-auto mb-6">Start with our calculators, capture leads, and scale using the admin dashboard.</p>
        <Link to="/calculators" className="px-6 py-3 bg-white text-blue-600 rounded-xl">Open Calculators</Link>
      </section>

      <section className="mt-10 grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-xl font-semibold mb-2">Portfolio Management</h3>
          <p>Track asset allocation, expected returns and risk.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-xl font-semibold mb-2">Advisory</h3>
          <p>Personalized advisory flows (connect to real advisor APIs).</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-xl font-semibold mb-2">Lead Capture CRM</h3>
          <p>Quick lead intake form connected to the CRM.</p>
        </div>
      </section>
    </main>
  );
}

// --------------------- Login ---------------------
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  function handleLogin(e) {
    e.preventDefault();
    // DEMO: accept any password. In prod validate with backend.
    if (!email) return setError("Enter email");
    const user = { email, role: email.endsWith("@admin.com") ? "admin" : "client" };
    fakeAuth.login(user);
    navigate("/");
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form className="space-y-3" onSubmit={handleLogin}>
        <input className="w-full p-3 border rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full p-3 border rounded" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl">Login</button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
}

// --------------------- Admin Dashboard ---------------------
function AdminDashboard() {
  const user = fakeAuth.getUser();
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <p>Welcome, {user?.email}</p>
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow"> 
          <h4 className="font-semibold">Quick Stats</h4>
          <ul className="mt-2">
            <li>Leads: {JSON.parse(localStorage.getItem("invest_leads") || "[]").length}</li>
            <li>Registered Clients: {JSON.parse(localStorage.getItem("invest_clients") || "[]").length}</li>
          </ul>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold">Actions</h4>
          <p className="mt-2">Export leads, manage content, configure plans (connect to backend).</p>
          <ExportLeads />
        </div>
      </div>
    </div>
  );
}

function ExportLeads() {
  function handleExport() {
    const leads = JSON.parse(localStorage.getItem("invest_leads") || "[]");
    const csv = [Object.keys(leads[0] || {}).join(","), ...leads.map(l => Object.values(l).join(","))].join("
");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return <button className="mt-3 px-4 py-2 border rounded" onClick={handleExport}>Export Leads CSV</button>;
}

// --------------------- Lead Capture CRM ---------------------
function LeadCaptureCRM() {
  const [leads, setLeads] = useState(JSON.parse(localStorage.getItem("invest_leads") || "[]"));
  const [form, setForm] = useState({ name: "", email: "", phone: "", note: "" });

  function addLead(e) {
    e.preventDefault();
    const newLead = { ...form, id: Date.now(), createdAt: new Date().toISOString() };
    const updated = [newLead, ...leads];
    setLeads(updated);
    localStorage.setItem("invest_leads", JSON.stringify(updated));
    setForm({ name: "", email: "", phone: "", note: "" });
  }

  function deleteLead(id) {
    const updated = leads.filter(l => l.id !== id);
    setLeads(updated);
    localStorage.setItem("invest_leads", JSON.stringify(updated));
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Lead Capture CRM</h2>
      <form className="bg-white p-4 rounded shadow mb-6" onSubmit={addLead}>
        <input className="w-full p-2 border rounded mb-2" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="w-full p-2 border rounded mb-2" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="w-full p-2 border rounded mb-2" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <textarea className="w-full p-2 border rounded mb-2" placeholder="Notes" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Add Lead</button>
      </form>

      <div className="space-y-3">
        {leads.length === 0 && <p>No leads yet.</p>}
        {leads.map(lead => (
          <div key={lead.id} className="bg-white p-3 rounded shadow flex justify-between items-start">
            <div>
              <div className="font-semibold">{lead.name} — <span className="text-sm text-gray-500">{lead.email}</span></div>
              <div className="text-sm text-gray-600">{lead.phone}</div>
              <div className="text-sm mt-1">{lead.note}</div>
            </div>
            <div className="space-y-2">
              <button className="px-3 py-1 border rounded" onClick={() => navigator.clipboard.writeText(JSON.stringify(lead))}>Copy</button>
              <button className="px-3 py-1 border rounded text-red-600" onClick={() => deleteLead(lead.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --------------------- Calculators ---------------------
function CalculatorsHome() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Calculators</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="emi" className="p-4 bg-white rounded shadow text-center">EMI Calculator</Link>
        <Link to="roi" className="p-4 bg-white rounded shadow text-center">ROI Calculator</Link>
        <Link to="sip" className="p-4 bg-white rounded shadow text-center">SIP Calculator</Link>
      </div>
    </div>
  );
}

function EMICalculator() {
  const [principal, setPrincipal] = useState(1000000);
  const [tenureYears, setTenureYears] = useState(10);
  const [annualRate, setAnnualRate] = useState(8.5);
  const monthlyRate = annualRate / 12 / 100;
  const n = tenureYears * 12;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-3">EMI Calculator</h3>
      <div className="space-y-3 bg-white p-4 rounded shadow">
        <label>Principal (₹)</label>
        <input type="number" className="w-full p-2 border rounded" value={principal} onChange={e => setPrincipal(Number(e.target.value))} />
        <label>Tenure (years)</label>
        <input type="number" className="w-full p-2 border rounded" value={tenureYears} onChange={e => setTenureYears(Number(e.target.value))} />
        <label>Annual Rate (%)</label>
        <input type="number" className="w-full p-2 border rounded" value={annualRate} onChange={e => setAnnualRate(Number(e.target.value))} />
        <div className="mt-2 p-3 bg-gray-50 rounded">Monthly EMI: <strong>₹{isFinite(emi) ? emi.toFixed(2) : '—'}</strong></div>
      </div>
    </div>
  );
}

function ROICalculator() {
  const [initial, setInitial] = useState(100000);
  const [finalValue, setFinalValue] = useState(150000);
  const [years, setYears] = useState(2);
  const roi = ((finalValue - initial) / initial) * 100;
  const cagr = Math.pow(finalValue / initial, 1 / years) - 1;
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-3">ROI & CAGR Calculator</h3>
      <div className="space-y-3 bg-white p-4 rounded shadow">
        <label>Initial Investment (₹)</label>
        <input type="number" className="w-full p-2 border rounded" value={initial} onChange={e => setInitial(Number(e.target.value))} />
        <label>Final Value (₹)</label>
        <input type="number" className="w-full p-2 border rounded" value={finalValue} onChange={e => setFinalValue(Number(e.target.value))} />
        <label>Years</label>
        <input type="number" className="w-full p-2 border rounded" value={years} onChange={e => setYears(Number(e.target.value))} />
        <div className="mt-2 p-3 bg-gray-50 rounded">Total ROI: <strong>{isFinite(roi) ? roi.toFixed(2) + '%' : '—'}</strong></div>
        <div className="mt-2 p-3 bg-gray-50 rounded">CAGR: <strong>{isFinite(cagr) ? (cagr * 100).toFixed(2) + '%' : '—'}</strong></div>
      </div>
    </div>
  );
}

function SIPCalculator() {
  const [sip, setSip] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const r = rate / 12 / 100;
  const n = years * 12;
  const fv = sip * (Math.pow(1 + r, n) - 1) / r * (1 + r);
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-3">SIP Calculator</h3>
      <div className="space-y-3 bg-white p-4 rounded shadow">
        <label>Monthly SIP (₹)</label>
        <input type="number" className="w-full p-2 border rounded" value={sip} onChange={e => setSip(Number(e.target.value))} />
        <label>Expected Annual Return (%)</label>
        <input type="number" className="w-full p-2 border rounded" value={rate} onChange={e => setRate(Number(e.target.value))} />
        <label>Years</label>
        <input type="number" className="w-full p-2 border rounded" value={years} onChange={e => setYears(Number(e.target.value))} />
        <div className="mt-2 p-3 bg-gray-50 rounded">Future Value: <strong>₹{isFinite(fv) ? fv.toFixed(2) : '—'}</strong></div>
      </div>
    </div>
  );
}

// --------------------- Portfolio (simple) ---------------------
function Portfolio() {
  const [holdings, setHoldings] = useState(JSON.parse(localStorage.getItem("invest_holdings") || "[]"));
  const [form, setForm] = useState({ name: "", invested: 0, current: 0 });

  function addHolding(e) {
    e.preventDefault();
    const newH = { ...form, id: Date.now() };
    const updated = [newH, ...holdings];
    setHoldings(updated);
    localStorage.setItem("invest_holdings", JSON.stringify(updated));
    setForm({ name: "", invested: 0, current: 0 });
  }

  const totalInvested = holdings.reduce((s, h) => s + Number(h.invested || 0), 0);
  const totalCurrent = holdings.reduce((s, h) => s + Number(h.current || 0), 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Portfolio Tracker</h2>
      <form className="bg-white p-4 rounded shadow mb-4" onSubmit={addHolding}>
        <input className="w-full p-2 border rounded mb-2" placeholder="Asset Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input type="number" className="w-full p-2 border rounded mb-2" placeholder="Invested Amount" value={form.invested} onChange={e => setForm({ ...form, invested: e.target.value })} />
        <input type="number" className="w-full p-2 border rounded mb-2" placeholder="Current Value" value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Add Holding</button>
      </form>

      <div className="bg-white p-4 rounded shadow">
        <div className="mb-2">Total Invested: <strong>₹{totalInvested}</strong></div>
        <div className="mb-2">Total Current Value: <strong>₹{totalCurrent}</strong></div>
        <div>Overall Gain/Loss: <strong>₹{(totalCurrent - totalInvested).toFixed(2)}</strong></div>
        <div className="mt-4 space-y-2">
          {holdings.map(h => (
            <div key={h.id} className="p-2 border rounded flex justify-between">
              <div>
                <div className="font-semibold">{h.name}</div>
                <div className="text-sm text-gray-600">Invested: ₹{h.invested} — Current: ₹{h.current}</div>
              </div>
              <div className="text-right">ROI: {( (h.current - h.invested) / Math.max(1,h.invested) * 100 ).toFixed(2)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --------------------- Main App & Routes ---------------------
export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/crm" element={<LeadCaptureCRM />} />
          <Route path="/portfolio" element={<Portfolio />} />

          <Route path="/calculators" element={<CalculatorsHome />} />
          <Route path="/calculators/emi" element={<EMICalculator />} />
          <Route path="/calculators/roi" element={<ROICalculator />} />
          <Route path="/calculators/sip" element={<SIPCalculator />} />

          {/* legacy friendly routes */}
          <Route path="/calculators/*" element={<div className="p-6">Select a calculator from the list (<Link to="/calculators">back</Link>).</div>} />
        </Routes>

        <footer className="text-center py-6 bg-gray-900 text-white mt-10">
          © 2025 InvestSmart. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

/* --------------------- README & Deployment Notes ---------------------

This single-file React demo provides:
- Admin Dashboard (mock-auth)
- Client login system (mock, client-side)
- Portfolio tracker (localStorage)
- EMI / ROI / SIP calculators
- Lead capture CRM (localStorage + CSV export)
- Basic SEO helper (document.title + meta description)

Next steps for production-ready app:
1) Split components into files, use a modern framework (Next.js or Vite + React Router).
2) Replace fakeAuth with real auth:
   - Option A: Firebase Auth + Firestore for quick MVP
   - Option B: Custom backend (Node/Express) with JWT + Postgres / Mongo
3) Use a server-side DB for leads, clients, holdings. Add role-based access control.
4) Add email service (SendGrid / Mailgun) for lead nurturing and confirmations.
5) Add analytics, error tracking (Sentry), and unit tests.
6) Security hardening: HTTPS, CSP, input validation, rate limiting.

SEO & Content suggestions (quick):
- Create pages: /about, /services, /pricing, /blog
- Each blog post should be accessible at /blog/yyyy/mm/slug with canonical tags.
- Include structured data (JSON-LD) for Organization and Breadcrumbs.
- Add open graph tags for social sharing.

Deployment (Netlify / Vercel)
- Build: npm run build (Vite) or next build (Next.js)
- Netlify: connect repo, set build command and publish directory (dist or .next)
- Vercel: connect repo, automatic deployments for main branch
- Environment variables: store API keys and DB URIs in the hosting platform's secret manager

CI/CD & Production Steps
- Protect admin endpoints behind server-side checks.
- Create a staging site for QA before promoting to prod.
- Use database backups & monitoring.

Want me to:
- Generate a full file structure (separate files) ready to git clone?
- Create a Node/Express backend (auth + leads API + export)?
- Create deploy-ready configs for Vercel (or Netlify)?

If yes — tell me which backend (Firebase / Node+Postgres / Supabase) and which hosting (Vercel / Netlify) you prefer.
*/
