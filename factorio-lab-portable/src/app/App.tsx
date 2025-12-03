import { useEffect, useRef, useState } from "react";
import TitleBar from "../components/TitleBar";
import Sidebar from "../components/Sidebar";
import SettingsOverlay from "../components/Settings";
import UpdaterDialog from "../components/UpdaterDialog";
import { Tab } from "./types/tabTypes";
import { webviewOnLoad, updateTab } from "./utils/webviewHelper";
import Splash from "../components/Splash";
import { useSplash } from "./utils/splashHelper";
import { useUpdater } from "./utils/updater";
import {
  handleAddTab,
  handleChangeTab,
  handleCloseTab,
  handleReorderTabs,
} from "./utils/tabActions";
import "../styles/App.css";

function App() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const tabsRef = useRef<Tab[]>([]);

  // toggle multiTabMode
  const [multiTabMode, setMultiTabMode] = useState(false);

  // settings overlay
  const [settingsOpen, setSettingsOpen] = useState(false);

  // set active tab
  const [activeTabId, setActiveTabId] = useState(1);

  // sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // webview refs
  const webviewRefs = useRef<{ [key: number]: HTMLWebViewElement | null }>({});

  // debounce timeout refs
  const timeoutRefs = useRef<{ [key: number]: NodeJS.Timeout }>({});

  // splash handler
  const { splashMessages, showSplash, startSplash, removeSplash } = useSplash();

  // auto check for updates
  const [checkUpdatesOnStartup, setCheckUpdatesOnStartup] = useState(true);

  // updater
  const {
    updateStatus,
    showDownloadDialog,
    showInstallDialog,
    setShowDownloadDialog,
    setShowInstallDialog,
    splashID,
    handleCheckForUpdate,
  } = useUpdater(startSplash, removeSplash);

  // load tabs
  useEffect(() => {
    async function loadSavedTabs() {
      const saved = await window.electronAPI.loadTabs();
      if (saved.tabs.length > 0) {
        setTabs(saved.tabs);
        setActiveTabId(saved.activeTabId || saved.tabs[0].id);
      } else {
        handleAddTab([], setTabs, setActiveTabId, multiTabMode, showSplash);
      }
    }
    loadSavedTabs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load settings
  useEffect(() => {
    async function loadSettings() {
      const saved = await window.electronAPI.loadSettings();
      if (saved && typeof saved.multiTabMode === "boolean") {
        setMultiTabMode(saved.multiTabMode);
      } else {
        setMultiTabMode(true);
      }

      if (saved?.checkUpdatesOnStartup) {
        console.log("check updates");
        handleCheckForUpdate();
      }
    }
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // create new tabs
  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);
  useEffect(() => {
    window.electronAPI.createNewTab((url) => {
      console.log("App protocol triggered:", url);
      const newId = tabsRef.current.length
        ? Math.max(...tabsRef.current.map((t) => t.id)) + 1
        : 1;

      const newTab: Tab = {
        id: newId,
        title: "Loading...",
        src: url,
        url: "",
        spritePosition: "",
        spritePath: "",
        itemQuality: "",
      };

      setTabs([...tabsRef.current, newTab]);
      setActiveTabId(newId);
    });
  }, []);

  // error handling
  if (!window.electronAPI) {
    return (
      <div className="error-overlay-container">
        <div className="error-overlay-message">
          <h3>Something Went Wrong</h3>
          <p>An internal component failed to load in this window.</p>
          <p style={{ fontSize: "0.8em", marginTop: "20px" }}>
            Please close this tab and try opening again.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="App">
      {/* title bar */}
      <TitleBar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTabId={(id) => handleChangeTab(id, setTabs, setActiveTabId)}
        onAddTab={() =>
          handleAddTab(tabs, setTabs, setActiveTabId, multiTabMode, showSplash)
        }
        onCloseTab={(tabId) =>
          handleCloseTab(tabId, tabs, setTabs, setActiveTabId, timeoutRefs)
        }
        onReorderTabs={(srcIndex, destIndex) =>
          handleReorderTabs(activeTabId, srcIndex, destIndex, setTabs)
        }
      />

      {/* settings overlay */}
      {settingsOpen && (
        <SettingsOverlay
          onClose={() => setSettingsOpen(false)}
          multiTabMode={multiTabMode}
          setMultiTabMode={setMultiTabMode}
          setTabs={setTabs}
          handleCheckForUpdate={handleCheckForUpdate}
          updateStatus={updateStatus}
          checkUpdatesOnStartup={checkUpdatesOnStartup}
          setCheckUpdatesOnStartup={setCheckUpdatesOnStartup}
        />
      )}

      {/* main component */}
      {multiTabMode
        ? // multiTabMode
          [...tabs]
            .sort((a, b) => a.id - b.id)
            .map((tab) => (
              <webview
                key={tab.id}
                ref={(webviewElement) => {
                  if (webviewElement) {
                    webviewRefs.current[tab.id] = webviewElement;
                    webviewElement.addEventListener("did-finish-load", () => {
                      webviewOnLoad(tab, webviewRefs);
                    });
                    webviewElement.addEventListener(
                      "did-navigate-in-page",
                      () => {
                        updateTab(
                          activeTabId,
                          webviewElement,
                          tab,
                          timeoutRefs,
                          setTabs
                        );
                      }
                    );
                  }
                }}
                src={tab.src}
                title={tab.title}
                className="App-webview"
                style={{
                  opacity: tab.id === activeTabId ? 1 : 0,
                  pointerEvents: tab.id === activeTabId ? "auto" : "none",
                  position: "absolute",
                  display: "flex",
                }}
                {...({
                  allowpopups: "true",
                  webpreferences: "nativeWindowOpen=yes",
                } as any)}
              />
            ))
        : // single tab mode
          (() => {
            const activeTab = tabs.find((t) => t.id === activeTabId);
            if (!activeTab) return null;
            return (
              <webview
                key={activeTab.id}
                ref={(webviewElement: any) => {
                  if (webviewElement) {
                    webviewRefs.current[activeTab.id] = webviewElement;
                    webviewElement.addEventListener("did-finish-load", () => {
                      webviewOnLoad(activeTab, webviewRefs);
                    });
                    webviewElement.addEventListener(
                      "did-navigate-in-page",
                      () => {
                        updateTab(
                          activeTabId,
                          webviewElement,
                          activeTab,
                          timeoutRefs,
                          setTabs
                        );
                      }
                    );
                  }
                }}
                src={activeTab.src}
                title={activeTab.title}
                className="App-webview"
                style={{ display: "flex" }}
                {...({
                  allowpopups: "true",
                  webpreferences: "nativeWindowOpen=yes",
                } as any)}
              />
            );
          })()}

      {/* splash message */}
      <Splash messages={splashMessages} />

      {/* updater dialog */}
      <UpdaterDialog
        updateStatus={updateStatus}
        showDownloadDialog={showDownloadDialog}
        showInstallDialog={showInstallDialog}
        setShowDownloadDialog={setShowDownloadDialog}
        setShowInstallDialog={setShowInstallDialog}
        startSplash={startSplash}
        removeSplash={removeSplash}
        splashID={splashID}
      />
    </div>
  );
}

export default App;
