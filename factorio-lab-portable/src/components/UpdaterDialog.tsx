import "../styles/UpdaterDialog.css";

interface UpdaterDialogProps {
  updateStatus: any;
  showDownloadDialog: boolean;
  showInstallDialog: boolean;
  setShowDownloadDialog: (val: boolean) => void;
  setShowInstallDialog: (val: boolean) => void;

  startSplash: (id: string, title: string, message: string) => void;
  removeSplash: (id: string) => void;

  splashID: string;
}

export default function UpdaterDialog({
  updateStatus,
  showDownloadDialog,
  showInstallDialog,
  setShowDownloadDialog,
  setShowInstallDialog,
  startSplash,
  removeSplash,
  splashID,
}: UpdaterDialogProps) {
  return (
    <>
      {/* Download Dialog */}
      {showDownloadDialog && (
        <div className="custom-dialog">
          <div className="dialog-panel">
            <h3>Update Available</h3>
            <p>
              A new update (v{(updateStatus as any).version}) is available.
              Download now?
            </p>

            <div className="dialog-buttons">
              <button
                onClick={() => {
                  startSplash(splashID, "Updater", "Update cancelled.");
                  removeSplash(splashID);
                  setShowDownloadDialog(false);
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowDownloadDialog(false);
                  window.electronAPI.startDownloadUpdate();
                }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install Dialog */}
      {showInstallDialog && (
        <div className="custom-dialog">
          <div className="dialog-panel">
            <h3>Update Ready</h3>
            <p>The update has been downloaded. Install and restart now?</p>

            <div className="dialog-buttons">
              <button onClick={() => setShowInstallDialog(false)}>Later</button>

              <button onClick={() => window.electronAPI.installUpdate()}>
                Install
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
