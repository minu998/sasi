import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { Language, SensitivityConfig } from '../types/optimizer';
import { SENSITIVITY_PRESETS, UI_COPY } from '../data/presets';

interface SensitivityPanelProps {
  lang: Language;
  sensitivity: SensitivityConfig;
  onChangeSensitivity: (next: SensitivityConfig) => void;
}

export function SensitivityPanel({
  lang,
  sensitivity,
  onChangeSensitivity,
}: SensitivityPanelProps) {
  const copy = UI_COPY[lang];
  const [copied, setCopied] = useState(false);

  const sliderFields: {
    key: 'general' | 'redDot' | 'scope2x' | 'scope4x' | 'sniperScope' | 'freeLook';
    labelSi: string;
    labelEn: string;
  }[] = [
    { key: 'general', labelSi: 'General (සාමාන්‍ය)', labelEn: 'General' },
    { key: 'redDot', labelSi: 'Red Dot', labelEn: 'Red Dot' },
    { key: 'scope2x', labelSi: '2x Scope', labelEn: '2x Scope' },
    { key: 'scope4x', labelSi: '4x Scope', labelEn: '4x Scope' },
    { key: 'sniperScope', labelSi: 'Sniper Scope', labelEn: 'Sniper Scope' },
    { key: 'freeLook', labelSi: 'Free Look', labelEn: 'Free Look' },
  ];

  const handleCopy = async () => {
    const summary = [
      `FireBoost FF Config (${sensitivity.tierLabel})`,
      `General: ${sensitivity.general}`,
      `Red Dot: ${sensitivity.redDot}`,
      `2x Scope: ${sensitivity.scope2x}`,
      `4x Scope: ${sensitivity.scope4x}`,
      `Sniper Scope: ${sensitivity.sniperScope}`,
      `Free Look: ${sensitivity.freeLook}`,
      `Recommended DPI: ${sensitivity.dpi}`,
      `Graphics: ${sensitivity.graphicsPreset} | FPS: ${sensitivity.fpsSetting} | Shadows: ${
        sensitivity.shadows ? 'On' : 'Off'
      }`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked
    }
  };

  return (
    <section id="sensitivity" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-100 sm:text-2xl">
            {copy.sensitivityHeading}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {lang === 'si'
              ? 'ඔබේ දුරකථනයේ RAM ප්‍රමාණය අනුව නිවැරදි Sensitivity, DPI සහ හීට් අඩු Graphics සැකසුම් තෝරා ගන්න.'
              : 'Tune OB4x 0–200 sensitivity sliders, DPI, and thermal-safe in-game graphics presets.'}
          </p>
        </div>

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
          <span>{copied ? copy.copied : copy.copyConfig}</span>
        </button>
      </div>

      {/* RAM Tier Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-xs text-slate-400">
          {lang === 'si' ? 'ඉක්මන් RAM සැකසුම්:' : 'RAM Tier Presets:'}
        </span>
        {Object.entries(SENSITIVITY_PRESETS).map(([key, preset]) => {
          const isCurrent = sensitivity.tierLabel === preset.tierLabel;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChangeSensitivity({ ...preset })}
              className={`min-h-[40px] rounded-lg border px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                isCurrent
                  ? 'border-orange-500 bg-orange-500 text-slate-950'
                  : 'border-slate-800 bg-[#131822] text-slate-300 hover:border-slate-700'
              }`}
            >
              {preset.tierLabel}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sensitivity Sliders */}
        <div className="space-y-5 rounded-xl border border-slate-800 bg-[#131822] p-6 lg:col-span-7">
          {sliderFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor={`sens-${field.key}`} className="font-medium text-slate-200">
                  {lang === 'si' ? field.labelSi : field.labelEn}
                </label>
                <span className="font-mono text-sm font-semibold text-orange-400 tabular-nums">
                  {sensitivity[field.key]}
                </span>
              </div>
              <input
                id={`sens-${field.key}`}
                type="range"
                min={0}
                max={200}
                value={sensitivity[field.key]}
                onChange={(e) =>
                  onChangeSensitivity({
                    ...sensitivity,
                    [field.key]: Number(e.target.value),
                  })
                }
                className="ff-slider w-full"
              />
            </div>
          ))}
        </div>

        {/* Graphics, FPS & DPI Config */}
        <div className="flex flex-col justify-between space-y-6 rounded-xl border border-slate-800 bg-[#131822] p-6 lg:col-span-5">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="sens-dpi" className="font-medium text-slate-200">
                  {lang === 'si' ? 'නිර්දේශිත Developer DPI' : 'Recommended Display DPI'}
                </label>
                <span className="font-mono text-sm font-semibold text-orange-400 tabular-nums">
                  {sensitivity.dpi} dp
                </span>
              </div>
              <input
                id="sens-dpi"
                type="range"
                min={360}
                max={800}
                step={10}
                value={sensitivity.dpi}
                onChange={(e) =>
                  onChangeSensitivity({
                    ...sensitivity,
                    dpi: Number(e.target.value),
                  })
                }
                className="ff-slider w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-200">
                {lang === 'si' ? 'In-Game Graphics සැකසුම' : 'In-Game Graphics'}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['Smooth', 'Standard', 'Ultra'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() =>
                      onChangeSensitivity({
                        ...sensitivity,
                        graphicsPreset: g,
                      })
                    }
                    className={`min-h-[44px] rounded-lg border text-xs font-medium transition-colors ${
                      sensitivity.graphicsPreset === g
                        ? 'border-orange-500 bg-[#1C2331] text-orange-400'
                        : 'border-slate-800 bg-[#0B0E14] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-200">High FPS</div>
                <div className="grid grid-cols-2 gap-2">
                  {(['Normal', 'High'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() =>
                        onChangeSensitivity({
                          ...sensitivity,
                          fpsSetting: f,
                        })
                      }
                      className={`min-h-[44px] rounded-lg border text-xs font-medium transition-colors ${
                        sensitivity.fpsSetting === f
                          ? 'border-orange-500 bg-[#1C2331] text-orange-400'
                          : 'border-slate-800 bg-[#0B0E14] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-200">
                  {lang === 'si' ? 'සෙවනැලි (Shadows)' : 'Shadows'}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[false, true].map((val) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() =>
                        onChangeSensitivity({
                          ...sensitivity,
                          shadows: val,
                        })
                      }
                      className={`min-h-[44px] rounded-lg border text-xs font-medium transition-colors ${
                        sensitivity.shadows === val
                          ? 'border-orange-500 bg-[#1C2331] text-orange-400'
                          : 'border-slate-800 bg-[#0B0E14] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {val ? 'On' : 'Off'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0B0E14] p-4 text-xs leading-relaxed text-slate-300">
            {sensitivity.shadows
              ? lang === 'si'
                ? 'සැලකිය යුතුයි: Shadows "On" කිරීමෙන් GPU බර වැඩි වී දුරකථනය රත් වීම වැඩි විය හැක. අඩු හීට් සඳහා Off තබන්න.'
                : 'Note: Enabling shadows raises GPU heat and reduces sustained frame stability. Turn Off for cooler play.'
              : lang === 'si'
                ? 'උපදෙස: Shadows "Off" සහ High FPS "High" තැබීමෙන් උෂ්ණත්වය අඩු කර ස්ථාවර FPS ලබාගත හැක.'
                : 'Thermal tip: Keeping Shadows Off with High FPS delivers cooler sessions and steadier close-range fights.'}
          </div>
        </div>
      </div>
    </section>
  );
}
