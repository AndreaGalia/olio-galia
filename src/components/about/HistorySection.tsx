import Image from "next/image";
import { HistoryImageProps, HistorySectionProps } from "@/types/about";

export function HistorySection({ history, variant = "compact" }: HistorySectionProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 ${variant === "compact" ? "mb-12 sm:mb-16" : ""} shadow-lg`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="space-y-6">
          <h3 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-serif text-olive">
            {history.title}
          </h3>
          
          <div className="space-y-4 text-nocciola leading-relaxed">
            <p>{history.paragraph1}</p>
            <p>{history.paragraph2}</p>
            <p>
              {history.paragraph3.split('OLIO GALIA').map((part, index, array) => (
                index === array.length - 1 ? part : (
                  <span key={index}>
                    {part}
                    <span className="font-bold">OLIO GALIA</span>
                  </span>
                )
              ))}
            </p>
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
  const historicImageUrl = process.env.NEXT_PUBLIC_HISTORIC_IMAGE_URL;

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-olive/10 to-salvia/10 rounded-2xl p-6 sm:p-8">
        <div className="w-full h-80 sm:h-96 lg:h-[450px] relative rounded-xl overflow-hidden bg-olive/5">
          {historicImageUrl ? (
            <>
              <Image
                src={historicImageUrl}
                alt="Foto storica dell'azienda"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
              />
              {/* Overlay gradiente per effetto vintage */}
              <div className="absolute inset-0 bg-gradient-to-b from-olive/20 via-olive/10 to-olive/20 pointer-events-none" />
              {/* Vignette effect per focus centrale */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(85,107,47,0.2)_100%)] pointer-events-none" />
            </>
          ) : (
            <div className="w-full h-full bg-olive/20 flex items-center justify-center">
              <svg className="w-16 h-16 text-olive/40" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Badge vintage */}
      <div className="absolute -top-4 -right-4 bg-salvia text-beige px-3 py-2 rounded-full text-xs font-bold shadow-lg rotate-12">
        Est. 1940
      </div>
    </div>
  );
}