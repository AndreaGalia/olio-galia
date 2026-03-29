/**
 * Script di seed per i dati productStory di Latta 5L e Beauty Oil 100ml.
 *
 * Aggiunge il campo `productStory` (IT + EN) nelle translations di ciascun prodotto
 * senza toccare nessun altro campo.
 *
 * ESECUZIONE (dry-run — nessuna scrittura):
 *   npm run seed-product-stories
 *
 * ESECUZIONE (scrittura effettiva):
 *   npm run seed-product-stories -- --force
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectToDatabase } from '../src/lib/mongodb';
import type { ProductStory } from '../src/types/productStory';

const DRY_RUN = !process.argv.includes('--force');

// ─── DATI: LATTA 5L ──────────────────────────────────────────────────────────

const LATTA_STORY_IT: ProductStory = {
  sections: [
    {
      type: 'items',
      layout: 'grid',
      title: "Benefici dell'Olio",
      badge: '100% Extra Vergine Siciliano',
      items: [
        {
          name: 'Polifenoli',
          description:
            "Antiossidanti naturali che proteggono cuore e sistema immunitario. Indicatore di qualit\u00e0 e freschezza dell'olio.",
        },
        {
          name: 'Vitamina E',
          description:
            "Anti-age naturale, contrasta l'invecchiamento cellulare e preserva le propriet\u00e0 organolettiche nel tempo.",
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
            "Originaria dell'Etna. Carattere deciso con note amare e piccanti che bilanciano la dolcezza della Tonda Iblea.",
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
        "Il territorio tra Ferla e Buccheri, nel cuore dei Monti Iblei, rappresenta una delle zone olivicole pi\u00f9 vocate della Sicilia. L'olivo cresce su terreni calcarei e collinari terrazzati, ricchi di biodiversit\u00e0 che contribuisce alla complessit\u00e0 aromatica dell'olio.",
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

const LATTA_STORY_EN: ProductStory = {
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
            "Natural anti-ageing agent, fights cellular ageing and preserves the oil's organoleptic properties over time.",
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

// ─── DATI: BEAUTY OIL 100ML ──────────────────────────────────────────────────

const BEAUTY_STORY_IT: ProductStory = {
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
            "Aumenta la tonicit\u00e0 della pelle e ne migliora l'elasticit\u00e0 con uso continuativo.",
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
            "Contrasta i radicali liberi, mantiene l'elasticit\u00e0 cutanea e prolunga la freschezza del prodotto.",
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
          description: 'Solo 2 ingredienti naturali \u2014 nessun parabene, silicone o additivo sintetico.',
        },
        {
          name: 'Made in Italy',
          description: 'Qualit\u00e0 e filiera controllata \u2014 mandorle italiane, produzione italiana.',
        },
        {
          name: 'Vitamina E Naturale',
          description: 'Antiossidante e conservante naturale \u2014 nessun additivo chimico.',
        },
        {
          name: 'Multiuso',
          description: 'Corpo, viso e capelli \u2014 un solo prodotto per tutta la routine.',
        },
        {
          name: 'Vegan Friendly',
          description: 'Formula 100% vegetale, non testata su animali.',
        },
        {
          name: 'Profumo Naturale',
          description: 'Aroma delicato e naturale di mandorla dolce.',
        },
      ],
    },
  ],
};

const BEAUTY_STORY_EN: ProductStory = {
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
            "Fights free radicals, maintains skin elasticity and extends the product's freshness.",
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
          description:
            'Use pure or as a carrier for essential oils (1\u20132 drops per 10 ml of oil).',
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
          description: 'Just 2 natural ingredients \u2014 no parabens, silicones or synthetic additives.',
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
        {
          name: 'Natural Fragrance',
          description: 'Delicate and natural sweet almond aroma.',
        },
      ],
    },
  ],
};

// ─── RICERCA PRODOTTO ─────────────────────────────────────────────────────────

async function findProduct(
  db: Awaited<ReturnType<typeof connectToDatabase>>['db'],
  patterns: RegExp[]
) {
  for (const pattern of patterns) {
    const doc = await db.collection('products').findOne({
      $or: [
        { 'slug.it': pattern },
        { 'slug.en': pattern },
        { 'translations.it.name': pattern },
      ],
    });
    if (doc) return doc;
  }
  return null;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501');
  console.log('  seed-product-stories');
  console.log(
    DRY_RUN
      ? '  MODE: dry-run (passa --force per scrivere)'
      : '  MODE: WRITE'
  );
  console.log('\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n');

  const { client, db } = await connectToDatabase();

  const targets = [
    {
      label: 'Latta 5L',
      patterns: [/latta/i, /5l/i],
      storyIt: LATTA_STORY_IT,
      storyEn: LATTA_STORY_EN,
    },
    {
      label: 'Beauty Oil 100ml',
      patterns: [/beauty/i, /mandorle/i, /almond/i],
      storyIt: BEAUTY_STORY_IT,
      storyEn: BEAUTY_STORY_EN,
    },
  ];

  let updated = 0;
  let notFound = 0;

  for (const target of targets) {
    console.log(`\uD83D\uDD0D Cerco: ${target.label}`);
    const doc = await findProduct(db, target.patterns);

    if (!doc) {
      console.log('   \u2717 Non trovato \u2014 verifica la regex o lo slug in MongoDB\n');
      notFound++;
      continue;
    }

    const name: string = doc.translations?.it?.name ?? String(doc._id);
    const slugIt: string = doc.slug?.it ?? '\u2014';
    const existingSections: number = doc.translations?.it?.productStory?.sections?.length ?? 0;

    console.log(`   \u2713 Trovato: "${name}" (slug IT: ${slugIt})`);

    if (existingSections > 0) {
      console.log(
        `   \u26A0 productStory IT gi\u00e0 presente (${existingSections} sezioni) \u2014 verr\u00e0 sovrascritta`
      );
    }

    console.log(
      `   \u2192 Sezioni IT: ${target.storyIt.sections.length} | Sezioni EN: ${target.storyEn.sections.length}`
    );

    if (!DRY_RUN) {
      await db.collection('products').updateOne(
        { _id: doc._id },
        {
          $set: {
            'translations.it.productStory': target.storyIt,
            'translations.en.productStory': target.storyEn,
            'metadata.updatedAt': new Date(),
          },
        }
      );
      console.log('   \u2705 Aggiornato\n');
    } else {
      console.log('   \u25CB Dry-run: nessuna scrittura\n');
    }

    updated++;
  }

  console.log('\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501');
  if (DRY_RUN) {
    console.log(`  Dry-run completato. Prodotti trovati: ${updated}/${targets.length}`);
    console.log('  Riesegui con --force per scrivere su MongoDB.');
  } else {
    console.log(
      `  Completato. Aggiornati: ${updated}/${targets.length}. Non trovati: ${notFound}.`
    );
  }
  console.log('\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n');

  await client.close();
}

main().catch((err) => {
  console.error('Errore:', err);
  process.exit(1);
});
