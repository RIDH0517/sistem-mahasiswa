'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import {
  COLOR_THEMES,
  THEME_ACCENT_EVENT,
  THEME_ACCENT_KEY,
  THEME_MODE_KEY,
  THEME_STYLE_EVENT,
  THEME_STYLE_KEY,
  UI_STYLES,
  applyColorTheme,
  applyDarkMode,
  applyUiStyle,
  isValidColorTheme,
  isValidUiStyle,
  type ColorThemeId,
  type UiStyleId,
} from '@/lib/theme';

function subscribeAccent(callback: () => void) {
  window.addEventListener(THEME_ACCENT_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(THEME_ACCENT_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function getAccentSnapshot(): ColorThemeId {
  const val = document.documentElement.getAttribute('data-theme');
  return isValidColorTheme(val) ? val : 'blue';
}

function subscribeStyle(callback: () => void) {
  window.addEventListener(THEME_STYLE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(THEME_STYLE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function getStyleSnapshot(): UiStyleId {
  const val = document.documentElement.getAttribute('data-style');
  return isValidUiStyle(val) ? val : 'modern';
}

export default function ThemeToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const activeAccent = useSyncExternalStore(
    subscribeAccent,
    getAccentSnapshot,
    () => 'blue' as ColorThemeId
  );

  const activeStyle = useSyncExternalStore(
    subscribeStyle,
    getStyleSnapshot,
    () => 'modern' as UiStyleId
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_MODE_KEY) {
        const isDark =
          e.newValue === 'dark' ||
          (!e.newValue && window.matchMedia('(prefers-color-scheme: dark)').matches);
        applyDarkMode(isDark);
      }
      if (e.key === THEME_ACCENT_KEY) {
        const nextAccent = isValidColorTheme(e.newValue) ? e.newValue : 'blue';
        applyColorTheme(nextAccent);
        window.dispatchEvent(new Event(THEME_ACCENT_EVENT));
      }
      if (e.key === THEME_STYLE_KEY) {
        const nextStyle = isValidUiStyle(e.newValue) ? e.newValue : 'modern';
        applyUiStyle(nextStyle);
        window.dispatchEvent(new Event(THEME_STYLE_EVENT));
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const handleSelectStyle = (id: UiStyleId) => {
    applyUiStyle(id);
    try {
      localStorage.setItem(THEME_STYLE_KEY, id);
    } catch {
      // Abaikan error localStorage jika penyimpanan tidak tersedia
    }
    window.dispatchEvent(new Event(THEME_STYLE_EVENT));
  };

  const handleSelectAccent = (id: ColorThemeId) => {
    applyColorTheme(id);
    try {
      localStorage.setItem(THEME_ACCENT_KEY, id);
    } catch {
      // Abaikan error localStorage jika penyimpanan tidak tersedia
    }
    window.dispatchEvent(new Event(THEME_ACCENT_EVENT));
  };

  const handleToggleMode = () => {
    const nextIsDark = !document.documentElement.classList.contains('dark');
    applyDarkMode(nextIsDark);
    try {
      localStorage.setItem(THEME_MODE_KEY, nextIsDark ? 'dark' : 'light');
    } catch {
      // Abaikan error localStorage jika penyimpanan tidak tersedia
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Pemilih Gaya UI & Tema Warna */}
      <div className="relative" ref={pickerRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="Pilih gaya tampilan dan tema warna"
          title="Pilih gaya tampilan & warna"
          className="ui-btn-secondary inline-flex h-9 items-center gap-1.5 px-2.5"
        >
          <Palette className="h-4 w-4" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent-solid" aria-hidden="true" />
        </button>

        {isOpen && (
          <div className="ui-popover absolute right-0 z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] origin-top-right p-2.5">
            {/* Bagian 1: Gaya Tampilan */}
            <p className="px-2 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
              Gaya Tampilan
            </p>
            <div className="space-y-0.5">
              {UI_STYLES.map((style) => {
                const active = activeStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => handleSelectStyle(style.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                      active
                        ? 'bg-accent-soft text-accent-text'
                        : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold">{style.label}</span>
                      <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {style.description}
                      </span>
                    </span>
                    {active && <Check className="h-4 w-4 shrink-0 text-accent-text" />}
                  </button>
                );
              })}
            </div>

            {/* Bagian 2: Tema Warna */}
            <div className="mt-2.5 border-t border-slate-200/70 pt-2.5 dark:border-slate-800">
              <p className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                Tema Warna
              </p>
              <div className="flex items-center justify-between px-2 pb-1">
                {COLOR_THEMES.map((theme) => {
                  const active = activeAccent === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectAccent(theme.id)}
                      aria-label={`Tema warna ${theme.label}`}
                      title={`${theme.label} — ${theme.description}`}
                      className={`flex h-7 w-7 items-center justify-center rounded-full border border-black/10 transition-transform hover:scale-110 dark:border-white/15 ${
                        active
                          ? 'ring-2 ring-accent-solid ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
                          : ''
                      }`}
                      style={{ backgroundColor: theme.swatch }}
                    >
                      {active && <Check className="h-3.5 w-3.5 text-white drop-shadow-xs" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tombol Mode Terang / Gelap */}
      <button
        type="button"
        onClick={handleToggleMode}
        aria-label="Ganti tema tampilan"
        title="Ganti tema Terang / Gelap"
        className="ui-btn-secondary inline-flex h-9 w-9 items-center justify-center"
      >
        <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
        <Moon className="h-4 w-4 dark:hidden" aria-hidden="true" />
      </button>
    </div>
  );
}
