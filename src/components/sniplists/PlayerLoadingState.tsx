
import { Button } from "@/components/ui/button";

interface PlayerLoadingStateProps {
  onClose: () => void;
}

export function PlayerLoadingState({ onClose }: PlayerLoadingStateProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-center py-2">Loading snippets...</p>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

