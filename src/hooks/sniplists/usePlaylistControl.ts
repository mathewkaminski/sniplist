import { useState, useRef, useEffect } from "react";
import { Snippet } from "@/components/sniplists/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

export function usePlaylistControl(snippets: Snippet[]) {
  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
  const [playlistComplete, setPlaylistComplete] = useState(false);
  const [isCurrentSnippetPlaying, setIsCurrentSnippetPlaying] = useState(false);
  const isMobile = useIsMobile();
  const snippetTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSnippetEndedAt = useRef<number | null>(null);
  const autoAdvanceEnabled = useRef(true);
  const playbackAttempts = useRef(0);
  const maxPlaybackAttempts = 3;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (snippetTimer.current) {
        clearTimeout(snippetTimer.current);
        snippetTimer.current = null;
      }
    };
  }, []);

  // Setup backup timer when snippet is playing
  useEffect(() => {
    if (isCurrentSnippetPlaying && snippets.length > 0) {
      console.log("Setting up backup timer for snippet playback");
      resetSnippetTimer();
      
      return () => {
        if (snippetTimer.current) {
          clearTimeout(snippetTimer.current);
          snippetTimer.current = null;
        }
      };
    }
  }, [isCurrentSnippetPlaying, currentSnippetIndex, snippets.length]);

  // Reset timer with current snippet duration + safety buffer
  const resetSnippetTimer = () => {
    if (snippetTimer.current) {
      clearTimeout(snippetTimer.current);
      snippetTimer.current = null;
    }

    if (!playlistComplete && snippets.length > 0) {
      const currentSnippet = snippets[currentSnippetIndex];
      if (!currentSnippet) return;
      
      const snippetDuration = (currentSnippet.end_time - currentSnippet.start_time) * 1000;
      const safetyBuffer = isMobile ? 3000 : 1500; // Increased buffer for mobile
      
      console.log(`Setting backup timer for snippet ${currentSnippetIndex + 1}, duration: ${snippetDuration}ms + ${safetyBuffer}ms buffer`);
      
      snippetTimer.current = setTimeout(() => {
        console.log(`Backup timer elapsed for snippet ${currentSnippetIndex + 1}, forcing advance`);
        advanceToNextSnippet("backup-timer");
      }, snippetDuration + safetyBuffer);
    }
  };

  // Advance to next snippet with debounce to prevent multiple triggers
  const advanceToNextSnippet = (source: string = "unknown") => {
    // Debounce - prevent double triggers within 2 seconds
    const now = Date.now();
    if (lastSnippetEndedAt.current && now - lastSnippetEndedAt.current < 2000) {
      console.log(`Skipping duplicate advance request from ${source}, too soon after last advance`);
      return;
    }
    
    lastSnippetEndedAt.current = now;
    console.log(`Advancing to next snippet from source: ${source}`);
    
    if (currentSnippetIndex < snippets.length - 1) {
      setCurrentSnippetIndex(prevIndex => prevIndex + 1);
      playbackAttempts.current = 0; // Reset attempts for new snippet
      
      // Always keep playing when advancing automatically
      if (autoAdvanceEnabled.current) {
        setIsCurrentSnippetPlaying(true);
      }
    } else {
      console.log("Reached end of playlist");
      setPlaylistComplete(true);
      setIsCurrentSnippetPlaying(false);
    }
    
    if (snippetTimer.current) {
      clearTimeout(snippetTimer.current);
      snippetTimer.current = null;
    }
  };

  // Handle snippet end with retry logic for mobile
  const handleSnippetEnd = () => {
    if (isMobile && playbackAttempts.current < maxPlaybackAttempts) {
      playbackAttempts.current++;
      console.log(`Mobile playback attempt ${playbackAttempts.current}/${maxPlaybackAttempts}`);
      
      // Short delay before retrying
      setTimeout(() => {
        setIsCurrentSnippetPlaying(true);
      }, 500);
    } else {
      advanceToNextSnippet("snippet-end");
    }
  };

  // Restart playlist
  const handleRestartPlaylist = () => {
    setCurrentSnippetIndex(0);
    setPlaylistComplete(false);
    setIsCurrentSnippetPlaying(true);
    playbackAttempts.current = 0;
  };

  return {
    currentSnippetIndex,
    playlistComplete,
    isCurrentSnippetPlaying,
    setCurrentSnippetIndex,
    handleSnippetEnd,
    handleRestartPlaylist,
    setPlaylistComplete,
    setSnippetPlayingStatus: setIsCurrentSnippetPlaying
  };
}
