// app/conferma-ordine/page.tsx
"use client";

import { Suspense } from "react";
import ConfermaOrdineContent from "./ConfermaOrdineContent";

// Loading component per il Suspense
function ConfermaOrdineLoading() {
  return (
    <div className="min-h-screen bg-beige flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-olive border-t-transparent"></div>
    </div>
  );
}

export default function ConfermaOrdinePage() {
  return (
    <Suspense fallback={<ConfermaOrdineLoading />}>
      <ConfermaOrdineContent />
    </Suspense>
  );
}