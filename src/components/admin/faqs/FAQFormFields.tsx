'use client';

interface FAQFormFieldsProps {
  language: 'it' | 'en';
  languageLabel: string;
  languageColor: string;
  formData: {
    question: string;
    answer: string;
    category: string;
  };
  onChange: (field: 'question' | 'answer' | 'category', value: string) => void;
  labels: {
    question: string;
    answer: string;
    category: string;
    categoryPlaceholder: string;
    categoryHint: string;
  };
}

export default function FAQFormFields({
  language,
  languageLabel,
  languageColor,
  formData,
  onChange,
  labels,
}: FAQFormFieldsProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-6">
      <h2 className="text-xl font-serif text-olive mb-6 flex items-center">
        <span
          className={`w-8 h-8 ${languageColor} rounded-full flex items-center justify-center mr-3 text-sm font-bold`}
        >
          {languageLabel}
        </span>
        {language === 'it' ? 'Versione Italiana' : 'English Version'}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-nocciola mb-2">
            {labels.question} *
          </label>
          <input
            type="text"
            value={formData.question}
            onChange={(e) => onChange('question', e.target.value)}
            className="w-full px-4 py-2 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-nocciola mb-2">
            {labels.answer} *
          </label>
          <textarea
            value={formData.answer}
            onChange={(e) => onChange('answer', e.target.value)}
            className="w-full px-4 py-3 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive"
            rows={5}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-nocciola mb-2">
            {labels.category} *
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => onChange('category', e.target.value)}
            className="w-full px-4 py-2 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive"
            placeholder={labels.categoryPlaceholder}
            required
          />
          <p className="mt-1 text-xs text-gray-500">{labels.categoryHint}</p>
        </div>
      </div>
    </div>
  );
}
