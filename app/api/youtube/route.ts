import { NextResponse } from "next/server";

const CHANNEL_HANDLE = "@TheCuriousClassroom-s2s";
const API_BASE = "https://www.googleapis.com/youtube/v3";

type ChannelResponse = {
  items?: {
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }[];
};

type Thumbnail = {
  url: string;
};

type PlaylistResponse = {
  items?: {
    snippet?: {
      title?: string;
      resourceId?: {
        videoId?: string;
      };
      thumbnails?: {
        maxres?: Thumbnail;
        standard?: Thumbnail;
        high?: Thumbnail;
        medium?: Thumbnail;
        default?: Thumbnail;
      };
    };
    status?: {
      privacyStatus?: string;
    };
  }[];
};

async function youtubeRequest<T>(
  endpoint: string,
  params: Record<string, string>,
  apiKey: string
): Promise<T> {
  const query = new URLSearchParams({
    ...params,
    key: apiKey,
  });

  const response = await fetch(`${API_BASE}/${endpoint}?${query}`, {
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    // Do not expose the API key or upstream response to visitors.
    throw new Error(`YouTube API returned ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: "YouTube API key is not configured." },
      { status: 503 }
    );
  }

  try {
    // Resolve the channel's uploads playlist.
    const channel = await youtubeRequest<ChannelResponse>(
      "channels",
      {
        part: "contentDetails",
        forHandle: CHANNEL_HANDLE,
      },
      apiKey
    );

    const uploadsId =
      channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsId) {
      return NextResponse.json(
        { error: "YouTube channel could not be found." },
        { status: 502 }
      );
    }

    // Fetch recent uploads in playlist order.
    const playlist = await youtubeRequest<PlaylistResponse>(
      "playlistItems",
      {
        part: "snippet,status",
        playlistId: uploadsId,
        maxResults: "15",
      },
      apiKey
    );

    if (!Array.isArray(playlist.items)) {
      throw new Error("Invalid YouTube response");
    }

    const seen = new Set<string>();

    const videos = playlist.items.flatMap((item) => {
      const snippet = item.snippet;
      const id = snippet?.resourceId?.videoId;
      const title = snippet?.title;
      const thumbnails = snippet?.thumbnails;

      const thumbnail =
        thumbnails?.maxres?.url ??
        thumbnails?.standard?.url ??
        thumbnails?.high?.url ??
        thumbnails?.medium?.url ??
        thumbnails?.default?.url;

      if (
        item.status?.privacyStatus !== "public" ||
        !id ||
        !title ||
        !thumbnail ||
        seen.has(id)
      ) {
        return [];
      }

      seen.add(id);

      return [
        {
          id,
          title,
          thumbnail,
          url: `https://www.youtube.com/watch?v=${id}`,
        },
      ];
    });

    return NextResponse.json(videos.slice(0, 3));
  } catch {
    return NextResponse.json(
      { error: "Unable to load YouTube videos right now." },
      { status: 502 }
    );
  }
}