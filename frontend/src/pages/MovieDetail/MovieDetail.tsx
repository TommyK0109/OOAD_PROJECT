import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './MovieDetail.css';
import { getMovieById } from '../../services/movieService';
import { CreateParty, JoinParty } from '../../components/Party';
import { Movie } from '../../types/movie';

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [activeTab, setActiveTab] = useState('synopsis');
  const [loading, setLoading] = useState(true);
  const [showPartyModal, setShowPartyModal] = useState<'create' | 'join' | null>(null);
  const [showPartyOptions, setShowPartyOptions] = useState(false);

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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!movie) {
    return <div className="error">Movie not found</div>;
  }

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
            <button className="movie-detail__play-btn" onClick={handlePlayClick}>
              <span className="play-icon">▶</span> Play
            </button>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="movie-detail__tabs">
        <button 
          className={`tab ${activeTab === 'watch' ? 'active' : ''}`}
          onClick={() => setActiveTab('watch')}
        >
          Where to watch
        </button>
        <button 
          className={`tab ${activeTab === 'free' ? 'active' : ''}`}
          onClick={() => setActiveTab('free')}
        >
          Watch for free
        </button>
        <button 
          className={`tab ${activeTab === 'episodes' ? 'active' : ''}`}
          onClick={() => setActiveTab('episodes')}
        >
          Episodes
        </button>
        <button 
          className={`tab ${activeTab === 'synopsis' ? 'active' : ''}`}
          onClick={() => setActiveTab('synopsis')}
        >
          Synopsis
        </button>
        <button 
          className={`tab ${activeTab === 'trailers' ? 'active' : ''}`}
          onClick={() => setActiveTab('trailers')}
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
        
        {activeTab === 'watch' && (
          <div className="movie-detail__watch-options">
            <h2>WATCH NOW</h2>
            <div className="watch-filters">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">Subscription</button>
              <button className="filter-btn">Free</button>
            </div>
            
            <div className="streaming-options">
              <div className="streaming-option">
                <div className="service-info">
                  <div className="service-logo netflix">NETFLIX</div>
                  <div className="service-details">
                    <p className="quality-tags">
                      <span className="tag">CC</span>
                      <span className="tag">HD</span>
                    </p>
                    <p className="season-info">1 Season - 23min - Japanese</p>
                  </div>
                </div>
                <div className="service-price">
                  <p className="price-type">Subscription</p>
                  <p className="price-amount">₹149.00/month</p>
                  <button className="watch-now-btn">▶ Watch Now</button>
                </div>
              </div>
              
              <div className="streaming-option prime">
                <div className="service-info">
                  <div className="service-logo prime">prime video</div>
                  <div className="service-details">
                    <p>Watch similar TV shows for free</p>
                    <p>on Prime Video</p>
                  </div>
                </div>
                <div className="service-price">
                  <p className="price-type">30 Days Free</p>
                  <p className="price-amount">Then ₹299.00/month</p>
                  <button className="stream-free-btn">▶ Stream Free</button>
                </div>
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
                  // Handle solo watch here - e.g., navigate to /watch/${id}
                  console.log('Watch solo');
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
