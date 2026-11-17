import { useMemo, useState } from 'react';
import { Check, Copy, Download, Info } from 'lucide-react';
import type {
  GameEntry,
  Language,
  OptimizationModeId,
  OptimizationToggles,
  SensitivityConfig,
} from '../types/optimizer';
import { UI_COPY } from '../data/presets';
import { generateAndroidOptimizationScript } from '../utils/diagnostics';

interface AndroidScriptPanelProps {
  lang: Language;
  game: GameEntry;
  mode: OptimizationModeId;
  toggles: OptimizationToggles;
  sensitivity: SensitivityConfig;
}

export function AndroidScriptPanel({
  lang,
  game,
  mode,
  toggles,
  sensitivity,
}: AndroidScriptPanelProps) {
  const copy = UI_COPY[lang];
  const [copied, setCopied] = useState(false);

  const scriptContent = useMemo(
    () => generateAndroidOptimizationScript(game, mode, toggles, sensitivity),
    [game, mode, toggles, sensitivity]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked
    }
  };

  const handleDownload = () => {
    const blob = new Blob([scriptContent], { type: 'text/x-shellscript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fireboost-${game.id}.sh`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="script" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-100 sm:text-2xl">
            {copy.scriptHeading}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {lang === 'si'
              ? `තෝරාගත් ${game.name} (${game.packageName}) සඳහා සැකසූ ස්වයංක්‍රීය Android ADB / Shizuku විධාන ගොනුව.`
              : `Generated dynamically for ${game.name} (${game.packageName}) using your active switches.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-700 bg-[#131822] px-4 py-2 text-xs font-medium text-slate-100 transition-colors hover:border-slate-600 hover:bg-[#1C2331] whitespace-nowrap"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4 text-orange-400" aria-hidden="true" />
            )}
            <span>{copied ? copy.copied : copy.copyScript}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-orange-400 whitespace-nowrap"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>{copy.downloadScript}</span>
          </button>
        </div>
      </div>

      {/* Browser Sandbox Transparency Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-[#131822] p-5">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" aria-hidden="true" />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-100">{copy.sandboxNoticeTitle}</h3>
          <p className="text-xs leading-relaxed text-slate-300">{copy.sandboxNoticeBody}</p>
        </div>
      </div>

      {/* Generated Script Code Block */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0B0E14]">
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#131822] px-4 py-2.5 text-xs text-slate-400">
          <span className="font-mono">fireboost-{game.id}.sh</span>
          <span>ADB / Shizuku / Termux</span>
        </div>
        <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-200">
          <code>{scriptContent}</code>
        </pre>
      </div>
    </section>
  );
}
