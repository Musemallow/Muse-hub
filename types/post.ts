export type PostImage = {
  id: string;
  uri: string;
};

export type PostVideo = {
  id: string;
  uri: string;
  title?: string;
};

export type PostAudio = {
  id: string;
  uri: string;
  title?: string;
  duration?: string;
};

export type Post = {
  id: string;
  authorName: string;
  caption: string;
  createdAt: string;
  images: PostImage[];
  videos: PostVideo[];
  audios: PostAudio[];
  likeCount: number;
  commentCount: number;
  isDraft?: boolean;
};