export type AspectRatio = '1:1' | '9:16' | '16:9' | '4:3' | '3:4';

export type Language = 'en' | 'ar';

export interface HistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
  baseImageUrl?: string | null;
  aspectRatio?: AspectRatio;
  style?: string;
}