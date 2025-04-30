
import { useEffect, useState, useRef } from 'react';

export function useYouTubeAPI() {
  const [isAPIReady, setIsAPIReady] = useState(false);
  const apiLoadedRef = useRef(false);
  const apiLoadAttemptedRef = useRef(false);
  const checkIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      setIsAPIReady(true);
      return;
    }

    // Set up interval to check for API readiness
    if (!checkIntervalRef.current) {
      checkIntervalRef.current = window.setInterval(() => {
        if (window.YT && window.YT.Player) {
          setIsAPIReady(true);
          if (checkIntervalRef.current) {
            window.clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
          }
        }
      }, 250);
    }

    // Load the API if not already loading
    if (!apiLoadedRef.current && !apiLoadAttemptedRef.current) {
      apiLoadAttemptedRef.current = true;
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

    return () => {
      if (checkIntervalRef.current) {
        window.clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, []);

  return {
    isAPIReady
  };
}
