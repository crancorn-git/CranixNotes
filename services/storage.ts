
import { AreaState, AppSettings } from '../types';

const STORAGE_KEY_DATA = 'cranotes_data';
const STORAGE_KEY_THEME = 'cranotes_dark_mode';
const STORAGE_KEY_SETTINGS = 'cranotes_settings';

export const loadAreas = (defaults: AreaState[]): AreaState[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DATA);
    if (!saved) return defaults;
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load application data', e);
    return defaults;
  }
};

export const saveAreas = (areas: AreaState[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(areas));
  } catch (e) {
    console.error('Failed to save application data', e);
  }
};

export const loadDarkMode = (): boolean => {
  return localStorage.getItem(STORAGE_KEY_THEME) === 'true';
};

export const saveDarkMode = (isDark: boolean) => {
  localStorage.setItem(STORAGE_KEY_THEME, String(isDark));
};

const DEFAULT_SETTINGS: AppSettings = {
    background: 'minimal',
    tileRounding: 32,
    gridGap: 24,
    font: 'sans',
    blurStrength: 'medium',
    dockSize: 'medium',
    showDate: true,
    userName: ''
};

export const loadSettings = (): AppSettings => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (!saved) return DEFAULT_SETTINGS;
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
        return DEFAULT_SETTINGS;
    }
};

export const saveSettings = (settings: AppSettings) => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
};