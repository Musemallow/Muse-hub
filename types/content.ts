export type PostMediaKind = "image" | "video" | "audio";

export type PostMediaItem = {
  id: string;
  kind: PostMediaKind;
  url: string;
  name: string;
  contentType: string;
};

export type FeedPost = {
  id: string;
  creatorId: string;
  authorName: string;
  title: string;
  content: string;
  media: PostMediaItem[];
  visibility: "public" | "members" | "premium";
  publishedAt: string;
  likeCount: number;
  commentCount: number;
  viewerHasLiked?: boolean;
};

export type PostComment = {
  id: string;
  authorName: string;
  username: string;
  content: string;
  createdAt: string;
};
