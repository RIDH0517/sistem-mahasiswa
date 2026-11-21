export const THEME_MODE_KEY = 'siakademik_theme';
export const THEME_ACCENT_KEY = 'siakademik_accent';
export const THEME_ACCENT_EVENT = 'siakademik-accent-change';
export const THEME_STYLE_KEY = 'siakademik_style';
export const THEME_STYLE_EVENT = 'siakademik-style-change';

export type ColorThemeId = 'blue' | 'emerald' | 'indigo' | 'amber' | 'rose';
export type UiStyleId = 'modern' | 'glass' | 'brutal' | 'neumorph' | 'clay';

export interface ColorThemeOption {
  id: ColorThemeId;
  label: string;
  description: string;
  swatch: string;
}

export interface UiStyleOption {
  id: UiStyleId;
  label: string;
  description: string;
}

export const COLOR_THEMES: ColorThemeOption[] = [
  { id: 'blue', label: 'Biru', description: 'Akademik klasik', swatch: '#2563eb' },
  { id: 'emerald', label: 'Emerald', description: 'Hijau kampus', swatch: '#059669' },
  { id: 'indigo', label: 'Indigo', description: 'Ungu elegan', swatch: '#4f46e5' },
  { id: 'amber', label: 'Amber', description: 'Hangat & kertas', swatch: '#d97706' },
  { id: 'rose', label: 'Rose', description: 'Merah marun', swatch: '#e11d48' },
];

export const UI_STYLES: UiStyleOption[] = [
  { id: 'modern', label: 'Modern Flat', description: 'Bersih & minimalis' },
  { id: 'glass', label: 'Glassmorphism', description: 'Kaca buram transparan' },
  { id: 'brutal', label: 'Neo-Brutalism', description: 'Border tebal & kontras' },
  { id: 'neumorph', label: 'Neumorphism', description: 'Timbul lembut monokrom' },
  { id: 'clay', label: 'Claymorphism', description: 'Empuk 3D membulat' },
];

export function isValidColorTheme(value: string | null | undefined): value is ColorThemeId {
  return COLOR_THEMES.some((t) => t.id === value);
}

export function isValidUiStyle(value: string | null | undefined): value is UiStyleId {
  return UI_STYLES.some((s) => s.id === value);
}

export function applyColorTheme(id: ColorThemeId): void {
  document.documentElement.setAttribute('data-theme', id);
}

export function applyUiStyle(id: UiStyleId): void {
  document.documentElement.setAttribute('data-style', id);
}

export function applyDarkMode(isDark: boolean): void {
  document.documentElement.classList.toggle('dark', isDark);
}

interface ViewTransitionLike {
  ready: Promise<void>;
  finished: Promise<void>;
}

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => ViewTransitionLike;
};

let activeTransitionId = 0;
let fadeTimer: ReturnType<typeof setTimeout> | null = null;

export function toggleDarkModeWithTransition(
  nextIsDark: boolean,
  origin?: { x: number; y: number }
): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    applyDarkMode(nextIsDark);
    return;
  }

  const doc = document as DocumentWithViewTransition;
  const root = document.documentElement;

  if (typeof doc.startViewTransition === 'function') {
    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? window.innerHeight / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const id = ++activeTransitionId;
    root.classList.add('theme-transitioning');

    const transition = doc.startViewTransition(() => {
      applyDarkMode(nextIsDark);
    });

    transition.ready
      .then(() => {
        root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 520,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      })
      .catch(() => {
        // Abaikan AbortError saat transisi digantikan klik baru
      });

    transition.finished
      .catch(() => {
        // Abaikan AbortError saat transisi digantikan klik baru
      })
      .finally(() => {
        if (activeTransitionId === id) {
          root.classList.remove('theme-transitioning');
        }
      });
    return;
  }

  if (fadeTimer) clearTimeout(fadeTimer);
  root.classList.add('theme-fade');
  applyDarkMode(nextIsDark);
  fadeTimer = setTimeout(() => {
    root.classList.remove('theme-fade');
    fadeTimer = null;
  }, 360);
}
