"use client";

import { useState, useEffect } from "react";
import { useT } from "@/hooks/useT";
import { useNewsletterPopup } from "@/hooks/useNewsletterPopup";

export default function NewsletterPopup() {
  const { t } = useT();
  const { shouldShow, dismiss, markSubscribed } = useNewsletterPopup();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [visible, setVisible] = useState(false);

  // Animazione di entrata
  useEffect(() => {
    if (shouldShow) {
      // Blocca scroll del body quando il popup è aperto
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => setVisible(true), 50);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
  }, [shouldShow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: data.message || "Iscrizione completata con successo!",
        });
        setEmail("");
        markSubscribed();
        setTimeout(() => {
          dismiss();
        }, 3000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Errore durante l'iscrizione",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Errore di connessione. Riprova più tardi.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!shouldShow) return null;

  const popup = t.footer.newsletterPopup;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        visible ? "bg-black/50 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={(e) => {
        // Chiudi cliccando sullo sfondo
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        className={`relative bg-white w-full max-w-sm sm:max-w-md border border-olive/10 shadow-2xl transition-all duration-500 ease-out ${
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Decorazione top */}
        <div className="h-1.5 bg-gradient-to-r from-olive via-salvia to-olive" />

        {/* Contenuto */}
        <div className="p-6 sm:p-8">
          {/* Icona oliva */}
          <div className="text-center mb-5 sm:mb-6">
            <span className="text-3xl sm:text-4xl">🌿</span>
          </div>

          {/* Titolo */}
          <h4 className="text-center text-xl sm:text-2xl font-serif text-olive mb-2 sm:mb-3">
            {popup.title}
          </h4>

          {/* Descrizione */}
          <p className="text-center text-nocciola text-sm sm:text-base leading-relaxed mb-6 sm:mb-8">
            {popup.description}
          </p>

          {/* Messaggio successo/errore */}
          {message && (
            <div
              className={`p-3 sm:p-4 text-sm mb-4 border-l-2 ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border-green-600"
                  : "bg-red-50 text-red-800 border-red-600"
              }`}
            >
              <p className="font-medium">{message.text}</p>
            </div>
          )}

          {/* Form */}
          {(!message || message.type !== "success") && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 sm:py-3.5 bg-beige/50 border border-olive/20 text-olive text-sm sm:text-base placeholder:text-nocciola/60 focus:border-olive focus:ring-2 focus:ring-olive/20 focus:bg-white transition-all duration-300 touch-manipulation outline-none"
                placeholder={popup.placeholder}
                autoFocus
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-olive text-beige px-6 py-3 sm:py-3.5 text-sm sm:text-base font-medium border border-olive/20 hover:shadow-xl hover:shadow-olive/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation cursor-pointer"
              >
                {loading ? popup.sending : popup.submit}
              </button>
            </form>
          )}

          {/* "No grazie" link */}
          {(!message || message.type !== "success") && (
            <button
              onClick={dismiss}
              type="button"
              className="w-full mt-3 text-nocciola/70 hover:text-olive text-xs sm:text-sm transition-colors duration-300 cursor-pointer py-2 touch-manipulation"
            >
              {popup.noThanks}
            </button>
          )}

          {/* Privacy */}
          <p className="text-center text-[10px] sm:text-xs text-nocciola/50 mt-3 sm:mt-4 leading-relaxed">
            {popup.privacy}
          </p>
        </div>

        {/* Bottone X chiudi */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-nocciola/40 hover:text-olive transition-colors duration-300 cursor-pointer touch-manipulation"
          aria-label={popup.close}
          type="button"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
