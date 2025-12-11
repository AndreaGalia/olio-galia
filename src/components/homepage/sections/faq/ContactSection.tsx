// components/FAQ/ContactSection.tsx
import { Contact } from '@/types/faq';
import ContactButtons from './ContactButtons';
import ContactInfo from './ContactInfo';

interface ContactSectionProps {
  contact: Contact;
  onEmailClick: () => void;
  onPhoneClick: () => void;
  onWhatsAppClick: () => void;
}

export default function ContactSection({ contact, onEmailClick, onPhoneClick, onWhatsAppClick }: ContactSectionProps) {
  return (
    <div className="mt-12 sm:mt-16">
      <div className="bg-beige/30 border border-olive/10 p-6 sm:p-8 text-center">
        <div className="w-16 h-16 bg-olive/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-olive" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </div>
        
        <h3 className="text-xl sm:text-2xl font-serif text-olive mb-4">
          {contact.title}
        </h3>
        
        <p className="text-nocciola mb-6 max-w-md mx-auto">
          {contact.description}
        </p>
        
        <ContactButtons
          buttons={contact.buttons}
          onEmailClick={onEmailClick}
          onPhoneClick={onPhoneClick}
          onWhatsAppClick={onWhatsAppClick}
        />

        <ContactInfo info={contact.info} />
      </div>
    </div>
  );
}