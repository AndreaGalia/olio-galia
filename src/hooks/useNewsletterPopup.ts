"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

// Rotte dove il popup newsletter può apparire (esclusa homepage, gestita da config)
const BASE_ALLOWED_ROUTES = ["/products", "/about", "/contact"];

// Chiave sessionStorage per "già mostrato in questa sessione"
const SESSION_KEY = "newsletter_popup_shown";
// Chiave localStorage per "già iscritto"
const SUBSCRIBED_KEY = "newsletter_subscribed";
// Chiave localStorage per "popup chiuso dall'utente"
const DISMISSED_KEY = "newsletter_popup_dismissed";

// Valori di default (fallback se API non risponde)
const DEFAULTS = {
  enabled: true,
  showOnHomepage: false,
  delayMs: 20000,
  scrollThreshold: 50,
  dismissDays: 7,
};

interface NewsletterPopupConfig {
  enabled: boolean;
  showOnHomepage: boolean;
  delayMs: number;
  scrollThreshold: number;
  dismissDays: number;
}

function isAllowedRoute(pathname: string, showOnHomepage: boolean): boolean {
  if (showOnHomepage && pathname === "/") return true;
  return BASE_ALLOWED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function isDismissedRecently(dismissDays: number): boolean {
  try {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) return false;
    const dismissedDate = new Date(dismissed);
    const daysSince =
      (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < dismissDays;
  } catch {
    return false;
  }
}

export function useNewsletterPopup() {
  const [shouldShow, setShouldShow] = useState(false);
  const [config, setConfig] = useState<NewsletterPopupConfig>(DEFAULTS);
  const [configLoaded, setConfigLoaded] = useState(false);
  const pathname = usePathname();
  const configRef = useRef(config);
  configRef.current = config;

  // Fetch config from API
  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch settings");
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data.newsletter_popup) {
          setConfig(data.newsletter_popup);
        }
      })
      .catch(() => {
        // Fallback: usa i defaults
      })
      .finally(() => {
        if (!cancelled) setConfigLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(() => {
    setShouldShow(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
      localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
    } catch {}
  }, []);

  const markSubscribed = useCallback(() => {
    setShouldShow(false);
    try {
      localStorage.setItem(SUBSCRIBED_KEY, "true");
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {}
  }, []);

  useEffect(() => {
    if (!configLoaded) return;

    // Se il popup è disabilitato dall'admin, non mostrare mai
    if (!configRef.current.enabled) return;

    // Non mostrare se non è una rotta permessa
    if (!isAllowedRoute(pathname, configRef.current.showOnHomepage)) return;

    // Non mostrare se già iscritto, già mostrato in sessione, o chiuso di recente
    try {
      if (localStorage.getItem(SUBSCRIBED_KEY) === "true") return;
      if (sessionStorage.getItem(SESSION_KEY) === "true") return;
      if (isDismissedRecently(configRef.current.dismissDays)) return;
    } catch {
      return;
    }

    let triggered = false;

    const trigger = () => {
      if (triggered) return;
      triggered = true;
      setShouldShow(true);
      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {}
      // Cleanup
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };

    // Timer: dopo il delay configurato
    const timer = setTimeout(trigger, configRef.current.delayMs);

    // Scroll: alla percentuale configurata
    const scrollThresholdDecimal = configRef.current.scrollThreshold / 100;
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      if (docHeight > 0 && scrollTop / docHeight >= scrollThresholdDecimal) {
        trigger();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname, configLoaded]);

  return { shouldShow, dismiss, markSubscribed };
}
