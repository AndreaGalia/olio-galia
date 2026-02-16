# Piano Miglioramenti Newsletter

## Obiettivi

1. **Semplificare il form** - Solo email, eliminare nome/cognome/telefono
2. **Popup automatico smart** - Appare nelle pagine prodotto, non in homepage

---

## 1. Semplificazione Form (Solo Email)

### File da modificare

#### `src/components/layout/NewsletterModal.tsx`
- Rimuovere i campi `firstName`, `lastName`, `phone` dal form e dallo state
- Mantenere solo il campo `email`
- Ridurre il modal: header + campo email + bottone submit
- Layout piu compatto e pulito

#### `src/app/api/newsletter/route.ts`
- Rimuovere validazione obbligatoria di `firstName` e `lastName`
- Richiedere solo `email`
- Passare valori vuoti/default per firstName e lastName al `CustomerService.createCustomer()`
- Adattare la chiamata a `EmailService.sendNewsletterWelcome()` (saluto generico senza nome)

#### `src/data/locales/it.json` e `en.json`
- Aggiornare le traduzioni del modal newsletter
- Rimuovere label/placeholder di nome, cognome, telefono
- Aggiungere eventuale messaggio incentivo (es. "Ricevi il 10% di sconto!")

#### `src/lib/email/newsletter-template.ts`
- Adattare il template email per saluto generico (senza nome)
- Es. "Ciao!" invece di "Ciao Mario!"

---

## 2. Popup Automatico nelle Pagine Prodotto

### Logica di trigger

- **Dove**: Solo nelle pagine prodotto (`/products/*`, `/shop`, pagine catalogo)
- **Dove NO**: Homepage (`/`), pagine legali, checkout, about
- **Quando**: Dopo **20 secondi** di permanenza sulla pagina OPPURE al **scroll del 50%** (il primo dei due)
- **Frequenza**: Massimo 1 volta per sessione (usa `sessionStorage`)
- **Soppressione**: Non mostrare se l'utente e gia iscritto (check `localStorage` con flag `newsletter_subscribed`)
- **Chiusura**: Se l'utente chiude il popup, non rimostrarlo per quella sessione

### File da creare/modificare

#### Nuovo: `src/components/layout/NewsletterPopup.tsx`
- Componente separato dal `NewsletterModal` del footer
- Popup piu leggero e meno invasivo (banner in basso o slide-in laterale, non modal a tutto schermo)
- Contiene solo campo email + bottone
- Animazione di entrata (slide-up o fade-in)
- Bottone X per chiudere
- Riusa la stessa API `POST /api/newsletter`

#### `src/app/layout.tsx` (o layout delle pagine prodotto)
- Integrare il `NewsletterPopup` con logica condizionale basata sulla rotta
- Usare `usePathname()` per determinare se mostrare il popup

#### Nuovo: `src/hooks/useNewsletterPopup.ts`
- Hook custom che gestisce tutta la logica:
  - Timer 20 secondi
  - Scroll listener (50%)
  - Check `sessionStorage` (gia mostrato?)
  - Check `localStorage` (gia iscritto?)
  - Restituisce `{ shouldShow, dismiss, markSubscribed }`

### Flusso utente

```
Utente naviga su pagina prodotto
  → Dopo 20s O scroll 50% (primo che accade)
    → Check: gia mostrato in sessione? → NO → Mostra popup
    → Check: gia iscritto? → NO → Mostra popup
      → Utente inserisce email → POST /api/newsletter
        → Successo: messaggio conferma + salva flag localStorage
        → Errore/gia iscritto: messaggio appropriato
      → Utente chiude popup → salva flag sessionStorage
```

---

## 3. Mantenere il Bottone nel Footer

- Il bottone "Iscriviti" nel footer resta funzionante
- Apre lo stesso modal (semplificato con solo email)
- Serve come fallback per chi non ha visto il popup

---

## Ordine di implementazione

1. Semplificare il form a solo email (modal + API + traduzioni + template email)
2. Creare hook `useNewsletterPopup`
3. Creare componente `NewsletterPopup` (design leggero, slide-in)
4. Integrare popup nel layout con logica condizionale per rotta
5. Test completo del flusso
