import { useState } from 'react';
interface Item { href: string; label: string; }
export default function MobileNav({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-ice-600"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open
            ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
        </svg>
      </button>
      {open && (
        <nav className="absolute left-0 right-0 top-full flex flex-col gap-3 border-b border-ice-200 bg-white/95 px-6 py-4">
          {items.map((it) => (
            <a key={it.href} href={it.href} className="min-h-[44px] text-ice-ink" onClick={() => setOpen(false)}>{it.label}</a>
          ))}
        </nav>
      )}
    </div>
  );
}
