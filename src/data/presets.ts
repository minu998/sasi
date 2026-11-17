import type { GameEntry, OptimizationModeId, SensitivityConfig } from '../types/optimizer';

export const DEFAULT_GAMES: GameEntry[] = [
  {
    id: 'freefire',
    name: 'Free Fire',
    subtitle: 'Standard Edition · Low RAM & Fast Thermal Recovery',
    packageName: 'com.dts.freefireth',
    targetFps: 60,
    recommendedGraphics: 'Smooth / High FPS',
  },
  {
    id: 'freefire_max',
    name: 'Free Fire MAX',
    subtitle: 'HD Textures · High Refresh Rate & Frame Pacing',
    packageName: 'com.dts.freefiremax',
    targetFps: 90,
    recommendedGraphics: 'Standard / High FPS',
  },
];

export interface OptimizationModeSpec {
  id: OptimizationModeId;
  nameSi: string;
  nameEn: string;
  summarySi: string;
  summaryEn: string;
  targetFps: string;
  thermalGoalSi: string;
  thermalGoalEn: string;
  recommendedSettings: {
    graphics: 'Smooth' | 'Standard' | 'Ultra';
    fps: 'Normal' | 'High';
    shadows: boolean;
  };
}

export const OPTIMIZATION_MODES: OptimizationModeSpec[] = [
  {
    id: 'ultra_smooth',
    nameSi: 'අඩු හීට් · Ultra Smooth',
    nameEn: 'Cool Thermal · Ultra Smooth',
    summarySi: 'ෆෝන් එක රත්වීම අවම කර 60 FPS ස්ථාවරව පවත්වා ගනී (2GB–4GB RAM සඳහා).',
    summaryEn: 'Reduces CPU/GPU heat buildup and locks stable 60 FPS for 2GB–4GB RAM devices.',
    targetFps: '60 FPS',
    thermalGoalSi: 'අවම උෂ්ණත්වය',
    thermalGoalEn: 'Low Thermal Load',
    recommendedSettings: {
      graphics: 'Smooth',
      fps: 'High',
      shadows: false,
    },
  },
  {
    id: 'balanced_rank',
    nameSi: 'රෑන්ක්ඩ් ස්ථාවර · Balanced',
    nameEn: 'Balanced Ranked',
    summarySi: 'BR සහ CS Ranked තරඟ සඳහා පැහැදිලි දසුන් සහ අඩු Frame Drop ලබා දේ.',
    summaryEn: 'Balances visual clarity with steady frame pacing for BR & CS Ranked matches.',
    targetFps: '60–90 FPS',
    thermalGoalSi: 'මධ්‍යම උෂ්ණත්වය',
    thermalGoalEn: 'Controlled Heat',
    recommendedSettings: {
      graphics: 'Standard',
      fps: 'High',
      shadows: false,
    },
  },
  {
    id: 'max_fps',
    nameSi: 'උපරිම වේගය · Max FPS Pro',
    nameEn: 'Max Performance · Pro FPS',
    summarySi: 'වේගවත් ටච් ප්‍රතිචාරය සහ උපරිම FPS සඳහා පසුබිම් ක්‍රියාදාම සීමා කරයි.',
    summaryEn: 'Prioritizes touch sampling, zero UI animations, and peak refresh rate.',
    targetFps: '90–120 FPS',
    thermalGoalSi: 'අධික කාර්යසාධනය',
    thermalGoalEn: 'Peak Clock',
    recommendedSettings: {
      graphics: 'Smooth',
      fps: 'High',
      shadows: false,
    },
  },
];

export const SENSITIVITY_PRESETS: Record<string, SensitivityConfig> = {
  low_ram: {
    tierLabel: '2GB – 3GB RAM',
    general: 190,
    redDot: 178,
    scope2x: 168,
    scope4x: 155,
    sniperScope: 112,
    freeLook: 145,
    dpi: 480,
    graphicsPreset: 'Smooth',
    fpsSetting: 'High',
    shadows: false,
  },
  mid_ram: {
    tierLabel: '4GB – 6GB RAM',
    general: 184,
    redDot: 170,
    scope2x: 160,
    scope4x: 148,
    sniperScope: 105,
    freeLook: 140,
    dpi: 550,
    graphicsPreset: 'Standard',
    fpsSetting: 'High',
    shadows: false,
  },
  flagship: {
    tierLabel: '8GB+ RAM',
    general: 172,
    redDot: 162,
    scope2x: 152,
    scope4x: 138,
    sniperScope: 96,
    freeLook: 132,
    dpi: 620,
    graphicsPreset: 'Ultra',
    fpsSetting: 'High',
    shadows: false,
  },
};

export const UI_COPY = {
  si: {
    brand: 'FireBoost',
    navLauncher: 'ලොන්චරය',
    navDiagnostics: 'පරීක්ෂාව',
    navSensitivity: 'සෙන්සිටිවිටි',
    navScript: 'ADB ස්ක්‍රිප්ට්',
    primaryCta: 'ගේම් අරඹන්න',
    heroTitle: 'Free Fire කාර්යසාධන සහ ගේම් ලොන්චර් මධ්‍යස්ථානය',
    heroSubtitle:
      'ගේම් එක තෝරා කෑච් පිරිසිදු කිරීම, සජීවී FPS සහ Ping පරීක්ෂාව, උෂ්ණත්ව පාලන උපදෙස් සහ Android ADB වේගවත් කිරීමේ සැකසුම් එකම තැනකින් කළමනාකරණය කරන්න.',
    selectGameHeading: '01. ගේම් එක තෝරන්න',
    addCustomGame: 'වෙනත් ගේම් එකක් එක් කරන්න',
    modeHeading: '02. ඔප්ටිමයිස් මාදිලිය සහ සැකසුම්',
    togglesHeading: '03. ස්වයංක්‍රීය ක්‍රියාකාරකම් (Launch Pipeline)',
    launchNow: 'ඔප්ටිමයිස් කර ගේම් අරඹන්න',
    quickCleanBtn: 'දැන් කෑච් පිරිසිදු කරන්න',
    diagnosticsHeading: 'උපාංග හාඩ්වෙයාර් සහ සජීවී වේග පරීක්ෂාව',
    runFpsTest: 'FPS පරීක්ෂාව අරඹන්න',
    runPingTest: 'Ping පරීක්ෂාව අරඹන්න',
    cleanBrowserCache: 'කෑච් මකන්න',
    sensitivityHeading: 'Headshot සෙන්සිටිවිටි සහ ග්‍රැෆික්ස් සැකසුම්',
    copyConfig: 'සැකසුම් Copy කරන්න',
    copied: 'Copy විය',
    scriptHeading: 'Android Auto-Clean සහ FPS Boost ස්ක්‍රිප්ට් (ADB / Termux)',
    downloadScript: 'Script බාගන්න (.sh)',
    copyScript: 'Commands Copy කරන්න',
    sandboxNoticeTitle: 'බ්‍රව්සර් ආරක්ෂක සීමාව සහ සැබෑ Android ක්‍රියාකාරිත්වය',
    sandboxNoticeBody:
      'වෙබ් බ්‍රව්සරයක ආරක්ෂක සීමා නිසා වෙනත් ඇප්වල Android පද්ධති කෑච් ෆයිල් කෙලින්ම මැකීමට හෝ CPU උෂ්ණත්වය වෙනස් කිරීමට Android පද්ධතියෙන් ඉඩ නොදේ. එබැවින් මෙම ඇප් එකෙන් ඔබේ බ්‍රව්සර් කෑච් සහ මතකය සැබෑ ලෙසම පිරිසිදු කර, සජීවී FPS/Ping පරීක්ෂා කර, Direct Intent මගින් ගේම් එක විවෘත කරන අතර Android උපාංගයේ සැබෑ කෑච් මකා දැමීමට ADB / Shizuku / Termux Script එකද ස්වයංක්‍රීයව සාදා දෙයි.',
  },
  en: {
    brand: 'FireBoost',
    navLauncher: 'Launcher',
    navDiagnostics: 'Diagnostics',
    navSensitivity: 'Sensitivity',
    navScript: 'ADB Script',
    primaryCta: 'Launch Game',
    heroTitle: 'Free Fire Performance & Tactical Game Launcher',
    heroSubtitle:
      'Select your Free Fire edition, sweep cached storage, run real frame-time and ping diagnostics, apply thermal-safe settings, and generate Android ADB optimization scripts.',
    selectGameHeading: '01. Select Game Edition',
    addCustomGame: 'Add Custom App',
    modeHeading: '02. Optimization Profile',
    togglesHeading: '03. Pre-Launch Pipeline Switches',
    launchNow: 'Optimize & Launch Game',
    quickCleanBtn: 'Sweep Cache Now',
    diagnosticsHeading: 'Hardware Profile, Live FPS & Ping Diagnostics',
    runFpsTest: 'Run FPS Benchmark',
    runPingTest: 'Run Ping Test',
    cleanBrowserCache: 'Clean Cache',
    sensitivityHeading: 'Sensitivity, DPI & Graphics Configurator',
    copyConfig: 'Copy Config',
    copied: 'Copied',
    scriptHeading: 'Android Auto-Clean & FPS Boost Script (ADB / Termux)',
    downloadScript: 'Download Script (.sh)',
    copyScript: 'Copy Commands',
    sandboxNoticeTitle: 'Browser Sandbox Transparency & Real Android Execution',
    sandboxNoticeBody:
      'Web browsers cannot directly delete another native Android app’s OS cache or modify kernel thermal governors. FireBoost performs real browser cache/memory cleanup, live WebGL FPS and network latency measurements, launches your selected Free Fire package via Android Intent, and generates a tailored ADB / Shizuku shell script for OS-level cache trimming and animation scaling.',
  },
};
