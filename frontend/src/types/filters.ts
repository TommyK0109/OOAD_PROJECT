export interface MovieFilters {
    releaseYear?: string;
    genres?: string[];
    rating?: string;
    mediaType?: 'movie' | 'tvshow' | 'all';
    country?: string;
    sortBy?: string;
}
  