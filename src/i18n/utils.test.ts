import { describe, it, expect } from 'vitest';
import { getLangFromUrl, useTranslations } from './utils';

describe('getLangFromUrl', () => {
  it('reads the locale from the path', () => {
    expect(getLangFromUrl(new URL('https://x.com/en/projetos'))).toBe('en');
  });
  it('falls back to default for unknown locale', () => {
    expect(getLangFromUrl(new URL('https://x.com/fr/'))).toBe('pt');
  });
});

describe('useTranslations', () => {
  it('returns the string for the active language', () => {
    const t = useTranslations('en');
    expect(t('hero.cta.contact')).toBe('Hire me');
  });
  it('falls back to default language when key missing in target', () => {
    const t = useTranslations('en');
    expect(t('nav.about')).toBe('About');
  });
});
