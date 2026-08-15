import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, HardDriveUpload, Loader2, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import BulkDataActions from "./bulk-data-actions";
import { useBatchDeleteDestinationsMutation } from "@/features/destination/destinationApiSlice";

const SelectedDataActions = ({ type, selectedIds, setSelectedIds }) => {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [trainOpen, setTrainOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [batchDelete, { isLoading: deleting }] =
    useBatchDeleteDestinationsMutation();

  if (!selectedIds.length) return null;

  const clearSelection = () => setSelectedIds([]);

  const handleDelete = async () => {
    try {
      await batchDelete({ type, ids: selectedIds }).unwrap();
      toast.success(`${selectedIds.length} selected item(s) deleted`);
      setDeleteOpen(false);
      clearSelection();
    } catch (error) {
      toast.error(error?.data?.detail || "Selected items could not be deleted");
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-800">
            {selectedIds.length} selected
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={clearSelection}
            aria-label="Clear selection"
          >
            <X size={16} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setTrainOpen(true)}
            className="rounded-full"
          >
            <HardDriveUpload size={16} /> Train Data
          </Button>
          <Button
            variant="outline"
            onClick={() => setDownloadOpen(true)}
            className="rounded-full"
          >
            <Download size={16} /> Download
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            className="rounded-full"
          >
            <Trash2 size={16} /> Delete
          </Button>
        </div>
      </div>

      <BulkDataActions
        type={type}
        selectedIds={selectedIds}
        selectedOnly
        downloadOpen={downloadOpen}
        setDownloadOpen={setDownloadOpen}
        trainOpen={trainOpen}
        setTrainOpen={setTrainOpen}
        onCompleted={clearSelection}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[468px]">
          <DialogHeader>
            <DialogTitle>
              Delete {selectedIds.length} selected item(s)?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All selected records will be
              permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting && <Loader2 className="animate-spin" />}
              Delete selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectedDataActions;
