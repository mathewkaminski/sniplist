
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

  interface PlayerOptions {
    videoId: string;
    events?: {
      onReady?: () => void;
      onStateChange?: (event: { data: PlayerState }) => void;
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
