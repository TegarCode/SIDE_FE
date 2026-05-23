export type TutorialPlaylistApiItem = {
  id?: number | string;
  slug?: string;
  title?: string;
  url?: string;
  desc?: string;
  description?: string;
  thumbnail_url?: string;
  thumbnail?: string;
};

export type TutorialPlaylistItem = {
  id: string;
  slug: string;
  title: string;
  url: string;
  description: string;
  thumbnail: string | null;
};

export type HomeFeature = {
  title: string;
  description: string;
};

export type HomePainPoint = {
  title: string;
  description: string;
};

export type HomeSector = {
  title: string;
  imageUrl: string;
  description: string;
};

export type AnalyticsHistoryItem = {
  label: string;
  views: number;
};

export type AnalyticsOverview = {
  history: AnalyticsHistoryItem[];
  avgPerPeriod: number;
};

export type ContactMessageType = "PERTANYAAN" | "MASUKAN" | "SARAN";

export type ContactFormPayload = {
  nama: string;
  email: string;
  jenis: ContactMessageType;
  pesan: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqTopic = {
  topic: string;
  summary?: string;
  isFeatured?: boolean;
  items: FaqItem[];
};
