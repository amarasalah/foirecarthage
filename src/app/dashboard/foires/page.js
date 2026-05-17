"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Plus, Edit, Trash2, MapPin, X } from "lucide-react";
import { getFoires, addFoire, updateFoire, deleteFoire } from "@/lib/firestore";
import { useToast } from "@/components/ToastProvider";

export default function FoiresPage() {
  const { addToast } = useToast();
  const [foires, setFoires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", location: "", startDate: "", endDate: "", description: "" });

  useEffect(() => { load(); }, []);

  const load = async () => { setFoires(await getFoires()); setLoading(false); };

  const resetForm = () => { setForm({ name: "", location: "", startDate: "", endDate: "", description: "" }); setEditId(null); setShowForm(false); };

  const handleSave = async () => {
    if (!form.name) { addToast("Le nom est obligatoire", "error"); return; }
    try {
      if (editId) { await updateFoire(editId, form); addToast("Foire mise à jour !", "success"); }
      else { await addFoire(form); addToast("Foire créée !", "success"); }
      resetForm(); load();
    } catch { addToast("Erreur", "error"); }
  };

  const handleEdit = (f) => { setForm({ name: f.name, location: f.location || "", startDate: f.startDate || "", endDate: f.endDate || "", description: f.description || "" }); setEditId(f.id); setShowForm(true); };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette foire ?")) return;
    await deleteFoire(id); addToast("Foire supprimée", "info"); load();
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}><span className="text-gradient">Foires</span></h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Gérer vos éditions de foires</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary"><Plus size={16} /> Nouvelle Foire</button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="glass" style={{ padding: 28, marginBottom: 24 }}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>{editId ? "Modifier" : "Nouvelle"} Foire</h3>
              <button onClick={resetForm} className="btn-icon"><X size={16} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Nom de la foire *</label>
                <input className="form-input" placeholder="Foire Internationale de Carthage 2026" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Lieu</label>
                <input className="form-input" placeholder="Parc des Expositions, Le Kram" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Date début</label>
                <input type="date" className="form-input" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Date fin</label>
                <input type="date" className="form-input" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={2} placeholder="Description de l'événement..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={handleSave} className="btn btn-primary">{editId ? "Mettre à jour" : "Créer"}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid-cards">{[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)}</div>
      ) : foires.length === 0 ? (
        <div className="glass empty-state"><CalendarDays size={48} /><h3>Aucune foire</h3><p>Créez votre première édition de foire</p></div>
      ) : (
        <div className="grid-cards">
          {foires.map((f, i) => (
            <motion.div key={f.id} className="glass" style={{ padding: 24 }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #22d3ee, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CalendarDays size={20} color="#fff" />
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="btn-icon" onClick={() => handleEdit(f)}><Edit size={14} /></button>
                  <button className="btn-icon" onClick={() => handleDelete(f.id)} style={{ color: "var(--accent-rose)" }}><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 4 }}>{f.name}</h3>
              {f.location && <p style={{ color: "var(--text-secondary)", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {f.location}</p>}
              {(f.startDate || f.endDate) && (
                <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}>
                  📅 {f.startDate || "?"} → {f.endDate || "?"}
                </p>
              )}
              {f.description && <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}>{f.description}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
