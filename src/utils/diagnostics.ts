import type {
  CacheSweepResult,
  DeviceHardwareInfo,
  FrameBenchmarkResult,
  GameEntry,
  OptimizationModeId,
  OptimizationToggles,
  PingTestResult,
  SensitivityConfig,
} from '../types/optimizer';

interface NavigatorExtended extends Navigator {
  deviceMemory?: number;
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
  getBattery?: () => Promise<{
    level: number;
    charging: boolean;
  }>;
}

export async function readDeviceHardwareInfo(): Promise<DeviceHardwareInfo> {
  const nav = navigator as NavigatorExtended;

  let gpuRenderer = 'Standard WebGL Renderer';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (typeof renderer === 'string' && renderer.trim()) {
          gpuRenderer = renderer.trim();
        }
      }
    }
  } catch {
    // Keep default renderer string when WebGL is blocked
  }

  let batteryLevel: number | null = null;
  let batteryCharging: boolean | null = null;
  try {
    if (typeof nav.getBattery === 'function') {
      const battery = await nav.getBattery();
      batteryLevel = Math.round(battery.level * 100);
      batteryCharging = battery.charging;
    }
  } catch {
    // Battery API unavailable on some browsers
  }

  let storageUsedMb: number | null = null;
  let storageQuotaMb: number | null = null;
  try {
    if (navigator.storage && typeof navigator.storage.estimate === 'function') {
      const est = await navigator.storage.estimate();
      if (typeof est.usage === 'number') {
        storageUsedMb = Number((est.usage / (1024 * 1024)).toFixed(2));
      }
      if (typeof est.quota === 'number') {
        storageQuotaMb = Math.round(est.quota / (1024 * 1024));
      }
    }
  } catch {
    // Storage estimate unavailable
  }

  return {
    cpuCores: typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null,
    ramGb: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
    gpuRenderer,
    platform: navigator.platform || 'Unknown',
    screenResolution: `${window.screen.width} × ${window.screen.height}`,
    pixelRatio: window.devicePixelRatio || 1,
    batteryLevel,
    batteryCharging,
    connectionType: nav.connection?.effectiveType ?? null,
    downlinkMbps: typeof nav.connection?.downlink === 'number' ? nav.connection.downlink : null,
    rttMs: typeof nav.connection?.rtt === 'number' ? nav.connection.rtt : null,
    storageUsedMb,
    storageQuotaMb,
  };
}

export async function performBrowserCacheSweep(): Promise<CacheSweepResult> {
  let cacheCachesDeleted = 0;
  let estimatedFreedKb = 0;

  if ('caches' in window) {
    try {
      const keys = await window.caches.keys();
      for (const key of keys) {
        const cache = await window.caches.open(key);
        const requests = await cache.keys();
        estimatedFreedKb += requests.length * 24;
        const deleted = await window.caches.delete(key);
        if (deleted) {
          cacheCachesDeleted += 1;
        }
      }
    } catch {
      // CacheStorage restricted
    }
  }

  const sessionKeysCleared = window.sessionStorage.length;
  window.sessionStorage.clear();

  let localKeysCleaned = 0;
  const preserveKeys = new Set([
    'fireboost_games_v1',
    'fireboost_selected_game_v1',
    'fireboost_mode_v1',
    'fireboost_toggles_v1',
    'fireboost_sensitivity_v1',
    'fireboost_lang_v1',
  ]);

  const toRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const k = window.localStorage.key(i);
    if (k && !preserveKeys.has(k)) {
      const val = window.localStorage.getItem(k) || '';
      estimatedFreedKb += Math.max(1, Math.ceil((k.length + val.length) / 1024));
      toRemove.push(k);
    }
  }
  toRemove.forEach((k) => {
    window.localStorage.removeItem(k);
    localKeysCleaned += 1;
  });

  if (estimatedFreedKb === 0 && (sessionKeysCleared > 0 || localKeysCleaned > 0)) {
    estimatedFreedKb = sessionKeysCleared * 2 + localKeysCleaned * 2;
  }

  return {
    cacheCachesDeleted,
    localKeysCleaned,
    sessionKeysCleared,
    estimatedFreedKb,
    completedAt: new Date().toLocaleTimeString(),
  };
}

export function runFrameRateBenchmark(
  canvas: HTMLCanvasElement | null,
  durationMs = 3000,
  onProgress?: (pct: number, currentFps: number) => void
): Promise<FrameBenchmarkResult> {
  return new Promise((resolve) => {
    const ctx = canvas ? canvas.getContext('2d') : null;
    const frameTimes: number[] = [];
    const fpsSamples: number[] = [];
    let startTime: number | null = null;
    let lastTime: number | null = null;
    let frameCount = 0;
    let rafId = 0;

    const particles = Array.from({ length: 48 }, (_, idx) => ({
      x: (idx * 37) % 320,
      y: (idx * 23) % 120,
      vx: ((idx % 5) + 1) * 0.9,
      vy: ((idx % 3) + 1) * 0.8,
    }));

    const step = (now: number) => {
      if (startTime === null) {
        startTime = now;
        lastTime = now;
        rafId = requestAnimationFrame(step);
        return;
      }

      const delta = now - (lastTime ?? now);
      lastTime = now;
      frameCount += 1;

      if (delta > 0 && delta < 500) {
        frameTimes.push(delta);
        const instantFps = Math.min(240, Math.round(1000 / delta));
        fpsSamples.push(instantFps);
      }

      if (ctx && canvas) {
        const w = canvas.width;
        const h = canvas.height;
        ctx.fillStyle = '#0B0E14';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(249, 115, 22, 0.25)';
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i += 1) {
          const p = particles[i];
          p.x = (p.x + p.vx) % w;
          p.y = (p.y + p.vy) % h;
          ctx.fillStyle = i % 3 === 0 ? '#f97316' : '#38bdf8';
          ctx.fillRect(p.x, p.y, 3, 3);
        }

        const recent = fpsSamples.slice(-40);
        const barW = w / Math.max(40, recent.length);
        recent.forEach((fpsVal, idx) => {
          const barH = Math.min(h - 12, Math.max(4, (fpsVal / 120) * (h - 18)));
          ctx.fillStyle = fpsVal >= 55 ? '#10b981' : fpsVal >= 38 ? '#f59e0b' : '#ef4444';
          ctx.fillRect(idx * barW + 1, h - barH, Math.max(2, barW - 2), barH);
        });
      }

      const elapsed = now - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      const latestFps = fpsSamples.length > 0 ? fpsSamples[fpsSamples.length - 1] : 60;
      if (onProgress && frameCount % 4 === 0) {
        onProgress(pct, latestFps);
      }

      if (elapsed < durationMs) {
        rafId = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(rafId);
        const validTimes = frameTimes.length > 0 ? frameTimes : [16.67];
        const avgFrameTimeMs = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
        const avgFps = Math.round(1000 / avgFrameTimeMs);
        const minFps = fpsSamples.length > 0 ? Math.min(...fpsSamples) : avgFps;
        const maxFps = fpsSamples.length > 0 ? Math.max(...fpsSamples) : avgFps;
        const droppedFrames = validTimes.filter((t) => t > avgFrameTimeMs * 1.45).length;
        const stabilityPercent = Math.max(
          0,
          Math.min(100, Math.round(((validTimes.length - droppedFrames) / validTimes.length) * 100))
        );

        resolve({
          avgFps,
          minFps,
          maxFps,
          avgFrameTimeMs: Number(avgFrameTimeMs.toFixed(2)),
          droppedFrames,
          totalFrames: validTimes.length,
          frameSamples: fpsSamples.slice(-40),
          stabilityPercent,
          completedAt: new Date().toLocaleTimeString(),
        });
      }
    };

    rafId = requestAnimationFrame(step);
  });
}

export async function runNetworkPingTest(sampleCount = 5): Promise<PingTestResult> {
  const samplesMs: number[] = [];

  for (let i = 0; i < sampleCount; i += 1) {
    const start = performance.now();
    try {
      await fetch(`${window.location.origin}/?_ping=${Date.now()}_${i}`, {
        method: 'HEAD',
        cache: 'no-store',
      });
    } catch {
      // Even if HEAD fails, measure fallback timing
    }
    const elapsed = Math.max(1, Math.round(performance.now() - start));
    samplesMs.push(elapsed);
    await new Promise((r) => setTimeout(r, 110));
  }

  const avgMs = Math.round(samplesMs.reduce((a, b) => a + b, 0) / samplesMs.length);
  const minMs = Math.min(...samplesMs);
  const maxMs = Math.max(...samplesMs);
  const jitterMs = Math.max(0, maxMs - minMs);

  return {
    samplesMs,
    avgMs,
    minMs,
    maxMs,
    jitterMs,
    completedAt: new Date().toLocaleTimeString(),
  };
}

export function buildAndroidLaunchIntentUrl(packageName: string): string {
  const cleanPkg = packageName.trim() || 'com.dts.freefireth';
  return `intent://#Intent;package=${encodeURIComponent(
    cleanPkg
  )};action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;S.browser_fallback_url=${encodeURIComponent(
    `https://play.google.com/store/apps/details?id=${cleanPkg}`
  )};end`;
}

export function generateAndroidOptimizationScript(
  game: GameEntry,
  mode: OptimizationModeId,
  toggles: OptimizationToggles,
  sensitivity: SensitivityConfig
): string {
  const pkg = game.packageName;
  const lines: string[] = [
    '#!/system/bin/sh',
    `# FireBoost FF Optimizer Script — ${game.name} (${pkg})`,
    `# Profile: ${mode} | Recommended Graphics: ${sensitivity.graphicsPreset} / FPS: ${sensitivity.fpsSetting}`,
    '',
    `echo "Starting optimization for ${game.name} (${pkg})..."`,
    '',
  ];

  if (toggles.autoCacheClean) {
    lines.push(
      '# 1. Trim system & game cache files safely',
      'pm trim-caches 4096M',
      `rm -rf /sdcard/Android/data/${pkg}/cache/* 2>/dev/null`,
      `rm -rf /sdcard/Android/data/${pkg}/files/il2cpp/MetadataCache* 2>/dev/null`,
      ''
    );
  }

  if (toggles.ramRelease) {
    lines.push(
      '# 2. Release background RAM before game launch',
      'am kill-all',
      'sync',
      ''
    );
  }

  if (toggles.disableAnimations) {
    lines.push(
      '# 3. Set UI animations to 0 for faster responsiveness',
      'settings put global window_animation_scale 0',
      'settings put global transition_animation_scale 0',
      'settings put global animator_duration_scale 0',
      ''
    );
  }

  if (toggles.thermalGuard) {
    lines.push(
      '# 4. Thermal Guard: Reduce background sync & screen heat',
      'cmd power set-adaptive-power-saver-enabled false 2>/dev/null',
      'settings put system screen_brightness_mode 0',
      mode === 'ultra_smooth'
        ? 'settings put system screen_brightness 135'
        : 'settings put system screen_brightness 175',
      ''
    );
  }

  if (mode === 'max_fps') {
    lines.push(
      '# 5. Max FPS Performance Mode (Android 11+)',
      'cmd power set-fixed-performance-mode-enabled true 2>/dev/null',
      `cmd game mode performance ${pkg} 2>/dev/null`,
      ''
    );
  } else if (mode === 'ultra_smooth') {
    lines.push(
      '# 5. Battery & Thermal Balanced Game Mode (Android 12+)',
      `cmd game mode battery ${pkg} 2>/dev/null`,
      ''
    );
  } else {
    lines.push(
      '# 5. Standard Ranked Game Mode (Android 12+)',
      `cmd game mode standard ${pkg} 2>/dev/null`,
      ''
    );
  }

  if (toggles.dnsLowPing) {
    lines.push(
      '# 6. Private DNS for Lower Latency (Cloudflare 1.1.1.1)',
      'settings put global private_dns_mode hostname',
      'settings put global private_dns_specifier one.one.one.one',
      ''
    );
  }

  lines.push(
    `# 7. Launch ${game.name}`,
    `monkey -p ${pkg} -c android.intent.category.LAUNCHER 1`,
    'echo "Game launch command dispatched."'
  );

  return lines.join('\n');
}
