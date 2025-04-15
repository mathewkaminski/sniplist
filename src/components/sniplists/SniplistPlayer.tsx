
import { useState, useEffect } from "react";
import { SnippetPlayer } from "@/components/SnippetPlayer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ListMusic } from "lucide-react";
import { toast } from "sonner";

interface Snippet {
  id: string;
  title: string;
  video_id: string;
  start_time: number;
  end_time: number;
  artist?: string;
}

interface SniplistPlayerProps {
  sniplistId: string;
  onClose: () => void;
}

export function SniplistPlayer({ sniplistId, onClose }: SniplistPlayerProps) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
  const [playlistComplete, setPlaylistComplete] = useState(false);

  useEffect(() => {
    fetchSniplistItems();
  }, [sniplistId]);

  const fetchSniplistItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sniplist_items')
        .select(`
          snippet_id,
          position,
          snippets (
            id,
            title,
            video_id,
            start_time,
            end_time,
            artist
          )
        `)
        .eq('sniplist_id', sniplistId)
        .order('position');

      if (error) throw error;

      const sortedSnippets = data
        .map(item => item.snippets as Snippet)
        .filter(Boolean);

      setSnippets(sortedSnippets);
    } catch (error: any) {
      console.error('Error fetching sniplist items:', error);
      toast.error(`Failed to load sniplist items: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSnippetEnd = () => {
    console.log("Snippet ended, current index:", currentSnippetIndex, "total snippets:", snippets.length);
    // Move to next snippet when current one ends
    if (currentSnippetIndex < snippets.length - 1) {
      setCurrentSnippetIndex(prevIndex => prevIndex + 1);
    } else {
      // We've reached the end of the playlist
      setPlaylistComplete(true);
      toast.success("Playlist complete!");
    }
  };

  if (loading) {
    return <div>Loading snippets...</div>;
  }

  if (snippets.length === 0) {
    return <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span>No snippets found in this sniplist.</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>;
  }

  const currentSnippet = snippets[currentSnippetIndex];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListMusic className="h-5 w-5 text-purple-700" />
            <span className="font-medium">
              {playlistComplete ? "Playlist Complete" : `Now Playing: ${currentSnippet.title}`}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        
        {!playlistComplete && (
          <div className="flex flex-col">
            <div className="mb-4">
              <div className="flex items-center">
                <SnippetPlayer
                  videoId={currentSnippet.video_id}
                  startTime={currentSnippet.start_time}
                  endTime={currentSnippet.end_time}
                  autoplay={true}
                  onEnded={handleSnippetEnd}
                />
                <div className="ml-4">
                  <p className="text-lg font-medium">
                    {currentSnippet.title}
                  </p>
                  {currentSnippet.artist && (
                    <p className="text-sm text-gray-500">
                      {currentSnippet.artist}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2">
              {snippets.map((snippet, index) => (
                <div 
                  key={snippet.id} 
                  className={`flex-none cursor-pointer p-2 rounded ${index === currentSnippetIndex ? 'bg-gray-100' : ''}`}
                  onClick={() => {
                    setCurrentSnippetIndex(index);
                    setPlaylistComplete(false);
                  }}
                >
                  <p className="text-sm font-medium truncate max-w-[200px]">
                    {snippet.title}
                  </p>
                  {snippet.artist && (
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                      {snippet.artist}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
