import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import { Search, Home, Settings, Menu, PlusCircle, User, X, Music, LogOut, Play } from 'lucide-react';
import MusicPlayer from '../../components/songplayer/Player';

interface SearchResultItem {
  song_id: string;
  song_name: string;
  artist_name: string;
  album_name: string;
  genre_name: string;
  duration: string;
  path: string;
  coverUrl?: string;
  album_id: string;
}

interface SearchResults {
  songs: SearchResultItem[];
  artists: [];
}

const SearchPage: React.FC = () => {
  const [results, setResults] = useState<SearchResults>({ songs: [], artists: [] });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [currentSong, setCurrentSong] = useState<SearchResultItem | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const searchKeyword = searchParams.get('keyword') || '';

  useEffect(() => {
    const fetchUserId = async () => {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const userData = JSON.parse(userJson);
        setUserId(userData.user_id);
      }
    };
    fetchUserId();
  }, []);

  const handleSearch = async () => {
    if (searchKeyword.trim() === '') {
      setResults({ songs: [], artists: [] });
      return;
    }

    const token = localStorage.getItem('token') || '';  // Retrieve token from local storage

    try {
      const response = await axios.get(`/songs/search`, {
        params: { keyword: searchKeyword },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setResults({
        songs: Array.isArray(response.data) ? response.data : [],
        artists: []
      });
      setErrMsg(null);

    } catch (error: any) {
      console.error('Error performing search:', error);
      if (error.response && error.response.status === 401) {
        setErrMsg('Unauthorized: Please log in again.');
        navigate('/login');
      } else {
        setErrMsg('Failed to fetch search results.');
      }
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchKeyword]);

  const updateSearchParams = (keyword: string) => {
    const params = new URLSearchParams();
    params.set('keyword', keyword);
    navigate({ search: params.toString() });
  };

  const formatDuration = (duration: string | null) => {
    if (!duration) {
      return '00:00'; // Default value for invalid duration
    }
    const [minutes, seconds] = duration.split(':');
    return `${minutes || '00'}:${seconds ? seconds.padStart(2, '0') : '00'}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/#');
  };

  const handleCreatePlaylist = () => {
    navigate('/newplaylist');
  };

  return (
    <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex font-sans">
      {/* Sidebar */}
      <div className={`w-16 flex flex-col items-center py-4 bg-black border-r border-gray-800 transition-all duration-300 ease-in-out ${isMenuExpanded ? 'w-64' : 'w-16'}`}>
        <div className="flex flex-col items-center space-y-4 mb-8">
          <button onClick={() => setIsMenuExpanded(!isMenuExpanded)} className="text-[#1ED760] hover:text-white" aria-label="Menu">
            {isMenuExpanded ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        <div className="flex-grow"></div>
        <div className="mt-auto flex flex-col items-center space-y-4 mb-4">
          <button onClick={handleCreatePlaylist} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-[#EBE7CD] hover:text-white" aria-label="Add">
            <PlusCircle className="w-6 h-6" />
          </button>
          <Link to="/useredit" aria-label="User Profile" className="text-[#1ED760] hover:text-white">
            <User className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Expandable Menu */}
      {isMenuExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="bg-[#121212] w-64 h-full p-4">
            <button onClick={() => setIsMenuExpanded(false)} className="mb-8 text-[#1ED760]">
              <X className="w-6 h-6" />
            </button>
            <nav>
              <ul className="space-y-4">
                <li><Link to="/homepage" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center"><Home className="w-5 h-5 mr-3" /> Home</Link></li>
                <li><Link to="/search" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center"><Search className="w-5 h-5 mr-3" /> Search</Link></li>
                <li><Link to="/userlibrary" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center"><Music className="w-5 h-5 mr-3" /> Your Library</Link></li>
                <li><button onClick={handleCreatePlaylist} className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center w-full"><PlusCircle className="w-5 h-5 mr-3" /> Create Playlist</button></li>
              </ul>
            </nav>
            <div className="mt-auto">
              <Link to="/useredit" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center mt-4">
                <User className="w-5 h-5 mr-3" /> Profile
              </Link>
              <button onClick={handleLogout} className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center mt-4 w-full">
                <LogOut className="w-5 h-5 mr-3" /> Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto pb-20">
        {/* Search bar */}
        <div className="flex items-center mb-8">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => updateSearchParams(e.target.value)}
              placeholder="Search for Song or Artist"
              id="search-bar"
              className="w-full bg-[#2A2A2A] rounded-full py-2 pl-10 pr-4 text-sm text-[#EBE7CD] focus:outline-none"
            />
          </div>
        </div>

        {/* Search Results */}
        {searchKeyword && (
          <div>
            {results.songs.length > 0 ? (
              <div>
                <h3 className="text-xl font-semibold mb-3">Songs</h3>
                <div className="grid grid-cols-1 gap-2">
                  {results.songs.map((song) => (
                    <div
                      key={song.song_id}
                      className="bg-[#2A2A2A] p-3 rounded-lg flex items-center hover:bg-[#3A3A3A] transition-colors"
                      onClick={() => setCurrentSong(song)}
                    >
                      <Play className="w-4 h-4 mr-3 text-gray-400" />
                      <div className="flex-grow">
                        <p className="font-semibold">{song.song_name || 'Unknown Song'}</p>
                        <p className="text-sm text-gray-400">Artist: {song.artist_name || 'Unknown Artist'}</p>
                        <p className="text-sm text-gray-400">Album: {song.album_name || 'Unknown Album'}</p>
                      </div>
                      <p className="text-sm text-gray-400">{formatDuration(song.duration)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-400">No results found</p>
            )}
          </div>
        )}
      </div>

      {/* Music Player */}
      {currentSong && (
        <MusicPlayer
          currentSong={{
            id: currentSong.song_id,
            title: currentSong.song_name,
            artist: currentSong.artist_name,
            coverUrl: `/api/albums/${currentSong.album_id}/cover`,
            audioUrl: `/api/songs/${currentSong.song_id}/stream`
          }}
          userId={userId}
        />
      )}
    </div>
  );
};

export default SearchPage;
