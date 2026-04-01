import { Post } from "../types/post";

export const mockPosts: Post[] = [
  {
    id: "1",
    authorName: "Musemallow",
    caption: "First post with images",
    createdAt: "2h ago",
    images: [
      { id: "img1", uri: "https://placehold.co/900x600" },
      { id: "img2", uri: "https://placehold.co/900x601" },
    ],
    videos: [],
    audios: [],
    likeCount: 12,
    commentCount: 3,
  },
  {
    id: "2",
    authorName: "Musemallow",
    caption: "Video test",
    createdAt: "5h ago",
    images: [],
    videos: [{ id: "vid1", uri: "", title: "Test Clip" }],
    audios: [],
    likeCount: 20,
    commentCount: 5,
  },
  {
    id: "3",
    authorName: "Musemallow",
    caption: "Full mixed media test",
    createdAt: "1d ago",
    images: [{ id: "img3", uri: "https://placehold.co/900x602" }],
    videos: [{ id: "vid2", uri: "", title: "Forest Signal" }],
    audios: [
      { id: "aud1", uri: "", title: "Voice Log", duration: "01:23" },
    ],
    likeCount: 40,
    commentCount: 9,
  },
];