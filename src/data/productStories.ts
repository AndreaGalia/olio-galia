/**
 * Dati productStory per i prodotti del catalogo.
 * Importato sia dalle migrazioni DB che dall'eventuale script locale.
 */

import type { ProductStory } from '@/types/productStory';

export const LATTA_5L_STORY_IT: ProductStory = {
  sections: [
    {
      type: 'items',
      layout: 'grid',
      title: "Benefici dell\u2019Olio",
      badge: '100% Extra Vergine Siciliano',
      items: [
        {
          name: 'Polifenoli',
          description:
            "Antiossidanti naturali che proteggono cuore e sistema immunitario. Indicatore di qualit\u00e0 e freschezza dell\u2019olio.",
        },
        {
          name: 'Vitamina E',
          description:
            "Anti-age naturale, contrasta l\u2019invecchiamento cellulare e preserva le propriet\u00e0 organolettiche nel tempo.",
        },
        {
          name: 'Acido Oleico',
          description:
            'Grassi monoinsaturi che contribuiscono al controllo del colesterolo e della pressione arteriosa.',
        },
        {
          name: 'Purezza 100%',
          description:
            "Senza additivi o raffinazione. Prodotto genuino dalla frangitura diretta delle olive siciliane.",
        },
      ],
    },
    {
      type: 'flavorProfile',
      title: 'Cultivar e Profilo Aromatico',
      cultivars: [
        {
          name: 'Tonda Iblea',
          description:
            'Variet\u00e0 tipica dei Monti Iblei. Profumi intensi di pomodoro verde, erba fresca, carciofo e mandorla dolce.',
        },
        {
          name: 'Nocellara Etna',
          description:
            "Originaria dell\u2019Etna. Carattere deciso con note amare e piccanti che bilanciano la dolcezza della Tonda Iblea.",
        },
      ],
      sensorNotes: [
        { label: 'Colore', value: 'Dorato-verde brillante' },
        { label: 'Profumo', value: 'Fruttato medio \u2014 oliva fresca' },
        { label: 'Gusto', value: 'Equilibrato e armonico' },
        { label: 'Retrogusto', value: 'Persistente, note di mandorla' },
      ],
    },
    {
      type: 'origin',
      title: 'Origine e Lavorazione',
      location: 'Ferla (Siracusa) \u2014 Monti Iblei, Sicilia',
      altitude: '450\u2013700 m s.l.m.',
      climate: 'Mediterraneo temperato \u2014 estate calda e ventilata',
      territory:
        "Il territorio tra Ferla e Buccheri, nel cuore dei Monti Iblei, rappresenta una delle zone olivicole pi\u00f9 vocate della Sicilia. L\u2019olivo cresce su terreni calcarei e collinari terrazzati, ricchi di biodiversit\u00e0 che contribuisce alla complessit\u00e0 aromatica dell\u2019olio.",
      steps: [
        { label: 'Raccolta', value: 'Manuale \u2014 brucatura, Ottobre\u2013Novembre' },
        { label: 'Frangitura', value: 'Rapida, entro poche ore dalla raccolta' },
        { label: 'Estrazione', value: 'A freddo \u2014 temperatura inferiore a 27\u00b0C' },
        { label: 'Stoccaggio', value: 'Cisterne inox sotto azoto \u2014 luce esclusa' },
      ],
    },
    {
      type: 'items',
      layout: 'grid',
      title: 'Punti di Forza',
      items: [
        {
          name: '100% Italiano',
          description: 'Prodotto interamente in Sicilia, Monti Iblei \u2014 origine tracciabile.',
        },
        {
          name: 'Raccolta Manuale',
          description: 'Brucatura tradizionale, olive integre e senza stress meccanico.',
        },
        {
          name: 'Estratto a Freddo',
          description: 'Frantoio aziendale, processo sotto i 27\u00b0C per preservare i polifenoli.',
        },
        {
          name: 'Formato Famiglia',
          description:
            'Latta in acciaio da 5 litri \u2014 protegge dalla luce, ideale per uso continuativo.',
        },
        {
          name: 'Qualit\u00e0 Accessibile',
          description: 'Premium autentico senza intermediari \u2014 direttamente dal produttore.',
        },
      ],
    },
  ],
};

export const LATTA_5L_STORY_EN: ProductStory = {
  sections: [
    {
      type: 'items',
      layout: 'grid',
      title: 'Olive Oil Benefits',
      badge: '100% Sicilian Extra Virgin',
      items: [
        {
          name: 'Polyphenols',
          description:
            "Natural antioxidants that protect the heart and immune system \u2014 a key indicator of quality and freshness.",
        },
        {
          name: 'Vitamin E',
          description:
            "Natural anti-ageing agent, fights cellular ageing and preserves the oil\u2019s organoleptic properties over time.",
        },
        {
          name: 'Oleic Acid',
          description:
            'Monounsaturated fats that help regulate cholesterol levels and blood pressure.',
        },
        {
          name: '100% Purity',
          description:
            'No additives or refining. A genuine product obtained by direct pressing of Sicilian olives.',
        },
      ],
    },
    {
      type: 'flavorProfile',
      title: 'Cultivars & Flavour Profile',
      cultivars: [
        {
          name: 'Tonda Iblea',
          description:
            'Typical variety of the Monti Iblei. Intense aromas of green tomato, fresh grass, artichoke and sweet almond.',
        },
        {
          name: 'Nocellara Etna',
          description:
            'Native to Etna. A bold character with bitter and spicy notes that balance the sweetness of Tonda Iblea.',
        },
      ],
      sensorNotes: [
        { label: 'Colour', value: 'Bright golden-green' },
        { label: 'Aroma', value: 'Medium fruity \u2014 fresh olive' },
        { label: 'Taste', value: 'Balanced and harmonious' },
        { label: 'Finish', value: 'Persistent, almond notes' },
      ],
    },
    {
      type: 'origin',
      title: 'Origin & Craft',
      location: 'Ferla (Siracusa) \u2014 Monti Iblei, Sicily',
      altitude: '450\u2013700 m a.s.l.',
      climate: 'Temperate Mediterranean \u2014 warm and breezy summers',
      territory:
        'The territory between Ferla and Buccheri, in the heart of the Monti Iblei, is one of the most vocationally suited olive-growing areas in Sicily. Olive trees grow on limestone terraced hillside soils, rich in biodiversity that contributes to the aromatic complexity of the oil.',
      steps: [
        { label: 'Harvest', value: 'Manual \u2014 handpicking, October\u2013November' },
        { label: 'Milling', value: 'Rapid, within a few hours of harvest' },
        { label: 'Extraction', value: 'Cold-pressed \u2014 below 27\u00b0C' },
        { label: 'Storage', value: 'Stainless steel tanks under nitrogen \u2014 no light exposure' },
      ],
    },
    {
      type: 'items',
      layout: 'grid',
      title: 'Key Strengths',
      items: [
        {
          name: '100% Italian',
          description: 'Produced entirely in Sicily, Monti Iblei \u2014 fully traceable origin.',
        },
        {
          name: 'Hand-harvested',
          description: 'Traditional hand-picking, whole olives with no mechanical stress.',
        },
        {
          name: 'Cold-pressed',
          description: 'On-site mill, process below 27\u00b0C to preserve polyphenols.',
        },
        {
          name: 'Family Format',
          description: '5-litre steel tin \u2014 blocks light, ideal for everyday use.',
        },
        {
          name: 'Accessible Premium',
          description: 'Authentic premium quality with no middlemen \u2014 direct from the producer.',
        },
      ],
    },
  ],
};

export const BEAUTY_OIL_STORY_IT: ProductStory = {
  sections: [
    {
      type: 'items',
      layout: 'grid',
      title: 'Benefici Principali',
      badge: '100% Naturale \u2022 Vegan \u2022 Made in Italy',
      items: [
        {
          name: 'Idratazione Profonda',
          description: 'Idratazione intensa e duratura per pelli secche, sensibili e disidratate.',
        },
        {
          name: 'Elasticit\u00e0 Cutanea',
          description:
            "Aumenta la tonicit\u00e0 della pelle e ne migliora l\u2019elasticit\u00e0 con uso continuativo.",
        },
        {
          name: 'Anti-Smagliature',
          description:
            'Aiuta nella prevenzione delle smagliature se applicato regolarmente su pancia, fianchi e cosce.',
        },
        {
          name: 'Azione Lenitiva',
          description: 'Effetto rilassante e lenitivo \u2014 ideale dopo doccia o bagno caldo.',
        },
        {
          name: 'Olio da Massaggio',
          description: 'Perfetto come olio da massaggio puro o come base per oli essenziali.',
        },
        {
          name: 'Capelli Nutriti',
          description: 'Ammorbidisce capelli secchi e sfibrati se applicato prima dello shampoo.',
        },
      ],
    },
    {
      type: 'items',
      layout: 'list',
      title: 'Propriet\u00e0 degli Ingredienti',
      items: [
        {
          name: 'Olio di Mandorle Dolci',
          action: 'Emolliente, idratante, nutriente',
          description:
            "Rende la pelle pi\u00f9 morbida, elastica e tonica. Aiuta a prevenire la secchezza e le smagliature.",
        },
        {
          name: 'Vitamina E (Tocoferolo)',
          action: 'Antiossidante naturale',
          description:
            "Contrasta i radicali liberi, mantiene l\u2019elasticit\u00e0 cutanea e prolunga la freschezza del prodotto.",
        },
      ],
    },
    {
      type: 'items',
      layout: 'list',
      title: 'Come Utilizzarlo',
      items: [
        {
          name: 'Corpo \u2014 Uso Quotidiano',
          description:
            'Applicare una piccola quantit\u00e0 sulla pelle umida dopo la doccia, massaggiando fino a completo assorbimento.',
        },
        {
          name: 'Contro le Smagliature',
          description:
            'Applicare regolarmente su pancia, fianchi, seno e cosce con movimenti circolari.',
        },
        {
          name: 'Viso',
          description:
            'Versare poche gocce su un dischetto di cotone per rimuovere trucco e impurit\u00e0. Risciacquare con acqua tiepida.',
        },
        {
          name: 'Capelli',
          description:
            'Distribuire alcune gocce sulle lunghezze prima dello shampoo, lasciare agire 20\u201330 minuti e lavare con shampoo delicato.',
        },
        {
          name: 'Massaggi',
          description:
            'Utilizzare puro oppure come base per diluire oli essenziali (1\u20132 gocce per 10 ml di olio).',
        },
      ],
    },
    {
      type: 'technicalData',
      title: 'Dati Tecnici',
      badge: 'INCI: Prunus Amygdalus Dulcis Oil, Tocopherol',
      keyValues: [
        { key: 'Aspetto', value: 'Liquido limpido, colore giallo tenue' },
        { key: 'Odore', value: 'Naturale, delicato (mandorla)' },
        { key: 'Densit\u00e0', value: '0,910 \u2013 0,920 g/ml' },
        { key: 'pH', value: 'Neutro (\u2248 7,0)' },
        { key: 'Conservanti', value: 'Nessuno aggiunto \u2014 vitamina E come antiossidante naturale' },
        { key: 'Shelf Life', value: '24 mesi chiuso \u2014 12 mesi aperto' },
        { key: 'Conservazione', value: '15\u201325\u00b0C, al riparo dalla luce, in vetro ambrato' },
      ],
    },
    {
      type: 'items',
      layout: 'grid',
      title: 'Punti di Forza',
      items: [
        {
          name: 'Formula Minimalista',
          description:
            'Solo 2 ingredienti naturali \u2014 nessun parabene, silicone o additivo sintetico.',
        },
        {
          name: 'Made in Italy',
          description:
            'Qualit\u00e0 e filiera controllata \u2014 mandorle italiane, produzione italiana.',
        },
        {
          name: 'Vitamina E Naturale',
          description: 'Antiossidante e conservante naturale \u2014 nessun additivo chimico.',
        },
        {
          name: 'Multiuso',
          description: 'Corpo, viso e capelli \u2014 un solo prodotto per tutta la routine.',
        },
        { name: 'Vegan Friendly', description: 'Formula 100% vegetale, non testata su animali.' },
        { name: 'Profumo Naturale', description: 'Aroma delicato e naturale di mandorla dolce.' },
      ],
    },
  ],
};

// ─── Latta 3L ────────────────────────────────────────────────────────────────

export const LATTA_3L_STORY_IT: ProductStory = {
  sections: [
    {
      type: 'items',
      layout: 'grid',
      title: "Benefici dell\u2019Olio",
      badge: '100% Extra Vergine Siciliano',
      items: [
        {
          name: 'Polifenoli',
          description:
            "Antiossidanti naturali che proteggono cuore e sistema immunitario. Indicatore di qualit\u00e0 e freschezza dell\u2019olio.",
        },
        {
          name: 'Vitamina E',
          description:
            "Anti-age naturale, contrasta l\u2019invecchiamento cellulare e preserva le propriet\u00e0 organolettiche nel tempo.",
        },
        {
          name: 'Acido Oleico',
          description:
            'Grassi monoinsaturi che contribuiscono al controllo del colesterolo e della pressione arteriosa.',
        },
        {
          name: 'Purezza 100%',
          description:
            "Senza additivi o raffinazione. Prodotto genuino dalla frangitura diretta delle olive siciliane.",
        },
      ],
    },
    {
      type: 'flavorProfile',
      title: 'Cultivar e Profilo Aromatico',
      cultivars: [
        {
          name: 'Tonda Iblea',
          description:
            'Variet\u00e0 tipica dei Monti Iblei. Profumi intensi di pomodoro verde, erba fresca, carciofo e mandorla dolce.',
        },
        {
          name: 'Nocellara Etna',
          description:
            "Originaria dell\u2019Etna. Carattere deciso con note amare e piccanti che bilanciano la dolcezza della Tonda Iblea.",
        },
      ],
      sensorNotes: [
        { label: 'Colore', value: 'Dorato-verde brillante' },
        { label: 'Profumo', value: 'Fruttato medio \u2014 oliva fresca' },
        { label: 'Gusto', value: 'Equilibrato e armonico' },
        { label: 'Retrogusto', value: 'Persistente, note di mandorla' },
      ],
    },
    {
      type: 'origin',
      title: 'Origine e Lavorazione',
      location: 'Ferla (Siracusa) \u2014 Monti Iblei, Sicilia',
      altitude: '450\u2013700 m s.l.m.',
      climate: 'Mediterraneo temperato \u2014 estate calda e ventilata',
      territory:
        "Il territorio tra Ferla e Buccheri, nel cuore dei Monti Iblei, rappresenta una delle zone olivicole pi\u00f9 vocate della Sicilia. L\u2019olivo cresce su terreni calcarei e collinari terrazzati, ricchi di biodiversit\u00e0 che contribuisce alla complessit\u00e0 aromatica dell\u2019olio.",
      steps: [
        { label: 'Raccolta', value: 'Manuale \u2014 brucatura, Ottobre\u2013Novembre' },
        { label: 'Frangitura', value: 'Rapida, entro poche ore dalla raccolta' },
        { label: 'Estrazione', value: 'A freddo \u2014 temperatura inferiore a 27\u00b0C' },
        { label: 'Stoccaggio', value: 'Cisterne inox sotto azoto \u2014 luce esclusa' },
      ],
    },
    {
      type: 'items',
      layout: 'grid',
      title: 'Punti di Forza',
      items: [
        {
          name: '100% Italiano',
          description: 'Prodotto interamente in Sicilia, Monti Iblei \u2014 origine tracciabile.',
        },
        {
          name: 'Raccolta Manuale',
          description: 'Brucatura tradizionale, olive integre e senza stress meccanico.',
        },
        {
          name: 'Estratto a Freddo',
          description: 'Frantoio aziendale, processo sotto i 27\u00b0C per preservare i polifenoli.',
        },
        {
          name: 'Formato Pratico',
          description:
            'Latta in acciaio da 3 litri \u2014 compatta, protegge dalla luce, perfetta per nuclei di 2\u20133 persone.',
        },
        {
          name: 'Qualit\u00e0 Accessibile',
          description: 'Premium autentico senza intermediari \u2014 direttamente dal produttore.',
        },
      ],
    },
  ],
};

export const LATTA_3L_STORY_EN: ProductStory = {
  sections: [
    {
      type: 'items',
      layout: 'grid',
      title: 'Olive Oil Benefits',
      badge: '100% Sicilian Extra Virgin',
      items: [
        {
          name: 'Polyphenols',
          description:
            "Natural antioxidants that protect the heart and immune system \u2014 a key indicator of quality and freshness.",
        },
        {
          name: 'Vitamin E',
          description:
            "Natural anti-ageing agent, fights cellular ageing and preserves the oil\u2019s organoleptic properties over time.",
        },
        {
          name: 'Oleic Acid',
          description:
            'Monounsaturated fats that help regulate cholesterol levels and blood pressure.',
        },
        {
          name: '100% Purity',
          description:
            'No additives or refining. A genuine product obtained by direct pressing of Sicilian olives.',
        },
      ],
    },
    {
      type: 'flavorProfile',
      title: 'Cultivars & Flavour Profile',
      cultivars: [
        {
          name: 'Tonda Iblea',
          description:
            'Typical variety of the Monti Iblei. Intense aromas of green tomato, fresh grass, artichoke and sweet almond.',
        },
        {
          name: 'Nocellara Etna',
          description:
            'Native to Etna. A bold character with bitter and spicy notes that balance the sweetness of Tonda Iblea.',
        },
      ],
      sensorNotes: [
        { label: 'Colour', value: 'Bright golden-green' },
        { label: 'Aroma', value: 'Medium fruity \u2014 fresh olive' },
        { label: 'Taste', value: 'Balanced and harmonious' },
        { label: 'Finish', value: 'Persistent, almond notes' },
      ],
    },
    {
      type: 'origin',
      title: 'Origin & Craft',
      location: 'Ferla (Siracusa) \u2014 Monti Iblei, Sicily',
      altitude: '450\u2013700 m a.s.l.',
      climate: 'Temperate Mediterranean \u2014 warm and breezy summers',
      territory:
        'The territory between Ferla and Buccheri, in the heart of the Monti Iblei, is one of the most vocationally suited olive-growing areas in Sicily. Olive trees grow on limestone terraced hillside soils, rich in biodiversity that contributes to the aromatic complexity of the oil.',
      steps: [
        { label: 'Harvest', value: 'Manual \u2014 handpicking, October\u2013November' },
        { label: 'Milling', value: 'Rapid, within a few hours of harvest' },
        { label: 'Extraction', value: 'Cold-pressed \u2014 below 27\u00b0C' },
        { label: 'Storage', value: 'Stainless steel tanks under nitrogen \u2014 no light exposure' },
      ],
    },
    {
      type: 'items',
      layout: 'grid',
      title: 'Key Strengths',
      items: [
        {
          name: '100% Italian',
          description: 'Produced entirely in Sicily, Monti Iblei \u2014 fully traceable origin.',
        },
        {
          name: 'Hand-harvested',
          description: 'Traditional hand-picking, whole olives with no mechanical stress.',
        },
        {
          name: 'Cold-pressed',
          description: 'On-site mill, process below 27\u00b0C to preserve polyphenols.',
        },
        {
          name: 'Practical Format',
          description:
            '3-litre steel tin \u2014 compact, blocks light, perfect for households of 2\u20133 people.',
        },
        {
          name: 'Accessible Premium',
          description: 'Authentic premium quality with no middlemen \u2014 direct from the producer.',
        },
      ],
    },
  ],
};

// ─── Premium Oil (Bottiglia) ──────────────────────────────────────────────────

export const PREMIUM_OIL_STORY_IT: ProductStory = {
  sections: [
    {
      type: 'items',
      layout: 'grid',
      title: "L\u2019Eccellenza in Bottiglia",
      badge: 'Premium \u2022 Extra Vergine \u2022 Monovarietale',
      items: [
        {
          name: 'Selezione Rigorosa',
          description:
            "Solo le olive migliori della stagione, selezionate manualmente al momento ottimale di maturazione per esprimere il massimo potenziale aromatico.",
        },
        {
          name: 'Alta Concentrazione di Polifenoli',
          description:
            "Raccolta anticipata che garantisce un profilo antiossidante superiore. Pi\u00f9 polifenoli, pi\u00f9 benefici e maggiore longevit\u00e0 del prodotto.",
        },
        {
          name: 'Fruttato Intenso',
          description:
            "Note sensoriali spiccate di pomodoro verde, carciofo, erba fresca \u2014 un olio da degustazione prima ancora che da cucina.",
        },
        {
          name: 'Bottiglia in Vetro Scuro',
          description:
            "La bottiglia in vetro ambrato protegge dall\u2019ossidazione, preservando integri i profumi e le qualit\u00e0 nutrizionali nel tempo.",
        },
      ],
    },
    {
      type: 'flavorProfile',
      title: 'Profilo Sensoriale',
      cultivars: [
        {
          name: 'Tonda Iblea',
          description:
            "Cultivar autoctona dei Monti Iblei, vocata alla produzione di oli di alta qualit\u00e0. Regala note di mandorla, carciofo e pomodoro verde con un fruttato persistente.",
        },
        {
          name: 'Raccolta Anticipata',
          description:
            "Le olive vengono raccolte a inizio campagna, quando ancora verdi o in leggera invaiatura. Scelta che massimizza amaro, piccante e complessit\u00e0 aromatica.",
        },
      ],
      sensorNotes: [
        { label: 'Colore', value: 'Verde intenso con riflessi dorati' },
        { label: 'Profumo', value: 'Fruttato intenso \u2014 pomodoro verde, carciofo' },
        { label: 'Amaro', value: 'Elegante e persistente' },
        { label: 'Piccante', value: 'Deciso \u2014 indice di elevata polifenolicit\u00e0' },
        { label: 'Retrogusto', value: 'Lungo, note di mandorla e erba fresca' },
      ],
    },
    {
      type: 'origin',
      title: 'Origine e Lavorazione',
      location: 'Ferla (Siracusa) \u2014 Monti Iblei, Sicilia',
      altitude: '450\u2013700 m s.l.m.',
      climate: 'Mediterraneo temperato \u2014 escursione termica favorevole alla qualit\u00e0',
      territory:
        "I Monti Iblei rappresentano uno dei comprensori olivicoli pi\u00f9 pregiati d\u2019Italia. Il microclima ideale, i suoli calcarei e le tradizioni millenarie degli olivicoltori locali si fondono in un olio che racconta il territorio in ogni goccia.",
      steps: [
        { label: 'Raccolta', value: 'Manuale anticipata \u2014 inizio campagna, olive in invaiatura' },
        { label: 'Frangitura', value: 'Entro 4\u20136 ore \u2014 preserva integrit\u00e0 aromatica' },
        { label: 'Estrazione', value: 'A freddo continuo \u2014 sotto 27\u00b0C' },
        { label: 'Filtrazione', value: 'Naturale su cotone \u2014 limpidezza senza centrifuga' },
        { label: 'Imbottigliamento', value: 'Sotto azoto in vetro scuro \u2014 ossidazione zero' },
      ],
    },
    {
      type: 'technicalData',
      title: 'Dati Analitici',
      badge: 'Analisi chimica certificata',
      keyValues: [
        { key: 'Acidit\u00e0 libera', value: '< 0,3% \u2014 eccellente (limite legale: 0,8%)' },
        { key: 'Perossidi', value: '< 10 meq O\u2082/kg \u2014 freschezza elevata' },
        { key: 'Polifenoli totali', value: '> 300 mg/kg \u2014 alta qualit\u00e0 antiossidante' },
        { key: 'Vitamina E', value: 'Naturalmente presente (tocoferoli)' },
        { key: 'Formato', value: 'Bottiglia in vetro scuro 500 ml' },
        { key: 'Shelf Life', value: '18 mesi dalla produzione' },
        { key: 'Conservazione', value: 'Lontano da luce e fonti di calore' },
      ],
    },
    {
      type: 'items',
      layout: 'grid',
      title: 'Perfetto Per',
      items: [
        {
          name: 'A Crudo',
          description:
            "Esaltato su bruschette, insalate, carpacci e zuppe. Versato a crudo sprigiona tutto il suo profilo aromatico.",
        },
        {
          name: 'Carne e Pesce',
          description:
            "Finitura ideale su grigliate di carne, pesce al forno e frutti di mare. Il piccante pulisce il palato e valorizza i sapori.",
        },
        {
          name: 'Degustazione',
          description:
            "Olio da assaggiare come un vino pregiato \u2014 a temperatura ambiente, in coppetta, per apprezzare ogni sfumatura.",
        },
        {
          name: 'Regalo Raffinato',
          description:
            "La bottiglia elegante lo rende il regalo ideale per chi apprezza l\u2019eccellenza gastronomica italiana.",
        },
      ],
    },
  ],
};

export const PREMIUM_OIL_STORY_EN: ProductStory = {
  sections: [
    {
      type: 'items',
      layout: 'grid',
      title: 'Excellence in a Bottle',
      badge: 'Premium \u2022 Extra Virgin \u2022 Single Variety',
      items: [
        {
          name: 'Rigorous Selection',
          description:
            'Only the finest olives of the season, hand-selected at the optimal stage of ripeness to express their full aromatic potential.',
        },
        {
          name: 'High Polyphenol Concentration',
          description:
            'Early harvest ensures a superior antioxidant profile. More polyphenols, more benefits and greater product longevity.',
        },
        {
          name: 'Intense Fruitiness',
          description:
            'Pronounced sensory notes of green tomato, artichoke, fresh grass \u2014 an oil to savour before even cooking with it.',
        },
        {
          name: 'Dark Glass Bottle',
          description:
            "The amber glass bottle protects against oxidation, preserving the oil\u2019s aromas and nutritional qualities over time.",
        },
      ],
    },
    {
      type: 'flavorProfile',
      title: 'Sensory Profile',
      cultivars: [
        {
          name: 'Tonda Iblea',
          description:
            'An autochthonous cultivar of the Monti Iblei, suited to high-quality oil production. Delivers notes of almond, artichoke and green tomato with a persistent fruitiness.',
        },
        {
          name: 'Early Harvest',
          description:
            'Olives are collected at the start of the campaign, while still green or just beginning to ripen. This choice maximises bitterness, spiciness and aromatic complexity.',
        },
      ],
      sensorNotes: [
        { label: 'Colour', value: 'Intense green with golden reflections' },
        { label: 'Aroma', value: 'Intense fruity \u2014 green tomato, artichoke' },
        { label: 'Bitterness', value: 'Elegant and persistent' },
        { label: 'Spiciness', value: 'Bold \u2014 a sign of high polyphenol content' },
        { label: 'Finish', value: 'Long, notes of almond and fresh grass' },
      ],
    },
    {
      type: 'origin',
      title: 'Origin & Craft',
      location: 'Ferla (Siracusa) \u2014 Monti Iblei, Sicily',
      altitude: '450\u2013700 m a.s.l.',
      climate: 'Temperate Mediterranean \u2014 thermal range favourable to quality',
      territory:
        "The Monti Iblei represent one of Italy\u2019s most prized olive-growing areas. The ideal microclimate, limestone soils and centuries-old traditions of local growers come together in an oil that tells the story of its territory in every drop.",
      steps: [
        { label: 'Harvest', value: 'Early hand-picking \u2014 start of campaign, olives just turning' },
        { label: 'Milling', value: 'Within 4\u20136 hours \u2014 aromatic integrity preserved' },
        { label: 'Extraction', value: 'Continuous cold-press \u2014 below 27\u00b0C' },
        { label: 'Filtration', value: 'Natural cotton filtration \u2014 clarity without centrifuge' },
        { label: 'Bottling', value: 'Under nitrogen in dark glass \u2014 zero oxidation' },
      ],
    },
    {
      type: 'technicalData',
      title: 'Analytical Data',
      badge: 'Certified chemical analysis',
      keyValues: [
        { key: 'Free acidity', value: '< 0.3% \u2014 excellent (legal limit: 0.8%)' },
        { key: 'Peroxides', value: '< 10 meq O\u2082/kg \u2014 high freshness' },
        { key: 'Total polyphenols', value: '> 300 mg/kg \u2014 high antioxidant quality' },
        { key: 'Vitamin E', value: 'Naturally present (tocopherols)' },
        { key: 'Format', value: '500 ml dark glass bottle' },
        { key: 'Shelf Life', value: '18 months from production' },
        { key: 'Storage', value: 'Away from light and heat sources' },
      ],
    },
    {
      type: 'items',
      layout: 'grid',
      title: 'Perfect For',
      items: [
        {
          name: 'Raw Drizzle',
          description:
            'Best on bruschetta, salads, carpaccio and soups. Drizzled raw, it releases its full aromatic profile.',
        },
        {
          name: 'Meat & Fish',
          description:
            'Ideal finishing oil for grilled meats, baked fish and seafood. The spiciness cleanses the palate and enhances the flavours.',
        },
        {
          name: 'Tasting',
          description:
            'An oil to savour like a fine wine \u2014 at room temperature, in a tasting cup, to appreciate every nuance.',
        },
        {
          name: 'Refined Gift',
          description:
            'The elegant bottle makes it the ideal gift for anyone who appreciates Italian gastronomic excellence.',
        },
      ],
    },
  ],
};

export const BEAUTY_OIL_STORY_EN: ProductStory = {
  sections: [
    {
      type: 'items',
      layout: 'grid',
      title: 'Main Benefits',
      badge: '100% Natural \u2022 Vegan \u2022 Made in Italy',
      items: [
        {
          name: 'Deep Hydration',
          description: 'Intense and long-lasting hydration for dry, sensitive and dehydrated skin.',
        },
        {
          name: 'Skin Elasticity',
          description: 'Increases skin tone and improves elasticity with regular use.',
        },
        {
          name: 'Stretch Mark Prevention',
          description:
            'Helps prevent stretch marks when applied regularly to the abdomen, hips and thighs.',
        },
        {
          name: 'Soothing Action',
          description: 'Relaxing and soothing effect \u2014 ideal after a shower or warm bath.',
        },
        {
          name: 'Massage Oil',
          description: 'Perfect as a pure massage oil or as a carrier for essential oils.',
        },
        {
          name: 'Nourished Hair',
          description: 'Softens dry and brittle hair when applied before shampooing.',
        },
      ],
    },
    {
      type: 'items',
      layout: 'list',
      title: 'Ingredient Properties',
      items: [
        {
          name: 'Sweet Almond Oil',
          action: 'Emollient, moisturising, nourishing',
          description:
            'Makes skin softer, more elastic and toned. Helps prevent dryness and stretch marks.',
        },
        {
          name: 'Vitamin E (Tocopherol)',
          action: 'Natural antioxidant',
          description:
            "Fights free radicals, maintains skin elasticity and extends the product\u2019s freshness.",
        },
      ],
    },
    {
      type: 'items',
      layout: 'list',
      title: 'How to Use',
      items: [
        {
          name: 'Body \u2014 Daily Use',
          description:
            'Apply a small amount to damp skin after showering and massage until fully absorbed.',
        },
        {
          name: 'Stretch Mark Prevention',
          description:
            'Apply regularly to abdomen, hips, bust and thighs using circular movements.',
        },
        {
          name: 'Face',
          description:
            'Apply a few drops to a cotton pad to remove make-up and impurities. Rinse with lukewarm water.',
        },
        {
          name: 'Hair',
          description:
            'Apply a few drops to the lengths before shampooing, leave for 20\u201330 minutes, then wash with a gentle shampoo.',
        },
        {
          name: 'Massage',
          description: 'Use pure or as a carrier for essential oils (1\u20132 drops per 10 ml of oil).',
        },
      ],
    },
    {
      type: 'technicalData',
      title: 'Technical Data',
      badge: 'INCI: Prunus Amygdalus Dulcis Oil, Tocopherol',
      keyValues: [
        { key: 'Appearance', value: 'Clear liquid, pale yellow colour' },
        { key: 'Odour', value: 'Natural, delicate (almond)' },
        { key: 'Density', value: '0.910 \u2013 0.920 g/ml' },
        { key: 'pH', value: 'Neutral (\u2248 7.0)' },
        { key: 'Preservatives', value: 'None added \u2014 vitamin E as natural antioxidant' },
        { key: 'Shelf Life', value: '24 months sealed \u2014 12 months opened' },
        { key: 'Storage', value: '15\u201325\u00b0C, away from light, in amber glass' },
      ],
    },
    {
      type: 'items',
      layout: 'grid',
      title: 'Key Strengths',
      items: [
        {
          name: 'Minimal Formula',
          description:
            'Just 2 natural ingredients \u2014 no parabens, silicones or synthetic additives.',
        },
        {
          name: 'Made in Italy',
          description: 'Quality and controlled supply chain \u2014 Italian almonds, Italian production.',
        },
        {
          name: 'Natural Vitamin E',
          description: 'Antioxidant and natural preservative \u2014 no chemical additives.',
        },
        {
          name: 'Multi-use',
          description: 'Body, face and hair \u2014 one product for your entire routine.',
        },
        {
          name: 'Vegan Friendly',
          description: '100% plant-based formula, not tested on animals.',
        },
        { name: 'Natural Fragrance', description: 'Delicate and natural sweet almond aroma.' },
      ],
    },
  ],
};
