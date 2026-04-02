export type DraftMediaFile = {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

export type DraftPost = {
  id: string;
  caption: string;
  images: DraftMediaFile[];
  videos: DraftMediaFile[];
  audios: DraftMediaFile[];
  createdAt: string;
};