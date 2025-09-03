// types/faq.ts
export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export interface FAQData {
  question: string;
  answer: string;
  category: string;
}

export interface FAQTitle {
  line1: string;
  line2: string;
}

export interface ContactButtons {
  email: string;
  phone: string;
  whatsapp: string;
}

export interface ContactInfo {
  email: string;
  emailAddress: string;
  phone: string;
  phoneNumber: string;
  whatsapp: string;
  whatsappNumber: string;
}

export interface Contact {
  title: string;
  description: string;
  buttons: ContactButtons;
  info: ContactInfo;
}

export interface FAQCategories {
  [key: string]: string;
}

export interface FAQTranslations {
  badge: string;
  title: FAQTitle;
  description: string;
  questions: FAQData[];
  categories: FAQCategories;
  contact: Contact;
}

export interface FAQHeaderProps {
  badge: string;
  title: FAQTitle;
  description: string;
}
