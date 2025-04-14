
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
    // Using a different API key - the previous ones weren't working
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=AIzaSyBtL6-crDXNdpxlbmzRfwi27IaFyRrKlBY`);
    const data = await response.json();
    
    if (data.error) {
      console.error('YouTube API error:', data.error);
      return 'Untitled Video';
    }
    
    if (data.items && data.items.length > 0) {
      return data.items[0].snippet.title;
    }
    
    return 'Untitled Video';
  } catch (error) {
    console.error('Error fetching video title:', error);
    return 'Untitled Video';
  }
};
