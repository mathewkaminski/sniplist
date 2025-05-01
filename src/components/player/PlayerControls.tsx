import { Play, Pause, SkipForward, SkipBack, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function PlayerControls({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onClose,
  hasNext,
  hasPrevious,
}: PlayerControlsProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size={isMobile ? "lg" : "default"}
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="p-2"
        >
          <SkipBack className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size={isMobile ? "lg" : "default"}
          onClick={onPlayPause}
          className="p-2"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size={isMobile ? "lg" : "default"}
          onClick={onNext}
          disabled={!hasNext}
          className="p-2"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size={isMobile ? "lg" : "default"}
        onClick={onClose}
        className="p-2"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
} 