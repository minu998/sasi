import { useState } from 'react';
import { Check, Flame, Globe, Plus, Rocket, ShieldCheck, Trash2, Zap } from 'lucide-react';
import type {
  CacheSweepResult,
  GameEntry,
  Language,
  OptimizationModeId,
  OptimizationToggles,
} from '../types/optimizer';
import { OPTIMIZATION_MODES, UI_COPY } from '../data/presets';

interface GameLauncherPanelProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  games: GameEntry[];
  selectedGameId: string;
  onSelectGame: (id: string) => void;
  onAddCustomGame: (game: Omit<GameEntry, 'id' | 'isCustom'>) => void;
  onRemoveCustomGame: (id: string) => void;
  selectedMode: OptimizationModeId;
  onSelectMode: (mode: OptimizationModeId) => void;
  toggles: OptimizationToggles;
  onToggleSwitch: (key: keyof OptimizationToggles) => void;
  onStartLaunchPipeline: () => void;
  onQuickCleanCache: () => Promise<void>;
  lastSweep: CacheSweepResult | null;
  isSweeping: boolean;
}

export function GameLauncherPanel({
  lang,
  onChangeLang,
  games,
  selectedGameId,
  onSelectGame,
  onAddCustomGame,
  onRemoveCustomGame,
  selectedMode,
  onSelectMode,
  toggles,
  onToggleSwitch,
  onStartLaunchPipeline,
  onQuickCleanCache,
  lastSweep,
  isSweeping,
}: GameLauncherPanelProps) {
  const copy = UI_COPY[lang];
  const [showAddForm, setShowAddForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPkg, setCustomPkg] = useState('');
  const [formError, setFormError] = useState('');
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [emblemImgFailed, setEmblemImgFailed] = useState(false);

  const selectedGame = games.find((g) => g.id === selectedGameId) ?? games[0];
  const activeModeSpec =
    OPTIMIZATION_MODES.find((m) => m.id === selectedMode) ?? OPTIMIZATION_MODES[0];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = customName.trim();
    const trimmedPkg = customPkg.trim();
    if (!trimmedName || !trimmedPkg.includes('.')) {
      setFormError(
        lang === 'si'
          ? 'කරුණාකර වලංගු ගේම් නමක් සහ Android Package නමක් (උදා: com.dts.freefireth) ඇතුළත් කරන්න.'
          : 'Please enter a valid game name and Android package ID (e.g., com.dts.freefireth).'
      );
      return;
    }
    onAddCustomGame({
      name: trimmedName,
      subtitle: 'Custom Package · User Configured Profile',
      packageName: trimmedPkg,
      targetFps: 60,
      recommendedGraphics: activeModeSpec.recommendedSettings.graphics,
    });
    setCustomName('');
    setCustomPkg('');
    setFormError('');
    setShowAddForm(false);
  };

  const switchList: {
    key: keyof OptimizationToggles;
    titleSi: string;
    titleEn: string;
    descSi: string;
    descEn: string;
  }[] = [
    {
      key: 'autoCacheClean',
      titleSi: 'ගේම් අරඹන විට කෑච් ඔටෝ මකන්න',
      titleEn: 'Auto-Clean Cache on Launch',
      descSi: 'Launch කිරීමට පෙර තාවකාලික කෑච් ෆයිල් සහ බ්‍රව්සර් Storage පිරිසිදු කරයි.',
      descEn: 'Sweeps temporary cache storage and browser buffers right before launch.',
    },
    {
      key: 'thermalGuard',
      titleSi: 'ෆෝන් රත්වීම පාලනය (Thermal Guard)',
      titleEn: 'Thermal Cooling Guard',
      descSi: 'චාජ් වෙමින් ක්‍රීඩා කිරීම හඳුනාගෙන දීප්තිය සහ Shadow load අඩු කිරීමට සකසයි.',
      descEn: 'Detects charging heat risk and caps background thermal load flags.',
    },
    {
      key: 'ramRelease',
      titleSi: 'පසුබිම් RAM නිදහස් කිරීම',
      titleEn: 'Background RAM Sweep',
      descSi: 'ගේම් එකට වැඩි මතකයක් ඉතිරි කිරීමට පසුබිම් ඇප් සීමා කරයි (ADB Script ඇතුළත්).',
      descEn: 'Prepares background app termination commands for maximum free memory.',
    },
    {
      key: 'touchBoost',
      titleSi: 'ටච් වේගය සහ FPS ස්ථාවරකරණය',
      titleEn: 'Touch & Frame Pacing Boost',
      descSi: 'Headshot සහ වේගවත් Aim සඳහා Touch ප්‍රතිචාර ප්‍රමුඛතාව වැඩි කරයි.',
      descEn: 'Prioritizes touch responsiveness and steady frame intervals.',
    },
    {
      key: 'dnsLowPing',
      titleSi: 'අඩු Ping සඳහා Private DNS (1.1.1.1)',
      titleEn: 'Low-Ping DNS Routing',
      descSi: 'Network latency අඩු කිරීමට Cloudflare DNS සැකසුම් ඇතුළත් කරයි.',
      descEn: 'Applies Cloudflare 1.1.1.1 DNS routing optimization in companion script.',
    },
    {
      key: 'disableAnimations',
      titleSi: 'පද්ධති ඇනිමේෂන් අක්‍රිය කිරීම',
      titleEn: 'Zero Window Animations',
      descSi: 'UI පමාවන් නැති කිරීමට Android animation scale 0x ලෙස සකසයි.',
      descEn: 'Sets Android UI transition scales to 0 for snappy switching.',
    },
  ];

  return (
    <section id="launcher" className="space-y-8">
      {/* Workspace Toolbar: Language Switcher & Quick Cache Feedback */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{selectedGame.name}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-slate-300">{selectedGame.packageName}</span>
          <span aria-hidden="true">·</span>
          <span>{activeModeSpec.targetFps}</span>
        </div>

        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <div className="flex items-center rounded-lg border border-slate-800 bg-[#131822] p-0.5">
            <button
              type="button"
              onClick={() => onChangeLang('si')}
              className={`min-h-[36px] rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap ${
                lang === 'si' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              සිංහල
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              className={`min-h-[36px] rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap ${
                lang === 'en' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Hero Split (2-column balanced stretch) */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#131822] p-6 sm:p-8 lg:col-span-7">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {!emblemImgFailed ? (
                <img
                  src="/src/assets/images/fireboost_game_emblem_1794926800173.jpg"
                  alt="FireBoost Tactical Emblem"
                  referrerPolicy="no-referrer"
                  onError={() => setEmblemImgFailed(true)}
                  className="h-12 w-12 rounded-xl border border-slate-700/80 object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700/80 bg-[#1C2331] text-orange-400">
                  <Flame className="h-6 w-6" />
                </div>
              )}
              <div className="text-xs text-slate-400">
                <span>{lang === 'si' ? 'සක්‍රිය ගේම් පැකේජය' : 'Active Target'}</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span className="font-medium text-slate-200">{selectedGame.name}</span>
              </div>
            </div>

            <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-slate-100 sm:text-4xl [text-wrap:balance]">
              {copy.heroTitle}
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              {copy.heroSubtitle}
            </p>
          </div>

          <div className="mt-6 space-y-4 pt-4 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onStartLaunchPipeline}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-orange-400 active:scale-[0.98] whitespace-nowrap"
              >
                <Rocket className="h-4 w-4" aria-hidden="true" />
                <span>{copy.launchNow}</span>
              </button>

              <button
                type="button"
                onClick={onQuickCleanCache}
                disabled={isSweeping}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#1C2331] px-5 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap"
              >
                <Trash2 className="h-4 w-4 text-orange-400" aria-hidden="true" />
                <span>
                  {isSweeping
                    ? lang === 'si'
                      ? 'පිරිසිදු කරමින්...'
                      : 'Cleaning...'
                    : copy.quickCleanBtn}
                </span>
              </button>
            </div>

            {lastSweep && (
              <p className="text-xs text-emerald-400 tabular-nums">
                {lang === 'si'
                  ? `කෑච් පිරිසිදු කරන ලදී (${lastSweep.completedAt}) · නිදහස් කළ ඉඩ: ~${lastSweep.estimatedFreedKb} KB · Keys: ${
                      lastSweep.localKeysCleaned + lastSweep.sessionKeysCleared
                    }`
                  : `Cache cleaned at ${lastSweep.completedAt} · Freed ~${lastSweep.estimatedFreedKb} KB · Cleared ${
                      lastSweep.localKeysCleaned + lastSweep.sessionKeysCleared
                    } keys`}
              </p>
            )}
          </div>
        </div>

        <div className="relative min-h-[240px] overflow-hidden rounded-2xl border border-slate-800/90 bg-[#131822] lg:col-span-5">
          {!heroImgFailed ? (
            <img
              src="/src/assets/images/tactical_hardware_banner_1794926799556.jpg"
              alt="Gaming smartphone hardware cooling profile"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#131822] to-[#1C2331] p-8">
              <Zap className="h-16 w-16 text-orange-500/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="text-xs text-slate-300">
              <span>{lang === 'si' ? activeModeSpec.nameSi : activeModeSpec.nameEn}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-orange-400">{activeModeSpec.targetFps}</span>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-100">
              {lang === 'si' ? activeModeSpec.summarySi : activeModeSpec.summaryEn}
            </p>
          </div>
        </div>
      </div>

      {/* 01. Select Game Edition */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-slate-100 sm:text-xl">
            {copy.selectGameHeading}
          </h2>
          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700 bg-[#131822] px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-[#1C2331] whitespace-nowrap"
          >
            <Plus className="h-4 w-4 text-orange-400" aria-hidden="true" />
            <span>{copy.addCustomGame}</span>
          </button>
        </div>

        {showAddForm && (
          <form
            onSubmit={handleAddSubmit}
            className="grid grid-cols-1 gap-3 rounded-xl border border-slate-800 bg-[#131822] p-4 sm:grid-cols-3"
          >
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={lang === 'si' ? 'ගේම් නම (උදා: Free Fire OB)' : 'Game Name'}
              className="min-h-[44px] rounded-lg border border-slate-700 bg-[#0B0E14] px-3 text-sm text-slate-100 placeholder:text-slate-500"
            />
            <input
              type="text"
              value={customPkg}
              onChange={(e) => setCustomPkg(e.target.value)}
              placeholder="Package ID (e.g. com.dts.freefireth)"
              className="min-h-[44px] rounded-lg border border-slate-700 bg-[#0B0E14] px-3 font-mono text-sm text-slate-100 placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="min-h-[44px] rounded-lg bg-orange-500 px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-orange-400"
            >
              {lang === 'si' ? 'ගේම් එක් කරන්න' : 'Save Game'}
            </button>
            {formError && (
              <p className="text-xs text-red-400 sm:col-span-3">{formError}</p>
            )}
          </form>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => {
            const isSelected = game.id === selectedGame.id;
            return (
              <div
                key={game.id}
                onClick={() => onSelectGame(game.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectGame(game.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                className={`flex min-h-[112px] cursor-pointer flex-col justify-between rounded-xl border p-5 transition-colors ${
                  isSelected
                    ? 'border-orange-500 bg-[#1C2331]'
                    : 'border-slate-800 bg-[#131822] hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-100">
                      {game.name}
                    </h3>
                    <p className="mt-0.5 font-mono text-xs text-slate-400">{game.packageName}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {game.isCustom && (
                      <button
                        type="button"
                        aria-label={`Remove ${game.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveCustomGame(game.id);
                        }}
                        className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500 text-slate-950'
                          : 'border-slate-700 text-transparent'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 tabular-nums">
                  <span>{game.recommendedGraphics}</span>
                  <span aria-hidden="true">·</span>
                  <span>Target {game.targetFps} FPS</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 02. Optimization Mode */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-slate-100 sm:text-xl">
          {copy.modeHeading}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {OPTIMIZATION_MODES.map((mode) => {
            const isSelected = mode.id === selectedMode;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onSelectMode(mode.id)}
                className={`flex flex-col justify-between rounded-xl border p-5 text-left transition-colors ${
                  isSelected
                    ? 'border-orange-500 bg-[#1C2331]'
                    : 'border-slate-800 bg-[#131822] hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-base font-semibold text-slate-100">
                      {lang === 'si' ? mode.nameSi : mode.nameEn}
                    </span>
                    <span className="font-mono text-xs font-medium text-orange-400 tabular-nums whitespace-nowrap">
                      {mode.targetFps}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">
                    {lang === 'si' ? mode.summarySi : mode.summaryEn}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                  <span>{lang === 'si' ? mode.thermalGoalSi : mode.thermalGoalEn}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {mode.recommendedSettings.graphics} / {mode.recommendedSettings.fps} FPS
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 03. Pre-Launch Pipeline Switches */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-slate-100 sm:text-xl">
            {copy.togglesHeading}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <span className="tabular-nums">
              {Object.values(toggles).filter(Boolean).length} / {switchList.length}{' '}
              {lang === 'si' ? 'සක්‍රියයි' : 'Active'}
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-[#131822]">
          {switchList.map((item) => {
            const checked = toggles[item.key];
            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-100">
                    {lang === 'si' ? item.titleSi : item.titleEn}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {lang === 'si' ? item.descSi : item.descEn}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={checked}
                  aria-label={lang === 'si' ? item.titleSi : item.titleEn}
                  onClick={() => onToggleSwitch(item.key)}
                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                    checked ? 'bg-orange-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 rounded-full bg-white transition-transform ${
                      checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
