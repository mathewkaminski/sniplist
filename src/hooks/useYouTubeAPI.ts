
import { useEffect, useRef } from 'react';

export function useYouTubeAPI() {
  const apiLoaded = useRef(false);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  return {
    isAPIReady: Boolean(window.YT && window.YT.Player)
  };
}
