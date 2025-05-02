export interface Movie {
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
}
