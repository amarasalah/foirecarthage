"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save, User, Briefcase, MapPin, Share2, MessageSquare,
  X, Phone, Mail, Building2, Globe, Link2, AtSign,
  Contact, Hash, Tag, Star, FileText, Upload
} from "lucide-react";
import { addClient } from "@/lib/firestore";
import { useToast } from "@/components/ToastProvider";
import { REGIONS, COUNTRIES, ACTIVITY_SECTORS, RATING_OPTIONS, TAG_SUGGESTIONS } from "@/lib/constants";
import CloudinaryUpload from "@/components/CloudinaryUpload";

function Section({ icon: Icon, title, color, delay, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={sectionStyle}
      className="glass"
    >
      <div style={sectionHeaderStyle}>
        <div style={{ ...sectionIconStyle, background: color }}>
          <Icon size={18} color="#fff" />
        </div>
        <h3 style={sectionTitleStyle}>{title}</h3>
      </div>
      <div style={sectionBodyStyle}>{children}</div>
    </motion.div>
  );
}

export default function AddClientPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    company: "", posteTravail: "", activitySector: "",
    country: "Tunisie", region: "", delegation: "", address: "",
    facebook: "", instagram: "", linkedin: "", twitter: "", website: "",
    rating: "", tags: [], notes: "", mediaUrls: [], avatar: "",
    foireId: "",
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const delegations = form.region && REGIONS[form.region] ? REGIONS[form.region] : [];

  const toggleTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName) {
      addToast("Le nom et prénom sont obligatoires", "error");
      return;
    }
    setSaving(true);
    try {
      await addClient({ ...form, visitDate: new Date().toISOString() });
      addToast("Client ajouté avec succès !", "success");
      router.push("/dashboard/clients");
    } catch (err) {
      addToast("Erreur lors de l'ajout du client", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>
            Nouveau <span className="text-gradient">Client</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            Remplissez les informations du nouveau contact
          </p>
        </div>
        <motion.button
          onClick={handleSave}
          className="btn btn-primary btn-lg"
          disabled={saving}
          whileHover={{ scale: 1.03, boxShadow: "0 8px 30px rgba(99,102,241,0.4)" }}
          whileTap={{ scale: 0.97 }}
        >
          {saving ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={spinnerSmall} /> Enregistrement...
            </span>
          ) : (
            <><Save size={18} /> Enregistrer le client</>
          )}
        </motion.button>
      </motion.div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

        {/* ─── LEFT COLUMN ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Identity */}
          <Section icon={User} title="Identité" color="linear-gradient(135deg, #6366f1, #818cf8)" delay={0.05}>
            <div style={gridTwo}>
              <div className="form-group">
                <label className="form-label">Prénom *</label>
                <div style={inputWrap}>
                  <User size={14} style={inputIconStyle} />
                  <input className="form-input" placeholder="Ahmed" value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)} style={inputPadded} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nom *</label>
                <div style={inputWrap}>
                  <User size={14} style={inputIconStyle} />
                  <input className="form-input" placeholder="Ben Ali" value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)} style={inputPadded} />
                </div>
              </div>
            </div>
            <div style={{ ...gridTwo, marginTop: 14 }}>
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <div style={inputWrap}>
                  <Phone size={14} style={inputIconStyle} />
                  <input className="form-input" placeholder="+216 XX XXX XXX" value={form.phone}
                    onChange={(e) => update("phone", e.target.value)} style={inputPadded} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <div style={inputWrap}>
                  <Mail size={14} style={inputIconStyle} />
                  <input type="email" className="form-input" placeholder="email@example.com" value={form.email}
                    onChange={(e) => update("email", e.target.value)} style={inputPadded} />
                </div>
              </div>
            </div>
          </Section>

          {/* Professional */}
          <Section icon={Briefcase} title="Professionnel" color="linear-gradient(135deg, #f59e0b, #fbbf24)" delay={0.1}>
            <div style={gridTwo}>
              <div className="form-group">
                <label className="form-label">Entreprise</label>
                <div style={inputWrap}>
                  <Building2 size={14} style={inputIconStyle} />
                  <input className="form-input" placeholder="Nom de l'entreprise" value={form.company}
                    onChange={(e) => update("company", e.target.value)} style={inputPadded} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Poste de Travail</label>
                <div style={inputWrap}>
                  <Briefcase size={14} style={inputIconStyle} />
                  <input className="form-input" placeholder="Directeur, Manager..." value={form.posteTravail}
                    onChange={(e) => update("posteTravail", e.target.value)} style={inputPadded} />
                </div>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Secteur d'Activité</label>
              <select className="form-select" value={form.activitySector}
                onChange={(e) => update("activitySector", e.target.value)}>
                <option value="">Sélectionner un secteur...</option>
                {ACTIVITY_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Classification Lead</label>
              <div style={{ display: "flex", gap: 8 }}>
                {RATING_OPTIONS.map((r) => (
                  <motion.button
                    key={r.value}
                    onClick={() => update("rating", form.rating === r.value ? "" : r.value)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      flex: 1, padding: "11px 10px", borderRadius: 10, border: "1px solid",
                      borderColor: form.rating === r.value ? r.color : "var(--border-glass)",
                      background: form.rating === r.value ? `${r.color}18` : "rgba(15,20,35,0.4)",
                      color: form.rating === r.value ? r.color : "var(--text-secondary)",
                      cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                      boxShadow: form.rating === r.value ? `0 0 16px ${r.color}25` : "none",
                    }}
                  >
                    {r.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </Section>

          {/* Location */}
          <Section icon={MapPin} title="Localisation" color="linear-gradient(135deg, #10b981, #34d399)" delay={0.15}>
            <div style={gridTwo}>
              <div className="form-group">
                <label className="form-label">Pays</label>
                <select className="form-select" value={form.country}
                  onChange={(e) => update("country", e.target.value)}>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Gouvernorat / Région</label>
                <select className="form-select" value={form.region}
                  onChange={(e) => { update("region", e.target.value); update("delegation", ""); }}>
                  <option value="">Sélectionner...</option>
                  {Object.keys(REGIONS).map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div style={{ ...gridTwo, marginTop: 14 }}>
              <div className="form-group">
                <label className="form-label">Délégation</label>
                <select className="form-select" value={form.delegation}
                  onChange={(e) => update("delegation", e.target.value)}
                  disabled={!delegations.length}>
                  <option value="">Sélectionner...</option>
                  {delegations.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Adresse</label>
                <input className="form-input" placeholder="Adresse complète"
                  value={form.address} onChange={(e) => update("address", e.target.value)} />
              </div>
            </div>
          </Section>
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Social Media */}
          <Section icon={Share2} title="Réseaux Sociaux" color="linear-gradient(135deg, #ec4899, #f472b6)" delay={0.08}>
            <div style={gridTwo}>
              <div className="form-group">
                <label className="form-label">Facebook</label>
                <div style={inputWrap}>
                  <Link2 size={14} style={inputIconStyle} />
                  <input className="form-input" placeholder="facebook.com/..."
                    value={form.facebook} onChange={(e) => update("facebook", e.target.value)} style={inputPadded} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Instagram</label>
                <div style={inputWrap}>
                  <AtSign size={14} style={inputIconStyle} />
                  <input className="form-input" placeholder="@username"
                    value={form.instagram} onChange={(e) => update("instagram", e.target.value)} style={inputPadded} />
                </div>
              </div>
            </div>
            <div style={{ ...gridTwo, marginTop: 14 }}>
              <div className="form-group">
                <label className="form-label">LinkedIn</label>
                <div style={inputWrap}>
                  <Contact size={14} style={inputIconStyle} />
                  <input className="form-input" placeholder="linkedin.com/in/..."
                    value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} style={inputPadded} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Twitter / X</label>
                <div style={inputWrap}>
                  <Hash size={14} style={inputIconStyle} />
                  <input className="form-input" placeholder="@username"
                    value={form.twitter} onChange={(e) => update("twitter", e.target.value)} style={inputPadded} />
                </div>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Site Web</label>
              <div style={inputWrap}>
                <Globe size={14} style={inputIconStyle} />
                <input className="form-input" placeholder="https://www.example.com"
                  value={form.website} onChange={(e) => update("website", e.target.value)} style={inputPadded} />
              </div>
            </div>
          </Section>

          {/* Tags */}
          <Section icon={Tag} title="Tags" color="linear-gradient(135deg, #22d3ee, #67e8f9)" delay={0.12}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TAG_SUGGESTIONS.map((t) => (
                <motion.button
                  key={t}
                  onClick={() => toggleTag(t)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  style={{
                    padding: "7px 16px", borderRadius: 20, border: "1px solid",
                    borderColor: form.tags.includes(t) ? "var(--accent-cyan)" : "var(--border-glass)",
                    background: form.tags.includes(t) ? "rgba(34,211,238,0.12)" : "rgba(15,20,35,0.4)",
                    color: form.tags.includes(t) ? "var(--accent-cyan)" : "var(--text-secondary)",
                    cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.2s",
                    boxShadow: form.tags.includes(t) ? "0 0 12px rgba(34,211,238,0.15)" : "none",
                  }}
                >
                  {form.tags.includes(t) ? "✓ " : ""}{t}
                </motion.button>
              ))}
            </div>
          </Section>

          {/* Notes */}
          <Section icon={FileText} title="Notes & Observations" color="linear-gradient(135deg, #8b5cf6, #a78bfa)" delay={0.16}>
            <textarea
              className="form-textarea"
              placeholder="Notes, remarques, observations sur le client..."
              rows={4}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              style={{ width: "100%" }}
            />
          </Section>

          {/* Media */}
          <Section icon={Upload} title="Médias" color="linear-gradient(135deg, #f43f5e, #fb7185)" delay={0.2}>
            <CloudinaryUpload
              onSuccess={(url) => {
                setForm((prev) => ({ ...prev, mediaUrls: [...prev.mediaUrls, url] }));
                addToast("Fichier uploadé !", "success");
              }}
            >
              {({ open }) => (
                <motion.button
                  type="button"
                  onClick={() => open()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={uploadBtnStyle}
                >
                  <Upload size={20} style={{ color: "var(--accent-primary)" }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>Cliquez pour uploader</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Photos, Documents, PDF...</p>
                  </div>
                </motion.button>
              )}
            </CloudinaryUpload>
            {form.mediaUrls.length > 0 && (
              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                {form.mediaUrls.map((url, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={mediaThumbnailStyle}
                  >
                    <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      onClick={() => setForm((prev) => ({ ...prev, mediaUrls: prev.mediaUrls.filter((_, j) => j !== i) }))}
                      style={mediaRemoveStyle}
                    >
                      <X size={10} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>

      {/* Bottom save (mobile-friendly) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 28, paddingBottom: 40 }}
      >
        <motion.button
          onClick={handleSave}
          className="btn btn-primary btn-lg"
          disabled={saving}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {saving ? "Enregistrement..." : <><Save size={18} /> Enregistrer le client</>}
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ─── Styles ─── */
const sectionStyle = {
  padding: 0,
  overflow: "hidden",
};
const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "16px 22px",
  borderBottom: "1px solid var(--border-glass)",
};
const sectionIconStyle = {
  width: 34,
  height: 34,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
const sectionTitleStyle = {
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: "0.2px",
};
const sectionBodyStyle = {
  padding: "18px 22px 22px",
};
const gridTwo = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};
const inputWrap = {
  position: "relative",
};
const inputIconStyle = {
  position: "absolute",
  left: 12,
  top: "50%",
  transform: "translateY(-50%)",
  color: "var(--text-muted)",
  pointerEvents: "none",
};
const inputPadded = {
  paddingLeft: 36,
  width: "100%",
};
const uploadBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  width: "100%",
  padding: "18px 20px",
  borderRadius: 12,
  border: "2px dashed var(--border-glass)",
  background: "rgba(15,20,35,0.3)",
  cursor: "pointer",
  transition: "all 0.2s",
};
const mediaThumbnailStyle = {
  position: "relative",
  width: 72,
  height: 72,
  borderRadius: 10,
  overflow: "hidden",
  border: "1px solid var(--border-glass)",
};
const mediaRemoveStyle = {
  position: "absolute",
  top: 4,
  right: 4,
  width: 20,
  height: 20,
  borderRadius: "50%",
  background: "rgba(0,0,0,0.7)",
  border: "none",
  color: "#fff",
  fontSize: 11,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const spinnerSmall = {
  width: 16,
  height: 16,
  border: "2px solid rgba(255,255,255,0.3)",
  borderTopColor: "#fff",
  borderRadius: "50%",
  animation: "spin 0.6s linear infinite",
  display: "inline-block",
};
