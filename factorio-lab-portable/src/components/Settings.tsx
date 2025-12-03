import React, { useEffect, useState } from "react";
import "../styles/Settings.css";
import { Tab } from "../app/types/tabTypes";
import { UpdateStatus } from "../app/types/updateStatusTypes";
interface Props {
  onClose: () => void;
  multiTabMode: boolean;
  setMultiTabMode: (value: boolean) => void;
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
  handleCheckForUpdate: () => void;
  updateStatus: UpdateStatus;
  checkUpdatesOnStartup: boolean;
  setCheckUpdatesOnStartup: (value: boolean) => void;
}
const SettingsOverlay: React.FC<Props> = ({
  onClose,
  multiTabMode,
  setMultiTabMode,
  setTabs,
  handleCheckForUpdate,
  updateStatus,
  checkUpdatesOnStartup,
  setCheckUpdatesOnStartup,
}) => {
  const [version, setVersion] = useState("");

  useEffect(() => {
    window.electronAPI.getAppVersion().then((v: string) => setVersion(v));
  }, []);
  useEffect(() => {
    window.electronAPI.loadSettings().then((saved) => {
      if (saved?.checkUpdatesOnStartup !== undefined) {
        setCheckUpdatesOnStartup(saved.checkUpdatesOnStartup);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isProcessing =
    updateStatus.status === "checking" || updateStatus.status === "downloading";

  let buttonText = "Check for Updates";

  if (updateStatus.status === "checking") {
    buttonText = "Checking...";
  } else if (updateStatus.status === "downloading") {
    const progress = (updateStatus as any).progress ?? 0;
    buttonText = `Downloading (${Math.round(progress)}%)...`;
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-header-close" onClick={onClose}>
            <img src="./assets/title_bar_icons/close.svg" alt="Close" />
          </button>
        </div>
        {/* keep tabs alive */}
        <div className="settings-item">
          <label className="settings-label">
            Keep tabs alive
            <span
              className="info-icon"
              data-tooltip="Disabling this will greatly reduce RAM usage, but switching tabs will take 1-2 seconds."
            >
              <img
                src="./assets/title_bar_icons/tooltip.svg"
                alt="info"
                className="info-svg"
              />
            </span>
          </label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={multiTabMode}
              onChange={(toggle) => {
                setTabs((prev) =>
                  prev.map((tab) => ({
                    ...tab,
                    src: tab.url,
                  }))
                );
                const value = toggle.target.checked;
                setMultiTabMode(value);
                window.electronAPI.saveSettings({ multiTabMode: value });
              }}
            />
            <span className="slider"></span>
          </label>
        </div>
        {/* updates on startup */}
        <div className="settings-item">
          <label className="settings-label">Check for updates on startup</label>

          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={checkUpdatesOnStartup}
              onChange={(e) => {
                const value = e.target.checked;
                setCheckUpdatesOnStartup(value);

                window.electronAPI.saveSettings({
                  checkUpdatesOnStartup: value,
                });
              }}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* check for updates */}
        <div className="settings-item">
          <label className="settings-label">App Updates</label>
          <button
            className="update-check-button"
            onClick={handleCheckForUpdate}
            disabled={isProcessing}
          >
            {isProcessing && <div className="button-spinner"></div>}
            {buttonText}
          </button>
        </div>
        {/* version number */}
        <div className="version-number">
          <span>Version {version}</span>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;
