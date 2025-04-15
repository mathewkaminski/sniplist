
import { Button } from "@/components/ui/button";

interface PlaylistCompleteProps {
  onRestart: () => void;
  onClose: () => void;
}

export function PlaylistComplete({ onRestart, onClose }: PlaylistCompleteProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium">Playlist Complete</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="flex justify-center gap-4 py-4">
          <Button onClick={onRestart} variant="outline">
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}

