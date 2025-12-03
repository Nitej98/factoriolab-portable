import { Tab } from "../types/tabTypes";

// update tabs
export const updateTab = async (
  activeTabId: number,
  webviewElement: any,
  tab: Tab,
  timeoutRefs: React.MutableRefObject<{ [key: number]: NodeJS.Timeout }>,
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>
) => {
  // set debounce for 100ms
  if (timeoutRefs.current[tab.id]) {
    clearTimeout(timeoutRefs.current[tab.id]);
  }
  const currentUrl = webviewElement.getURL();
  timeoutRefs.current[tab.id] = setTimeout(async () => {
    try {
      const result = await window.electronAPI.decode(currentUrl!);
      let itemName: string | null;
      let spritePosition = "";
      let spritePath = "";
      let itemQuality = "";
      if (result) {
        itemName = result.itemName;
        spritePosition = result.spritePosition!;
        spritePath = result.spritePath!;
        itemQuality = result.itemQuality!;
      }

      setTabs((prevTabs) => {
        const tabIndex = prevTabs.findIndex((t) => t.id === tab.id);
        if (tabIndex === -1) return prevTabs;

        const updatedTabs = [...prevTabs];
        updatedTabs[tabIndex] = {
          ...prevTabs[tabIndex],
          title: itemName ?? "FactorioLab",
          url: currentUrl!,
          spritePosition: spritePosition,
          spritePath: spritePath,
          itemQuality: itemQuality,
        };

        window.electronAPI.saveTabs({
          tabs: updatedTabs,
          activeTabId: activeTabId,
        });
        return updatedTabs;
      });
    } catch (e) {
      console.log(e);
    }
  }, 100);
};

// iframe onLoad handler
export const webviewOnLoad = (
  tab: Tab,
  webviewRefs: React.MutableRefObject<{ [key: number]: any | null }>
) => {
  const webviewElement = webviewRefs.current[tab.id];
  if (!webviewElement) return;

  webviewElement.executeJavaScript(`
    (function() {
      try {
        // Disable text selection
        document.body.style.userSelect = "none";
        document.body.style.webkitUserSelect = "none";

        // Disable drag events
        document.addEventListener("dragstart", e => e.preventDefault(), true);
        
      } catch (err) {
        console.error("[WebView] Failed to disable selection:", err);
      }
    })();
  `);
};
