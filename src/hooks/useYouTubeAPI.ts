
import { useEffect, useState, useRef } from 'react';

export function useYouTubeAPI() {
  const [isAPIReady, setIsAPIReady] = useState(false);
  const apiLoadedRef = useRef(false);

  useEffect(() => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      setIsAPIReady(true);
      return;
    }

    // Load the API if not already loading
    if (!apiLoadedRef.current) {
      apiLoadedRef.current = true;

      // Save the original callback if it exists
      const originalCallback = window.onYouTubeIframeAPIReady;

      // Set up our callback to run after the API loads
      window.onYouTubeIframeAPIReady = () => {
        setIsAPIReady(true);
        // Call the original callback if it existed
        if (typeof originalCallback === 'function') {
          originalCallback();
        }
      };

      // Load the YouTube API script
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  return {
    isAPIReady
  };
}
