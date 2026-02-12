"use client";

import { useT } from "@/hooks/useT";
import { useState } from "react";
import NewsletterModal from "./NewsletterModal";


export default function Footer() {
  const { t } = useT();
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);

  const handleNewsletterClick = () => {
    setShowNewsletterModal(true);
  };

  const handleCloseModal = () => {
    setShowNewsletterModal(false);
  };

  return (
    <>
      <footer className="relative bg-olive text-beige overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          
          {/* Sezione principale del footer */}
          <div className="py-12 sm:py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
              
              {/* Brand e descrizione */}
              <div className="lg:col-span-1 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-serif notranslate" translate="no">{t.navbar.logo}</h3>
                  <p className="text-beige/80 leading-relaxed text-sm sm:text-base">
                    {t.footer.brand.description}
                  </p>
                </div>
                
                {/* Badge qualità */}
                <div className="flex flex-wrap gap-2">
                  <span className="bg-beige/20 text-beige px-3 py-1 rounded-full text-xs font-medium">
                    {t.footer.brand.badges.sicilian}
                  </span>
                  <span className="bg-beige/20 text-beige px-3 py-1 rounded-full text-xs font-medium">
                    {t.footer.brand.badges.extraVirgin}
                  </span>
                </div>
              </div>

              {/* Prodotti */}
              <div className="space-y-4 sm:space-y-6">
                <h4 className="text-lg sm:text-xl font-serif">{t.footer.products.title}</h4>
                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                  <li><a href="#" className="text-beige/80 hover:text-beige transition-colors duration-300 hover:underline">{t.footer.products.classic}</a></li>
                  <li><a href="#" className="text-beige/80 hover:text-beige transition-colors duration-300 hover:underline">{t.footer.products.bodyOil}</a></li>
                </ul>
              </div>

              {/* Informazioni */}
              <div className="space-y-4 sm:space-y-6">
                <h4 className="text-lg sm:text-xl font-serif">{t.footer.info.title}</h4>
                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                  <li><a href="/about" className="text-beige/80 hover:text-beige transition-colors duration-300 hover:underline">{t.footer.info.story}</a></li>
                  <li><a href="#" className="text-beige/80 hover:text-beige transition-colors duration-300 hover:underline">{t.footer.info.mill}</a></li>
                  <li><a href="#" className="text-beige/80 hover:text-beige transition-colors duration-300 hover:underline">{t.footer.info.shipping}</a></li>
                  <li><a href="/manage-subscription" className="text-beige/80 hover:text-beige transition-colors duration-300 hover:underline">{t.footer.info.manageSubscription || 'Gestisci Abbonamento'}</a></li>
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
                    <span className="text-beige/80 text-sm sm:text-base">{process.env.NEXT_PUBLIC_CONTACT_ADDRESS || t.footer.contact.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-beige/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="text-beige/80 text-sm sm:text-base">{process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || t.footer.contact.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-beige/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="text-beige/80 text-sm sm:text-base">{process.env.NEXT_PUBLIC_CONTACT_EMAIL || t.footer.contact.email}</span>
                  </div>
                </div>

                {/* Social media */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium">{t.footer.contact.social}</h5>
                  <div className="flex gap-3 flex-wrap">
                    {/* WhatsApp */}
                    <button
                      onClick={() => {
                        const url = process.env.NEXT_PUBLIC_WHATSAPP_URL;
                        if (url) window.open(url, '_blank');
                      }}
                      className="w-10 h-10 bg-green-500/20 hover:bg-green-500/30 rounded-full flex items-center justify-center transition-colors duration-300 group cursor-pointer"
                      aria-label="WhatsApp"
                    >
                      <svg className="w-5 h-5 text-beige group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </button>

                    {/* Instagram */}
                    <button
                      onClick={() => {
                        const url = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
                        if (url) window.open(url, '_blank');
                      }}
                      className="w-10 h-10 bg-beige/20 hover:bg-beige/30 rounded-full flex items-center justify-center transition-colors duration-300 group cursor-pointer"
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5 text-beige group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </button>

                    {/* Facebook */}
                    <button
                      onClick={() => {
                        const url = process.env.NEXT_PUBLIC_FACEBOOK_URL;
                        if (url) window.open(url, '_blank');
                      }}
                      className="w-10 h-10 bg-beige/20 hover:bg-beige/30 rounded-full flex items-center justify-center transition-colors duration-300 group cursor-pointer"
                      aria-label="Facebook"
                    >
                      <svg className="w-5 h-5 text-beige group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>

                    {/* TikTok */}
                    <button
                      onClick={() => {
                        const url = process.env.NEXT_PUBLIC_TIKTOK_URL;
                        if (url) window.open(url, '_blank');
                      }}
                      className="w-10 h-10 bg-beige/20 hover:bg-beige/30 rounded-full flex items-center justify-center transition-colors duration-300 group cursor-pointer"
                      aria-label="TikTok"
                    >
                      <svg className="w-5 h-5 text-beige group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                    </button>

                    {/* Pinterest */}
                    <button
                      onClick={() => {
                        const url = process.env.NEXT_PUBLIC_PINTEREST_URL;
                        if (url) window.open(url, '_blank');
                      }}
                      className="w-10 h-10 bg-beige/20 hover:bg-beige/30 rounded-full flex items-center justify-center transition-colors duration-300 group cursor-pointer"
                      aria-label="Pinterest"
                    >
                      <svg className="w-5 h-5 text-beige group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.627 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641 0 12.017 0z"/>
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

              <div className="flex justify-center">
                <button
                  onClick={handleNewsletterClick}
                  className="bg-beige text-olive px-8 py-3 font-medium transition-colors duration-300 cursor-pointer border border-olive/20"
                >
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
                © {process.env.NEXT_PUBLIC_COMPANY_YEAR || new Date().getFullYear()} {t.footer.bottom.copyrightText} | {t.footer.bottom.vatLabel} {process.env.NEXT_PUBLIC_VAT_NUMBER || '12345678901'}
              </div>
              
              <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6 text-sm">
                <a href="/privacy-policy" className="text-beige/60 hover:text-beige transition-colors duration-300">{t.footer.bottom.privacy}</a>
                <a href="/cookie-policy" className="text-beige/60 hover:text-beige transition-colors duration-300">{t.footer.bottom.cookies}</a>
                <a href="/termini-servizio" className="text-beige/60 hover:text-beige transition-colors duration-300">{t.footer.bottom.terms}</a>
              </div>
            </div>
          </div>

        </div>
      </footer>

      {/* Newsletter Modal */}
      <NewsletterModal
        isOpen={showNewsletterModal}
        onClose={handleCloseModal}
      />
    </>
  );
}