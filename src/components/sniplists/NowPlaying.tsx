import { ListMusic, ExternalLink } from "lucide-react";
import { SnippetPlayer } from "@/components/SnippetPlayer";
import { Button } from "@/components/ui/button";
import { Snippet } from "./types";
import { SnippetList } from "./SnippetList";
import { useEffect } from "react";
import { getYoutubeVideoUrl } from "@/utils/youtube";

interface NowPlayingProps {
  currentSnippet: Snippet;
  snippets: Snippet[];
  currentSnippetIndex: number;
  onClose: () => void;
  onSnippetEnd: () => void;
  onSnippetSelect: (index: number) => void;
  setPlaylistComplete: (complete: boolean) => void;
}

export function NowPlaying({
  currentSnippet,
  snippets,
  currentSnippetIndex,
  onClose,
  onSnippetEnd,
  onSnippetSelect,
  setPlaylistComplete
}: NowPlayingProps) {
  useEffect(() => {
    console.log(`NowPlaying rendering snippet ${currentSnippetIndex + 1}/${snippets.length}:`, currentSnippet);
  }, [currentSnippet, currentSnippetIndex, snippets.length]);

  const displayTitle = currentSnippet.title || currentSnippet.youtube_title || 'Untitled';
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListMusic className="h-5 w-5 text-purple-700" />
            <span className="font-medium">
              Now Playing: {displayTitle}
              {currentSnippet.artist && ` - ${currentSnippet.artist}`}
              <span className="text-gray-500 text-sm ml-2">
                ({currentSnippetIndex + 1}/{snippets.length})
              </span>
              <a 
                href={getYoutubeVideoUrl(currentSnippet.video_id)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="ml-1">YouTube</span>
              </a>
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        
        <div className="flex flex-col">
          <div className="mb-4">
            <div className="flex items-center">
              <SnippetPlayer
                key={`${currentSnippet.video_id}-${currentSnippet.start_time}-${currentSnippetIndex}`}
                videoId={currentSnippet.video_id}
                startTime={currentSnippet.start_time}
                endTime={currentSnippet.end_time}
                autoplay={true}
                onEnded={onSnippetEnd}
              />
              <div className="ml-4">
                <p className="text-lg font-medium">
                  {displayTitle}
                </p>
                {currentSnippet.artist && (
                  <p className="text-sm text-gray-500">
                    {currentSnippet.artist}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <SnippetList
            snippets={snippets}
            currentSnippetIndex={currentSnippetIndex}
            onSnippetSelect={(index) => {
              onSnippetSelect(index);
              setPlaylistComplete(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
