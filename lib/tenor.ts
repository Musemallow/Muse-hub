import { ChannelMessage } from "../data/discussionThreads";

export type TenorGif = {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
};

type TenorResponse = {
  results?: {
    id: string;
    title?: string;
    content_description?: string;
    media_formats?: {
      gif?: { url?: string };
      tinygif?: { url?: string };
      nanogif?: { url?: string };
    };
  }[];
};

export async function searchTenorGifs(query: string): Promise<TenorGif[]> {
  const key = process.env.NEXT_PUBLIC_TENOR_API_KEY;
  if (!key) {
    throw new Error("Add NEXT_PUBLIC_TENOR_API_KEY to enable Tenor GIF search.");
  }

  const params = new URLSearchParams({
    key,
    q: query,
    limit: "12",
    media_filter: "gif,tinygif,nanogif",
    contentfilter: "medium",
  });
  const response = await fetch(`https://tenor.googleapis.com/v2/search?${params}`);

  if (!response.ok) {
    throw new Error("Tenor search failed.");
  }

  const data = (await response.json()) as TenorResponse;

  return (data.results ?? []).flatMap((result) => {
    const url = result.media_formats?.gif?.url;
    const previewUrl =
      result.media_formats?.tinygif?.url ??
      result.media_formats?.nanogif?.url ??
      url;

    if (!url || !previewUrl) return [];

    return [
      {
        id: result.id,
        title: result.content_description || result.title || "Tenor GIF",
        url,
        previewUrl,
      },
    ];
  });
}

export function tenorGifToAttachment(gif: TenorGif): ChannelMessage["attachment"] {
  return {
    type: "gif",
    label: gif.title || "Tenor GIF",
    url: gif.url,
  };
}
