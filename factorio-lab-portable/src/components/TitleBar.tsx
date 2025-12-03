import React, { useEffect, useState } from "react";
import "../styles/TitleBar.css";

interface TitleBarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({
  sidebarOpen,
  onToggleSidebar,
  onOpenSettings,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    window.electronAPI?.onMaximized(() => setIsMaximized(true));
    window.electronAPI?.onUnmaximized(() => setIsMaximized(false));
  }, []);

  return (
    <div className="titlebar">
      <div className="titlebar-left">
        <div className="sidebar-toggle-button" onClick={onToggleSidebar}>
          <img
            src="./assets/title_bar_icons/menu.svg"
            alt="Menu"
            draggable="false"
          />
        </div>

        <img
          src="./assets/title_bar_icons/title_bar_icon.png"
          alt="App Icon"
          className="titlebar-app-icon"
          draggable="false"
        />
        <span className="titlebar-title">Factoriolab Portable</span>
      </div>

      <div className="titlebar-buttons">
        <div
          className="titlebar-button settings-button"
          onClick={onOpenSettings}
        >
          <img src="./assets/title_bar_icons/settings.svg" alt="Settings" />
        </div>
        <div
          className="titlebar-button"
          onClick={() => window.electronAPI?.minimize()}
        >
          <img src="./assets/title_bar_icons/minimize.svg" alt="Minimize" />
        </div>
        <div
          className="titlebar-button"
          onClick={() => window.electronAPI?.toggleMaximize()}
        >
          <img
            src={
              isMaximized
                ? "./assets/title_bar_icons/restore.svg"
                : "./assets/title_bar_icons/maximize.svg"
            }
            alt={isMaximized ? "Restore" : "Maximize"}
          />
        </div>
        <div
          className="titlebar-button close"
          onClick={() => window.electronAPI?.close()}
        >
          <img src="./assets/title_bar_icons/close.svg" alt="Close" />
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
