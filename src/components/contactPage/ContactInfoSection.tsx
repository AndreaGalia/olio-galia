"use client";

import { useT } from '@/hooks/useT';
import { openEmail, openWhatsApp } from '@/utils/contactActions';
import ContactInfoCard from './ContactInfoCard';
import { EmailIcon, PhoneIcon, WhatsAppIcon } from './ContactIcons';

export default function ContactInfoSection() {
  const { t } = useT();
  const info = t.contactPage.info;

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || '';
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || '';
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';

  function handlePhone() {
    if (phone) window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  }

  return (
    <div>
      <h2 className="font-serif text-black mb-8">{info.title}</h2>
      <ContactInfoCard
        icon={<PhoneIcon />}
        title={info.phone.title}
        value={phone}
        description={info.phone.description}
        onClick={handlePhone}
      />
      <ContactInfoCard
        icon={<WhatsAppIcon />}
        title={info.whatsapp.title}
        value={whatsapp}
        description={info.whatsapp.description}
        onClick={() => openWhatsApp(whatsapp, t.contactPage.whatsappMessage)}
      />
      <ContactInfoCard
        icon={<EmailIcon />}
        title={info.email.title}
        value={email}
        description={info.email.description}
        onClick={() => openEmail()}
      />
    </div>
  );
}
