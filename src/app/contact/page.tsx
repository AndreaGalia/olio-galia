"use client";

import { useT } from "@/hooks/useT";

export default function ContactPage() {
  const { t } = useT();

  const contactMethods = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
      ),
      title: t.contactPage.methods[0].title,
      value: t.contactPage.methods[0].value,
      description: t.contactPage.methods[0].description,
      action: () => window.open('mailto:info@oliogalia.it')
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      ),
      title: t.contactPage.methods[1].title,
      value: t.contactPage.methods[1].value,
      description: t.contactPage.methods[1].description,
      action: () => window.open(`https://wa.me/3661368797?text=${encodeURIComponent(t.contactPage.whatsappMessage)}`, '_blank')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
      {/* CSS Custom Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-delay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 1s ease-out 0.5s forwards;
          opacity: 0;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
      
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
        {/* Elementi decorativi di sfondo animati */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-12 w-32 h-32 rounded-full bg-olive animate-pulse"></div>
          <div className="absolute bottom-32 left-8 w-24 h-24 rounded-full bg-salvia animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3s'}}></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-nocciola animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 right-1/3 w-20 h-20 rounded-full bg-olive/60 animate-ping" style={{animationDelay: '2s', animationDuration: '4s'}}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-olive/10 text-olive px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <div className="w-2 h-2 bg-olive rounded-full animate-pulse"></div>
              {t.contactPage.hero.badge}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-olive mb-6 leading-tight animate-slide-up">
              {t.contactPage.hero.title.main}
              <span className="block italic text-salvia">{t.contactPage.hero.title.subtitle}</span>
            </h1>
            
            <p className="text-xl text-nocciola max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
              {t.contactPage.hero.description}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <div 
                key={index}
                onClick={method.action}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 group animate-fade-in-up"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <div className="w-20 h-20 bg-olive/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-olive group-hover:text-beige transition-all duration-300 group-hover:animate-bounce">
                  <div className="text-olive group-hover:text-beige transition-colors duration-300">
                    {method.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-serif text-olive mb-3 group-hover:animate-pulse">{method.title}</h3>
                <p className="text-olive font-medium mb-2 text-lg">{method.value}</p>
                <p className="text-nocciola">{method.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}