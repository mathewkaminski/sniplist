
import { Button } from "@/components/ui/button";

interface PlayerEmptyStateProps {
  onClose: () => void;
}

export function PlayerEmptyState({ onClose }: PlayerEmptyStateProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span>No snippets found in this sniplist.</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

