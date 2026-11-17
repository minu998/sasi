import { useCallback, useEffect, useState } from 'react';
import { AndroidScriptPanel } from './components/AndroidScriptPanel';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';
import { GameLauncherPanel } from './components/GameLauncherPanel';
import { LaunchSequenceModal } from './components/LaunchSequenceModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SensitivityPanel } from './components/SensitivityPanel';
import { TopBar } from './components/TopBar';
import { DEFAULT_GAMES, SENSITIVITY_PRESETS } from './data/presets';
import type {
  CacheSweepResult,
  DeviceHardwareInfo,
  GameEntry,
  Language,
  NavSection,
  OptimizationModeId,
  OptimizationToggles,
  SensitivityConfig,
} from './types/optimizer';
import { performBrowserCacheSweep, readDeviceHardwareInfo } from './utils/diagnostics';

const STORAGE_KEYS = {
  lang: 'fireboost_lang_v1',
  games: 'fireboost_games_v1',
  selectedGame: 'fireboost_selected_game_v1',
  mode: 'fireboost_mode_v1',
  toggles: 'fireboost_toggles_v1',
  sensitivity: 'fireboost_sensitivity_v1',
} as const;

const DEFAULT_TOGGLES: OptimizationToggles = {
  autoCacheClean: true,
  thermalGuard: true,
  ramRelease: true,
  touchBoost: true,
  dnsLowPing: true,
  disableAnimations: true,
};

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [lang, setLang] = useState<Language>(() => readStored<Language>(STORAGE_KEYS.lang, 'si'));
  const [activeSection, setActiveSection] = useState<NavSection>('launcher');

  const [games, setGames] = useState<GameEntry[]>(() =>
    readStored<GameEntry[]>(STORAGE_KEYS.games, DEFAULT_GAMES)
  );
  const [selectedGameId, setSelectedGameId] = useState<string>(() =>
    readStored<string>(STORAGE_KEYS.selectedGame, DEFAULT_GAMES[0].id)
  );
  const [selectedMode, setSelectedMode] = useState<OptimizationModeId>(() =>
    readStored<OptimizationModeId>(STORAGE_KEYS.mode, 'ultra_smooth')
  );
  const [toggles, setToggles] = useState<OptimizationToggles>(() =>
    readStored<OptimizationToggles>(STORAGE_KEYS.toggles, DEFAULT_TOGGLES)
  );
  const [sensitivity, setSensitivity] = useState<SensitivityConfig>(() =>
    readStored<SensitivityConfig>(STORAGE_KEYS.sensitivity, SENSITIVITY_PRESETS.mid_ram)
  );

  const [hardware, setHardware] = useState<DeviceHardwareInfo | null>(null);
  const [lastSweep, setLastSweep] = useState<CacheSweepResult | null>(null);
  const [isSweeping, setIsSweeping] = useState(false);
  const [launchModalOpen, setLaunchModalOpen] = useState(false);

  const refreshHardware = useCallback(async () => {
    const info = await readDeviceHardwareInfo();
    setHardware(info);
  }, []);

  useEffect(() => {
    refreshHardware();
  }, [refreshHardware]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.lang, JSON.stringify(lang));
      window.localStorage.setItem(STORAGE_KEYS.games, JSON.stringify(games));
      window.localStorage.setItem(STORAGE_KEYS.selectedGame, JSON.stringify(selectedGameId));
      window.localStorage.setItem(STORAGE_KEYS.mode, JSON.stringify(selectedMode));
      window.localStorage.setItem(STORAGE_KEYS.toggles, JSON.stringify(toggles));
      window.localStorage.setItem(STORAGE_KEYS.sensitivity, JSON.stringify(sensitivity));
    } catch {
      // Ignore storage quota errors
    }
  }, [lang, games, selectedGameId, selectedMode, toggles, sensitivity]);

  const handleSelectSection = (section: NavSection) => {
    setActiveSection(section);
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAddCustomGame = (gameData: Omit<GameEntry, 'id' | 'isCustom'>) => {
    const id = `custom_${Date.now()}`;
    const nextGame: GameEntry = {
      ...gameData,
      id,
      isCustom: true,
    };
    setGames((prev) => [...prev, nextGame]);
    setSelectedGameId(id);
  };

  const handleRemoveCustomGame = (id: string) => {
    setGames((prev) => {
      const filtered = prev.filter((g) => g.id !== id);
      if (selectedGameId === id && filtered.length > 0) {
        setSelectedGameId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleToggleSwitch = (key: keyof OptimizationToggles) => {
    setToggles((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleQuickCleanCache = async () => {
    if (isSweeping) return;
    setIsSweeping(true);
    const result = await performBrowserCacheSweep();
    setLastSweep(result);
    await refreshHardware();
    setIsSweeping(false);
  };

  const activeGame = games.find((g) => g.id === selectedGameId) ?? games[0];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 pb-20 lg:pb-12">
      <TopBar
        lang={lang}
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onLaunchClick={() => setLaunchModalOpen(true)}
      />

      <main className="mx-auto max-w-7xl space-y-14 px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <GameLauncherPanel
          lang={lang}
          onChangeLang={setLang}
          games={games}
          selectedGameId={selectedGameId}
          onSelectGame={setSelectedGameId}
          onAddCustomGame={handleAddCustomGame}
          onRemoveCustomGame={handleRemoveCustomGame}
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          toggles={toggles}
          onToggleSwitch={handleToggleSwitch}
          onStartLaunchPipeline={() => setLaunchModalOpen(true)}
          onQuickCleanCache={handleQuickCleanCache}
          lastSweep={lastSweep}
          isSweeping={isSweeping}
        />

        <div className="border-t border-slate-800/80 pt-10">
          <DiagnosticsPanel
            lang={lang}
            hardware={hardware}
            onRefreshHardware={refreshHardware}
            onCleanCache={handleQuickCleanCache}
            lastSweep={lastSweep}
            isSweeping={isSweeping}
          />
        </div>

        <div className="border-t border-slate-800/80 pt-10">
          <SensitivityPanel
            lang={lang}
            sensitivity={sensitivity}
            onChangeSensitivity={setSensitivity}
          />
        </div>

        <div className="border-t border-slate-800/80 pt-10">
          <AndroidScriptPanel
            lang={lang}
            game={activeGame}
            mode={selectedMode}
            toggles={toggles}
            sensitivity={sensitivity}
          />
        </div>
      </main>

      <footer className="mx-auto mt-14 max-w-7xl border-t border-slate-800/80 px-4 py-6 text-xs text-slate-500 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>FireBoost FF Optimizer</span>
          <span>
            {lang === 'si'
              ? 'Free Fire සහ Free Fire MAX ක්‍රීඩකයින් සඳහා නිර්මාණය කරන ලදී'
              : 'Built for Free Fire & Free Fire MAX players'}
          </span>
        </div>
      </footer>

      <MobileBottomNav
        lang={lang}
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
      />

      <LaunchSequenceModal
        isOpen={launchModalOpen}
        onClose={() => setLaunchModalOpen(false)}
        lang={lang}
        game={activeGame}
        mode={selectedMode}
        toggles={toggles}
      />
    </div>
  );
}
