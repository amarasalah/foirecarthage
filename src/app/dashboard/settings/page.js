"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, MessageCircle, Save } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

export default function SettingsPage() {
  const { addToast } = useToast();
  const [template, setTemplate] = useState(
    "Bonjour {firstName},\n\nSuite à notre rencontre à la {foireName}, nous souhaitons rester en contact avec vous.\n\nNous serions ravis de discuter d'éventuelles collaborations.\n\nCordialement,\nL'équipe Foire Carthage"
  );

  const handleSave = () => {
    localStorage.setItem("whatsapp_template", template);
    addToast("Modèle WhatsApp enregistré !", "success");
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>
          <SettingsIcon size={26} style={{ display: "inline", verticalAlign: "middle", marginRight: 10 }} />
          <span className="text-gradient">Paramètres</span>
        </h1>
      </motion.div>

      <motion.div className="glass" style={{ padding: 28, maxWidth: 700 }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <MessageCircle size={20} color="#25d366" />
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Modèle de Message WhatsApp</h3>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16 }}>
          Variables disponibles: <code style={{ color: "var(--accent-cyan)" }}>{"{firstName}"}</code>, <code style={{ color: "var(--accent-cyan)" }}>{"{lastName}"}</code>, <code style={{ color: "var(--accent-cyan)" }}>{"{company}"}</code>, <code style={{ color: "var(--accent-cyan)" }}>{"{foireName}"}</code>
        </p>
        <textarea className="form-textarea" rows={8} value={template} onChange={(e) => setTemplate(e.target.value)}
          style={{ width: "100%", fontSize: 14, lineHeight: 1.8 }} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={handleSave} className="btn btn-primary"><Save size={16} /> Enregistrer</button>
        </div>
      </motion.div>

      <motion.div className="glass" style={{ padding: 28, maxWidth: 700, marginTop: 20 }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>À propos</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.8 }}>
          <strong>Foire Carthage CRM</strong> — Plateforme de gestion des contacts pour foires commerciales.<br />
          Version 1.0.0<br />
          Développé avec Next.js, Firebase & Cloudinary.
        </p>
      </motion.div>
    </div>
  );
}
