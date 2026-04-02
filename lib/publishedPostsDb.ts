import { Post } from "../types/post";

const STORAGE_KEY = "musehub-published-posts";

export function getPublishedPosts(): Post[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch {
    return [];
  }
}

export function savePublishedPosts(posts: Post[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    console.error("Failed to save published posts.");
  }
}

export function addPublishedPost(post: Post) {
  const existing = getPublishedPosts();
  savePublishedPosts([post, ...existing]);
}

export function deletePublishedPost(postId: string) {
  const existing = getPublishedPosts();
  const updated = existing.filter((post) => post.id !== postId);
  savePublishedPosts(updated);
}

export async function getPublishedPostsFromDb(): Promise<Post[]> {
  return getPublishedPosts();
}

export async function savePublishedPostToDb(post: Post): Promise<void> {
  addPublishedPost(post);
}

export async function deletePublishedPostFromDb(postId: string): Promise<void> {
  deletePublishedPost(postId);
}