
import { Button } from "@/components/ui/button";
import { Music2 } from "lucide-react";

interface PlayerEmptyStateProps {
  onClose: () => void;
}

export function PlayerEmptyState({ onClose }: PlayerEmptyStateProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Music2 className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">No snippets found in this sniplist.</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
