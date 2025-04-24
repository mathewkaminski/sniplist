
declare namespace YT {
  interface Player {
    playVideo(): void;
    pauseVideo(): void;
    getCurrentTime(): number;
    getDuration(): number;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    destroy(): void;
  }

  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5
  }

  interface PlayerEvent {
    target: Player;
  }

  interface OnStateChangeEvent {
    data: PlayerState;
  }

  interface OnErrorEvent {
    data: number;
  }

  interface PlayerOptions {
    videoId: string;
    height?: string | number;
    width?: string | number;
    playerVars?: {
      autoplay?: number;
      controls?: number;
      disablekb?: number;
      fs?: number;
      rel?: number;
      modestbranding?: number;
      playsinline?: number;
      start?: number;
    };
    events?: {
      onReady?: (event: PlayerEvent) => void;
      onStateChange?: (event: OnStateChangeEvent) => void;
      onError?: (event: OnErrorEvent) => void;
    };
  }

  interface PlayerConstructor {
    new (elementId: string, options: PlayerOptions): Player;
  }
}

interface Window {
  YT: { Player: YT.PlayerConstructor };
  onYouTubeIframeAPIReady: () => void;
}
