"use client";

import { useT } from "@/hooks/useT";


export default function Footer() {
  const { t } = useT();

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/391234567890', '_blank');
  };

  return (
    <>
      <footer className="relative bg-gradient-to-br from-olive to-salvia text-beige overflow-hidden">
        {/* Elementi decorativi di sfondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 left-12 w-24 h-24 rounded-full bg-beige"></div>
          <div className="absolute bottom-20 right-16 w-32 h-32 rounded-full bg-sabbia"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-nocciola"></div>
          <div className="absolute bottom-1/3 right-1/3 w-12 h-12 rounded-full bg-beige"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          
          {/* Sezione principale del footer */}
          <div className="py-12 sm:py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
              
              {/* Brand e descrizione */}
              <div className="lg:col-span-1 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-serif">Olio Galia</h3>
                  <p className="text-beige/80 leading-relaxed text-sm sm:text-base">
                    {t.footer.brand.description}
                  </p>
                </div>
                
                {/* Badge qualità */}
                <div className="flex flex-wrap gap-2">
                  <span className="bg-beige/20 text-beige px-3 py-1 rounded-full text-xs font-medium">
                    {t.footer.brand.badges.dop}
                  </span>
                  <span className="bg-beige/20 text-beige px-3 py-1 rounded-full text-xs font-medium">
                    {t.footer.brand.badges.bio}
                  </span>
                  <span className="bg-beige/20 text-beige px-3 py-1 rounded-full text-xs font-medium">
                    {t.footer.brand.badges.natural}
                  </span>
                </div>
              </div>

              {/* Prodotti */}
              <div className="space-y-4 sm:space-y-6">
                <h4 className="text-lg sm:text-xl font-serif">{t.footer.products.title}</h4>
                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                  <li><a href="#" className="text-beige/80 hover:text-beige transition-colors duration-300 hover:underline">{t.footer.products.classic}</a></li>
                  <li><a href="#" className="text-beige/80 hover:text-beige transition-colors duration-300 hover:underline">{t.footer.products.organic}</a></li>
                  <li><a href="#" className="text-beige/80 hover:text-beige transition-colors duration-300 hover:underline">{t.footer.products.premium}</a></li>
                  <li><a href="#" className="text-beige/80 hover:text-beige transition-colors duration-300 hover:underline">{t.footer.products.gifts}</a></li>
                  <li><a href="#" className="text-beige/80 hover:text-beige transition-colors duration-300 hover:underline">{t.footer.products.tastings}</a></li>
                </ul>
              </div>

              {/* Informazioni */}
              <div className="space-y-4 sm:space-y-6">
                <h4 className="text-lg sm:text-xl font-serif">{t.footer.info.title}</h4>
                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                  <li><a href="#" className="text-beige/80 hover:text-beige transition-colors duration-300 hover:underline">{t.footer.info.story}</a></li>
                  <li><a href="#" className="text-beige/80 hover:text-beige transition-colors duration-300 hover:underline">{t.footer.info.production}</a></li>
                  <li><a href="#" className="text-beige/80 hover:text-beige transition-colors duration-300 hover:underline">{t.footer.info.certifications}</a></li>
                  <li><a href="#" className="text-beige/80 hover:text-beige transition-colors duration-300 hover:underline">{t.footer.info.visits}</a></li>
                  <li><a href="#" className="text-beige/80 hover:text-beige transition-colors duration-300 hover:underline">{t.footer.info.shipping}</a></li>
                </ul>
              </div>

              {/* Contatti e social */}
              <div className="space-y-4 sm:space-y-6">
                <h4 className="text-lg sm:text-xl font-serif">{t.footer.contact.title}</h4>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-beige/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-beige/80 text-sm sm:text-base">{t.footer.contact.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-beige/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="text-beige/80 text-sm sm:text-base">{t.footer.contact.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-beige/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="text-beige/80 text-sm sm:text-base">{t.footer.contact.email}</span>
                  </div>
                </div>

                {/* Social media */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium">{t.footer.contact.social}</h5>
                  <div className="flex gap-3">
                    <button className="w-10 h-10 bg-beige/20 hover:bg-beige/30 rounded-full flex items-center justify-center transition-colors duration-300 group">
                      <svg className="w-5 h-5 text-beige group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    </button>
                    
                    <button className="w-10 h-10 bg-beige/20 hover:bg-beige/30 rounded-full flex items-center justify-center transition-colors duration-300 group">
                      <svg className="w-5 h-5 text-beige group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                      </svg>
                    </button>
                    
                    <button className="w-10 h-10 bg-beige/20 hover:bg-beige/30 rounded-full flex items-center justify-center transition-colors duration-300 group">
                      <svg className="w-5 h-5 text-beige group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001.017.001z.001"/>
                      </svg>
                    </button>
                    
                    <button 
                      onClick={handleWhatsAppClick}
                      className="w-10 h-10 bg-green-500/20 hover:bg-green-500/30 rounded-full flex items-center justify-center transition-colors duration-300 group"
                    >
                      <svg className="w-5 h-5 text-beige group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Newsletter */}
          <div className="border-t border-beige/20 py-8 sm:py-12">
            <div className="max-w-2xl mx-auto text-center space-y-4 sm:space-y-6">
              <h4 className="text-xl sm:text-2xl font-serif">{t.footer.newsletter.title}</h4>
              <p className="text-beige/80 text-sm sm:text-base">
                {t.footer.newsletter.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder={t.footer.newsletter.placeholder}
                  className="flex-1 px-4 py-3 rounded-full bg-beige/20 border border-beige/30 text-beige placeholder-beige/60 focus:outline-none focus:ring-2 focus:ring-beige/50 focus:border-transparent"
                />
                <button className="bg-beige text-olive px-6 py-3 rounded-full font-medium hover:bg-sabbia transition-colors duration-300 whitespace-nowrap cursor-pointer">
                  {t.footer.newsletter.button}
                </button>
              </div>
              
              <p className="text-xs text-beige/60">
                {t.footer.newsletter.privacy}
              </p>
            </div>
          </div>

          {/* Bottom footer */}
          <div className="border-t border-beige/20 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-beige/60 text-center sm:text-left">
                {t.footer.bottom.copyright}
              </div>
              
              <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6 text-sm">
                <a href="#" className="text-beige/60 hover:text-beige transition-colors duration-300">{t.footer.bottom.privacy}</a>
                <a href="#" className="text-beige/60 hover:text-beige transition-colors duration-300">{t.footer.bottom.cookies}</a>
                <a href="#" className="text-beige/60 hover:text-beige transition-colors duration-300">{t.footer.bottom.terms}</a>
              </div>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}