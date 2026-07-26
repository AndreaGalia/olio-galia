// lib/fakeReviews/pools.ts
// Pool di nomi e commenti per la generazione di recensioni dall'admin.
// Usato sia client-side (anteprima) che server-side (validazione).

export const MALE_FIRST_NAMES = [
  'Marco', 'Giuseppe', 'Antonio', 'Francesco', 'Luigi', 'Salvatore', 'Vincenzo', 'Pietro',
  'Andrea', 'Paolo', 'Stefano', 'Roberto', 'Alessandro', 'Davide', 'Matteo', 'Simone',
  'Fabio', 'Enrico', 'Claudio', 'Gianni',
];

export const FEMALE_FIRST_NAMES = [
  'Maria', 'Anna', 'Giulia', 'Francesca', 'Laura', 'Elena', 'Chiara', 'Sara',
  'Valentina', 'Alessia', 'Federica', 'Silvia', 'Martina', 'Roberta', 'Paola', 'Teresa',
  'Rosa', 'Carmela', 'Lucia', 'Elisa', 'Serena', 'Ilaria', 'Monica', 'Barbara',
  'Cristina', 'Daniela', 'Giovanna', 'Marta', 'Beatrice', 'Camilla',
];

export const SURNAMES = [
  'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci',
  'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Costa', 'Giordano',
  'Mancini', 'Rizzo', 'Lombardi', 'Moretti', 'Barbieri', 'Fontana', 'Santoro', 'Mariani',
  'Rinaldi', 'Caruso', 'Ferrara', 'Galli', 'Martini', 'Leone',
];

export const EMAIL_DOMAINS = ['gmail.com', 'libero.it', 'yahoo.it', 'hotmail.it', 'outlook.it', 'tiscali.it'];

/**
 * Tipo di pool commenti: 'food' per gli oli alimentari (EVO),
 * 'beauty' per i prodotti cosmetici (olio di mandorle, ecc.)
 */
export type CommentPoolType = 'food' | 'beauty';

/**
 * Commenti per fascia di stelle (prodotti alimentari). Il placeholder {prodotto}
 * viene sostituito con il nome del prodotto (in alcuni template).
 */
export const FOOD_COMMENT_POOLS: Record<number, string[]> = {
  5: [
    'Olio eccezionale, si sente subito che è genuino. Lo ricomprerò sicuramente.',
    'Ottimo!',
    'Sapore intenso e fruttato, come l\'olio che faceva mio nonno. Consigliatissimo.',
    'Qualità davvero superiore, niente a che vedere con quello del supermercato.',
    'Spedizione veloce e olio buonissimo. Che dire, perfetto.',
    'Il migliore olio che abbia mai comprato online. Profumo incredibile appena aperto.',
    'Prodotto genuino e di grande qualità. Si sente la differenza sul pane e sulle insalate.',
    'Davvero ottimo, dal colore al profumo al sapore. Complimenti!',
    'Ho provato {prodotto} dopo il consiglio di un amico e non lo cambio più.',
    'Eccellente rapporto qualità prezzo. Arrivato in tempi rapidi e imballato benissimo.',
    'Un olio come si deve, dal gusto deciso. A crudo è spettacolare.',
    'Finalmente un olio vero! Piccante al punto giusto, come deve essere un buon EVO.',
    'Acquisto più che soddisfacente, tutta la famiglia l\'ha apprezzato.',
    'Profumo e sapore da olio appena franto. Top.',
    'Consigliato da amici, si è rivelato all\'altezza delle aspettative. Riordinerò.',
    'Buonissimo, genuino e si sente che è fatto con passione. Grazie!',
    'Perfetto per la bruschetta, sapore autentico del sud.',
    'Qualità impeccabile e servizio clienti gentilissimo. Cinque stelle meritate.',
    'Secondo ordine, conferma piena. {prodotto} è ormai un must in casa nostra.',
    'L\'ho regalato ai miei suoceri e ora lo vogliono comprare anche loro. Ottimo prodotto.',
    'Sapore rotondo e fruttato, retrogusto piccantino. Davvero un bel prodotto.',
    'Non torno più all\'olio industriale. Complimenti per la qualità.',
    'Arrivato prima del previsto, confezione curata e olio fantastico.',
    'Semplicemente il migliore. Da provare assolutamente.',
    'Gusto autentico, si capisce che le olive sono raccolte e lavorate come si deve.',
  ],
  4: [
    'Molto buono, spedizione un po\' lenta ma ne vale la pena.',
    'Ottimo olio, avrei preferito una confezione un po\' più curata ma la sostanza c\'è tutta.',
    'Buon prodotto, sapore genuino. Il prezzo è leggermente alto ma la qualità si paga.',
    'Olio molto buono, per i miei gusti un filo troppo delicato ma la qualità è evidente.',
    'Soddisfatto dell\'acquisto, buon sapore e consegna nei tempi.',
    'Qualità buona, lo ricomprerei. Quattro stelle solo perché la consegna ha tardato un giorno.',
    'Buon olio genuino, magari un po\' più di piccante non guasterebbe.',
    'Prodotto valido, si sente la genuinità. Consigliato.',
    'Molto valido {prodotto}, buon equilibrio tra fruttato e piccante.',
    'Buono, niente da dire sul prodotto. Migliorabile solo l\'imballaggio.',
    'Ottimo sapore, prezzo nella media. Complessivamente soddisfatto.',
    'Buon acquisto, olio dal gusto pieno. Lo consiglio a chi cerca un EVO autentico.',
    'Qualità decisamente sopra la media. Un piccolo sconto sulle quantità sarebbe gradito.',
    'Arrivato tutto bene, olio buono e genuino come descritto.',
    'Molto soddisfatto, unica nota il tappo un po\' scomodo da dosare.',
    'Sapore autentico, si abbina benissimo a tutto. Promosso.',
    'Buon olio, secondo me perfetto per cucinare. A crudo preferisco un fruttato più intenso.',
    'Consegna regolare e prodotto di qualità. Tornerò a ordinare.',
    'Valido prodotto artigianale, si sente la differenza rispetto alla grande distribuzione.',
    'Buono davvero, quattro stelle piene.',
  ],
  3: [
    'Buon prodotto, prezzo un po\' alto rispetto ad altri oli simili.',
    'Olio discreto, mi aspettavo un sapore più intenso.',
    'Nella norma, non mi ha entusiasmato ma è comunque un olio genuino.',
    'Prodotto onesto. La spedizione però ha tardato qualche giorno.',
    'Buono ma non eccezionale, forse le mie aspettative erano troppo alte.',
    'Sapore gradevole ma per il prezzo mi aspettavo qualcosa in più.',
    'Discreto, lo userò per cucinare. A crudo preferisco altro.',
    'Olio nella media, confezione arrivata con un po\' di ritardo.',
    'Non male, ma ho assaggiato di meglio nella stessa fascia di prezzo.',
    'Prodotto corretto, qualità onesta. Tre stelle.',
    'Mi aspettavo un fruttato più deciso da {prodotto}, comunque un prodotto dignitoso.',
    'Sufficiente. Il servizio è stato buono, il sapore per me è troppo delicato.',
  ],
  2: [
    'Olio arrivato con la confezione danneggiata, il prodotto in sé è discreto.',
    'Non mi ha convinto, sapore troppo leggero per i miei gusti.',
    'Consegna lenta e prezzo alto. L\'olio è nella media.',
    'Mi aspettavo molto di più dalle recensioni. Deluso.',
    'Qualità non all\'altezza del prezzo secondo me.',
    'Sapore anonimo, non lo ricomprerei.',
    'Il prodotto è arrivato in ritardo e la bottiglia era sporca d\'olio all\'esterno.',
    'Sotto le aspettative, peccato.',
  ],
  1: [
    'Prodotto non conforme alle mie aspettative, esperienza deludente.',
    'Consegna in forte ritardo e nessuna risposta alle mie email. Non ci siamo.',
    'Non mi è piaciuto per niente, sapore che non sa di nulla.',
    'Bottiglia arrivata rotta. Poi risolto con il reso ma che disagio.',
    'Deluso dall\'acquisto, non lo consiglio.',
    'Per me bocciato, ho pagato tanto per un olio qualunque.',
  ],
};

/**
 * Commenti per fascia di stelle (prodotti beauty/cosmetici, es. olio di mandorle).
 */
export const BEAUTY_COMMENT_POOLS: Record<number, string[]> = {
  5: [
    'Olio meraviglioso, la pelle resta morbida e idratata tutto il giorno. Lo adoro!',
    'Fantastico!',
    'Si assorbe subito senza ungere, e il profumo è delicatissimo. Consigliato.',
    'Lo uso tutte le sere dopo la doccia, pelle di seta. Non lo cambio più.',
    'Prodotto naturale e genuino, si sente la differenza rispetto a quelli industriali.',
    'Perfetto per i massaggi, texture leggera e profumo piacevole.',
    'Lo uso anche sui capelli come impacco, risultato incredibile. Super consigliato.',
    'Qualità eccellente, {prodotto} è ormai fisso nella mia routine.',
    'Ottimo sulla pelle sensibile, nessuna irritazione. Finalmente un prodotto pulito.',
    'Idratazione perfetta senza effetto unto. Arrivato anche in tempi rapidissimi.',
    'L\'ho comprato per le smagliature in gravidanza su consiglio dell\'ostetrica. Ottimo.',
    'Profumo naturale e delicato, niente a che vedere con i profumi artificiali. Top.',
    'Regalo azzeccatissimo, mia sorella lo usa ogni giorno e me lo ha chiesto di nuovo.',
    'Prodotto puro e di qualità, si vede che è artigianale. Cinque stelle.',
    'La mia pelle secca è rinata. Riacquisterò sicuramente.',
    'Perfetto anche per la pelle delicata dei bambini. Promosso a pieni voti.',
    'Davvero un ottimo olio, nutriente e leggero. Il flacone dura tantissimo.',
  ],
  4: [
    'Molto buono, idrata bene. Avrei preferito un dosatore più pratico.',
    'Ottimo prodotto, si assorbe bene. Quattro stelle solo per la consegna un po\' lenta.',
    'Buon olio naturale, il profumo è molto tenue, a me piacerebbe più deciso.',
    'Valido per pelle e capelli, prezzo leggermente alto ma la qualità c\'è.',
    'Soddisfatta dell\'acquisto, pelle morbida già dopo pochi utilizzi.',
    'Buona qualità, texture un filo ricca per l\'estate ma d\'inverno è perfetto.',
    'Lo uso per i massaggi, scorre bene e nutre. Consigliato.',
    'Prodotto valido e naturale, {prodotto} mi ha convinto. Ricomprerò.',
    'Buono, si assorbe abbastanza in fretta. Confezione curata.',
    'Idrata molto bene, unica pecca il tappo che perde qualche goccia.',
    'Contenta dell\'acquisto, prodotto genuino e spedizione nei tempi.',
    'Buon rapporto qualità prezzo per un olio puro. Promosso.',
  ],
  3: [
    'Prodotto discreto, idrata ma non mi ha stupito.',
    'Nella media, mi aspettavo un profumo più gradevole.',
    'Buono ma un po\' caro rispetto ad altri oli di mandorle.',
    'Texture per me troppo grassa, impiega un po\' ad assorbirsi.',
    'Onesto, fa il suo dovere. Niente di più, niente di meno.',
    'Il prodotto è buono ma la spedizione ha tardato qualche giorno.',
    'Discreto, lo uso per i massaggi ma sulla pelle del viso preferisco altro.',
    'Sufficiente, forse le mie aspettative erano troppo alte.',
  ],
  2: [
    'Flacone arrivato con un po\' di prodotto fuoriuscito, peccato.',
    'Non mi ha convinto, l\'ho trovato troppo unto.',
    'Mi aspettavo di più dalle recensioni, per ora deluso.',
    'Il profumo non mi piace e il prezzo è alto per quello che offre.',
    'Consegna lenta e prodotto nella media. Non ricomprerò.',
  ],
  1: [
    'Esperienza deludente, prodotto non all\'altezza delle aspettative.',
    'Flacone arrivato danneggiato e assistenza lenta a rispondere.',
    'Non mi è piaciuto per niente, non fa quello che promette.',
    'Bocciato, ho pagato tanto per un olio qualunque.',
  ],
};

export const COMMENT_POOLS_BY_TYPE: Record<CommentPoolType, Record<number, string[]>> = {
  food: FOOD_COMMENT_POOLS,
  beauty: BEAUTY_COMMENT_POOLS,
};
