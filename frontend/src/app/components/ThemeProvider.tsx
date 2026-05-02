'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';
interface ThemeCtx { theme: Theme; toggle: () => void; }

const ThemeContext = createContext<ThemeCtx>({ theme: 'light', toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('desi-cart-theme') as Theme | null;
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initial = saved || preferred;
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggle = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('desi-cart-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
      {mounted && <ThemeToggleButton theme={theme} toggle={toggle} />}
    </ThemeContext.Provider>
  );
}

function ThemeToggleButton({ theme, toggle }: { theme: Theme; toggle: () => void }) {
  const isDark = theme === 'dark';
  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        id="theme-toggle"
        onClick={toggle}
        aria-label="Toggle dark mode"
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: isDark ? '#1f2937' : '#ffffff',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          borderRadius: '9999px', padding: '6px 14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
      >
        {/* Sun */}
        <svg width="16" height="16" fill={isDark ? '#6b7280' : '#f59e0b'} viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>

        {/* Slider track */}
        <div style={{
          position: 'relative', width: '40px', height: '22px',
          borderRadius: '9999px', background: isDark ? '#3b82f6' : '#d1d5db',
          transition: 'background 0.3s',
        }}>
          <div style={{
            position: 'absolute', top: '3px',
            left: isDark ? '20px' : '3px',
            width: '16px', height: '16px',
            borderRadius: '9999px', background: '#ffffff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            transition: 'left 0.3s',
          }} />
        </div>

        {/* Moon */}
        <svg width="16" height="16" fill={isDark ? '#93c5fd' : '#9ca3af'} viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </button>
    </div>
  );
}
