import { Cpu, Crosshair, Rocket, Terminal } from 'lucide-react';
import type { Language, NavSection } from '../types/optimizer';
import { UI_COPY } from '../data/presets';

interface MobileBottomNavProps {
  lang: Language;
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
}

export function MobileBottomNav({ lang, activeSection, onSelectSection }: MobileBottomNavProps) {
  const copy = UI_COPY[lang];

  const items: { id: NavSection; label: string; icon: typeof Rocket }[] = [
    { id: 'launcher', label: copy.navLauncher, icon: Rocket },
    { id: 'diagnostics', label: copy.navDiagnostics, icon: Cpu },
    { id: 'sensitivity', label: copy.navSensitivity, icon: Crosshair },
    { id: 'script', label: copy.navScript, icon: Terminal },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-[#0B0E14]/95 backdrop-blur-md lg:hidden"
    >
      <div className="grid h-14 grid-cols-4 items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
                isActive ? 'text-orange-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="max-w-full truncate text-[11px] font-medium leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
