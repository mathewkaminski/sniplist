import { Progress } from '@/components/ui/progress';
import { Snippet } from '@/types';

interface PlaybackProgressProps {
  current: number;
  total: number;
  snippet: Snippet;
}

export function PlaybackProgress({
  current,
  total,
  snippet,
}: PlaybackProgressProps) {
  const progress = (current / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-500">
        <span>
          {current} of {total}
        </span>
        <span>
          {snippet.title || `Snippet ${current}`}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
} 