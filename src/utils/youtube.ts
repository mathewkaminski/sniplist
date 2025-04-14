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

export const fetchVideoTitle = async (videoId: string): Promise<string> => {
  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=AIzaSyC3HN2pHvZxTGgmHjl97x7wKtxsJz5p-zc`);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items[0].snippet.title;
    }
    
    return 'Untitled Video';
  } catch (error) {
    console.error('Error fetching video title:', error);
    return 'Untitled Video';
  }
};
