import Link from 'next/link';

export default function PetitionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bone">
      <header className="w-full bg-forest text-bone py-sm px-md md:px-lg flex items-center">
        <Link
          href="/"
          className="font-display text-base font-medium tracking-wide leading-none flex items-center shrink-0"
        >
          <span className="flex flex-col leading-tight">
            <span className="block whitespace-nowrap">CORONATION</span>
            <span className="block whitespace-nowrap text-[1.15em] tracking-wider">GARDENS</span>
          </span>
        </Link>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
