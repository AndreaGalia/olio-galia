import Link from 'next/link';

interface PrivacyContactCtaProps {
  content: string;
  button: string;
}

export default function PrivacyContactCta({ content, button }: PrivacyContactCtaProps) {
  return (
    <div className="mt-16 border-t border-olive/20 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <p className="text-sm text-black/60 leading-relaxed">{content}</p>
      <Link
        href="/contact"
        className="text-[11px] tracking-[0.25em] uppercase px-6 py-3 border border-olive/20 text-black/60 hover:bg-olive hover:text-beige hover:border-olive transition-all duration-300 cursor-pointer whitespace-nowrap"
      >
        {button}
      </Link>
    </div>
  );
}
