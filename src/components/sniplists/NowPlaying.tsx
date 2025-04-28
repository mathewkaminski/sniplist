
import { ListMusic, ExternalLink } from "lucide-react";
import { SnippetPlayer } from "@/components/SnippetPlayer";
import { Button } from "@/components/ui/button";
import { Snippet } from "./types";
import { SnippetList } from "./SnippetList";
import { useEffect, useState, useRef } from "react";
import { getYoutubeVideoUrl } from "@/utils/youtube";
import { supabase } from "@/integrations/supabase/client";
import { PlayerButton } from "@/components/PlayerButton";
import { useIsMobile } from "@/hooks/use-mobile";

interface NowPlayingProps {
  currentSnippet: Snippet;
  snippets: Snippet[];
  currentSnippetIndex: number;
  onClose: () => void;
  onSnippetEnd: () => void;
  onSnippetSelect: (index: number) => void;
  setPlaylistComplete: (complete: boolean) => void;
  isCurrentSnippetPlaying: boolean;
  setSnippetPlayingStatus: (isPlaying: boolean) => void;
}

export function NowPlaying({
  currentSnippet,
  snippets,
  currentSnippetIndex,
  onClose,
  onSnippetEnd,
  onSnippetSelect,
  setPlaylistComplete,
  isCurrentSnippetPlaying,
  setSnippetPlayingStatus
}: NowPlayingProps) {
  const isMobile = useIsMobile();
  const [playerReady, setPlayerReady] = useState(false);
  const [forcePlay, setForcePlay] = useState(false);
  const playerReadyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const readyForMainButtonControl = useRef(false);

  useEffect(() => {
    // Track playlist progress when completed songs >= 2
    if (currentSnippetIndex >= 2 && currentSnippet?.sniplist_id) {
      const trackPlayProgress = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('sniplist_plays').insert({
          user_id: user.id,
          sniplist_id: currentSnippet.sniplist_id || null,
          completed_songs: currentSnippetIndex
        });
      };

      trackPlayProgress();
    }
  }, [currentSnippetIndex, currentSnippet]);

  useEffect(() => {
    console.log(`NowPlaying rendering snippet ${currentSnippetIndex + 1}/${snippets.length}:`, currentSnippet);
    setPlayerReady(false);
    setForcePlay(false);
    readyForMainButtonControl.current = false;
    
    // Clear any existing timeout
    if (playerReadyTimeoutRef.current) {
      clearTimeout(playerReadyTimeoutRef.current);
    }
    
    // Give a moment for the player to initialize
    playerReadyTimeoutRef.current = setTimeout(() => {
      setPlayerReady(true);
      readyForMainButtonControl.current = true;
    }, 1000);
    
    return () => {
      if (playerReadyTimeoutRef.current) {
        clearTimeout(playerReadyTimeoutRef.current);
        playerReadyTimeoutRef.current = null;
      }
    };
  }, [currentSnippet, currentSnippetIndex, snippets.length]);

  // Main playlist play/pause toggle - enhanced for mobile
  const handleMainPlayPause = () => {
    if (!readyForMainButtonControl.current) {
      console.log("Player not fully initialized yet, waiting...");
      return;
    }
    
    if (isMobile && !isCurrentSnippetPlaying) {
      console.log("Mobile main button play requested, forcing play");
      setForcePlay(true);
      setSnippetPlayingStatus(true);
      
      // Reset force play flag after a delay
      setTimeout(() => {
        setForcePlay(false);
      }, 1000);
    } else {
      setSnippetPlayingStatus(!isCurrentSnippetPlaying);
    }
  };

  if (!currentSnippet) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <p className="text-gray-500">No snippet data available</p>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  const displayTitle = currentSnippet.title || currentSnippet.youtube_title || 'Untitled';
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListMusic className="h-5 w-5 text-purple-700" />
            <span className="font-medium">
              Now Playing: {displayTitle}
              {currentSnippet.comments && ` - ${currentSnippet.comments}`}
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
          {isMobile && (
            <div className="mb-4 flex justify-center">
              <PlayerButton
                isPlaying={isCurrentSnippetPlaying}
                playerReady={playerReady}
                onToggle={handleMainPlayPause}
                size="large"
              />
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex items-center">
              <SnippetPlayer
                key={`${currentSnippet.video_id}-${currentSnippet.start_time}-${currentSnippetIndex}`}
                videoId={currentSnippet.video_id}
                startTime={currentSnippet.start_time}
                endTime={currentSnippet.end_time}
                autoplay={!isMobile} // Don't autoplay on mobile
                onEnded={onSnippetEnd}
                onPlayStateChange={setSnippetPlayingStatus}
                forcePlay={forcePlay}
              />
              <div className="ml-4 flex-1">
                <p className="text-lg font-medium line-clamp-1">
                  {displayTitle}
                </p>
                {currentSnippet.comments && (
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {currentSnippet.comments}
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
              
              // On mobile, we want to start playing immediately when a snippet is selected
              if (isMobile) {
                console.log("Mobile: snippet selected, will try to autoplay");
                // Using a slightly longer delay to ensure component gets updated
                setTimeout(() => {
                  setForcePlay(true);
                  setSnippetPlayingStatus(true);
                  
                  setTimeout(() => {
                    setForcePlay(false);
                  }, 1000);
                }, 300);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
