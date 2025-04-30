
import { toast } from "sonner";

// Special handling for mobile YouTube playback challenges
export class MobileYouTubeAdapter {
  private player: YT.Player;
  private startTime: number;
  private endTime: number;
  private isPlaying: boolean = false;
  private retryAttempts: number = 0;
  private maxRetries: number = 5;
  private playMonitorInterval: number | null = null;
  private stateCheckInterval: number | null = null;
  
  constructor(player: YT.Player, startTime: number, endTime: number) {
    this.player = player;
    this.startTime = startTime;
    this.endTime = endTime;
    this.setupStateMonitoring();
  }

  // Set up continuous state monitoring for mobile
  private setupStateMonitoring() {
    if (this.stateCheckInterval) {
      window.clearInterval(this.stateCheckInterval);
    }
    
    // Check player state frequently on mobile
    this.stateCheckInterval = window.setInterval(() => {
      try {
        if (!this.player) return;
        
        const currentTime = this.player.getCurrentTime();
        const playerState = this.player.getPlayerState();
        
        // Debug logging
        console.log(`Mobile monitor: time=${currentTime.toFixed(2)}, state=${playerState}, playing=${this.isPlaying}`);
        
        // Check if we've reached the end
        if (currentTime >= this.endTime - 0.15) {
          console.log("Mobile adapter: Reached end time, stopping playback");
          this.stop();
        }
        
        // Auto-recovery for stalled playback
        if (this.isPlaying && playerState !== YT.PlayerState.PLAYING && 
            playerState !== YT.PlayerState.BUFFERING) {
          this.recoverPlayback();
        }
      } catch (e) {
        console.error("Error in mobile state monitoring:", e);
      }
    }, 300); // Check every 300ms
  }
  
  // Play video with enhanced mobile retry logic
  public play(): Promise<boolean> {
    return new Promise((resolve) => {
      this.isPlaying = true;
      this.retryAttempts = 0;
      
      console.log(`Mobile adapter: Playing from ${this.startTime}`);
      this.seekAndPlay(resolve);
    });
  }
  
  // Enhanced seek + play with retries specifically for mobile
  private seekAndPlay(resolve: (success: boolean) => void) {
    try {
      // First seek to the start time
      this.player.seekTo(this.startTime, true);
      
      // Give the player a moment to seek
      setTimeout(() => {
        try {
          // Then try to play
          this.player.playVideo();
          
          // Check if playback actually started
          setTimeout(() => {
            try {
              const playerState = this.player.getPlayerState();
              
              if (playerState === YT.PlayerState.PLAYING) {
                console.log("Mobile adapter: Playback started successfully");
                this.startPlaybackMonitoring();
                resolve(true);
              } else {
                this.handlePlaybackFailure(resolve);
              }
            } catch (e) {
              console.error("Error in play verification:", e);
              this.handlePlaybackFailure(resolve);
            }
          }, 500);
        } catch (e) {
          console.error("Error playing video:", e);
          this.handlePlaybackFailure(resolve);
        }
      }, 200);
    } catch (e) {
      console.error("Error seeking video:", e);
      this.handlePlaybackFailure(resolve);
    }
  }
  
  // Handle failure with retry logic
  private handlePlaybackFailure(resolve: (success: boolean) => void) {
    this.retryAttempts++;
    
    if (this.retryAttempts <= this.maxRetries) {
      console.log(`Mobile adapter: Retry attempt ${this.retryAttempts}/${this.maxRetries}`);
      // Exponential backoff for retries
      const delay = Math.min(200 * Math.pow(1.5, this.retryAttempts), 3000);
      
      setTimeout(() => {
        this.seekAndPlay(resolve);
      }, delay);
    } else {
      console.log("Mobile adapter: Max retries reached, giving up");
      toast.error("Playback failed. Try tapping play again.");
      this.isPlaying = false;
      resolve(false);
    }
  }
  
  // Recover stalled playback
  private recoverPlayback() {
    try {
      console.log("Mobile adapter: Attempting to recover stalled playback");
      const currentTime = this.player.getCurrentTime();
      
      // Only recover if we're not at the end
      if (currentTime < this.endTime - 0.5) {
        this.player.playVideo();
      }
    } catch (e) {
      console.error("Error in playback recovery:", e);
    }
  }
  
  // Start continuous playback monitoring
  private startPlaybackMonitoring() {
    if (this.playMonitorInterval) {
      window.clearInterval(this.playMonitorInterval);
    }
    
    this.playMonitorInterval = window.setInterval(() => {
      try {
        if (!this.isPlaying || !this.player) {
          this.stopPlaybackMonitoring();
          return;
        }
        
        const currentTime = this.player.getCurrentTime();
        
        // Check if we've reached the end time
        if (currentTime >= this.endTime - 0.15) {
          console.log(`Mobile adapter: Reached end time (${currentTime.toFixed(2)} >= ${this.endTime.toFixed(2)})`);
          this.stop();
        }
      } catch (e) {
        console.error("Error in playback monitoring:", e);
      }
    }, 200);
  }
  
  // Stop playback monitoring
  private stopPlaybackMonitoring() {
    if (this.playMonitorInterval) {
      window.clearInterval(this.playMonitorInterval);
      this.playMonitorInterval = null;
    }
  }
  
  // Pause video
  public pause() {
    try {
      this.isPlaying = false;
      this.player.pauseVideo();
      this.stopPlaybackMonitoring();
      console.log("Mobile adapter: Playback paused");
    } catch (e) {
      console.error("Error pausing video:", e);
    }
  }
  
  // Stop video (pause and report ended)
  public stop() {
    try {
      this.isPlaying = false;
      this.player.pauseVideo();
      this.stopPlaybackMonitoring();
      console.log("Mobile adapter: Playback stopped");
    } catch (e) {
      console.error("Error stopping video:", e);
    }
  }
  
  // Clean up resources
  public destroy() {
    this.isPlaying = false;
    this.stopPlaybackMonitoring();
    
    if (this.stateCheckInterval) {
      window.clearInterval(this.stateCheckInterval);
      this.stateCheckInterval = null;
    }
    
    console.log("Mobile adapter: Resources cleaned up");
  }
  
  // Update time boundaries
  public updateTimeBounds(startTime: number, endTime: number) {
    this.startTime = startTime;
    this.endTime = endTime;
    console.log(`Mobile adapter: Updated time bounds to ${startTime}-${endTime}`);
  }
  
  // Get current playback status
  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}
