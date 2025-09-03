// components/Contact/ContactMethods.tsx
import { ContactMethod } from '@/types/contact';
import ContactMethodCard from './ContactMethodCard';

interface ContactMethodsProps {
  methods: ContactMethod[];
}

export default function ContactMethods({ methods }: ContactMethodsProps) {
  return (
    <section className="py-16 bg-white/50">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {methods.map((method, index) => (
            <ContactMethodCard
              key={index}
              method={method}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}