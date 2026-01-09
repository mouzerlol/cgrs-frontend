import { useQuery } from '@tanstack/react-query';
import { getNewsArticles } from '@/lib/api/news';

export function useNews(options?: { limit?: number; category?: string; featured?: boolean }) {
  return useQuery({
    queryKey: ['news', options],
    queryFn: () => getNewsArticles(options),
  });
}
