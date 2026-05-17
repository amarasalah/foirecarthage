"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Save, ArrowLeft, ArrowRight, User, Briefcase, MapPin, Share2, MessageSquare, X } from "lucide-react";
import { addClient } from "@/lib/firestore";
import { useToast } from "@/components/ToastProvider";
import { REGIONS, COUNTRIES, ACTIVITY_SECTORS, RATING_OPTIONS, TAG_SUGGESTIONS } from "@/lib/constants";
import { CldUploadWidget } from "next-cloudinary";

const STEPS = [
  { icon: User, label: "Identité" },
  { icon: Briefcase, label: "Professionnel" },
  { icon: MapPin, label: "Localisation" },
  { icon: Share2, label: "Réseaux" },
  { icon: MessageSquare, label: "Notes & Médias" },
];

export default function AddClientPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState(0);
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

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);
  const goNext = () => { if (step < 4) { setDirection(1); setStep(step + 1); } };
  const goPrev = () => { if (step > 0) { setDirection(-1); setStep(step - 1); } };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>Ajouter un <span className="text-gradient">Client</span></h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Remplissez les informations du contact</p>
      </motion.div>

      {/* Steps indicator */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => { setDirection(i > step ? 1 : -1); setStep(i); }}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "12px 8px", borderRadius: 10, border: "none", cursor: "pointer",
              background: i === step ? "rgba(99,102,241,0.15)" : "transparent",
              color: i === step ? "var(--accent-primary)" : i < step ? "var(--accent-emerald)" : "var(--text-muted)",
              fontSize: 13, fontWeight: i === step ? 600 : 400,
              transition: "all 0.2s",
            }}>
            <s.icon size={16} />
            <span style={{ display: "inline" }}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Form content */}
      <motion.div className="glass" style={{ padding: 32, minHeight: 360, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={step} custom={direction}
            variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}>

            {step === 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">Prénom *</label>
                  <input className="form-input" placeholder="Ahmed" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom *</label>
                  <input className="form-input" placeholder="Ben Ali" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input className="form-input" placeholder="+216 XX XXX XXX" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="email@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">Entreprise</label>
                  <input className="form-input" placeholder="Nom de l'entreprise" value={form.company} onChange={(e) => update("company", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Poste de Travail</label>
                  <input className="form-input" placeholder="Directeur, Manager..." value={form.posteTravail} onChange={(e) => update("posteTravail", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Secteur d'Activité</label>
                  <select className="form-select" value={form.activitySector} onChange={(e) => update("activitySector", e.target.value)}>
                    <option value="">Sélectionner...</option>
                    {ACTIVITY_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Classification Lead</label>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    {RATING_OPTIONS.map((r) => (
                      <button key={r.value} onClick={() => update("rating", r.value)}
                        style={{
                          flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid",
                          borderColor: form.rating === r.value ? r.color : "var(--border-glass)",
                          background: form.rating === r.value ? `${r.color}15` : "transparent",
                          color: form.rating === r.value ? r.color : "var(--text-secondary)",
                          cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.2s",
                        }}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">Pays</label>
                  <select className="form-select" value={form.country} onChange={(e) => update("country", e.target.value)}>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Gouvernorat / Région</label>
                  <select className="form-select" value={form.region} onChange={(e) => { update("region", e.target.value); update("delegation", ""); }}>
                    <option value="">Sélectionner...</option>
                    {Object.keys(REGIONS).map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Délégation</label>
                  <select className="form-select" value={form.delegation} onChange={(e) => update("delegation", e.target.value)} disabled={!delegations.length}>
                    <option value="">Sélectionner...</option>
                    {delegations.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Adresse</label>
                  <input className="form-input" placeholder="Adresse complète" value={form.address} onChange={(e) => update("address", e.target.value)} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">Facebook</label>
                  <input className="form-input" placeholder="facebook.com/..." value={form.facebook} onChange={(e) => update("facebook", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Instagram</label>
                  <input className="form-input" placeholder="@username" value={form.instagram} onChange={(e) => update("instagram", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">LinkedIn</label>
                  <input className="form-input" placeholder="linkedin.com/in/..." value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Twitter / X</label>
                  <input className="form-input" placeholder="@username" value={form.twitter} onChange={(e) => update("twitter", e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Site Web</label>
                  <input className="form-input" placeholder="https://..." value={form.website} onChange={(e) => update("website", e.target.value)} />
                </div>
              </div>
            )}

            {step === 4 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {TAG_SUGGESTIONS.map((t) => (
                      <button key={t} onClick={() => toggleTag(t)}
                        style={{
                          padding: "6px 14px", borderRadius: 20, border: "1px solid",
                          borderColor: form.tags.includes(t) ? "var(--accent-primary)" : "var(--border-glass)",
                          background: form.tags.includes(t) ? "rgba(99,102,241,0.15)" : "transparent",
                          color: form.tags.includes(t) ? "var(--accent-primary)" : "var(--text-secondary)",
                          cursor: "pointer", fontSize: 13, transition: "all 0.2s",
                        }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" placeholder="Notes, remarques, observations..." rows={4}
                    value={form.notes} onChange={(e) => update("notes", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Médias (Photos, Documents)</label>
                  <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                    onSuccess={(result) => {
                      if (result.info?.secure_url) {
                        setForm((prev) => ({ ...prev, mediaUrls: [...prev.mediaUrls, result.info.secure_url] }));
                        addToast("Fichier uploadé !", "success");
                      }
                    }}
                  >
                    {({ open }) => (
                      <button type="button" onClick={() => open()} className="btn btn-secondary" style={{ width: "fit-content" }}>
                        📎 Uploader des fichiers
                      </button>
                    )}
                  </CldUploadWidget>
                  {form.mediaUrls.length > 0 && (
                    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                      {form.mediaUrls.map((url, i) => (
                        <div key={i} style={{ position: "relative", width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-glass)" }}>
                          <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button onClick={() => setForm((prev) => ({ ...prev, mediaUrls: prev.mediaUrls.filter((_, j) => j !== i) }))}
                            style={{ position: "absolute", top: 2, right: 2, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Navigation buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <button onClick={goPrev} className="btn btn-secondary" disabled={step === 0}
          style={{ opacity: step === 0 ? 0.4 : 1 }}>
          <ArrowLeft size={16} /> Précédent
        </button>
        {step < 4 ? (
          <button onClick={goNext} className="btn btn-primary">
            Suivant <ArrowRight size={16} />
          </button>
        ) : (
          <motion.button onClick={handleSave} className="btn btn-primary btn-lg"
            disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {saving ? "Enregistrement..." : <><Save size={18} /> Enregistrer</>}
          </motion.button>
        )}
      </div>
    </div>
  );
}
