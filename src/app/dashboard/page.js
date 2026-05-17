"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Globe, Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getClients } from "@/lib/firestore";
import { ACTIVITY_SECTORS } from "@/lib/constants";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const COLORS = ["#6366f1","#8b5cf6","#22d3ee","#10b981","#f59e0b","#f43f5e","#ec4899","#14b8a6","#a78bfa","#fb923c"];

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span>{display}</span>;
}

export default function DashboardPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClients().then((data) => { setClients(data); setLoading(false); });
  }, []);

  const totalClients = clients.length;
  const hotLeads = clients.filter((c) => c.rating === "hot").length;
  const countries = [...new Set(clients.map((c) => c.country).filter(Boolean))].length;
  const thisWeek = clients.filter((c) => {
    if (!c.createdAt) return false;
    const d = new Date(c.createdAt);
    const now = new Date();
    return (now - d) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  // Region data
  const regionMap = {};
  clients.forEach((c) => { if (c.region) regionMap[c.region] = (regionMap[c.region] || 0) + 1; });
  const regionData = Object.entries(regionMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  // Sector data
  const sectorMap = {};
  clients.forEach((c) => { if (c.activitySector) sectorMap[c.activitySector] = (sectorMap[c.activitySector] || 0) + 1; });
  const sectorData = Object.entries(sectorMap).map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 20) + "…" : name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  // Rating data
  const ratingData = [
    { name: "Chaud", value: clients.filter((c) => c.rating === "hot").length, color: "#ef4444" },
    { name: "Tiède", value: clients.filter((c) => c.rating === "warm").length, color: "#f59e0b" },
    { name: "Froid", value: clients.filter((c) => c.rating === "cold").length, color: "#6366f1" },
    { name: "Non classé", value: clients.filter((c) => !c.rating).length, color: "#334155" },
  ].filter((d) => d.value > 0);

  const stats = [
    { label: "Total Clients", value: totalClients, icon: Users, color: "#6366f1", bg: "rgba(99,102,241,0.15)" },
    { label: "Leads Chauds", value: hotLeads, icon: TrendingUp, color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
    { label: "Pays", value: countries, icon: Globe, color: "#22d3ee", bg: "rgba(34,211,238,0.15)" },
    { label: "Cette Semaine", value: thisWeek, icon: Star, color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  ];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Tableau de bord</h1>
        <div className="grid-stats">
          {[1,2,3,4].map((i) => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Tableau de <span className="text-gradient">bord</span></h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Vue d'ensemble de vos contacts</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div className="grid-stats" variants={container} initial="hidden" animate="show">
        {stats.map((s, i) => (
          <motion.div key={i} variants={item} className="glass stat-card"
            whileHover={{ y: -4, boxShadow: `0 12px 40px rgba(0,0,0,0.3)` }}>
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div className="stat-value"><AnimatedNumber value={s.value} /></div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 28 }}>
        {/* Region chart */}
        <motion.div className="glass" style={{ padding: 24 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Clients par Région</h3>
          {regionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={regionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#0d1117", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, color: "#f1f5f9" }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {regionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>Aucune donnée régionale</p></div>
          )}
        </motion.div>

        {/* Rating pie */}
        <motion.div className="glass" style={{ padding: 24 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Distribution des Leads</h3>
          {ratingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={ratingData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  paddingAngle={4} stroke="none">
                  {ratingData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0d1117", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, color: "#f1f5f9" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>Aucune donnée</p></div>
          )}
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
            {ratingData.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                <span style={{ color: "var(--text-secondary)" }}>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Sector chart */}
      {sectorData.length > 0 && (
        <motion.div className="glass" style={{ padding: 24, marginTop: 20 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Top Secteurs d'Activité</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#0d1117", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, color: "#f1f5f9" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {sectorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Recent clients */}
      <motion.div className="glass" style={{ padding: 24, marginTop: 20 }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Derniers Clients Ajoutés</h3>
        {clients.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Entreprise</th>
                <th>Région</th>
                <th>Secteur</th>
                <th>Lead</th>
              </tr>
            </thead>
            <tbody>
              {clients.slice(0, 5).map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.firstName} {c.lastName}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{c.company || "—"}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{c.region || "—"}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{c.activitySector || "—"}</td>
                  <td>
                    {c.rating && (
                      <span className={`tag tag-${c.rating}`}>
                        {c.rating === "hot" ? "🔥 Chaud" : c.rating === "warm" ? "🌤 Tiède" : "❄️ Froid"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <Users size={48} />
            <h3>Aucun client</h3>
            <p>Commencez par ajouter vos premiers contacts</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
