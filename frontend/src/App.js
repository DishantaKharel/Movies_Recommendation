import React, { useState, useEffect } from 'react';
import daredevilPoster from './posters/daredevil.jpg';
import CaptainAmerica from './posters/Captain America.jpg';
import Babygirl from './posters/Babygirl.jpeg';
import Gorge from './posters/The Gorge.jpg';
import Bonhoeffer from './posters/Bonhoeffer.jpeg';
import Matrix from './posters/The Matrix.jpeg';
import Interstellar from './posters/Interstellar.jpeg';
import FightClub from './posters/Fight Club.jpeg';
import Shawshank from './posters/The Shawshank Redemption.jpeg';
import Goodfellas from './posters/Goodfellas.jpeg';
import Rings from './posters/The Lord of the Rings.jpeg';
import Pulp from './posters/Pulp Fiction.jpeg';

import './App.css'

const MovieRecommendationApp = () => {
  const [movieInput, setMovieInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestedMovies, setSuggestedMovies] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allMovies, setAllMovies] = useState([]);
  
  // Movie posters for the background
  const backgroundMovies = [
    { id: 1, title: 'Daredevil: Born Again', poster: daredevilPoster },
    { id: 2, title: 'Captain America: Brave New World', poster: CaptainAmerica },
    { id: 3, title: 'The Gorge', poster: Gorge },
    { id: 4, title: 'Babygirl', poster: Babygirl },
    { id: 5, title: 'Bonhoeffer: Pastor. Spy. Assassin.', poster: Bonhoeffer },
    { id: 6, title: 'The Matrix', poster: Matrix },
    { id: 7, title: 'Interstellar', poster: Interstellar },
    { id: 8, title: 'Fight Club', poster: FightClub },
    { id: 9, title: 'The Shawshank Redemption', poster: Shawshank },
    { id: 10, title: 'Goodfellas', poster: Goodfellas },
    { id: 11, title: 'The Lord of the Rings', poster: Rings },
    { id: 12, title: 'Pulp Fiction', poster: Pulp },
  ];

  // Fallback image for posters
  const fallbackPosterUrl = 'https://via.placeholder.com/150x225?text=No+Poster';

  // Fetch all movies for autocomplete
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/movies');
        const data = await response.json();

        if (data.movies) {
          setAllMovies(data.movies);
        }
      } catch (err) {
        console.error('Error fetching movie list:', err);
      }
    };

    fetchMovies();
  }, []);

  // Handle input changes and filter suggestions
  const handleInputChange = (e) => {
    const input = e.target.value;
    setMovieInput(input);

    if (input.length > 2) {
      const filtered = allMovies
        .filter(movie => movie.toLowerCase().includes(input.toLowerCase()))
        .slice(0, 5);

      setSuggestedMovies(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestedMovies([]);
      setShowSuggestions(false);
    }
  };

  // Select a suggested movie
  const selectMovie = (movie) => {
    setMovieInput(movie);
    setSuggestedMovies([]);
    setShowSuggestions(false);
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!movieInput.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Call the backend API
      const response = await fetch(`http://localhost:5000/api/recommend?movie=${encodeURIComponent(movieInput)}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        if (data.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
        }
      } else {
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      setError('Failed to fetch recommendations. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format similarity score as percentage
  const formatSimilarity = (similarity) => {
    if (similarity === null || similarity === undefined) return 'N/A';
    return `${(similarity * 100).toFixed(0)}%`;
  };

  // Get poster URL with fallback
  const getPosterUrl = (path) => {
    if (!path) return fallbackPosterUrl;

    // If the path is a full URL, use it directly
    if (path.startsWith('http')) return path;

    // Otherwise construct the URL (adjust based on your API)
    return `https://image.tmdb.org/t/p/w200${path}`;
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">
      {/* Animated background with movie posters - like featured carousel */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute top-0 w-full h-full">
          {/* First row of posters */}
          <div className="poster-row" style={{ top: '5%' }}>
            {backgroundMovies.slice(0, 6).map((movie, index) => (
              <div
                key={`row1-${movie.id}`}
                className="absolute poster-animate"
                style={{
                  left: `${(index * 300) + (index * 30)}px`,
                  animationDelay: `${index * 0.7}s`,
                  animationDuration: '60s'
                }}
              >
                <img
                  src={movie.poster || fallbackPosterUrl}
                  alt={movie.title}
                  className="w-48 h-72 rounded shadow-lg transition-all duration-300"
                  onError={(e) => { e.target.src = fallbackPosterUrl; }}
                />
                <p className="text-center text-xs mt-1 text-white">{movie.title}</p>
              </div>
            ))}
          </div>

          {/* Second row of posters - moving in opposite direction */}
          <div className="poster-row" style={{ top: '50%' }}>
            {backgroundMovies.slice(6).map((movie, index) => (
              <div
                key={`row2-${movie.id}`}
                className="absolute poster-animate-reverse"
                style={{
                  right: `${(index * 300) + (index * 30)}px`,
                  animationDelay: `${index * 0.5}s`,
                  animationDuration: '70s'
                }}
              >
                <img
                  src={movie.poster || fallbackPosterUrl}
                  alt={movie.title}
                  className="w-48 h-72 rounded shadow-lg transition-all duration-300"
                  onError={(e) => { e.target.src = fallbackPosterUrl; }}
                />
                <p className="text-center text-xs mt-1 text-white">{movie.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 backdrop-blur-sm overflow-y-auto py-12">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">Movie Recommender</h1>
          <p className="text-lg text-gray-300">Enter a movie you love and discover similar titles</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="mb-8 w-full max-w-md">
          <div className="relative">
            <input
              type="text"
              value={movieInput}
              onChange={handleInputChange}
              placeholder="Enter a movie title..."
              className="w-full rounded-full bg-white bg-opacity-20 px-6 py-4 text-white backdrop-blur-sm transition-all duration-300 placeholder:text-gray-300 focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 rounded-full bg-blue-600 px-4 py-2 font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              Find
            </button>

            {/* Autocomplete suggestions */}
            {showSuggestions && (
              <div className="absolute z-10 mt-2 w-full rounded-md bg-white bg-opacity-90 shadow-lg">
                <ul className="py-1 text-sm text-gray-800">
                  {suggestedMovies.map((movie, index) => (
                    <li
                      key={index}
                      className="cursor-pointer px-4 py-2 hover:bg-blue-100"
                      onClick={() => selectMovie(movie)}
                    >
                      {movie}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </form>

        {/* Error message */}
        {error && (
          <div className="mb-4 w-full max-w-md rounded bg-red-500 bg-opacity-70 p-3 text-white">
            {error}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
            <span className="ml-2">Finding recommendations...</span>
          </div>
        )}

        {/* Recommendations */}
        {!isLoading && recommendations.length > 0 && (
          <div className="w-full max-w-4xl mb-12">
            <h2 className="mb-4 text-center text-2xl font-semibold">Recommended Movies</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {recommendations.map((movie) => (
                <div key={movie.id} className="flex flex-col items-center">
                  <div className="mb-2 overflow-hidden rounded shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <img
                      src={getPosterUrl(movie.poster_path)}
                      alt={movie.title}
                      className="h-auto w-full"
                      onError={(e) => { e.target.src = fallbackPosterUrl; }}
                    />
                  </div>
                  <h3 className="text-center text-sm font-medium">{movie.title}</h3>
                  <p className="text-xs text-gray-400">{formatSimilarity(movie.similarity)} match</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add custom CSS for animations */}
      <style jsx global>{`
        @keyframes slideLeft {
          0% {
            transform: translateX(100vw);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        @keyframes slideRight {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100vw);
          }
        }
        
        .poster-animate {
          animation: slideLeft linear infinite;
        }
        
        .poster-animate-reverse {
          animation: slideRight linear infinite;
        }
        
        .poster-row {
          position: fixed; /* Change from absolute to fixed */
          width: 100%;
          height: 300px;
        }
      `}</style>
    </div>
  );
};

export default MovieRecommendationApp;