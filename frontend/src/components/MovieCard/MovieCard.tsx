import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MovieCard.css';
import { useWatchlist } from '../../context/WatchlistContext';
import { Movie } from '../../types/movie';

interface MovieCardProps {
  id: string;
  title: string;
  imageUrl: string;
  year?: number;
  rating?: string;
  genres?: string[];
}

const MovieCard = ({ id, title, imageUrl, year, rating, genres }: MovieCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarkHovered, setIsBookmarkHovered] = useState(false);
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  
  const inWatchlist = isInWatchlist(id);
  
  const handleWatchNow = () => {
    navigate(`/movie/${id}`);
  };
  
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card click
    
    if (inWatchlist) {
      removeFromWatchlist(id);
    } else {
      // Create a movie object with the data we have
      const movie: Movie = {
        id,
        title,
        posterUrl: imageUrl,
        year,
        rating,
        genres: genres || []
      };
      addToWatchlist(movie);
    }
  };
  
  return (
    <div 
      className="movie-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleWatchNow}
    >
      <div 
        className={`movie-card__bookmark ${inWatchlist ? 'active' : ''} ${isBookmarkHovered ? 'hovered' : ''}`}
        onClick={handleBookmarkClick}
        onMouseEnter={() => setIsBookmarkHovered(true)}
        onMouseLeave={() => setIsBookmarkHovered(false)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill={inWatchlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <img 
        src={imageUrl} 
        alt={title} 
        className="movie-card__image" 
      />
      {isHovered && (
        <div className="movie-card__overlay">
          <h3 className="movie-card__title">{title}</h3>
          {year && <span className="movie-card__year">{year}</span>}
          {rating && <span className="movie-card__rating">{rating}</span>}
          <button 
            className="movie-card__play-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleWatchNow();
            }}
          >
            ▶ Watch Now
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieCard;
