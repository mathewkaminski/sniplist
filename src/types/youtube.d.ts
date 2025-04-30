
declare namespace YT {
  interface Player {
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    getCurrentTime(): number;
    getDuration(): number;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    destroy(): void;
    getPlayerState(): PlayerState;
    getPlaybackRate(): number;
    setPlaybackRate(rate: number): void;
    getAvailablePlaybackRates(): number[];
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    getVolume(): number;
    setVolume(volume: number): void;
    getVideoLoadedFraction(): number;
    getVideoUrl(): string;
    getVideoEmbedCode(): string;
    getOptions(): string[];
    getOption(option: string): any;
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

  interface OnPlaybackRateChangeEvent {
    data: number;
  }

  interface PlayerOptions {
    videoId?: string;
    width?: string | number;
    height?: string | number;
    playerVars?: {
      autoplay?: number;
      cc_load_policy?: number;
      color?: string;
      controls?: number;
      disablekb?: number;
      enablejsapi?: number;
      end?: number;
      fs?: number;
      hl?: string;
      iv_load_policy?: number;
      list?: string;
      listType?: string;
      loop?: number;
      modestbranding?: number;
      origin?: string;
      playlist?: string;
      playsinline?: number;
      rel?: number;
      start?: number;
      widget_referrer?: string;
    };
    events?: {
      onReady?: (event: PlayerEvent) => void;
      onStateChange?: (event: OnStateChangeEvent) => void;
      onError?: (event: OnErrorEvent) => void;
      onPlaybackRateChange?: (event: OnPlaybackRateChangeEvent) => void;
      onPlaybackQualityChange?: (event: any) => void;
      onApiChange?: (event: any) => void;
    };
    host?: string;
  }

  interface PlayerConstructor {
    new (container: string | HTMLElement, options: PlayerOptions): Player;
  }
}

interface Window {
  YT: { 
    Player: YT.PlayerConstructor;
    PlayerState: typeof YT.PlayerState;
  };
  onYouTubeIframeAPIReady: () => void;
}
