import Link from 'next/link';

interface FaqContactCtaProps {
  title: string;
  button: string;
}

export default function FaqContactCta({ title, button }: FaqContactCtaProps) {
  return (
    <div className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-olive/15 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-black/60 tracking-wide">{title}</p>
      <Link
        href="/contact"
        className="btn-outline border border-olive text-olive px-6 py-2.5 text-sm tracking-widest uppercase hover:bg-olive hover:text-white transition-colors duration-200 whitespace-nowrap"
      >
        {button}
      </Link>
    </div>
  );
}
