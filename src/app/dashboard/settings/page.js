"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, MessageCircle, Save } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

export default function SettingsPage() {
  const { addToast } = useToast();
  const DEFAULT_TEMPLATE = `Bonjour,

Nous vous remercions sincèrement pour votre visite du stand SIREP PREFA lors du salon du bâtiment. Ce fut un réel plaisir d'échanger avec vous et de vous présenter nos solutions de préfabrication en béton.

SIREP PREFA est spécialisée dans la fabrication de planchers à poutrelles et entrevous, de dalles alvéolées précontraintes ainsi que de poteaux électriques en béton précontraint, conformément aux normes françaises et européennes. Grâce à des équipements de dernière génération et un savoir-faire industriel reconnu, nous proposons des solutions performantes, rapides à mettre en œuvre et adaptées à tous types de projets.

Nous restons à votre entière disposition pour toute étude, devis ou information complémentaire, et espérons avoir prochainement l'opportunité de collaborer avec vous.

📧 E-mail : contact@sirep-prefa.com.tn
🌐 Site web : sirep-prefa.com.tn
📞 Téléphone : +216 92 592 004 / +216 79 700 234`;

  const [template, setTemplate] = useState(
    () => (typeof window !== "undefined" && localStorage.getItem("whatsapp_template")) || DEFAULT_TEMPLATE
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
