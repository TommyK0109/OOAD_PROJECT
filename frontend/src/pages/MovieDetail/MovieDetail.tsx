import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MovieDetail.css';
import { getMovieById } from '../../services/movieService';
import { CreateParty, JoinParty } from '../../components/Party';
import { Movie } from '../../types/movie';
import { useWatchlist } from '../../context/WatchlistContext';

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [activeTab, setActiveTab] = useState('synopsis');
  const [loading, setLoading] = useState(true);
  const [showPartyModal, setShowPartyModal] = useState<'create' | 'join' | null>(null);
  const [showPartyOptions, setShowPartyOptions] = useState(false);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const data = await getMovieById(id);
        setMovie(data || null);
      } catch (error) {
        console.error('Failed to fetch movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  const handlePlayClick = () => {
    setShowPartyOptions(true);
  };

  const handleWatchLaterClick = () => {
    if (!movie || !id) return;

    if (isInWatchlist(id)) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist(movie);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!movie) {
    return <div className="error">Movie not found</div>;
  }

  const inWatchlist = id ? isInWatchlist(id) : false;

  return (
    <div className="movie-detail">
      {/* Movie header with banner image */}
      <div className="movie-detail__banner" style={{ backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})` }}>
        <div className="movie-detail__overlay">
          <div className="movie-detail__info">
            <h1 className="movie-detail__title">{movie.title} ({movie.year})</h1>
            {movie.originalTitle && (
              <p className="movie-detail__original-title">Original Title: {movie.originalTitle}</p>
            )}
            <div className="movie-detail__meta">
              <span className="movie-detail__rating">
                <span className="rating-score">{movie.rating}</span>
                <span className="rating-count">{movie.ratingCount}</span>
              </span>
              <span className="movie-detail__runtime">{movie.runtime || '23min'}</span>
            </div>
            <div className="movie-detail__actions">
              <button className="movie-detail__play-btn" onClick={handlePlayClick}>
                <span className="play-icon">▶</span> Play
              </button>
              <button 
                className={`movie-detail__watchlater-btn ${inWatchlist ? 'active' : ''}`} 
                onClick={handleWatchLaterClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill={inWatchlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                {inWatchlist ? 'Added to Watchlist' : 'Watch Later'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="movie-detail__tabs">
        <button 
          className={`tab ${activeTab === 'episodes' ? 'active' : ''}`}
          onClick={() => setActiveTab('episodes')}
          data-tab="episodes"
        >
          Episodes
        </button>
        <button 
          className={`tab ${activeTab === 'synopsis' ? 'active' : ''}`}
          onClick={() => setActiveTab('synopsis')}
          data-tab="synopsis"
        >
          Synopsis
        </button>
        <button 
          className={`tab ${activeTab === 'trailers' ? 'active' : ''}`}
          onClick={() => setActiveTab('trailers')}
          data-tab="trailers"
        >
          Trailers
        </button>
      </div>

      {/* Tab content */}
      <div className="movie-detail__content">
        {activeTab === 'synopsis' && (
          <div className="movie-detail__synopsis">
            <h2>Synopsis</h2>
            <p>{movie.overview || 'No synopsis available.'}</p>
          </div>
        )}
        
        {activeTab === 'episodes' && (
          <div className="movie-detail__episodes">
            <h2>1 SEASONS</h2>
            <div className="season-info">
              <img src={movie.posterUrl} alt={movie.title} className="season-poster" />
              <div className="season-data">
                <h3>Season 1</h3>
                <p>12 Episodes</p>
              </div>
            </div>
            
            <h2>WATCH NEWEST EPISODES</h2>
            <div className="episode-list">
              <div className="episode-item">
                <div className="episode-info">
                  <h3>S1 E12 - {movie.title}</h3>
                </div>
                <button className="episode-expand">▼</button>
              </div>
              <div className="episode-item">
                <div className="episode-info">
                  <h3>S1 E11 - I Parry Divine Wrath</h3>
                </div>
                <button className="episode-expand">▼</button>
              </div>
              <div className="episode-item">
                <div className="episode-info">
                  <h3>S1 E10 - I Parry the Emperor's Authority</h3>
                </div>
                <button className="episode-expand">▼</button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'trailers' && (
          <div className="movie-detail__trailers">
            <h2>Trailers & Videos</h2>
            <div className="trailers-grid">
              <div className="trailer-item">
                <div className="trailer-thumbnail">
                  <img src={movie.posterUrl} alt="Trailer thumbnail" />
                  <button className="trailer-play-btn">▶</button>
                </div>
                <p>Official Trailer (2023)</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* About section */}
      <div className="movie-detail__about">
        <h2>ABOUT THE TV SHOW</h2>
        <div className="about-content">
          <div className="about-ratings">
            <p className="rating-big">78% (79)</p>
            <p className="imdb-rating">IMDb 7.0 (1k)</p>
            <h3>GENRES</h3>
            <p className="genres">
              {movie.genres?.join(', ') || 'Action & Adventure, Fantasy, Animation, Classic Japanese Anime'}
            </p>
            <h3>RUNTIME</h3>
            <p>{movie.runtime || '23min'}</p>
            <h3>PRODUCTION COUNTRY</h3>
            <p>{movie.country || 'Japan'}</p>
          </div>
          <div className="about-poster">
            <img src={movie.posterUrl} alt={movie.title} />
          </div>
        </div>
      </div>

      {/* Party options popup */}
      {showPartyOptions && (
        <div className="modal-overlay" onClick={() => setShowPartyOptions(false)}>
          <div className="party-options-modal" onClick={e => e.stopPropagation()}>
            <h2>Watch Options</h2>
            <p>How would you like to watch "{movie.title}"?</p>
            
            <div className="party-options-buttons">
              <button 
                className="party-option-btn create"
                onClick={() => {
                  setShowPartyOptions(false);
                  setShowPartyModal('create');
                }}
              >
                Create New Watch Party
              </button>
              <button 
                className="party-option-btn join"
                onClick={() => {
                  setShowPartyOptions(false);
                  setShowPartyModal('join');
                }}
              >
                Join Existing Watch Party
              </button>
              <button 
                className="party-option-btn solo"
                onClick={() => {
                  setShowPartyOptions(false);
                  navigate(`/watch/solo/${id}`);
                }}
              >
                Watch Solo
              </button>
            </div>
            
            <button 
              className="close-button"
              onClick={() => setShowPartyOptions(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Party modals */}
      {showPartyModal === 'create' && (
        <div className="modal-overlay" onClick={() => setShowPartyModal(null)}>
          <div onClick={e => e.stopPropagation()}>
            <CreateParty
              movieId={id || ''}
              movieTitle={movie.title}
              posterUrl={movie.posterUrl}
              onClose={() => setShowPartyModal(null)}
            />
          </div>
        </div>
      )}

      {showPartyModal === 'join' && (
        <div className="modal-overlay" onClick={() => setShowPartyModal(null)}>
          <div onClick={e => e.stopPropagation()}>
            <JoinParty
              movieId={id || ''}
              movieTitle={movie.title}
              onClose={() => setShowPartyModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;
