// components/DeleteLayerModal.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteLayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  layerIndex: number | null;
}

export const DeleteLayerModal: React.FC<DeleteLayerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  layerIndex,
}) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Layer</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete Layer{" "}
            {layerIndex !== null ? layerIndex + 1 : ""}? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
