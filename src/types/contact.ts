// types/contact.ts
import { ReactNode } from 'react';

export interface ContactMethod {
  icon: ReactNode;
  title: string;
  value: string;
  description: string;
  action: () => void;
}

export interface ContactMethodData {
  title: string;
  value: string;
  description: string;
}

export interface ContactHero {
  badge: string;
  title: {
    main: string;
    subtitle: string;
  };
  description: string;
}

export interface ContactPageTranslations {
  hero: ContactHero;
  methods: ContactMethodData[];
  whatsappMessage: string;
}