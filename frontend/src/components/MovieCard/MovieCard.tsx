import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MovieCard.css';

interface MovieCardProps {
  id: string;
  title: string;
  imageUrl: string;
  year?: number;
  rating?: string;
}

const MovieCard = ({ id, title, imageUrl, year, rating }: MovieCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  const handleWatchNow = () => {
    navigate(`/movie/${id}`);
  };
  
  return (
    <div 
      className="movie-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="movie-card__bookmark">
        <span>◊</span>
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
            onClick={handleWatchNow}
          >
            ▶ Watch Now
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieCard;
