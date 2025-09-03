import { HistoryImageProps, HistorySectionProps } from "@/types/about";

export function HistorySection({ history, variant = "compact" }: HistorySectionProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 ${variant === "compact" ? "mb-12 sm:mb-16" : ""} shadow-lg`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="space-y-6">
          <h3 className="text-2xl sm:text-3xl font-serif text-olive">
            {history.title}
          </h3>
          
          <div className="space-y-4 text-nocciola leading-relaxed">
            <p>{history.paragraph1}</p>
            <p>{history.paragraph2}</p>
            <p>{history.paragraph3}</p>
          </div>

          {/* Statistiche famiglia */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-olive/20">
            <div className="text-center">
              <div className="text-2xl font-serif text-olive font-bold">{history.stats.years}</div>
              <div className="text-sm text-nocciola">{history.stats.yearsLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-serif text-olive font-bold">{history.stats.generations}</div>
              <div className="text-sm text-nocciola">{history.stats.generationsLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-serif text-olive font-bold">{history.stats.family}</div>
              <div className="text-sm text-nocciola">{history.stats.familyLabel}</div>
            </div>
          </div>
        </div>

        {/* Immagine storica placeholder */}
        <HistoryImage 
          imageCaption={history.imageCaption}
          imageNote={history.imageNote}
        />
      </div>
    </div>
  );
}

function HistoryImage({ imageCaption, imageNote }: HistoryImageProps) {
  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-olive/10 to-salvia/10 rounded-2xl p-8 text-center">
        <div className="w-full h-64 bg-olive/20 rounded-xl mb-4 flex items-center justify-center">
          <svg className="w-16 h-16 text-olive/40" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-sm text-nocciola italic">
          {imageCaption}
          <br />
          <span className="text-xs">{imageNote}</span>
        </p>
      </div>
      
      {/* Badge vintage */}
      <div className="absolute -top-4 -right-4 bg-salvia text-beige px-3 py-2 rounded-full text-xs font-bold shadow-lg rotate-12">
        Est. 1950
      </div>
    </div>
  );
}