
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface PlayerButtonProps {
  isPlaying: boolean;
  playerReady: boolean;
  onToggle: () => void;
}

export function PlayerButton({ isPlaying, playerReady, onToggle }: PlayerButtonProps) {
  return (
    <Button 
      size="icon" 
      variant="ghost"
      onClick={onToggle}
      disabled={!playerReady}
      title={playerReady ? (isPlaying ? "Pause" : "Play") : "Loading player..."}
    >
      {isPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
    </Button>
  );
}
