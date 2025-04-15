
import { SnippetPlayer } from "@/components/SnippetPlayer";
import { Button } from "@/components/ui/button";
import { ListMusic } from "lucide-react";
import { SniplistPlayerProps } from "./types";
import { useSniplistPlayback } from "./useSniplistPlayback";
import { SnippetList } from "./SnippetList";

export function SniplistPlayer({ sniplistId, onClose }: SniplistPlayerProps) {
  const {
    snippets,
    loading,
    currentSnippetIndex,
    playlistComplete,
    setCurrentSnippetIndex,
    handleSnippetEnd,
    handleRestartPlaylist,
    setPlaylistComplete,
  } = useSniplistPlayback(sniplistId);

  if (loading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="container mx-auto">
          <p className="text-center py-2">Loading snippets...</p>
        </div>
      </div>
    );
  }

  if (snippets.length === 0) {
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

  const currentSnippet = snippets[currentSnippetIndex];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListMusic className="h-5 w-5 text-purple-700" />
            <span className="font-medium">
              {playlistComplete ? "Playlist Complete" : `Now Playing: ${currentSnippet.title || 'Untitled'}`}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        
        {playlistComplete ? (
          <div className="flex justify-center gap-4 py-4">
            <Button onClick={handleRestartPlaylist} variant="outline">
              Play Again
            </Button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="mb-4">
              <div className="flex items-center">
                <SnippetPlayer
                  key={`${currentSnippet.video_id}-${currentSnippet.start_time}-${currentSnippetIndex}`}
                  videoId={currentSnippet.video_id}
                  startTime={currentSnippet.start_time}
                  endTime={currentSnippet.end_time}
                  autoplay={true}
                  onEnded={handleSnippetEnd}
                />
                <div className="ml-4">
                  <p className="text-lg font-medium">
                    {currentSnippet.title || 'Untitled'}
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
                setCurrentSnippetIndex(index);
                setPlaylistComplete(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
