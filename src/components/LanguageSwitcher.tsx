interface Props { lang: 'pt' | 'en'; path: string; }
export default function LanguageSwitcher({ lang, path }: Props) {
  const other = lang === 'pt' ? 'en' : 'pt';
  return (
    <a
      href={`/${other}/${path}`}
      aria-label={lang === 'pt' ? 'Switch to English' : 'Mudar para Português'}
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-ice-300 px-3 text-sm font-medium text-ice-600 transition hover:bg-ice-100"
    >
      {lang === 'pt' ? 'EN' : 'PT'}
    </a>
  );
}
