"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Sidebar from "@/components/Sidebar";
import ToastProvider from "@/components/ToastProvider";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
      } else {
        setReady(true);
      }
    });
    return () => unsub();
  }, [router]);

  if (!ready) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div style={spinnerStyle} />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{
          flex: 1,
          marginLeft: 260,
          padding: "24px 32px",
          minHeight: "100vh",
          transition: "margin-left 0.3s ease",
          position: "relative",
          zIndex: 1,
        }}>
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}

const spinnerStyle = {
  width: 36,
  height: 36,
  border: "3px solid var(--border-glass)",
  borderTopColor: "var(--accent-primary)",
  borderRadius: "50%",
  animation: "spin 0.7s linear infinite",
};
