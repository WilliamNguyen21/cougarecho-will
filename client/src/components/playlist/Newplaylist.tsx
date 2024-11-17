import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, Settings, Menu, PlusCircle, User, Play, Edit2, X, Music, LogOut, Image as ImageIcon } from 'lucide-react';
import axios from '../../api/axios';

const apiRoutes = {
  test: '/api/test',                                    // Add /api prefix
  search: '/api/songs/search',                         // Add /api prefix
  createPlaylist: '/api/playlist/new',                 // Add /api prefix
  addSongToPlaylist: (playlistId) => `/api/playlist/${playlistId}/song`, 
};

const api = axios.create({
  baseURL: 'http://localhost:8080', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add better error handling
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      params: config.params
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

const CreatePlaylistPage = () => {
  // State management with debug logging
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistImage, setPlaylistImage] = useState(null);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchError, setSearchError] = useState('');
  const navigate = useNavigate();

  // Error boundary
  useEffect(() => {
    const abortController = new AbortController();
    const handleError = (error) => {
      console.error('Runtime error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [searchQuery, selectedSongs]);

  // Test API connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await api.get(apiRoutes.test);
        console.log('API connection successful');
      } catch (err) {
        console.error('API connection failed:', err);
        setError('Unable to connect to server. Please try again later.');
      }
    };
  
    testConnection();
  }, []);

  // Authentication check with better error handling
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication...');
      setIsLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login');
          return;
        }

        // Set basic user info first
        setUser({ username: 'User' });

        // Try to get detailed user info from token
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log('Token payload:', payload);
            if (payload) {
              setUser(payload);
            }
          }
        } catch (err) {
          console.warn('Error parsing token:', err);
          // Continue with basic user info
        }
      } catch (err) {
        console.error('Auth error:', err);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Add cleanup for search API calls
  useEffect(() => {
    const abortController = new AbortController();

    const searchWithAbort = async (query) => {
      if (query.length > 1) {
        setIsSearching(true);
        setSearchError('');
        try {
          const response = await api.get(`api/songs/search?keyword=${query}`, {
            signal: abortController.signal
          });
          if (!abortController.signal.aborted) {
            const filteredResults = response.data.filter(
              result => !selectedSongs.some(selected => selected.song_id === result.song_id)
            );
            console.log('Search results:', filteredResults);
            setSearchResults(filteredResults);
          }
        } catch (err) {
          if (!abortController.signal.aborted) {
            console.error('Error searching songs:', err);
            setSearchError('Failed to search songs. Please try again.');
            setSearchResults([]);
          }
        } finally {
          if (!abortController.signal.aborted) {
            setIsSearching(false);
          }
        }
      } else {
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        console.log('Searching for:', searchQuery);
        searchWithAbort(searchQuery);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [searchQuery, selectedSongs]);
  // Handle playlist title changes with validation
  const handlePlaylistTitleChange = (e) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setPlaylistTitle(value);
      if (error && error.includes('title')) {
        setError('');
      }
    }
  };

  // Handle image upload with better error handling
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Uploading image:', file.name);
      
      // Clear previous image and errors
      if (playlistImage) {
        URL.revokeObjectURL(playlistImage);
      }
      setError('');

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5000000) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          setPlaylistImage(reader.result);
        } catch (err) {
          console.error('Error processing image:', err);
          setError('Failed to process image. Please try another.');
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read image file. Please try another.');
      };

      reader.readAsDataURL(file);
    }
  };

  // Handle logout with cleanup
  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    navigate('/login', { state: { message: "You've been logged out" } });
  };

  // Handle search song
  const handleSearchSongs = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
  
    setIsSearching(true);
    const token = localStorage.getItem('token') || '';
  
    try {
      const response = await api.get('/api/songs/search', {
        params: { 
          keyword: query.trim() // Make sure to trim the query
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      // Log the response for debugging
      console.log('Search response:', response);
  
      if (Array.isArray(response.data)) {
        const filteredResults = response.data.filter(result => 
          !selectedSongs.some(selected => selected.song_id === result.song_id)
        );
        setSearchResults(filteredResults);
        setSearchError('');
      } else {
        console.warn('Unexpected response format:', response.data);
        setSearchResults([]);
      }
    } catch (error: any) {
      console.error('Search error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        setError('Unauthorized: Please log in again.');
        navigate('/login');
      } else {
        setSearchError('Failed to fetch search results.');
      }
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  // Add song to playlist with validation
  const addSongToPlaylist = (song) => {
    console.log('Adding song:', song);
    setSelectedSongs(prev => [...prev, {
      song_id: song.song_id,
      song_name: song.song_name,
      artist_name: song.artist_name,
      album_name: song.album_name,
      duration: song.duration,
      dateAdded: new Date().toISOString(),
      active: 1
    }]);
    setSearchResults(prev => prev.filter(s => s.song_id !== song.song_id));
  };
  // Remove song from playlist
  const removeSongFromPlaylist = (song) => {
    console.log('Removing song:', song.song_name);
    setSelectedSongs(prev => prev.filter(s => s.song_id !== song.song_id));
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        handleSearchSongs(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  };

  // Create playlist with better error handling
  const handleCreatePlaylist = async () => {
    console.log('Creating playlist:', { playlistTitle, selectedSongs });
    
    // Validation
    if (!playlistTitle.trim()) {
      setError('Please enter a playlist title');
      return;
    }
    if (selectedSongs.length === 0) {
      setError('Please add at least one song to the playlist');
      return;
    }
    if (playlistTitle.length > 50) {
      setError('Playlist title must be less than 50 characters');
      return;
    }
    if (!user?.user_id) {
      setError('User ID is required');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Create playlist
    const playlistResponse = await api.post(apiRoutes.createPlaylist, {
      title: playlistTitle.trim(),
      userId: user.user_id,
      avatar: playlistImage || null
    });

    if (!playlistResponse.data.playlistId) {
      throw new Error('Failed to create playlist - no playlist ID returned');
    }

    const playlistId = playlistResponse.data.playlistId;

    // Add songs to playlist
    const failedSongs = [];
    for (const song of selectedSongs) {
      try {
        await api.post(apiRoutes.addSongToPlaylist(playlistId), {
          playlist_id: playlistId,
          song_id: song.song_id,
          active: 1
        });
      } catch (err) {
        console.error(`Failed to add song ${song.song_name}:`, err);
        failedSongs.push(song.song_name);
      }
    }

    if (failedSongs.length > 0) {
      setError(`Playlist created but failed to add songs: ${failedSongs.join(', ')}`);
    } else {
      navigate('/userlibrary');
    }
  } catch (err) {
    console.error('Error creating playlist:', err);
    setError(err.response?.data?.message || 'Failed to create playlist. Please try again.');
  } finally {
    setIsCreating(false);
  }
};
  // Utility functions
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDateAdded = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  // Render loading state
  if (isLoading) {
    return (
      <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1ED760] border-t-transparent"></div>
      </div>
    );
  }

  // Render error state
  if (hasError) {
    return (
      <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Something went wrong</h1>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#1ED760] text-black px-6 py-2 rounded-full"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex font-sans">
      {/* Sidebar */}
      <div className={`w-16 flex flex-col items-center py-4 bg-black border-r border-gray-800 transition-all duration-300 ease-in-out ${isMenuExpanded ? 'w-64' : 'w-16'}`}>
        <div className="flex flex-col items-center space-y-4 mb-8">
          <button 
            onClick={() => setIsMenuExpanded(!isMenuExpanded)} 
            className="text-[#1ED760] hover:text-white transition-colors" 
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow"></div>
        <div className="mt-auto flex flex-col items-center space-y-4 mb-4">
          <Link 
            to="/newplaylist" 
            className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-[#EBE7CD] hover:text-white transition-colors" 
            aria-label="Add"
          >
            <PlusCircle className="w-6 h-6" />
          </Link>
          <Link 
            to="/useredit" 
            aria-label="User Profile" 
            className="text-[#1ED760] hover:text-white transition-colors"
          >
            <User className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Expanded menu overlay */}
      {isMenuExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsMenuExpanded(false)} // Close on overlay click
        >
          <div 
            className="bg-[#121212] w-64 h-full p-4"
            onClick={e => e.stopPropagation()} // Prevent click from bubbling to overlay
          >
            <button 
              onClick={() => setIsMenuExpanded(false)} 
              className="mb-8 text-[#1ED760] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <nav>
              <ul className="space-y-4">
                <li>
                  <Link to="/homepage" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center transition-colors">
                    <Home className="w-5 h-5 mr-3" /> Home
                  </Link>
                </li>
                <li>
                  <Link to="/search" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center transition-colors">
                    <Search className="w-5 h-5 mr-3" /> Search
                  </Link>
                </li>
                <li>
                  <Link to="/userlibrary" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center transition-colors">
                    <Music className="w-5 h-5 mr-3" /> Your Library
                  </Link>
                </li>
                <li>
                  <Link to="/newplaylist" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center transition-colors">
                    <PlusCircle className="w-5 h-5 mr-3" /> Create Playlist
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="mt-auto">
              <Link to="/useredit" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center mt-4 transition-colors">
                <User className="w-5 h-5 mr-3" /> Profile
              </Link>
              <button 
                onClick={handleLogout} 
                className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center mt-4 transition-colors w-full"
              >
                <LogOut className="w-5 h-5 mr-3" /> Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-2xl font-bold">Create New Playlist</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/homepage" className="text-[#1ED760] hover:text-white transition-colors">
              <Home className="w-6 h-6" />
            </Link>
            <Link to="/useredit" className="text-[#1ED760] hover:text-white transition-colors">
              <Settings className="w-6 h-6" />
            </Link>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 bg-[#1A1A1A] rounded-lg p-6">
          {/* Playlist metadata */}
          <div className="flex items-center mb-6">
            <div className="w-40 h-40 bg-[#2A2A2A] rounded-lg mr-6 relative overflow-hidden group">
              {playlistImage ? (
                <img 
                  src={playlistImage} 
                  alt="Playlist cover" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-[#EBE7CD] opacity-50" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm">Click to change image</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Upload playlist cover image"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Playlist Title"
                value={playlistTitle}
                onChange={handlePlaylistTitleChange}
                maxLength={50}
                className="text-4xl font-bold bg-transparent border-b border-[#EBE7CD] text-[#EBE7CD] w-full focus:outline-none focus:border-[#1ED760] transition-colors"
                aria-label="Playlist title"
              />
              {error && (
                <p className="text-red-500 mt-2 text-sm" role="alert">
                  {error}
                </p>
              )}
              <p className="text-sm text-[#A0616A] mt-2">
                by {user?.username || 'User'}
              </p>
              <p className="text-sm text-[#EBE7CD] opacity-75 mt-1">
                {selectedSongs.length} {selectedSongs.length === 1 ? 'song' : 'songs'}
              </p>
            </div>
          </div>

          {/* Search section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">Search Songs</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchSongs(e.target.value)}
                placeholder="Search for songs"
                disabled={isSearching}
                className="w-full bg-[#2A2A2A] rounded-full py-2 pl-10 pr-4 text-sm text-[#EBE7CD] focus:outline-none focus:ring-2 focus:ring-[#1ED760]"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#1ED760] border-t-transparent"></div>
                </div>
              )}
            </div>
            {searchError && (
              <p className="text-red-500 mt-2 text-sm" role="alert">
                {searchError}
              </p>
            )}

            {/* Search results */}
            {searchResults.length > 0 && (
            <div className="bg-[#2A2A2A] rounded-lg p-4 max-h-60 overflow-y-auto">
              {searchResults.map((song) => (
                <div 
                  key={song.song_id} 
                  className="flex justify-between items-center py-2 hover:bg-[#383838] rounded px-2"
                >
                  <div>
                    <div className="text-sm font-semibold">{song.song_name || 'Unknown Song'}</div>
                    <div className="text-xs text-gray-400">
                      {song.artist_name || 'Unknown Artist'} • {song.album_name || 'Unknown Album'}
                    </div>
                  </div>
                  <button
                    onClick={() => addSongToPlaylist(song)}
                    className="bg-[#1ED760] text-black px-3 py-1 rounded-full text-sm hover:bg-[#1DB954]"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
          </div>

          {/* Selected songs list */}
<div className="mb-4">
  <h3 className="text-lg font-bold mb-4">Playlist Songs</h3>
  {selectedSongs.length === 0 ? (
    <p className="text-[#EBE7CD] opacity-75 text-center py-4">
      No songs added yet. Search for songs to add to your playlist.
    </p>
  ) : (
    <>
      <div className="grid grid-cols-4 text-sm font-bold text-[#EBE7CD] opacity-75 mb-2">
        <span></span>
        <span>Title</span>
        <span>Date Added</span>
        <span>Duration</span>
      </div>
      {selectedSongs.map((song) => (
        <div 
          key={song.song_id} 
          className="grid grid-cols-4 text-sm py-2 hover:bg-[#2A2A2A] rounded items-center"
        >
          <button 
            onClick={() => removeSongFromPlaylist(song)}
            className="text-red-500 hover:text-red-400"
          >
            <X className="w-5 h-5" />
          </button>
          <span>{song.song_name} - {song.artist_name}</span>
          <span>{formatDateAdded(song.dateAdded)}</span>
          <span>{formatDuration(song.duration)}</span>
        </div>
      ))}
    </>
  )}
</div>

          {/* Create playlist button */}
          <button
            onClick={handleCreatePlaylist}
            disabled={isCreating || selectedSongs.length === 0 || !playlistTitle.trim()}
            className={`mt-6 px-6 py-2 rounded-full text-lg font-semibold transition-all w-full md:w-auto
              ${isCreating || selectedSongs.length === 0 || !playlistTitle.trim()
                ? 'bg-gray-500 cursor-not-allowed opacity-50' 
                : 'bg-[#1ED760] hover:bg-[#1DB954] text-black'}`}
          >
            {isCreating ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-black mr-2"></div>
                Creating...
              </span>
            ) : (
              'Create Playlist'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistPage;