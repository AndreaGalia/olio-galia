import ContactFormSection from '@/components/contactPage/ContactFormSection';
import ContactFormTitle from '@/components/contactPage/ContactFormTitle';
import ContactInfoSection from '@/components/contactPage/ContactInfoSection';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-homepage-bg">
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="lg:col-span-2">
              <ContactFormTitle />
            </div>
            <ContactFormSection hideTitle />
            <ContactInfoSection />
          </div>
        </div>
      </section>
    </div>
  );
}
