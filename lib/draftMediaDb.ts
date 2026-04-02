import { DraftPost } from "../types/createPost";

const STORAGE_KEY = "musehub-draft-posts";

export function getDraftPosts(): DraftPost[] {
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

export function saveDraftPosts(posts: DraftPost[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    console.error("Failed to save draft posts.");
  }
}

export function addDraftPost(post: DraftPost) {
  const existing = getDraftPosts();
  saveDraftPosts([post, ...existing]);
}

export function deleteDraftPost(draftId: string) {
  const existing = getDraftPosts();
  const updated = existing.filter((draft) => draft.id !== draftId);
  saveDraftPosts(updated);
}

export function clearDraftPosts() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.error("Failed to clear draft posts.");
  }
}

/**
 * Async aliases so your current FeedPage import style keeps working
 */
export async function getDraftPostsFromDb(): Promise<DraftPost[]> {
  return getDraftPosts();
}

export async function clearDraftPostsFromDb(): Promise<void> {
  clearDraftPosts();
}

export async function deleteDraftPostFromDb(draftId: string): Promise<void> {
  deleteDraftPost(draftId);
}