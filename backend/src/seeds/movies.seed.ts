import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// Movie data matching your frontend mockMovies
const movieData = [
  {
    id: '1',
    title: 'Angels and Demons',
    posterUrl: 'https://images.justwatch.com/poster/244160758/s166/angels-and-demons.avif',
    year: 2009,
    rating: 'R18+',
    genres: ['Action', 'Thriller'],
    overview: 'When Robert Langdon discovers evidence of the resurgence of an ancient secret brotherhood known as the Illuminati, he also faces a deadly threat to the existence of the secret organization\'s most despised enemy: the Catholic Church.',
    runtime: '138min',
    country: 'United States',
    imdbRating: '6.7',
    imdbCount: '(297k)',
    ratingCount: '(1.2k)',
    streamingServices: ['Netflix', 'Amazon Prime'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' },
      { resolution: '1080p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' }
    ]
  },
  {
    id: '2',
    title: 'Minecraft Movie',
    posterUrl: 'https://images.justwatch.com/poster/328203307/s166/a-minecraft-movie.avif',
    year: 2025,
    rating: 'PG',
    genres: ['Fantasy', 'Comedy', 'Animation'],
    overview: 'A live-action adaptation of the popular video game Minecraft, following players as they navigate the pixelated world filled with adventure, creativity, and endless possibilities.',
    runtime: '110min',
    country: 'United States',
    imdbRating: '7.2',
    imdbCount: '(15k)',
    ratingCount: '(500)',
    streamingServices: ['Warner Bros'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://www.youtube.com/watch?v=wJO_vIDZn-I' },
      { resolution: '1080p', streamUrl: 'https://www.youtube.com/watch?v=wJO_vIDZn-I' }
    ]
  },
  {
    id: '3',
    title: 'Family Guy',
    posterUrl: 'https://images.justwatch.com/poster/242592844/s166/family-guy.avif',
    year: 1999,
    rating: 'TV-MA',
    genres: ['Animation', 'Comedy'],
    overview: 'The satiric adventures of a working-class family in the misfit city of Quahog. Patriarch Peter Griffin, his wife Lois, and their three kids Meg, Chris and Stewie.',
    runtime: '22min',
    country: 'United States',
    episodes: 400,
    imdbRating: '8.1',
    imdbCount: '(320k)',
    ratingCount: '(15k)',
    streamingServices: ['Hulu', 'Fox'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4' },
      { resolution: '1080p', streamUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4' }
    ]
  },
  {
    id: '4',
    title: 'Solo Leveling',
    originalTitle: '俺だけレベルアップな件',
    posterUrl: 'https://images.justwatch.com/poster/310154566/s166/solo-leveling.avif',
    backdropUrl: 'https://images.justwatch.com/poster/321046122/s332/season-2.avif',
    year: 2024,
    rating: '78%',
    ratingCount: '(79)',
    imdbRating: '7.0',
    imdbCount: '(1k)',
    runtime: '23min',
    overview: 'The story follows a skilled warrior who can parry any attack, making him virtually invincible in battle. After defeating the demon king, he seeks a peaceful life as an adventurer but finds that his reputation and abilities continue to draw him into conflict.',
    genres: ['Action & Adventure', 'Fantasy', 'Animation', 'Japanese Anime'],
    country: 'South Japan',
    episodes: 12,
    streamingServices: ['Netflix'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://www.youtube.com/watch?v=QTxvzkwVsQE' },
      { resolution: '1080p', streamUrl: 'https://www.youtube.com/watch?v=QTxvzkwVsQE' }
    ]
  },
  {
    id: '5', 
    title: 'MobLand',
    posterUrl: 'https://images.justwatch.com/poster/326902644/s166/mobland.avif',
    year: 2025,
    rating: 'TV-MA',
    genres: ['Drama', 'Crime'],
    overview: 'Movie description goes here...',
    runtime: '120min',
    country: 'United States',
    imdbRating: '8.5',
    imdbCount: '(28k)',
    ratingCount: '(500)',
    streamingServices: ['Netflix'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://example.com/video-720p.mp4' },
      { resolution: '1080p', streamUrl: 'https://example.com/video-1080p.mp4' }
    ]
  },
  {
    id: '6',
    title: 'The Flash',
    posterUrl: 'https://images.justwatch.com/poster/304477580/s166/the-flash.avif',
    year: 2023,
    rating: 'TV-14',
    genres: ['Action', 'Adventure', 'Drama'],
    overview: 'Barry Allen, a forensic scientist with a knack for solving crimes, gains super-speed powers after a particle accelerator explosion. He uses his abilities to fight crime and protect Central City as The Flash.',
    runtime: '42min',
    country: 'United States',
    imdbRating: '7.6',
    imdbCount: '(500k)',
    ratingCount: '(20k)',
    streamingServices: ['Netflix', 'Amazon Prime'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' },
      { resolution: '1080p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' }
    ]
  },
  {
    id: '7',
    title: 'Mission: Impossible - Dead Reckoning Part One',
    posterUrl: 'https://images.justwatch.com/poster/305409535/s166/mission-impossible-7.avif',
    year: 2023,
    rating: 'TV-14',
    genres: ['Action', 'Adventure', 'Drama'],
    overview: 'Barry Allen, a forensic scientist with a knack for solving crimes, gains super-speed powers after a particle accelerator explosion. He uses his abilities to fight crime and protect Central City as The Flash.',
    runtime: '42min',
    country: 'United States',
    imdbRating: '7.6',
    imdbCount: '(500k)',
    ratingCount: '(20k)',
    streamingServices: ['Netflix', 'Amazon Prime'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' },
      { resolution: '1080p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' }
    ]
  },
  {
    id: '8',
    title: 'The Marvels',
    posterUrl: 'https://images.justwatch.com/poster/244761547/s166/captain-marvel-2.avif',
    year: 2023,
    rating: 'PG-13',
    genres: ['Action', 'Adventure', 'Fantasy'],
    overview: 'Carol Danvers, Kamala Khan, and Monica Rambeau team up to face a cosmic threat that could destroy the universe.',
    runtime: '105min',
    country: 'United States',
    imdbRating: '6.5',
    imdbCount: '(200k)',
    ratingCount: '(10k)',
    streamingServices: ['Disney+'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' },
      { resolution: '1080p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' }
    ]
  },
  {
    id: '9',
    title: 'Dead Silence',
    posterUrl: 'https://images.justwatch.com/poster/305169754/s166/dead-silence.avif',
    year: 2023,
    rating: 'R',
    genres: ['Horror', 'Mystery', 'Thriller'],
    overview: 'A young couple discovers a sinister secret about their new home and must confront the malevolent force that lurks within.',
    runtime: '90min',
    country: 'United States',
    imdbRating: '5.8',
    imdbCount: '(50k)',
    ratingCount: '(5k)',
    streamingServices: ['HBO Max'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' },
      { resolution: '1080p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' }
    ]
  },
  {
    id: '10',
    title: 'Detective Conan',
    posterUrl: 'https://images.justwatch.com/poster/255380311/s166/detective-conan.avif',
    year: 2023,
    rating: 'PG',
    genres: ['Animation', 'Mystery', 'Adventure'],
    overview: 'A young detective is transformed into a child after being poisoned, but continues to solve crimes with the help of his friends.',
    runtime: '24min',
    country: 'Japan',
    imdbRating: '8.6',
    imdbCount: '(100k)',
    ratingCount: '(20k)',
    streamingServices: ['Crunchyroll'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' },
      { resolution: '1080p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' }
    ]
  },
  {
    id: '11',
    title: 'Final Destination 5',
    posterUrl: 'https://images.justwatch.com/poster/123473714/s166/final-destination-5.avif',
    year: 2011,
    rating: 'R',
    genres: ['Horror', 'Thriller'],
    overview: 'A group of people escape a deadly bridge collapse, only to find that Death is still after them.',
    runtime: '92min',
    country: 'United States',
    imdbRating: '5.9',
    imdbCount: '(100k)',
    ratingCount: '(10k)',
    streamingServices: ['HBO Max'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' },
      { resolution: '1080p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' }
    ]
  },
  {
    id: '12',
    title: 'Game of Thrones',
    posterUrl: 'https://images.justwatch.com/poster/297859466/s166/game-of-thrones.avif',
    year: 2011,
    rating: 'TV-MA',
    genres: ['Drama', 'Fantasy', 'Adventure'],
    overview: 'Nine noble families fight for control over the mythical land of Westeros, while an ancient enemy returns after being dormant for millennia.',
    runtime: '57min',
    country: 'United States',
    imdbRating: '9.3',
    imdbCount: '(2M)',
    ratingCount: '(500k)',
    streamingServices: ['HBO Max'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' },
      { resolution: '1080p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' }
    ]
  },
  {
    id: '13',
    title: 'Arcane',
    posterUrl: 'https://images.justwatch.com/poster/255388636/s166/arcane.avif',
    year: 2021,
    rating: 'TV-14',
    genres: ['Animation', 'Action', 'Adventure'],
    overview: 'Set in the universe of League of Legends, Arcane explores the origins of iconic characters and the delicate balance between the rich city of Piltover and the oppressed underground of Zaun.',
    runtime: '40min',
    country: 'United States',
    imdbRating: '9.4',
    imdbCount: '(200k)',
    ratingCount: '(50k)',
    streamingServices: ['Netflix'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' },
      { resolution: '1080p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' }
    ]
  },
  {
    id: '14',
    title: 'The Boys',
    posterUrl: 'https://images.justwatch.com/poster/203606186/s166/the-boys.avif',
    year: 2019,
    rating: 'TV-MA',
    genres: ['Action', 'Comedy', 'Drama'],
    overview: 'In a world where superheroes abuse their powers, a group of vigilantes known as "The Boys" set out to take them down.',
    runtime: '60min',
    country: 'United States',
    imdbRating: '8.7',
    imdbCount: '(500k)',
    ratingCount: '(100k)',
    streamingServices: ['Amazon Prime Video'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' },
      { resolution: '1080p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' }
    ]
  },
  {
    id: '15',
    title: 'Doctor Who',
    posterUrl: 'https://images.justwatch.com/poster/328945946/s166/doctor-who-2023.avif',
    year: 2023,
    rating: 'TV-PG',
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    overview: 'The Doctor, a Time Lord from the planet Gallifrey, travels through time and space in the TARDIS, a time machine that looks like a British police box.',
    runtime: '50min',
    country: 'United Kingdom',
    imdbRating: '8.6',
    imdbCount: '(300k)',
    ratingCount: '(50k)',
    streamingServices: ['BBC iPlayer'],
    qualities: [
      { resolution: '720p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' },
      { resolution: '1080p', streamUrl: 'https://www.youtube.com/watch?v=UWMzKXsY9A4' }
    ]
  }
];

export async function seedMovies() {
  try {
    const Movie = mongoose.model('Movie');
    
    // Clear existing movies
    await Movie.deleteMany({});
    logger.info('Cleared existing movies');
    
    // Insert seed movies
    const insertedMovies = await Movie.insertMany(movieData);
    logger.info(`Inserted ${insertedMovies.length} movies`);
    
    // Log the inserted movies for verification
    insertedMovies.forEach(movie => {
      logger.info(`- ${movie.title} (${movie.year})`);
    });
    
    return insertedMovies;
  } catch (error) {
    logger.error('Error seeding movies:', error);
    throw error;
  }
}

export async function seedCategoriesForCompatibility() {
  try {
    const Category = mongoose.model('Category');
    
    // Create some basic categories for backward compatibility
    const categories = [
      { name: 'Action', description: 'Action movies and shows' },
      { name: 'Comedy', description: 'Comedy movies and shows' },
      { name: 'Drama', description: 'Drama movies and shows' },
      { name: 'Fantasy', description: 'Fantasy movies and shows' },
      { name: 'Animation', description: 'Animated movies and shows' },
      { name: 'Thriller', description: 'Thriller movies and shows' }
    ];
    
    // Clear existing categories
    await Category.deleteMany({});
    
    // Insert categories
    const insertedCategories = await Category.insertMany(categories);
    logger.info(`Inserted ${insertedCategories.length} categories for compatibility`);
    
    return insertedCategories;
  } catch (error) {
    logger.error('Error seeding categories:', error);
    throw error;
  }
}
