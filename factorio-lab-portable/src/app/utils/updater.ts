import { useEffect, useState } from "react";
import { UpdateStatus } from "../types/updateStatusTypes";

export function useUpdater(startSplash: any, removeSplash: any) {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    status: "idle",
  });

  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);

  const splashID = "update-process-status";

  //   listen to electron update events
  useEffect(() => {
    const listener = (_event: any, payload: UpdateStatus) => {
      console.log("Update Status:", payload);
      setUpdateStatus(payload);
    };

    window.electronAPI.onUpdateStatus(listener);
    return () => window.electronAPI.removeUpdateStatusListener();
  }, []);

  //   check for update
  const handleCheckForUpdate = async () => {
    startSplash(splashID, "Updater", "Manually checking for updates...");
    setUpdateStatus({ status: "checking" });
    await window.electronAPI.checkForUpdate();
    removeSplash(splashID);
  };

  //   show update dialog
  useEffect(() => {
    if (updateStatus.status === "available") {
      setShowDownloadDialog(true);
    }

    if (updateStatus.status === "downloaded") {
      setShowInstallDialog(true);
    }
  }, [updateStatus]);

  //   set splash messages
  useEffect(() => {
    switch (updateStatus.status) {
      case "checking":
        startSplash(splashID, "Updater", "Checking for updates...");
        break;

      case "downloading": {
        const progress = (updateStatus as any).progress || 0;
        startSplash(
          splashID,
          "Updater",
          `Downloading update... ${Math.round(progress)}%`
        );
        break;
      }

      case "available":
        startSplash(
          splashID,
          "Update Available",
          `v${(updateStatus as any).version} is ready for download.`
        );
        break;

      case "downloaded":
        startSplash(
          splashID,
          "Update Ready",
          `v${(updateStatus as any).version} downloaded. Restart to install.`
        );
        removeSplash(splashID);
        break;

      case "not-available":
        startSplash(splashID, "Updater", "No updates available.");
        removeSplash(splashID);
        break;

      case "error":
        startSplash(splashID, "Update Error", "An unknown error occurred.");
        removeSplash(splashID);
        break;

      case "idle":
        removeSplash(splashID);
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateStatus]);

  return {
    updateStatus,
    showDownloadDialog,
    showInstallDialog,
    setShowDownloadDialog,
    setShowInstallDialog,
    splashID,
    handleCheckForUpdate,
  };
}
