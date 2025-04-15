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

export const fetchVideoData = async (videoId: string): Promise<{ title: string; uploader: string }> => {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (!response.ok) {
      throw new Error('Failed to fetch video data');
    }
    const data = await response.json();
    return {
      title: data.title,
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

export const getYoutubeVideoUrl = (videoId: string): string => {
  return `https://www.youtube.com/watch?v=${videoId}`;
};
