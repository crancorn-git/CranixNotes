export {};
declare global {
  interface Window {
    electron: {
      onUpdateAvailable: (cb: () => void) => void;
      onUpdateDownloaded: (cb: () => void) => void;
      restartApp: () => void;
    };
  }
}