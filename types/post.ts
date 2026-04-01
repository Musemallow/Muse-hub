export type ImageAttachment = {
  id: string;
  uri: string;
};

export type VideoAttachment = {
  id: string;
  uri: string;
  title?: string;
};

export type AudioAttachment = {
  id: string;
  uri: string;
  title?: string;
  duration?: string;
};

export type Post = {
  id: string;
  authorName: string;
  authorAvatar?: string;
  caption: string;
  createdAt: string;
  images: ImageAttachment[];
  videos: VideoAttachment[];
  audios: AudioAttachment[];
  likeCount: number;
  commentCount: number;
};