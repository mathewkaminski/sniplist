
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PlayerLoadingStateProps {
  onClose: () => void;
}

export function PlayerLoadingState({ onClose }: PlayerLoadingStateProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-purple-700" />
            <p className="text-gray-700">Loading snippets...</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
