export interface MovieType {
    id: string;
    title: string;
    originalTitle?: string;
    posterUrl: string;
    backdropUrl?: string;
    year?: number;
    rating?: string;
    ratingCount?: string;
    imdbRating?: string;
    imdbCount?: string;
    runtime?: string;
    overview?: string;
    genres?: string[];
    country?: string;
    episodes?: number;
    streamingServices?: string[];
    videoUrl?: string; // URL to the actual video file for playback
  }
  