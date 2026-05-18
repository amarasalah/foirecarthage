"use client";
import { useEffect, useRef, useCallback } from "react";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dphkgxhwc";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "foire_carthage";

export default function CloudinaryUpload({ onSuccess, children }) {
  const widgetRef = useRef(null);
  const scriptLoaded = useRef(false);

  const loadScript = useCallback(() => {
    return new Promise((resolve) => {
      if (window.cloudinary) { resolve(); return; }
      if (scriptLoaded.current) { resolve(); return; }
      scriptLoaded.current = true;
      const script = document.createElement("script");
      script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
      script.async = true;
      script.onload = resolve;
      document.body.appendChild(script);
    });
  }, []);

  const open = useCallback(async () => {
    await loadScript();
    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUD_NAME,
          uploadPreset: UPLOAD_PRESET,
          multiple: true,
          sources: ["local", "camera", "url"],
          maxFileSize: 10000000,
          language: "fr",
          text: {
            fr: {
              or: "ou",
              back: "Retour",
              close: "Fermer",
              upload_more: "Ajouter plus",
              done: "Terminé",
              drop_title_single: "Déposez votre fichier ici",
              drop_title_multiple: "Déposez vos fichiers ici",
              browse: "Parcourir",
            },
          },
        },
        (error, result) => {
          if (!error && result.event === "success") {
            onSuccess(result.info.secure_url);
          }
        }
      );
    }
    widgetRef.current.open();
  }, [loadScript, onSuccess]);

  return children({ open });
}
