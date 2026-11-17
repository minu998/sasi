export type Language = 'si' | 'en';

export type NavSection = 'launcher' | 'diagnostics' | 'sensitivity' | 'script';

export type OptimizationModeId = 'ultra_smooth' | 'balanced_rank' | 'max_fps';

export interface GameEntry {
  id: string;
  name: string;
  subtitle: string;
  packageName: string;
  targetFps: number;
  recommendedGraphics: string;
  isCustom?: boolean;
}

export interface OptimizationToggles {
  autoCacheClean: boolean;
  thermalGuard: boolean;
  ramRelease: boolean;
  touchBoost: boolean;
  dnsLowPing: boolean;
  disableAnimations: boolean;
}

export interface SensitivityConfig {
  tierLabel: string;
  general: number;
  redDot: number;
  scope2x: number;
  scope4x: number;
  sniperScope: number;
  freeLook: number;
  dpi: number;
  graphicsPreset: 'Smooth' | 'Standard' | 'Ultra';
  fpsSetting: 'Normal' | 'High';
  shadows: boolean;
}

export interface DeviceHardwareInfo {
  cpuCores: number | null;
  ramGb: number | null;
  gpuRenderer: string;
  platform: string;
  screenResolution: string;
  pixelRatio: number;
  batteryLevel: number | null;
  batteryCharging: boolean | null;
  connectionType: string | null;
  downlinkMbps: number | null;
  rttMs: number | null;
  storageUsedMb: number | null;
  storageQuotaMb: number | null;
}

export interface FrameBenchmarkResult {
  avgFps: number;
  minFps: number;
  maxFps: number;
  avgFrameTimeMs: number;
  droppedFrames: number;
  totalFrames: number;
  frameSamples: number[];
  stabilityPercent: number;
  completedAt: string;
}

export interface PingTestResult {
  samplesMs: number[];
  avgMs: number;
  minMs: number;
  maxMs: number;
  jitterMs: number;
  completedAt: string;
}

export interface CacheSweepResult {
  cacheCachesDeleted: number;
  localKeysCleaned: number;
  sessionKeysCleared: number;
  estimatedFreedKb: number;
  completedAt: string;
}

export interface LaunchStepStatus {
  id: 'cache' | 'thermal' | 'ping' | 'launch';
  labelSi: string;
  labelEn: string;
  status: 'pending' | 'running' | 'done';
  detail?: string;
}
