import type { Language, NavSection } from '../types/optimizer';
import { UI_COPY } from '../data/presets';

interface TopBarProps {
  lang: Language;
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onLaunchClick: () => void;
}

export function TopBar({ lang, activeSection, onSelectSection, onLaunchClick }: TopBarProps) {
  const copy = UI_COPY[lang];

  const navItems: { id: NavSection; label: string }[] = [
    { id: 'launcher', label: copy.navLauncher },
    { id: 'diagnostics', label: copy.navDiagnostics },
    { id: 'sensitivity', label: copy.navSensitivity },
    { id: 'script', label: copy.navScript },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-[#0B0E14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <a
          href="#launcher"
          onClick={(e) => {
            e.preventDefault();
            onSelectSection('launcher');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0"
        >
          {copy.brand}
        </a>

        <nav className="hidden lg:flex items-center gap-6" aria-label="Primary Navigation">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'border-orange-500 text-slate-100'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onLaunchClick}
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 transition-colors hover:bg-orange-400 active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            {copy.primaryCta}
          </button>
        </div>
      </div>
    </header>
  );
}
