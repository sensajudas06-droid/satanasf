export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;

  const cleanText = content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const wordCount = cleanText.split(' ').filter(word => word.length > 0).length;

  const minutes = Math.ceil(wordCount / wordsPerMinute);

  return Math.max(1, minutes);
}

export function formatReadingTime(minutes: number): string {
  if (minutes === 1) {
    return '1 dk okuma';
  }
  return `${minutes} dk okuma`;
}
