export interface Memory {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  date: string;
  rotation: number; // For that messy "tossed on table" look
  swayClass?: string; // For the hanging animation
}

export interface GeneratedContent {
  title: string;
  description: string;
}
