import "./globals.css";

export const metadata = {
  title: "Foire Carthage — Gestion des Clients",
  description: "Plateforme de gestion des contacts et clients pour les foires commerciales de Carthage",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
