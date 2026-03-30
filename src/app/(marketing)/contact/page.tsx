import ContactFormSection from '@/components/contactPage/ContactFormSection';
import ContactFormTitle from '@/components/contactPage/ContactFormTitle';
import ContactInfoSection from '@/components/contactPage/ContactInfoSection';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-sabbia-chiaro">
      <section className="px-6 sm:px-12 lg:px-16 xl:px-24 py-16 lg:py-28 min-h-[calc(100vh-80px)] flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-start">
          <div>
            <ContactFormTitle />
            <ContactInfoSection />
          </div>
          <ContactFormSection />
        </div>
      </section>
    </div>
  );
}
