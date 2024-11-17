import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Home, Settings, Menu, PlusCircle, User, Play, Pause, X, Music, LogOut } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  plays: string;
  duration: string;
  path: string;
}

interface CurrentSong {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const ArtistProfilePage: React.FC = () => {
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID on component mount
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const userData = JSON.parse(userJson);
      setUserId(userData.user_id);
    }
  }, []);

  // Mock data - replace with API call
  const songs: Song[] = [
    { 
      id: '1', 
      title: 'Santa', 
      plays: '600,126,349', 
      duration: '3:26',
      path: '/path/to/santa.mp3'
    },
    { 
      id: '2', 
      title: 'Diluvio', 
      plays: '500,125,196', 
      duration: '3:46',
      path: '/path/to/diluvio.mp3'
    },
    { 
      id: '3', 
      title: 'Dile a él', 
      plays: '400,125,196', 
      duration: '3:15',
      path: '/path/to/dile.mp3'
    },
  ];

  const handleSongPlay = async (song: Song) => {
    try {
      // Prepare song data for player
      const songData = {
        id: song.id,
        title: song.title,
        artist: 'Rauw Alejandro',
        coverUrl: '/path-to-artist-image.jpg',
        audioUrl: `${API_URL}/api/songs/${song.id}/stream`
      };

      // Save to localStorage for player
      localStorage.setItem('currentSong', JSON.stringify(songData));
      setCurrentSongId(song.id);
      setIsPlaying(true);

      // Record play if user is logged in
      if (userId) {
        // Record in play history
        await fetch(`${API_URL}/api/songs/${song.id}/play`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId
          })
        });

        // Increment play count
        await fetch(`${API_URL}/api/songs/${song.id}/increment-plays`, {
          method: 'POST'
        });
      }

      // Navigate to player page
      navigate('/player');

    } catch (error) {
      console.error('Error playing song:', error);
      // You might want to show an error message to the user
    }
  };

  const handleCreatePlaylist = () => {
    navigate('/newplaylist');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('currentSong');
    navigate('/#');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length > 0) {
      navigate(`/search?keyword=${encodeURIComponent(value)}`, { replace: true });
    }
  };

  return (
    <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex font-sans">
      {/* Sidebar */}
      <div className={`w-16 flex flex-col items-center py-4 bg-black border-r border-gray-800 transition-all duration-300 ease-in-out ${isMenuExpanded ? 'w-64' : 'w-16'}`}>
        {/* Sidebar content remains the same */}
      </div>

      {/* Expandable Menu - remains the same */}

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Navigation with Search */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search for Song or Artist"
                className="w-full bg-[#2A2A2A] rounded-full py-2 pl-10 pr-4 text-sm text-[#EBE7CD] focus:outline-none focus:ring-2 focus:ring-[#1ED760]"
              />
            </form>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/homepage" className="text-[#1ED760] hover:text-white">
              <Home className="w-6 h-6" />
            </Link>
            <Link to="/useredit" className="text-[#1ED760] hover:text-white">
              <Settings className="w-6 h-6" />
            </Link>
          </div>
        </div>

        {/* Artist Profile Section */}
        <div className="p-8">
          <div className="bg-[#1A1A1A] rounded-lg p-8">
            <div className="flex items-center space-x-6 mb-8">
              <img 
                src="/path-to-artist-image.jpg"
                alt="Rauw Alejandro"
                className="w-32 h-32 rounded-full object-cover"
              />
              <div>
                <h1 className="text-4xl font-bold mb-2">Rauw Alejandro</h1>
                <button 
                  onClick={() => handleSongPlay(songs[0])} 
                  className="bg-[#1ED760] text-black px-8 py-3 rounded-full font-semibold hover:bg-[#1db954] transition-colors"
                >
                  Play
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Songs Section */}
        <div className="px-8">
          <div className="bg-[#1A1A1A] rounded-lg p-6">
            <div className="space-y-2">
              {songs.map((song) => (
                <div 
                  key={song.id}
                  className="group flex items-center justify-between p-3 rounded-md hover:bg-[#282828] transition-colors cursor-pointer"
                  onClick={() => handleSongPlay(song)}
                >
                  <div className="flex items-center space-x-4">
                    {currentSongId === song.id && isPlaying ? (
                      <Pause className="w-5 h-5 text-[#1ED760]" />
                    ) : (
                      <Play className="w-5 h-5 text-[#1ED760] opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    <div>
                      <p className="font-semibold">{song.title}</p>
                      <p className="text-sm text-gray-400">{song.plays} plays</p>
                    </div>
                  </div>
                  <span className="text-gray-400">{song.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Albums Section */}
        <div className="px-8 mt-8 pb-20"> {/* Added padding bottom for player space */}
          <h2 className="text-xl font-bold mb-4">Albums</h2>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => (
              <div 
                key={index}
                className="bg-[#282828] p-4 rounded-lg cursor-pointer hover:bg-[#3E3E3E] transition-colors"
                onClick={() => navigate(`/album/${index}`)}
              >
                <div className="w-full aspect-square bg-gray-700 rounded-lg mb-4"></div>
                <h3 className="font-semibold">Album {index}</h3>
                <p className="text-sm text-gray-400">2024</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfilePage;