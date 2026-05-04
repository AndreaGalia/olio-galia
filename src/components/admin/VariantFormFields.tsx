import type { MediaItem } from '@/types/products';

interface VariantData {
  variantId: string;
  translations: {
    it: { name: string; description?: string };
    en: { name: string; description?: string };
  };
  stripeProductId: string;
  stripePriceId: string;
  price: string;
  originalPrice?: string;
  inStock: boolean;
  stockQuantity: number;
  images: string[]; // URL delle sole immagini — usato per Stripe, cart, thumbnail
  media: MediaItem[]; // Media ordinato (immagini + video) — usato dalla gallery
  color?: string;
}

interface VariantFormFieldsProps {
  variant: VariantData;
  onChange: (updated: VariantData) => void;
}

function generateVariantId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function VariantFormFields({ variant, onChange }: VariantFormFieldsProps) {
  const update = (field: string, value: any) => {
    onChange({ ...variant, [field]: value });
  };

  const updateTranslation = (lang: 'it' | 'en', field: string, value: string) => {
    onChange({
      ...variant,
      translations: {
        ...variant.translations,
        [lang]: {
          ...variant.translations[lang],
          [field]: value,
        },
      },
      // Auto-generate variantId from IT name
      ...(lang === 'it' && field === 'name' && !variant.variantId
        ? { variantId: generateVariantId(value) }
        : {}),
    });
  };

  const updateMediaItem = (index: number, field: keyof MediaItem, value: string) => {
    const newMedia = [...variant.media];
    newMedia[index] = { ...newMedia[index], [field]: value };
    const newImages = newMedia.filter(m => m.type === 'image').map(m => m.url).filter(u => u.trim());
    onChange({ ...variant, media: newMedia, images: newImages });
  };

  const addMediaItem = (type: 'image' | 'video') => {
    const newMedia = [...variant.media, { type, url: '' }];
    onChange({ ...variant, media: newMedia });
  };

  const removeMediaItem = (index: number) => {
    const newMedia = variant.media.filter((_, i) => i !== index);
    const newImages = newMedia.filter(m => m.type === 'image').map(m => m.url).filter(u => u.trim());
    onChange({ ...variant, media: newMedia.length > 0 ? newMedia : [{ type: 'image', url: '' }], images: newImages });
  };

  return (
    <div className="space-y-4 p-4 bg-purple-50/50 border border-purple-200 rounded-lg">
      {/* Nomi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Variante (IT) *</label>
          <input
            type="text"
            value={variant.translations.it.name}
            onChange={(e) => updateTranslation('it', 'name', e.target.value)}
            className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
            placeholder="Es: Zagara"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Variant Name (EN) *</label>
          <input
            type="text"
            value={variant.translations.en.name}
            onChange={(e) => updateTranslation('en', 'name', e.target.value)}
            className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
            placeholder="e.g: Orange Blossom"
            required
          />
        </div>
      </div>

      {/* Descrizioni */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione (IT)</label>
          <input
            type="text"
            value={variant.translations.it.description || ''}
            onChange={(e) => updateTranslation('it', 'description', e.target.value)}
            className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
            placeholder="Breve descrizione variante..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (EN)</label>
          <input
            type="text"
            value={variant.translations.en.description || ''}
            onChange={(e) => updateTranslation('en', 'description', e.target.value)}
            className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
            placeholder="Short variant description..."
          />
        </div>
      </div>

      {/* Variant ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID Variante
          <span className="text-xs text-nocciola ml-2">(auto-generato dal nome IT)</span>
        </label>
        <input
          type="text"
          value={variant.variantId}
          onChange={(e) => update('variantId', e.target.value)}
          className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 font-mono text-sm"
          placeholder="zagara"
        />
      </div>

      {/* Stripe IDs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Product ID *</label>
          <input
            type="text"
            value={variant.stripeProductId}
            onChange={(e) => update('stripeProductId', e.target.value)}
            className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 font-mono text-sm"
            placeholder="prod_xxxxxxxxxxxxx"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Price ID *</label>
          <input
            type="text"
            value={variant.stripePriceId}
            onChange={(e) => update('stripePriceId', e.target.value)}
            className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 font-mono text-sm"
            placeholder="price_xxxxxxxxxxxxx"
            required
          />
        </div>
      </div>

      {/* Prezzo e Stock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo (€) *</label>
          <input
            type="number"
            step="0.01"
            value={variant.price}
            onChange={(e) => update('price', e.target.value)}
            className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
            placeholder="19.99"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo Originale (€)</label>
          <input
            type="number"
            step="0.01"
            value={variant.originalPrice || ''}
            onChange={(e) => update('originalPrice', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
            placeholder="24.99"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input
            type="number"
            min="0"
            value={variant.stockQuantity}
            onChange={(e) => {
              const qty = parseInt(e.target.value) || 0;
              onChange({ ...variant, stockQuantity: qty, inStock: qty > 0 });
            }}
            className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
            placeholder="0"
          />
        </div>
      </div>

      {/* Colore */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Colore
          <span className="text-xs text-nocciola ml-2">(opzionale, per pallino nel selettore)</span>
        </label>
        <input
          type="text"
          value={variant.color || ''}
          onChange={(e) => update('color', e.target.value || undefined)}
          className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
          placeholder="#FFA500 o orange"
        />
      </div>

      {/* Media Variante */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Media Variante *
          <span className="text-xs text-nocciola ml-2">(immagini e video in ordine)</span>
        </label>
        {variant.media.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2 items-center">
            <select
              value={item.type}
              onChange={(e) => updateMediaItem(index, 'type', e.target.value)}
              className="px-2 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 text-sm bg-white"
            >
              <option value="image">Immagine</option>
              <option value="video">Video</option>
            </select>
            <input
              type="text"
              value={item.url}
              onChange={(e) => updateMediaItem(index, 'url', e.target.value)}
              className="flex-1 px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
              placeholder={item.type === 'video' ? 'URL video Cloudflare (.mp4)' : 'URL immagine'}
            />
            {variant.media.length > 1 && (
              <button
                type="button"
                onClick={() => removeMediaItem(index)}
                className="px-3 py-2 text-red-600 hover:text-red-800 text-sm"
              >
                Rimuovi
              </button>
            )}
          </div>
        ))}
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={() => addMediaItem('image')}
            className="px-3 py-1.5 text-purple-700 hover:text-purple-900 text-sm"
          >
            + Aggiungi Immagine
          </button>
          <button
            type="button"
            onClick={() => addMediaItem('video')}
            className="px-3 py-1.5 text-purple-700 hover:text-purple-900 text-sm"
          >
            + Aggiungi Video
          </button>
        </div>
      </div>
    </div>
  );
}

export type { VariantData };
