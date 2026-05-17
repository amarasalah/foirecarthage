"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Grid3X3, List, MessageCircle, Trash2, Edit, Eye, X, Download, ChevronDown } from "lucide-react";
import { getClients, deleteClient } from "@/lib/firestore";
import { useToast } from "@/components/ToastProvider";
import { REGIONS, COUNTRIES, ACTIVITY_SECTORS, RATING_OPTIONS } from "@/lib/constants";
import * as XLSX from "xlsx";

export default function ClientsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("table");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({ region: "", country: "", sector: "", rating: "" });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const data = await getClients();
    setClients(data);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const s = search.toLowerCase();
      const matchSearch = !s || [c.firstName, c.lastName, c.company, c.phone, c.email, c.region]
        .filter(Boolean).some((v) => v.toLowerCase().includes(s));
      const matchRegion = !filters.region || c.region === filters.region;
      const matchCountry = !filters.country || c.country === filters.country;
      const matchSector = !filters.sector || c.activitySector === filters.sector;
      const matchRating = !filters.rating || c.rating === filters.rating;
      return matchSearch && matchRegion && matchCountry && matchSector && matchRating;
    });
  }, [clients, search, filters]);

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce client ?")) return;
    await deleteClient(id);
    addToast("Client supprimé", "info");
    loadClients();
  };

  const openWhatsApp = (client) => {
    if (!client.phone) { addToast("Pas de numéro de téléphone", "error"); return; }
    const phone = client.phone.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(`Bonjour ${client.firstName}, suite à notre rencontre à la Foire de Carthage, nous souhaitons rester en contact. Cordialement.`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const bulkWhatsApp = () => {
    const selected = clients.filter((c) => selectedIds.includes(c.id) && c.phone);
    if (!selected.length) { addToast("Sélectionnez des clients avec numéro de téléphone", "error"); return; }
    selected.forEach((c, i) => {
      setTimeout(() => openWhatsApp(c), i * 1500);
    });
  };

  const exportExcel = () => {
    const data = filtered.map((c) => ({
      Prénom: c.firstName, Nom: c.lastName, Téléphone: c.phone,
      Email: c.email, Entreprise: c.company, Poste: c.posteTravail,
      Secteur: c.activitySector, Pays: c.country, Région: c.region,
      Délégation: c.delegation, Adresse: c.address, Lead: c.rating,
      Tags: (c.tags || []).join(", "), Notes: c.notes,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    XLSX.writeFile(wb, `clients_foire_${new Date().toISOString().slice(0, 10)}.xlsx`);
    addToast("Export Excel terminé !", "success");
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map((c) => c.id));
  };

  const clearFilters = () => { setFilters({ region: "", country: "", sector: "", rating: "" }); setSearch(""); };

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (search ? 1 : 0);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Mes <span className="text-gradient">Clients</span></h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            {filtered.length} client{filtered.length > 1 ? "s" : ""} {activeFilterCount > 0 ? "(filtré)" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportExcel} className="btn btn-secondary btn-sm"><Download size={14} /> Excel</button>
          {selectedIds.length > 0 && (
            <button onClick={bulkWhatsApp} className="btn btn-whatsapp btn-sm">
              <MessageCircle size={14} /> WhatsApp ({selectedIds.length})
            </button>
          )}
          <button onClick={() => router.push("/dashboard/add-client")} className="btn btn-primary">+ Ajouter</button>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <div className="glass" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input className="form-input" placeholder="Rechercher par nom, entreprise, téléphone..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 38, width: "100%" }} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-secondary btn-sm"
            style={{ borderColor: activeFilterCount > 0 ? "var(--accent-primary)" : undefined }}>
            <Filter size={14} /> Filtres {activeFilterCount > 0 && <span className="badge">{activeFilterCount}</span>}
          </button>
          <button onClick={() => setView(view === "table" ? "cards" : "table")} className="btn btn-secondary btn-sm">
            {view === "table" ? <Grid3X3 size={14} /> : <List size={14} />}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, paddingTop: 16, borderTop: "1px solid var(--border-glass)", marginTop: 16 }}>
                <select className="form-select" value={filters.region} onChange={(e) => setFilters((p) => ({ ...p, region: e.target.value }))}>
                  <option value="">Toutes régions</option>
                  {Object.keys(REGIONS).map((r) => <option key={r}>{r}</option>)}
                </select>
                <select className="form-select" value={filters.country} onChange={(e) => setFilters((p) => ({ ...p, country: e.target.value }))}>
                  <option value="">Tous pays</option>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <select className="form-select" value={filters.sector} onChange={(e) => setFilters((p) => ({ ...p, sector: e.target.value }))}>
                  <option value="">Tous secteurs</option>
                  {ACTIVITY_SECTORS.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select className="form-select" value={filters.rating} onChange={(e) => setFilters((p) => ({ ...p, rating: e.target.value }))}>
                  <option value="">Tous leads</option>
                  {RATING_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} style={{ marginTop: 8, background: "none", border: "none", color: "var(--accent-rose)", fontSize: 13, cursor: "pointer" }}>
                  <X size={12} /> Effacer les filtres
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid-cards">{[1,2,3,4,5,6].map((i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass empty-state">
          <Search size={48} />
          <h3>Aucun résultat</h3>
          <p>Essayez de modifier vos filtres ou ajoutez de nouveaux clients</p>
        </div>
      ) : view === "table" ? (
        <div className="glass" style={{ overflow: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={selectAll} /></th>
                <th>Nom</th><th>Entreprise</th><th>Téléphone</th><th>Région</th><th>Secteur</th><th>Lead</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <td><input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleSelect(c.id)} /></td>
                  <td style={{ fontWeight: 500 }}>{c.firstName} {c.lastName}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{c.company || "—"}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{c.phone || "—"}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{c.region || "—"}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{c.activitySector || "—"}</td>
                  <td>{c.rating && <span className={`tag tag-${c.rating}`}>{c.rating === "hot" ? "🔥" : c.rating === "warm" ? "🌤" : "❄️"}</span>}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn-icon" onClick={() => router.push(`/dashboard/clients/${c.id}`)} title="Voir"><Eye size={14} /></button>
                      <button className="btn-icon" onClick={() => openWhatsApp(c)} title="WhatsApp" style={{ color: "#25d366" }}><MessageCircle size={14} /></button>
                      <button className="btn-icon" onClick={() => handleDelete(c.id)} title="Supprimer" style={{ color: "var(--accent-rose)" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid-cards">
          {filtered.map((c, i) => (
            <motion.div key={c.id} className="glass" style={{ padding: 20, cursor: "pointer" }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }} onClick={() => router.push(`/dashboard/clients/${c.id}`)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff" }}>
                  {(c.firstName?.[0] || "")}{(c.lastName?.[0] || "")}
                </div>
                {c.rating && <span className={`tag tag-${c.rating}`}>{c.rating === "hot" ? "🔥 Chaud" : c.rating === "warm" ? "🌤 Tiède" : "❄️ Froid"}</span>}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{c.firstName} {c.lastName}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 2 }}>{c.company || "Sans entreprise"}</p>
              <p style={{ color: "var(--text-muted)", fontSize: 12 }}>{c.posteTravail || ""}</p>
              <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                {c.region && <span style={{ fontSize: 11, color: "var(--text-muted)", background: "rgba(99,102,241,0.08)", padding: "2px 8px", borderRadius: 10 }}>📍 {c.region}</span>}
                {c.activitySector && <span style={{ fontSize: 11, color: "var(--text-muted)", background: "rgba(99,102,241,0.08)", padding: "2px 8px", borderRadius: 10 }}>💼 {c.activitySector.slice(0, 18)}</span>}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 12, borderTop: "1px solid var(--border-glass)", paddingTop: 12 }}>
                <button className="btn-icon" onClick={(e) => { e.stopPropagation(); openWhatsApp(c); }} style={{ color: "#25d366" }}><MessageCircle size={14} /></button>
                <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} style={{ color: "var(--accent-rose)" }}><Trash2 size={14} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
