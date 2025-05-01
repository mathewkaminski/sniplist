export interface Snippet {
  id: string;
  video_id: string;
  start_time: number;
  end_time: number;
  title?: string;
  comments?: string;
  sniplist_id?: string;
}

export interface Sniplist {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  error: Error | null;
  networkState: 'online' | 'offline';
} 