"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      setError(
        err.code === "auth/invalid-credential" ? "Email ou mot de passe incorrect" :
        err.code === "auth/email-already-in-use" ? "Cet email est déjà utilisé" :
        err.code === "auth/weak-password" ? "Le mot de passe doit contenir au moins 6 caractères" :
        "Erreur de connexion. Vérifiez vos identifiants."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Animated background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={styles.card}
        className="glass"
      >
        {/* Logo */}
        <motion.div style={styles.logoWrap}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
          <div style={styles.logoCircle}>
            <Sparkles size={28} color="#fff" />
          </div>
        </motion.div>

        <motion.h1 style={styles.title}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          Foire <span className="text-gradient">Carthage</span>
        </motion.h1>
        <motion.p style={styles.subtitle}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}>
          {isRegister ? "Créer un compte administrateur" : "Connectez-vous pour gérer vos contacts"}
        </motion.p>

        {error && (
          <motion.div style={styles.error}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={styles.inputWrap}>
              <Mail size={16} style={styles.inputIcon} />
              <input type="email" className="form-input" placeholder="admin@foire.tn"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required style={{ paddingLeft: 40, width: "100%" }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div style={styles.inputWrap}>
              <Lock size={16} style={styles.inputIcon} />
              <input type="password" className="form-input" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required style={{ paddingLeft: 40, width: "100%" }} />
            </div>
          </div>

          <motion.button type="submit" className="btn btn-primary btn-lg"
            disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              <>
                <LogIn size={18} />
                {isRegister ? "Créer le compte" : "Se connecter"}
              </>
            )}
          </motion.button>
        </form>

        <button onClick={() => { setIsRegister(!isRegister); setError(""); }}
          style={styles.toggleBtn}>
          {isRegister ? "Déjà un compte ? Se connecter" : "Créer un nouveau compte"}
        </button>
      </motion.div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex", alignItems: "center", justifyContent: "center",
    minHeight: "100vh", padding: 20, position: "relative", overflow: "hidden",
  },
  orb1: {
    position: "absolute", width: 400, height: 400, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)",
    top: "-10%", left: "-5%", animation: "float 8s ease-in-out infinite",
  },
  orb2: {
    position: "absolute", width: 300, height: 300, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)",
    bottom: "-5%", right: "-5%", animation: "float 10s ease-in-out infinite reverse",
  },
  orb3: {
    position: "absolute", width: 200, height: 200, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(34,211,238,0.08), transparent 70%)",
    top: "40%", right: "20%", animation: "float 6s ease-in-out infinite",
  },
  card: {
    width: "100%", maxWidth: 420, padding: "40px 36px",
    position: "relative", zIndex: 1,
  },
  logoWrap: { display: "flex", justifyContent: "center", marginBottom: 20 },
  logoCircle: {
    width: 56, height: 56, borderRadius: 16,
    background: "var(--accent-gradient)", display: "flex",
    alignItems: "center", justifyContent: "center",
    boxShadow: "0 8px 30px rgba(99,102,241,0.3)",
  },
  title: { textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 4 },
  subtitle: { textAlign: "center", color: "var(--text-secondary)", fontSize: 14, marginBottom: 28 },
  error: {
    padding: "10px 14px", borderRadius: 8, marginBottom: 16,
    background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)",
    color: "#f43f5e", fontSize: 13,
  },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  inputWrap: { position: "relative" },
  inputIcon: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" },
  toggleBtn: {
    marginTop: 20, width: "100%", background: "none", border: "none",
    color: "var(--text-secondary)", fontSize: 13, cursor: "pointer",
  },
  spinner: {
    width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff", borderRadius: "50%",
    animation: "spin 0.6s linear infinite", display: "inline-block",
  },
};
