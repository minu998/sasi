import { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, Loader2, Rocket, X } from 'lucide-react';
import type {
  GameEntry,
  Language,
  LaunchStepStatus,
  OptimizationModeId,
  OptimizationToggles,
} from '../types/optimizer';
import {
  buildAndroidLaunchIntentUrl,
  performBrowserCacheSweep,
  readDeviceHardwareInfo,
  runNetworkPingTest,
} from '../utils/diagnostics';

interface LaunchSequenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  game: GameEntry;
  mode: OptimizationModeId;
  toggles: OptimizationToggles;
}

export function LaunchSequenceModal({
  isOpen,
  onClose,
  lang,
  game,
  mode,
  toggles,
}: LaunchSequenceModalProps) {
  const [steps, setSteps] = useState<LaunchStepStatus[]>([]);
  const [readyToLaunch, setReadyToLaunch] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setReadyToLaunch(false);

    const initialSteps: LaunchStepStatus[] = [
      {
        id: 'cache',
        labelSi: toggles.autoCacheClean
          ? 'තාවකාලික කෑච් සහ මතකය පිරිසිදු කිරීම'
          : 'මතක තත්ත්වය පරීක්ෂා කිරීම',
        labelEn: toggles.autoCacheClean
          ? 'Sweeping temporary cache & storage buffers'
          : 'Checking memory state',
        status: 'running',
      },
      {
        id: 'thermal',
        labelSi: 'උපාංග හාඩ්වෙයාර් සහ උෂ්ණත්ව පරීක්ෂාව',
        labelEn: 'Device hardware & thermal charging check',
        status: 'pending',
      },
      {
        id: 'ping',
        labelSi: 'සජීවී ජාල Ping අගය මැනීම',
        labelEn: 'Measuring live network latency',
        status: 'pending',
      },
      {
        id: 'launch',
        labelSi: `${game.name} දියත් කිරීමට සූදානම්`,
        labelEn: `Ready to launch ${game.name}`,
        status: 'pending',
      },
    ];

    setSteps(initialSteps);

    const executeSequence = async () => {
      // Step 1: Cache Sweep
      const sweep = toggles.autoCacheClean ? await performBrowserCacheSweep() : null;
      if (cancelled) return;
      setSteps((prev) =>
        prev.map((s) =>
          s.id === 'cache'
            ? {
                ...s,
                status: 'done',
                detail: sweep
                  ? `~${sweep.estimatedFreedKb} KB freed`
                  : lang === 'si'
                    ? 'සූදානම්'
                    : 'Skipped by user',
              }
            : s.id === 'thermal'
              ? { ...s, status: 'running' }
              : s
        )
      );

      // Step 2: Hardware / Thermal Check
      const hw = await readDeviceHardwareInfo();
      if (cancelled) return;
      const thermalDetail = hw.batteryCharging
        ? lang === 'si'
          ? 'චාජ් වෙමින් පවතී (හීට් අවදානම)'
          : 'Charging (disconnect for cooler FPS)'
        : lang === 'si'
          ? `සාමාන්‍යයි · Profile: ${mode}`
          : `Nominal · Profile: ${mode}`;

      setSteps((prev) =>
        prev.map((s) =>
          s.id === 'thermal'
            ? { ...s, status: 'done', detail: thermalDetail }
            : s.id === 'ping'
              ? { ...s, status: 'running' }
              : s
        )
      );

      // Step 3: Live Ping Check
      const ping = await runNetworkPingTest(3);
      if (cancelled) return;
      setSteps((prev) =>
        prev.map((s) =>
          s.id === 'ping'
            ? { ...s, status: 'done', detail: `${ping.avgMs} ms avg · ${ping.jitterMs} ms jitter` }
            : s.id === 'launch'
              ? { ...s, status: 'done', detail: game.packageName }
              : s
        )
      );

      setReadyToLaunch(true);
    };

    executeSequence();

    return () => {
      cancelled = true;
    };
  }, [isOpen, game.id, game.name, game.packageName, mode, toggles.autoCacheClean, lang]);

  if (!isOpen) return null;

  const intentUrl = buildAndroidLaunchIntentUrl(game.packageName);
  const playStoreUrl = `https://play.google.com/store/apps/details?id=${encodeURIComponent(
    game.packageName
  )}`;
  const adbLaunchCmd = `adb shell monkey -p ${game.packageName} -c android.intent.category.LAUNCHER 1`;

  const handleCopyCmd = async () => {
    try {
      await navigator.clipboard.writeText(adbLaunchCmd);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    } catch {
      // Clipboard blocked
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="launch-modal-title"
    >
      <div className="w-full max-w-lg rounded-t-3xl border border-slate-800 bg-[#131822] p-6 sm:rounded-2xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-700 sm:hidden" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="launch-modal-title" className="font-display text-lg font-bold text-slate-100">
              {lang === 'si' ? `${game.name} — Launch Pipeline` : `${game.name} — Launch Pipeline`}
            </h2>
            <p className="mt-0.5 font-mono text-xs text-slate-400">{game.packageName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-[#0B0E14]">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-200">
                  {lang === 'si' ? step.labelSi : step.labelEn}
                </div>
                {step.detail && (
                  <div className="mt-0.5 font-mono text-xs text-slate-400 tabular-nums">
                    {step.detail}
                  </div>
                )}
              </div>

              <div className="shrink-0">
                {step.status === 'done' ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check className="h-4 w-4" />
                  </span>
                ) : step.status === 'running' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-orange-400" />
                ) : (
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-700" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <a
            href={intentUrl}
            className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors ${
              readyToLaunch
                ? 'bg-orange-500 text-slate-950 hover:bg-orange-400'
                : 'pointer-events-none bg-slate-800 text-slate-500'
            }`}
          >
            <Rocket className="h-4 w-4" aria-hidden="true" />
            <span>
              {lang === 'si'
                ? `${game.name} දැන් විවෘත කරන්න (Android)`
                : `Open ${game.name} on Android`}
            </span>
          </a>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-[#1C2331] px-4 text-xs font-medium text-slate-200 hover:bg-slate-800"
            >
              <ExternalLink className="h-3.5 w-3.5 text-orange-400" aria-hidden="true" />
              <span>Play Store</span>
            </a>

            <button
              type="button"
              onClick={handleCopyCmd}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-[#1C2331] px-4 text-xs font-medium text-slate-200 hover:bg-slate-800"
            >
              {copiedCmd ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-orange-400" aria-hidden="true" />
              )}
              <span>{copiedCmd ? 'ADB Copied' : 'Copy ADB Launch'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
