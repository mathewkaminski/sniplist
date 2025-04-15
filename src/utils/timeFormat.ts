
export const formatTimeDisplay = (seconds: number): string => {
  // Round to whole number of seconds
  const totalSeconds = Math.floor(seconds);
  
  // Calculate minutes and remaining seconds
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  
  // Format as mm:ss or just ss if less than a minute
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${remainingSeconds}s`;
  }
};
