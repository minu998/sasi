import { useRef, useState } from 'react';
import { Activity, BatteryCharging, Cpu, HardDrive, RefreshCw, Trash2, Wifi } from 'lucide-react';
import type {
  CacheSweepResult,
  DeviceHardwareInfo,
  FrameBenchmarkResult,
  Language,
  PingTestResult,
} from '../types/optimizer';
import { UI_COPY } from '../data/presets';
import { runFrameRateBenchmark, runNetworkPingTest } from '../utils/diagnostics';

interface DiagnosticsPanelProps {
  lang: Language;
  hardware: DeviceHardwareInfo | null;
  onRefreshHardware: () => Promise<void>;
  onCleanCache: () => Promise<void>;
  lastSweep: CacheSweepResult | null;
  isSweeping: boolean;
}

export function DiagnosticsPanel({
  lang,
  hardware,
  onRefreshHardware,
  onCleanCache,
  lastSweep,
  isSweeping,
}: DiagnosticsPanelProps) {
  const copy = UI_COPY[lang];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [fpsRunning, setFpsRunning] = useState(false);
  const [fpsProgress, setFpsProgress] = useState(0);
  const [liveFps, setLiveFps] = useState<number | null>(null);
  const [fpsResult, setFpsResult] = useState<FrameBenchmarkResult | null>(null);

  const [pingRunning, setPingRunning] = useState(false);
  const [pingResult, setPingResult] = useState<PingTestResult | null>(null);

  const handleRunFps = async () => {
    if (fpsRunning) return;
    setFpsRunning(true);
    setFpsProgress(0);
    const result = await runFrameRateBenchmark(canvasRef.current, 3000, (pct, current) => {
      setFpsProgress(pct);
      setLiveFps(current);
    });
    setFpsResult(result);
    setFpsRunning(false);
  };

  const handleRunPing = async () => {
    if (pingRunning) return;
    setPingRunning(true);
    const res = await runNetworkPingTest(5);
    setPingResult(res);
    setPingRunning(false);
  };

  const isChargingRisk = hardware?.batteryCharging === true;

  return (
    <section id="diagnostics" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-100 sm:text-2xl">
            {copy.diagnosticsHeading}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {lang === 'si'
              ? 'ඔබේ උපාංගයේ සැබෑ බ්‍රව්සර් හාඩ්වෙයාර් තොරතුරු, FPS ස්ථාවරත්වය සහ Network Ping අගයන් මෙතැනින් මැන ගන්න.'
              : 'Measured directly from your device hardware APIs, requestAnimationFrame frame loop, and live HTTP round-trip latency.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onRefreshHardware}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-700 bg-[#131822] px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-[#1C2331] whitespace-nowrap"
        >
          <RefreshCw className="h-3.5 w-3.5 text-orange-400" aria-hidden="true" />
          <span>{lang === 'si' ? 'යාවත්කාලීන කරන්න' : 'Refresh Specs'}</span>
        </button>
      </div>

      {/* Thermal Warning Banner (Only shown if actually charging) */}
      {isChargingRisk && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <BatteryCharging className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
          <div className="text-xs leading-relaxed text-amber-200">
            <span className="font-semibold">
              {lang === 'si' ? 'උෂ්ණත්ව අනතුරු ඇඟවීම: ' : 'Thermal Warning: '}
            </span>
            {lang === 'si'
              ? 'ඔබේ උපාංගය දැන් චාජ් වෙමින් පවතී. චාජරය සම්බන්ධ කර Free Fire ක්‍රීඩා කිරීමෙන් බැටරිය සහ CPU ඉක්මනින් රත් වී FPS අඩු (Thermal Throttling) විය හැක.'
              : 'Device is currently charging. Gaming while charging significantly increases battery heat and triggers CPU thermal throttling.'}
          </div>
        </div>
      )}

      {/* 4-column Hardware KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-[#131822] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{lang === 'si' ? 'CPU සහ RAM' : 'CPU & Memory'}</span>
            <Cpu className="h-4 w-4 text-slate-500" aria-hidden="true" />
          </div>
          <div className="mt-2 font-mono text-xl font-semibold text-slate-100 tabular-nums">
            {hardware?.cpuCores ? `${hardware.cpuCores} Cores` : 'N/A'}
            <span className="mx-1.5 text-slate-600">·</span>
            {hardware?.ramGb ? `${hardware.ramGb} GB` : 'Browser Cap'}
          </div>
          <p className="mt-1 truncate text-xs text-slate-400" title={hardware?.gpuRenderer}>
            {hardware?.gpuRenderer ?? 'Detecting GPU...'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131822] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{lang === 'si' ? 'බැටරි සහ හීට් තත්ත්වය' : 'Battery & Thermal Risk'}</span>
            <BatteryCharging className="h-4 w-4 text-slate-500" aria-hidden="true" />
          </div>
          <div className="mt-2 font-mono text-xl font-semibold text-slate-100 tabular-nums">
            {hardware?.batteryLevel !== null && hardware?.batteryLevel !== undefined
              ? `${hardware.batteryLevel}%`
              : lang === 'si'
                ? 'සම්බන්ධයි'
                : 'AC / N/A'}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {hardware?.batteryCharging === true
              ? lang === 'si'
                ? 'චාජ් වෙමින් පවතී (හීට් වැඩි විය හැක)'
                : 'Charging (Higher heat risk)'
              : hardware?.batteryCharging === false
                ? lang === 'si'
                  ? 'බැටරි බලයෙන් (හීට් අඩුයි)'
                  : 'On Battery (Normal thermal)'
                : lang === 'si'
                  ? `තිරය: ${hardware?.screenResolution ?? '—'}`
                  : `Display: ${hardware?.screenResolution ?? '—'}`}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131822] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{lang === 'si' ? 'ජාල වේගය' : 'Network Profile'}</span>
            <Wifi className="h-4 w-4 text-slate-500" aria-hidden="true" />
          </div>
          <div className="mt-2 font-mono text-xl font-semibold text-slate-100 tabular-nums">
            {hardware?.connectionType ? hardware.connectionType.toUpperCase() : 'ONLINE'}
            {hardware?.rttMs ? ` · ${hardware.rttMs} ms` : ''}
          </div>
          <p className="mt-1 text-xs text-slate-400 tabular-nums">
            {hardware?.downlinkMbps
              ? `Downlink ~${hardware.downlinkMbps} Mbps`
              : lang === 'si'
                ? 'පහත Ping Test ධාවනය කරන්න'
                : 'Run Ping Test below for live ms'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131822] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{lang === 'si' ? 'බ්‍රව්සර් කෑච් ගබඩාව' : 'Web Cache Storage'}</span>
            <HardDrive className="h-4 w-4 text-slate-500" aria-hidden="true" />
          </div>
          <div className="mt-2 font-mono text-xl font-semibold text-slate-100 tabular-nums">
            {hardware?.storageUsedMb !== null && hardware?.storageUsedMb !== undefined
              ? `${hardware.storageUsedMb} MB`
              : '0.00 MB'}
          </div>
          <p className="mt-1 text-xs text-slate-400 tabular-nums">
            {hardware?.storageQuotaMb
              ? `${lang === 'si' ? 'මුළු ඉඩ' : 'Quota'}: ${hardware.storageQuotaMb} MB`
              : lang === 'si'
                ? 'තාවකාලික ගොනු පරීක්ෂාව'
                : 'Temporary origin cache'}
          </p>
        </div>
      </div>

      {/* Live FPS Benchmark & Network Ping + Cache Sweeper Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Live FPS Benchmark */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#131822] p-6 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-100">
                {lang === 'si' ? 'සජීවී FPS සහ Frame-Time පරීක්ෂාව' : 'Live FPS & Frame-Time Benchmark'}
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                {lang === 'si'
                  ? 'තත්පර 3ක real-time rendering පරීක්ෂාවකින් උපාංගයේ සැබෑ FPS අගය මනී.'
                  : 'Measures real device frame pacing over a 3-second canvas stress cycle.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunFps}
              disabled={fpsRunning}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-orange-400 disabled:opacity-60 whitespace-nowrap"
            >
              <Activity className="h-4 w-4" aria-hidden="true" />
              <span>
                {fpsRunning
                  ? `${fpsProgress}% (${liveFps ?? 60} FPS)`
                  : copy.runFpsTest}
              </span>
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-slate-800 bg-[#0B0E14]">
            <canvas
              ref={canvasRef}
              width={560}
              height={130}
              className="block h-[130px] w-full"
            />
          </div>

          {fpsResult ? (
            <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80 sm:grid-cols-4">
              <div>
                <div className="text-xs text-slate-400">Avg FPS</div>
                <div className="mt-0.5 font-mono text-lg font-semibold text-emerald-400 tabular-nums">
                  {fpsResult.avgFps} FPS
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Min / Max</div>
                <div className="mt-0.5 font-mono text-lg font-semibold text-slate-100 tabular-nums">
                  {fpsResult.minFps} / {fpsResult.maxFps}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Frame Time</div>
                <div className="mt-0.5 font-mono text-lg font-semibold text-slate-100 tabular-nums">
                  {fpsResult.avgFrameTimeMs} ms
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">
                  {lang === 'si' ? 'ස්ථාවරත්වය' : 'Stability'}
                </div>
                <div className="mt-0.5 font-mono text-lg font-semibold text-orange-400 tabular-nums">
                  {fpsResult.stabilityPercent}%
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-400">
              {lang === 'si'
                ? 'FPS පරීක්ෂාව ආරම්භ කිරීමට ඉහත බොත්තම ඔබන්න.'
                : 'Click Run FPS Benchmark to record real frame times on this screen.'}
            </p>
          )}
        </div>

        {/* Ping Tester & Cache Sweeper */}
        <div className="flex flex-col justify-between gap-5 rounded-xl border border-slate-800 bg-[#131822] p-6 lg:col-span-5">
          {/* Ping Block */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-base font-semibold text-slate-100">
                {lang === 'si' ? 'Ping සහ Jitter පරීක්ෂාව' : 'Live Ping & Jitter Test'}
              </h3>
              <button
                type="button"
                onClick={handleRunPing}
                disabled={pingRunning}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700 bg-[#1C2331] px-3.5 py-1.5 text-xs font-medium text-slate-100 transition-colors hover:border-slate-600 hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap"
              >
                <Wifi className="h-3.5 w-3.5 text-orange-400" aria-hidden="true" />
                <span>{pingRunning ? '...' : copy.runPingTest}</span>
              </button>
            </div>

            {pingResult ? (
              <div className="grid grid-cols-3 gap-3 rounded-lg border border-slate-800 bg-[#0B0E14] p-3.5">
                <div>
                  <div className="text-[11px] text-slate-400">Avg Ping</div>
                  <div
                    className={`mt-0.5 font-mono text-base font-semibold tabular-nums ${
                      pingResult.avgMs < 60
                        ? 'text-emerald-400'
                        : pingResult.avgMs < 110
                          ? 'text-amber-400'
                          : 'text-red-400'
                    }`}
                  >
                    {pingResult.avgMs} ms
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Min / Max</div>
                  <div className="mt-0.5 font-mono text-base font-semibold text-slate-100 tabular-nums">
                    {pingResult.minMs}/{pingResult.maxMs}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Jitter</div>
                  <div className="mt-0.5 font-mono text-base font-semibold text-slate-100 tabular-nums">
                    {pingResult.jitterMs} ms
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-800 bg-[#0B0E14] p-3.5 text-xs text-slate-400">
                {lang === 'si'
                  ? '5-sample HTTP latency පරීක්ෂාව සඳහා බොත්තම ඔබන්න.'
                  : 'Run a 5-sample latency burst to measure real connection jitter.'}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800/80 pt-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-base font-semibold text-slate-100">
                {lang === 'si' ? 'කෑච් ෆයිල් පිරිසිදු කිරීම' : 'Cache Storage Sweeper'}
              </h3>
              <button
                type="button"
                onClick={onCleanCache}
                disabled={isSweeping}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700 bg-[#1C2331] px-3.5 py-1.5 text-xs font-medium text-slate-100 transition-colors hover:border-slate-600 hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap"
              >
                <Trash2 className="h-3.5 w-3.5 text-orange-400" aria-hidden="true" />
                <span>{copy.cleanBrowserCache}</span>
              </button>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              {lastSweep
                ? lang === 'si'
                  ? `අවසන් පිරිසිදු කිරීම: ${lastSweep.completedAt} · නිදහස් කළ ඉඩ ~${lastSweep.estimatedFreedKb} KB (CacheStorage: ${lastSweep.cacheCachesDeleted})`
                  : `Last cleaned at ${lastSweep.completedAt} · Freed ~${lastSweep.estimatedFreedKb} KB (CacheStorage buckets: ${lastSweep.cacheCachesDeleted})`
                : lang === 'si'
                  ? 'ගේම් එක අරඹන විට තාවකාලික බ්‍රව්සර් කෑච් ස්වයංක්‍රීයව මැකීමට සකසා ඇත.'
                  : 'Clears temporary CacheStorage, session buffers, and stale keys while keeping your presets.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
