import Link from 'next/link';

interface FaqContactCtaProps {
  title: string;
  button: string;
}

export default function FaqContactCta({ title, button }: FaqContactCtaProps) {
  return (
    <div className="mt-16 border-t border-olive/20 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <p className="garamond-13">{title}</p>
      <Link
        href="/contact"
        className="font-serif termina-11 tracking-[0.25em] uppercase px-6 py-3 border border-olive/20 text-black hover:bg-olive hover:text-beige hover:border-olive transition-all duration-300 cursor-pointer whitespace-nowrap"
      >
        {button}
      </Link>
    </div>
  );
}
