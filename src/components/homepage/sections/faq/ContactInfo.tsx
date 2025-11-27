// components/FAQ/ContactInfo.tsx
import { ContactInfo as ContactInfoType } from '@/types/faq';

interface ContactInfoProps {
  info: ContactInfoType;
}

export default function ContactInfo({ info }: ContactInfoProps) {
  // Usa valori da .env con fallback
  const displayEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || info.emailAddress;
  const displayPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || info.phoneNumber;
  const displayWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || info.whatsappNumber;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-olive/20">
      <div className="text-center">
        <div className="text-sm font-medium text-olive mb-1">{info.email}</div>
        <div className="text-sm text-nocciola">{displayEmail}</div>
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-olive mb-1">{info.phone}</div>
        <div className="text-sm text-nocciola">{displayPhone}</div>
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-olive mb-1">{info.whatsapp}</div>
        <div className="text-sm text-nocciola">{displayWhatsApp}</div>
      </div>
    </div>
  );
}