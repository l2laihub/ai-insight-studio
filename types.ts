
export interface NewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
  type: 'article' | 'video';
}

export type Tab = 'news' | 'generate' | 'edit';

export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SavedNews {
  id: string;
  timestamp: number;
  text: string;
  sources: GroundingSource[];
  topics: string[];
  infographicUrl?: string;
}
