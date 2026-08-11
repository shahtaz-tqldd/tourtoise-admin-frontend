import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const RetrainDialog = ({ open, setOpen, onConfirm, isLoading = false }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[468px]">
        <DialogHeader>
          <DialogTitle>Retrain this item?</DialogTitle>
          <DialogDescription className="mt-4">
            This will replace the existing vector data and start training again.
            The request will continue in the background.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={onConfirm}
            className="w-28"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner spinner-white"></span>
            ) : (
              "Retrain"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RetrainDialog;
