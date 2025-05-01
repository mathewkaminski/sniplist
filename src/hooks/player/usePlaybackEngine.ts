import { useRef, useState, useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { toast } from 'sonner';

interface PlaybackEngineOptions {
  onError?: (error: Error) => void;
  onStateChange?: (state: PlaybackState) => void;
  bufferStrategy?: 'aggressive' | 'conservative';
  mobileOptimized?: boolean;
}

export interface PlaybackState {
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  error: Error | null;
  networkState: 'online' | 'offline';
}

export function usePlaybackEngine(options: PlaybackEngineOptions = {}) {
  const {
    onError,
    onStateChange,
    bufferStrategy = 'aggressive',
    mobileOptimized = true
  } = options;

  const playerRef = useRef<YT.Player | null>(null);
  const preloadPlayerRef = useRef<YT.Player | null>(null);
  const retryAttemptsRef = useRef(0);
  const networkStatus = useNetworkStatus();
  
  const [state, setState] = useState<PlaybackState>({
    isPlaying: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    error: null,
    networkState: 'online'
  });

  // Initialize players
  useEffect(() => {
    initializeMainPlayer();
    if (bufferStrategy === 'aggressive') {
      initializePreloadPlayer();
    }

    return () => {
      cleanup();
    };
  }, []);

  // Network status monitoring
  useEffect(() => {
    if (networkStatus === 'online' && state.isPlaying) {
      handleNetworkRecovery();
    } else if (networkStatus === 'offline') {
      handleNetworkLoss();
    }
  }, [networkStatus]);

  const initializeMainPlayer = async () => {
    try {
      // Enhanced initialization with retry logic
      const player = await createYouTubePlayer('main-player', {
        events: {
          onReady: handlePlayerReady,
          onStateChange: handlePlayerStateChange,
          onError: handlePlayerError,
        },
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        }
      });

      playerRef.current = player;
    } catch (error) {
      handleError(new Error('Failed to initialize player'));
    }
  };

  const initializePreloadPlayer = async () => {
    try {
      const player = await createYouTubePlayer('preload-player', {
        events: {
          onReady: () => console.log('Preload player ready'),
          onError: handlePreloadError,
        },
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          mute: 1,
        }
      });

      preloadPlayerRef.current = player;
    } catch (error) {
      console.warn('Preload player initialization failed:', error);
    }
  };

  const handlePlayerReady = () => {
    if (mobileOptimized) {
      applyMobileOptimizations();
    }
  };

  const handlePlayerStateChange = (event: YT.OnStateChangeEvent) => {
    const newState = event.data;
    
    setState(prev => ({
      ...prev,
      isBuffering: newState === YT.PlayerState.BUFFERING,
      isPlaying: newState === YT.PlayerState.PLAYING,
    }));

    onStateChange?.(state);
  };

  const handlePlayerError = async (event: YT.OnErrorEvent) => {
    const error = new Error(`Player error: ${event.data}`);
    
    if (retryAttemptsRef.current < 3) {
      retryAttemptsRef.current++;
      await retryPlayback();
    } else {
      handleError(error);
    }
  };

  const retryPlayback = async () => {
    const delay = Math.min(1000 * Math.pow(2, retryAttemptsRef.current), 8000);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      await initializeMainPlayer();
    } catch (error) {
      handleError(new Error('Retry failed'));
    }
  };

  const handleError = (error: Error) => {
    setState(prev => ({ ...prev, error }));
    onError?.(error);
    toast.error(error.message);
  };

  const applyMobileOptimizations = () => {
    if (!playerRef.current) return;

    // Set lower quality on mobile for better performance
    playerRef.current.setPlaybackQuality('small');
    
    // Reduce buffer size on mobile
    if (bufferStrategy === 'conservative') {
      // @ts-ignore - Internal YouTube player API
      playerRef.current.setOption('bufferSize', 'small');
    }
  };

  const preloadNextVideo = async (videoId: string, startTime: number) => {
    if (!preloadPlayerRef.current) return;

    try {
      await preloadPlayerRef.current.loadVideoById({
        videoId,
        startSeconds: startTime,
      });
      preloadPlayerRef.current.mute();
      preloadPlayerRef.current.playVideo();
      
      // Pause after buffer
      setTimeout(() => {
        if (preloadPlayerRef.current) {
          preloadPlayerRef.current.pauseVideo();
        }
      }, 2000);
    } catch (error) {
      console.warn('Preload failed:', error);
    }
  };

  const cleanup = () => {
    if (playerRef.current) {
      playerRef.current.destroy();
    }
    if (preloadPlayerRef.current) {
      preloadPlayerRef.current.destroy();
    }
  };

  return {
    state,
    player: playerRef.current,
    preloadNextVideo,
    retryPlayback,
    cleanup,
  };
} 