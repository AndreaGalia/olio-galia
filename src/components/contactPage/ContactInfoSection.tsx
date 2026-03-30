"use client";

import { useT } from '@/hooks/useT';
import { openEmail, openWhatsApp } from '@/utils/contactActions';

export default function ContactInfoSection() {
  const { t } = useT();
  const info = t.contactPage.info;

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || '';
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || '';
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';

  function handlePhone() {
    if (phone) window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  }

  const rows = [
    { label: info.phone.title, value: phone, action: handlePhone },
    { label: info.whatsapp.title, value: whatsapp, action: () => openWhatsApp(whatsapp, t.contactPage.whatsappMessage) },
    { label: info.email.title, value: email, action: () => openEmail() },
  ];

  return (
    <div className="mt-14">
      {rows.map((row, i) => (
        <div
          key={i}
          onClick={row.action}
          className="border-t border-olive/20 py-4 cursor-pointer group"
        >
          <span className="text-[11px] tracking-[0.2em] uppercase text-black/40 mr-3">{row.label}:</span>
          <span className="text-sm text-black group-hover:text-olive transition-colors duration-200">{row.value}</span>
        </div>
      ))}
      <div className="border-t border-olive/20" />
    </div>
  );
}
