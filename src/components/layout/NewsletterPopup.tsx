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

  useEffect(() => {
    if (shouldShow) {
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
        visible ? "bg-black/40" : "bg-black/0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        className={`relative bg-sabbia w-full max-w-sm sm:max-w-md px-10 py-12 transition-all duration-500 ease-out ${
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Chiudi × */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-5 text-black/40 hover:text-black transition-colors duration-200 cursor-pointer text-lg leading-none"
          aria-label={popup.close}
          type="button"
        >
          ×
        </button>

        {/* Titolo */}
        <h2
          className="text-4xl sm:text-5xl italic font-normal text-black mb-6"
          style={{ fontFamily: '"Cormorant Garamond", serif', letterSpacing: "0" }}
        >
          {popup.title}
        </h2>

        {/* Descrizione */}
        <p className="text-sm text-black/70 leading-relaxed mb-10">
          {popup.description}
        </p>

        {/* Messaggio successo/errore */}
        {message && (
          <div
            className={`text-sm mb-6 ${
              message.type === "success"
                ? "text-green-800"
                : "text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        {(!message || message.type !== "success") && (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center border-b border-black/40">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={popup.placeholder}
                autoFocus
                className="flex-1 bg-transparent py-2 text-sm text-black placeholder:text-black/50 outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex-shrink-0 pl-3 text-black/60 hover:text-black transition-colors duration-200 cursor-pointer disabled:opacity-40 text-lg"
                aria-label={loading ? popup.sending : "Invia"}
              >
                {loading ? (
                  <span className="text-xs">{popup.sending}</span>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Privacy */}
        <p className="text-[11px] text-black/40 mt-5 leading-relaxed">
          {popup.privacy}
        </p>
      </div>
    </div>
  );
}
