import Link from "next/link";

export const BrandMark = () => (
  <Link href="/" className="flex items-center gap-2.5 shrink-0">
    <svg className="w-7 h-7" viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="33" stroke="var(--border)" strokeWidth="2" fill="var(--surface)" />
      <path d="M3 36 A33 33 0 0 1 69 36 L36 36 Z" fill="var(--accent)" opacity="0.9" />
      <line x1="3" y1="36" x2="69" y2="36" stroke="var(--border)" strokeWidth="2" />
      <circle cx="36" cy="36" r="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
    </svg>
    <span className="text-lg font-bold tracking-tight text-foreground">Pokélytica</span>
  </Link>
);
