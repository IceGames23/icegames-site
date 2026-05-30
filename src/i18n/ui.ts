export const languages = { pt: 'Português', en: 'English' } as const;
export const defaultLang = 'pt';
export type Lang = keyof typeof languages;

export const ui = {
  pt: {
    'nav.about': 'Sobre',
    'nav.services': 'Serviços',
    'nav.projects': 'Projetos',
    'nav.skills': 'Skills',
    'nav.testimonials': 'Depoimentos',
    'nav.contact': 'Contato',
    'hero.role': 'Game Designer · Desenvolvedor Java',
    'hero.cta.projects': 'Ver projetos',
    'hero.cta.contact': 'Me contratar',
    'contact.heading': 'Vamos construir algo juntos?',
  },
  en: {
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.projects': 'Projects',
    'nav.skills': 'Skills',
    'nav.testimonials': 'Testimonials',
    'nav.contact': 'Contact',
    'hero.role': 'Game Designer · Java Developer',
    'hero.cta.projects': 'View projects',
    'hero.cta.contact': 'Hire me',
    'contact.heading': "Let's build something together?",
  },
} as const;

export type UIKey = keyof (typeof ui)['pt'];
