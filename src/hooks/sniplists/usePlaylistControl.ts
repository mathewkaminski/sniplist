
import { useState, useRef, useEffect } from "react";
import { Snippet } from "@/components/sniplists/types";

export function usePlaylistControl(snippets: Snippet[]) {
  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
  const [playlistComplete, setPlaylistComplete] = useState(false);
  const [isCurrentSnippetPlaying, setIsCurrentSnippetPlaying] = useState(false);
  const snippetTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (snippetTimer.current) {
        clearTimeout(snippetTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isCurrentSnippetPlaying && snippets.length > 0) {
      resetSnippetTimer();
      return () => {
        if (snippetTimer.current) {
          clearTimeout(snippetTimer.current);
          snippetTimer.current = null;
        }
      };
    }
  }, [isCurrentSnippetPlaying, currentSnippetIndex, snippets]);

  const resetSnippetTimer = () => {
    if (snippetTimer.current) {
      clearTimeout(snippetTimer.current);
      snippetTimer.current = null;
    }

    if (!playlistComplete && snippets.length > 0) {
      const currentSnippet = snippets[currentSnippetIndex];
      if (!currentSnippet) return;
      
      const snippetDuration = (currentSnippet.end_time - currentSnippet.start_time) * 1000;
      console.log(`Setting timer for snippet ${currentSnippetIndex + 1}, duration: ${snippetDuration}ms`);
      
      snippetTimer.current = setTimeout(() => {
        console.log(`Snippet ${currentSnippetIndex + 1} timer elapsed, advancing...`);
        advanceToNextSnippet();
      }, snippetDuration + 500); // Add 500ms buffer
    }
  };

  const advanceToNextSnippet = () => {
    if (currentSnippetIndex < snippets.length - 1) {
      setCurrentSnippetIndex(prevIndex => prevIndex + 1);
      setIsCurrentSnippetPlaying(true); // Keep playing when advancing
    } else {
      setPlaylistComplete(true);
      setIsCurrentSnippetPlaying(false);
    }
  };

  const handleSnippetEnd = () => {
    console.log("Snippet ended naturally, advancing...");
    advanceToNextSnippet();
  };

  const handleRestartPlaylist = () => {
    setCurrentSnippetIndex(0);
    setPlaylistComplete(false);
    setIsCurrentSnippetPlaying(false);
  };

  const setSnippetPlayingStatus = (isPlaying: boolean) => {
    console.log(`Setting snippet ${currentSnippetIndex + 1} playing status to: ${isPlaying}`);
    setIsCurrentSnippetPlaying(isPlaying);
  };

  return {
    currentSnippetIndex,
    playlistComplete,
    isCurrentSnippetPlaying,
    setCurrentSnippetIndex,
    handleSnippetEnd,
    handleRestartPlaylist,
    setPlaylistComplete,
    setSnippetPlayingStatus
  };
}
