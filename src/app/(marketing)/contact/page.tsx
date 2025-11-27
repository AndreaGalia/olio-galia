"use client";

import { useT } from "@/hooks/useT";
import { ContactMethod } from '@/types/contact';
import { openEmail, openWhatsApp } from '@/utils/contactActions';

import { EmailIcon, WhatsAppIcon } from "@/components/contactPage/ContactIcons";
import ContactBackground from "@/components/contactPage/ContactBackground";
import ContactHero from "@/components/contactPage/ContactHero";
import ContactMethods from "@/components/contactPage/ContactMethods";

export default function ContactPage() {
  const { t } = useT();

  const contactMethods: ContactMethod[] = [
    {
      icon: <EmailIcon />,
      title: t.contactPage.methods[0].title,
      value: process.env.NEXT_PUBLIC_CONTACT_EMAIL || t.contactPage.methods[0].value,
      description: t.contactPage.methods[0].description,
      action: () => openEmail()
    },
    {
      icon: <WhatsAppIcon />,
      title: t.contactPage.methods[1].title,
      value: process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || t.contactPage.methods[1].value,
      description: t.contactPage.methods[1].description,
      action: () => openWhatsApp(process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || '', t.contactPage.whatsappMessage)
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
        <ContactBackground />

        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
          <ContactHero hero={t.contactPage.hero} />
        </div>
      </section>

      {/* Contact Methods */}
      <ContactMethods methods={contactMethods} />
    </div>
  );
}