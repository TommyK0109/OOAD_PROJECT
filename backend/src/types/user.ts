export interface UserType {
    id: string;
    username: string;
    email: string;
    password: string;
    avatar?: string;
    watchlist?: string[]; // Array of movie IDs
    createdAt: Date;
    updatedAt: Date;
  }