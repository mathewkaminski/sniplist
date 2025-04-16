
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"; // Make sure this is correctly implemented via shadcn

export function SearchDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border p-6 shadow-md z-50 max-w-md">
        <DialogTitle className="text-lg font-bold text-black">Dialog Working ✅</DialogTitle>
        <p className="text-black mt-2">If you see this, your Dialog is now wired up properly.</p>
      </DialogContent>
    </Dialog>
  );
}
