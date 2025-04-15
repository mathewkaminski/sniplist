
export interface Snippet {
  id: string;
  title: string;
  video_id: string;
  start_time: number;
  end_time: number;
  comments?: string;
  youtube_title?: string;
  sniplist_id?: string;
}

export interface SniplistPlayerProps {
  sniplistId: string;
  onClose: () => void;
}
