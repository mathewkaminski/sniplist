
export const formatTimeDisplay = (seconds: number): string => {
  // Round to whole number of seconds
  const totalSeconds = Math.floor(seconds);
  
  // Calculate minutes and remaining seconds
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  
  // Always format as mm:ss
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

