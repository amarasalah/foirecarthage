"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Trash2, MessageCircle, Phone, Mail, MapPin, Globe, Briefcase, Save, X, ExternalLink } from "lucide-react";
import { getClient, updateClient, deleteClient } from "@/lib/firestore";
import { useToast } from "@/components/ToastProvider";
import { REGIONS, COUNTRIES, ACTIVITY_SECTORS, RATING_OPTIONS, TAG_SUGGESTIONS } from "@/lib/constants";
import { CldUploadWidget } from "next-cloudinary";

export default function ClientDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToast } = useToast();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadClient(); }, [id]);

  const loadClient = async () => {
    const data = await getClient(id);
    if (!data) { router.push("/dashboard/clients"); return; }
    setClient(data);
    setForm(data);
    setLoading(false);
  };

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id: _, createdAt, updatedAt, ...rest } = form;
      await updateClient(id, rest);
      addToast("Client mis à jour !", "success");
      setEditing(false);
      loadClient();
    } catch { addToast("Erreur de mise à jour", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer ce client définitivement ?")) return;
    await deleteClient(id);
    addToast("Client supprimé", "info");
    router.push("/dashboard/clients");
  };

  const openWhatsApp = () => {
    if (!client.phone) { addToast("Pas de numéro", "error"); return; }
    const phone = client.phone.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(`Bonjour ${client.firstName}, suite à notre rencontre à la Foire de Carthage, nous souhaitons rester en contact.`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  if (loading) {
    return <div style={{ display: "flex", gap: 20, flexDirection: "column" }}>
      <div className="skeleton" style={{ height: 40, width: 300, borderRadius: 8 }} />
      <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
    </div>;
  }

  const delegations = form.region && REGIONS[form.region] ? REGIONS[form.region] : [];

  const InfoRow = ({ icon: Icon, label, value, href }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(99,102,241,0.06)" }}>
      <Icon size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
      <span style={{ color: "var(--text-muted)", fontSize: 13, minWidth: 100 }}>{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}>
          {value} <ExternalLink size={12} />
        </a>
      ) : (
        <span style={{ fontSize: 14 }}>{value || "—"}</span>
      )}
    </div>
  );

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => router.back()} className="btn-icon"><ArrowLeft size={18} /></button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>{client.firstName} {client.lastName}</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{client.company || "Sans entreprise"} {client.posteTravail ? `· ${client.posteTravail}` : ""}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={openWhatsApp} className="btn btn-whatsapp btn-sm"><MessageCircle size={14} /> WhatsApp</button>
          <button onClick={() => setEditing(!editing)} className="btn btn-secondary btn-sm">{editing ? <><X size={14} /> Annuler</> : <><Edit size={14} /> Modifier</>}</button>
          <button onClick={handleDelete} className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
        </div>
      </motion.div>

      {editing ? (
        <motion.div className="glass" style={{ padding: 28 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group"><label className="form-label">Prénom</label><input className="form-input" value={form.firstName || ""} onChange={(e) => update("firstName", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Nom</label><input className="form-input" value={form.lastName || ""} onChange={(e) => update("lastName", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Téléphone</label><input className="form-input" value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.email || ""} onChange={(e) => update("email", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Entreprise</label><input className="form-input" value={form.company || ""} onChange={(e) => update("company", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Poste</label><input className="form-input" value={form.posteTravail || ""} onChange={(e) => update("posteTravail", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Secteur</label>
              <select className="form-select" value={form.activitySector || ""} onChange={(e) => update("activitySector", e.target.value)}>
                <option value="">—</option>{ACTIVITY_SECTORS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Pays</label>
              <select className="form-select" value={form.country || ""} onChange={(e) => update("country", e.target.value)}>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Région</label>
              <select className="form-select" value={form.region || ""} onChange={(e) => { update("region", e.target.value); update("delegation", ""); }}>
                <option value="">—</option>{Object.keys(REGIONS).map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Délégation</label>
              <select className="form-select" value={form.delegation || ""} onChange={(e) => update("delegation", e.target.value)}>
                <option value="">—</option>{delegations.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}><label className="form-label">Adresse</label><input className="form-input" value={form.address || ""} onChange={(e) => update("address", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Facebook</label><input className="form-input" value={form.facebook || ""} onChange={(e) => update("facebook", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Instagram</label><input className="form-input" value={form.instagram || ""} onChange={(e) => update("instagram", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">LinkedIn</label><input className="form-input" value={form.linkedin || ""} onChange={(e) => update("linkedin", e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Site Web</label><input className="form-input" value={form.website || ""} onChange={(e) => update("website", e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Lead</label>
              <div style={{ display: "flex", gap: 8 }}>
                {RATING_OPTIONS.map((r) => (
                  <button key={r.value} onClick={() => update("rating", r.value)} style={{
                    flex: 1, padding: "10px", borderRadius: 10, border: "1px solid",
                    borderColor: form.rating === r.value ? r.color : "var(--border-glass)",
                    background: form.rating === r.value ? `${r.color}15` : "transparent",
                    color: form.rating === r.value ? r.color : "var(--text-secondary)",
                    cursor: "pointer", fontSize: 13,
                  }}>{r.label}</button>
                ))}
              </div>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}><label className="form-label">Notes</label>
              <textarea className="form-textarea" rows={3} value={form.notes || ""} onChange={(e) => update("notes", e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Médias</label>
              <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={(r) => { if (r.info?.secure_url) { setForm((p) => ({ ...p, mediaUrls: [...(p.mediaUrls || []), r.info.secure_url] })); } }}>
                {({ open }) => <button type="button" onClick={() => open()} className="btn btn-secondary btn-sm">📎 Ajouter un média</button>}
              </CldUploadWidget>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
            <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
              {saving ? "Enregistrement..." : <><Save size={16} /> Enregistrer</>}
            </button>
          </div>
        </motion.div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          <motion.div className="glass" style={{ padding: 28 }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Informations</h3>
            <InfoRow icon={Phone} label="Téléphone" value={client.phone} />
            <InfoRow icon={Mail} label="Email" value={client.email} href={client.email ? `mailto:${client.email}` : null} />
            <InfoRow icon={Briefcase} label="Entreprise" value={client.company} />
            <InfoRow icon={Briefcase} label="Poste" value={client.posteTravail} />
            <InfoRow icon={Briefcase} label="Secteur" value={client.activitySector} />
            <InfoRow icon={MapPin} label="Pays" value={client.country} />
            <InfoRow icon={MapPin} label="Région" value={client.region} />
            <InfoRow icon={MapPin} label="Délégation" value={client.delegation} />
            <InfoRow icon={MapPin} label="Adresse" value={client.address} />
            {client.facebook && <InfoRow icon={Globe} label="Facebook" value={client.facebook} href={client.facebook.startsWith("http") ? client.facebook : `https://${client.facebook}`} />}
            {client.instagram && <InfoRow icon={Globe} label="Instagram" value={client.instagram} />}
            {client.linkedin && <InfoRow icon={Globe} label="LinkedIn" value={client.linkedin} href={client.linkedin.startsWith("http") ? client.linkedin : `https://${client.linkedin}`} />}
            {client.website && <InfoRow icon={Globe} label="Site Web" value={client.website} href={client.website.startsWith("http") ? client.website : `https://${client.website}`} />}
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <motion.div className="glass" style={{ padding: 20 }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Lead</h3>
              {client.rating ? (
                <span className={`tag tag-${client.rating}`} style={{ fontSize: 14, padding: "6px 16px" }}>
                  {client.rating === "hot" ? "🔥 Chaud" : client.rating === "warm" ? "🌤 Tiède" : "❄️ Froid"}
                </span>
              ) : <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Non classé</span>}
            </motion.div>

            {(client.tags || []).length > 0 && (
              <motion.div className="glass" style={{ padding: 20 }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Tags</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {client.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                </div>
              </motion.div>
            )}

            {client.notes && (
              <motion.div className="glass" style={{ padding: 20 }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Notes</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{client.notes}</p>
              </motion.div>
            )}

            {(client.mediaUrls || []).length > 0 && (
              <motion.div className="glass" style={{ padding: 20 }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Médias</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {client.mediaUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      style={{ borderRadius: 8, overflow: "hidden", aspectRatio: "1", border: "1px solid var(--border-glass)" }}>
                      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
