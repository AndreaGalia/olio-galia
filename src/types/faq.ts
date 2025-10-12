// types/faq.ts
import { ObjectId } from "mongodb";

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

// MongoDB Types
export interface FAQDocument {
  _id?: ObjectId;
  translations: {
    it: {
      question: string;
      answer: string;
      category: string;
    };
    en: {
      question: string;
      answer: string;
      category: string;
    };
  };
  order: number; // Ordine di visualizzazione
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
  };
}

export interface CreateFAQInput {
  questionIT: string;
  answerIT: string;
  categoryIT: string;
  questionEN: string;
  answerEN: string;
  categoryEN: string;
  order?: number;
}

export interface UpdateFAQInput {
  questionIT?: string;
  answerIT?: string;
  categoryIT?: string;
  questionEN?: string;
  answerEN?: string;
  categoryEN?: string;
  order?: number;
  isActive?: boolean;
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
