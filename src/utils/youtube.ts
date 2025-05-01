import { toast } from 'sonner';

export const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

export const isValidYouTubeUrl = (url: string): boolean => {
  return extractYouTubeId(url) !== null;
};

export const cleanVideoTitle = (title: string): string => {
  // Remove "Official Video" or "Official Audio" and surrounding characters
  return title
    .replace(/[^\s]{0,2}Official Video[^\s]{0,2}/g, '')
    .replace(/[^\s]{0,2}Official Audio[^\s]{0,2}/g, '')
    .trim();
};

export const fetchVideoData = async (videoId: string): Promise<{ title: string; uploader: string }> => {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (!response.ok) {
      throw new Error('Failed to fetch video data');
    }
    const data = await response.json();
    return {
      title: cleanVideoTitle(data.title),
      uploader: data.author_name
    };
  } catch (error) {
    console.error('Error fetching video data:', error);
    return {
      title: 'Untitled Video',
      uploader: 'Unknown'
    };
  }
};

export function getYoutubeVideoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export async function createYouTubePlayer(
  elementId: string,
  options: YT.PlayerOptions
): Promise<YT.Player> {
  return new Promise((resolve, reject) => {
    try {
      const player = new YT.Player(elementId, {
        ...options,
        events: {
          ...options.events,
          onReady: (event) => {
            options.events?.onReady?.(event);
            resolve(player);
          },
          onError: (event) => {
            options.events?.onError?.(event);
            reject(new Error(`YouTube player error: ${event.data}`));
          },
        },
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function handleYouTubeError(error: YT.OnErrorEvent): void {
  const errorMessages: Record<number, string> = {
    2: 'Invalid video parameter',
    5: 'HTML5 player error',
    100: 'Video not found',
    101: 'Embedding not allowed',
    150: 'Embedding not allowed',
  };

  const message = errorMessages[error.data] || 'Unknown error occurred';
  toast.error(message);
}
