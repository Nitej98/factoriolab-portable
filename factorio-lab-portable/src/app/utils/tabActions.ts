import { Tab } from "../types/tabTypes";
import { reorder } from "./reorder";

export const defaultSrc = "app://index.html";
export const maxTabLimit = 30;

// Add new tab
export const handleAddTab = (
  tabs: Tab[],
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>,
  setActiveTabId: React.Dispatch<React.SetStateAction<number>>,
  multiTabMode: boolean,
  showSplash: (id: string, title: string, body: string) => void
) => {
  if (multiTabMode && tabs.length >= maxTabLimit) {
    showSplash(
      "tab-limit",
      "Tab Limit Reached",
      `You cannot open more than ${maxTabLimit} tabs.`
    );
    return;
  }

  const newId = tabs.length ? Math.max(...tabs.map((t) => t.id)) + 1 : 1;

  const newTab: Tab = {
    id: newId,
    title: "Loading...",
    src: defaultSrc,
    url: defaultSrc,
    spritePosition: "",
    spritePath: "",
    itemQuality: "",
  };

  setTabs([...tabs, newTab]);
  setActiveTabId(newId);
};

// Close tab
export const handleCloseTab = (
  tabId: number,
  tabs: Tab[],
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>,
  setActiveTabId: React.Dispatch<React.SetStateAction<number>>,
  timeoutRefs: React.MutableRefObject<{ [key: number]: NodeJS.Timeout }>
) => {
  if (timeoutRefs.current[tabId]) {
    clearTimeout(timeoutRefs.current[tabId]);
    delete timeoutRefs.current[tabId];
  }

  setTabs((prevTabs) => {
    const remainingTabs = prevTabs.filter((t) => t.id !== tabId);
    if (remainingTabs.length === 0) {
      const newTab: Tab = {
        id: Date.now(),
        title: "Loading...",
        src: defaultSrc,
        url: defaultSrc,
        spritePosition: "",
        spritePath: "",
        itemQuality: "",
      };
      setActiveTabId(newTab.id);
      return [newTab];
    }

    setActiveTabId((prevActive) => {
      if (prevActive === tabId) {
        return remainingTabs[remainingTabs.length - 1].id;
      }
      return prevActive;
    });

    window.electronAPI.saveTabs({
      tabs: remainingTabs,
      activeTabId: remainingTabs[remainingTabs.length - 1]?.id,
    });
    return remainingTabs;
  });
};

// reorder tabs
export const handleReorderTabs = (
  activeTabId: number,
  sourceIndex: number,
  destinationIndex: number,
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>
) => {
  setTabs((prevTabs) => {
    if (
      destinationIndex === null ||
      destinationIndex < 0 ||
      destinationIndex >= prevTabs.length
    ) {
      return prevTabs;
    }

    const reorderedTabs = reorder(prevTabs, sourceIndex, destinationIndex);
    window.electronAPI.saveTabs({
      tabs: reorderedTabs,
      activeTabId: activeTabId,
    });

    return reorderedTabs;
  });
};

// change active tab
export const handleChangeTab = (
  tabId: number,
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>,
  setActiveTabId: React.Dispatch<React.SetStateAction<number>>
) => {
  setTabs((prev) =>
    prev.map((tab) => ({
      ...tab,
      src: tab.url,
    }))
  );
  setActiveTabId(tabId);
};
