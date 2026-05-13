export interface WaitingListEntry {
  _id?: string;
  productId: string;        // ID locale del prodotto (local_xxx)
  email: string;
  locale: 'it' | 'en';     // Lingua con cui l'utente si è iscritto — per inviare la mail nella lingua giusta
  createdAt: Date;
  notifiedAt?: Date;        // Popolato quando l'admin invia la notifica
}
