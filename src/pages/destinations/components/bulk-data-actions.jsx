import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import React from "react";
import {
  useBatchTrainDestinationsMutation,
  useBulkDownloadDestinationsMutation,
} from "@/features/destination/destinationApiSlice";
import { toast } from "sonner";

const saveBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const BulkDataActions = ({
  type,
  selectedIds = [],
  selectedOnly = false,
  downloadOpen,
  setDownloadOpen,
  trainOpen,
  setTrainOpen,
  onCompleted,
}) => {
  const [download, { isLoading: downloading }] =
    useBulkDownloadDestinationsMutation();
  const [batchTrain, { isLoading: training }] =
    useBatchTrainDestinationsMutation();
  const pluralLabel = type;
  const scope = selectedOnly ? "selected" : "all";

  const handleDownload = async (format) => {
    try {
      const ids = selectedOnly ? selectedIds : [];
      const blob = await download({ type, format, ids }).unwrap();
      saveBlob(blob, `${type}-${scope}.${format}`);
      toast.success("Download started");
      setDownloadOpen(false);
      onCompleted?.();
    } catch (error) {
      toast.error(error?.data?.detail || "Bulk download could not be started");
    }
  };

  const handleTrain = async () => {
    try {
      const ids = selectedOnly ? selectedIds : [];
      await batchTrain({ type, ids }).unwrap();
      toast.success("Batch training started");
      setTrainOpen(false);
      onCompleted?.();
    } catch (error) {
      toast.error(error?.data?.detail || "Batch training could not be started");
    }
  };

  return (
    <>
      <Dialog open={downloadOpen} onOpenChange={setDownloadOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {selectedOnly ? "Download selected" : "Bulk download"} {pluralLabel}
            </DialogTitle>
            <DialogDescription>
              Choose the file format for {selectedOnly ? selectedIds.length : "all"} {pluralLabel}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-24 flex-col"
              disabled={downloading}
              onClick={() => handleDownload("xlsx")}
            >
              {downloading ? <Loader2 className="animate-spin" /> : <FileSpreadsheet />}
              XLSX workbook
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-24 flex-col"
              disabled={downloading}
              onClick={() => handleDownload("csv")}
            >
              {downloading ? <Loader2 className="animate-spin" /> : <Download />}
              CSV file
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDownloadOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={trainOpen} onOpenChange={setTrainOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              Train {selectedOnly ? `${selectedIds.length} selected` : "all"} {pluralLabel}
            </DialogTitle>
            <DialogDescription>
              This replaces existing vector data and starts training in the background.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrainOpen(false)} disabled={training}>
              Cancel
            </Button>
            <Button onClick={handleTrain} disabled={training}>
              {training && <Loader2 className="animate-spin" />}
              Start training
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BulkDataActions;
