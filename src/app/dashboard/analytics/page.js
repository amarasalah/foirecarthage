"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { getClients } from "@/lib/firestore";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";

const COLORS = ["#6366f1","#8b5cf6","#22d3ee","#10b981","#f59e0b","#f43f5e","#ec4899","#14b8a6","#a78bfa","#fb923c","#84cc16","#06b6d4"];

export default function AnalyticsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getClients().then((d) => { setClients(d); setLoading(false); }); }, []);

  const buildMap = (key) => {
    const map = {};
    clients.forEach((c) => { if (c[key]) map[c[key]] = (map[c[key]] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  };

  const regionData = buildMap("region").slice(0, 10);
  const countryData = buildMap("country").slice(0, 10);
  const sectorData = buildMap("activitySector").slice(0, 8);
  const ratingData = [
    { name: "🔥 Chaud", value: clients.filter((c) => c.rating === "hot").length, color: "#ef4444" },
    { name: "🌤 Tiède", value: clients.filter((c) => c.rating === "warm").length, color: "#f59e0b" },
    { name: "❄️ Froid", value: clients.filter((c) => c.rating === "cold").length, color: "#6366f1" },
  ].filter((d) => d.value > 0);

  // Timeline: last 30 days
  const timelineData = (() => {
    const days = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    clients.forEach((c) => {
      if (c.createdAt) {
        const key = new Date(c.createdAt).toISOString().slice(0, 10);
        if (days[key] !== undefined) days[key]++;
      }
    });
    return Object.entries(days).map(([date, count]) => ({ date: date.slice(5), count }));
  })();

  // Tags
  const tagMap = {};
  clients.forEach((c) => (c.tags || []).forEach((t) => { tagMap[t] = (tagMap[t] || 0) + 1; }));
  const tagData = Object.entries(tagMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);

  const tooltipStyle = { background: "#0d1117", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, color: "#f1f5f9" };
  const anim = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay } });

  if (loading) return <div><h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Analytiques</h1><div className="grid-2">{[1,2,3,4].map((i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 16 }} />)}</div></div>;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>
          <BarChart3 size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: 10 }} />
          <span className="text-gradient">Analytiques</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>{clients.length} clients analysés</p>
      </motion.div>

      {/* Timeline */}
      <motion.div className="glass" style={{ padding: 24, marginBottom: 20 }} {...anim(0.1)}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Acquisition sur 30 jours</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={timelineData}>
            <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#grad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid-2">
        {/* Regions */}
        <motion.div className="glass" style={{ padding: 24 }} {...anim(0.2)}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Clients par Région</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={regionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[0,6,6,0]}>{regionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Rating */}
        <motion.div className="glass" style={{ padding: 24 }} {...anim(0.3)}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Distribution Leads</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={ratingData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} stroke="none">
                {ratingData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
            {ratingData.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                <span style={{ color: "var(--text-secondary)" }}>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Countries */}
        <motion.div className="glass" style={{ padding: 24 }} {...anim(0.4)}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Clients par Pays</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={countryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[6,6,0,0]}>{countryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sectors */}
        <motion.div className="glass" style={{ padding: 24 }} {...anim(0.5)}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Secteurs d'Activité</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={sectorData} dataKey="value" cx="50%" cy="50%" outerRadius={100} paddingAngle={2} stroke="none"
                label={({ name, percent }) => `${name.slice(0, 12)} ${(percent * 100).toFixed(0)}%`}>
                {sectorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Tags */}
      {tagData.length > 0 && (
        <motion.div className="glass" style={{ padding: 24, marginTop: 20 }} {...anim(0.6)}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Tags Populaires</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tagData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[6,6,0,0]} fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
