import { Tab } from "../app/tabTypes";

declare global {
  interface Window {
    electronAPI: {
      minimize: () => void;
      maximize: () => void;
      unmaximize: () => void;
      close: () => void;
      toggleMaximize: () => void;
      onMaximized: (callback: () => void) => void;
      onUnmaximized: (callback: () => void) => void;

      decode: (url: string) => Promise<{
        itemName: string | null;
        spritePosition: string | null;
        itemQuality: string | null;
        spritePath: string | null;
        urlHash: string | null;
      } | null>;

      saveTabs: (data: {
        tabs: Tab[];
        activeTabId: number;
      }) => Promise<{ success: boolean; error?: string }>;
      loadTabs: () => Promise<{ tabs: Tab[]; activeTabId: number | null }>;

      saveSettings: (
        settings: any
      ) => Promise<{ success: boolean; error?: string }>;
      loadSettings: () => Promise<any>;

      getAppVersion: () => Promise<string>;

      createNewTab: (callback: (url: string) => void) => void;

      checkForUpdate: () => Promise<void>;
      startDownloadUpdate: () => Promise<void>;
      onUpdateStatus: (
        callback: (
          event: Electron.IpcRendererEvent,
          payload: UpdateStatus
        ) => void
      ) => void;
      installUpdate: () => Promise<void>;
      removeUpdateStatusListener: () => void;
    };
  }
}

export {};
