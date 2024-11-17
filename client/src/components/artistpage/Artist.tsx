import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Home, Settings, Menu, PlusCircle, User, Play, Edit2, Loader, X, Music, LogOut } from 'lucide-react';
import { UserContext } from '../../context/UserContext';
import axios from '../../api/axios';

// Mock API
const mockApi = {
  fetchArtistProfile: () => new Promise(resolve =>
    setTimeout(() => resolve({ name: 'Tyler, Creator', albums: 2, songs: 36 }), 500)
  ),
  fetchLatestAlbum: () => new Promise(resolve =>
    setTimeout(() => resolve({
      name: 'Trousers',
      streams: 600000,
      likesSaves: 45000
    }), 500)
  ),
};

const Artist = () => {
  const { user } = useContext(UserContext)
  const navigate = useNavigate();
  const location = useLocation();
  const [artistProfile, setArtistProfile] = useState({ artist_id: '', display_name: '', album_count: 0, song_count: 0 });
  const [latestAlbum, setLatestAlbum] = useState({ name: '', streams: 0, likesSaves: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      console.log(user)
      try {
        const [artistRes, albumData] = await Promise.all([
          axios.get('/artist/' + user.user_id),
          mockApi.fetchLatestAlbum()
        ]);
        console.log(artistRes?.data)
        const { display_name, album_count, song_count } = artistRes?.data;
        const profileData = artistRes?.data;
        setArtistProfile({ display_name, album_count, song_count });
        setLatestAlbum(albumData);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q');
    if (query) {
      setSearchValue(query);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    sessionStorage.clear();

    navigate('/#', {
      state: {
        showLogoutMessage: true,
        message: "You've been logged out successfully"
      }
    });
  };

  const handleCreatePlaylist = () => {
    navigate('/newplaylist');
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value.length > 0) {
      navigate(`/search?q=${encodeURIComponent(value)}`, { replace: true });
    } else {
      navigate('/artist', { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <Loader className="w-10 h-10 text-[#1ED760] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex font-sans">
      {/* Sidebar */}
      <div className={`w-16 flex flex-col items-center py-4 bg-black border-r border-gray-800 transition-all duration-300 ease-in-out ${isMenuExpanded ? 'w-64' : 'w-16'}`}>
        <div className="flex flex-col items-center space-y-4 mb-8">
          <button onClick={() => setIsMenuExpanded(!isMenuExpanded)} className="text-[#1ED760] hover:text-white" aria-label="Menu">
            <Menu className="w-6 h-6" />
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
                <li><button onClick={handleCreatePlaylist} className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center"><PlusCircle className="w-5 h-5 mr-3" /> Create Playlist</button></li>
              </ul>
            </nav>
            <div className="mt-auto">
              <Link to="/useredit" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center mt-4">
                <User className="w-5 h-5 mr-3" /> Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center mt-4 w-full"
              >
                <LogOut className="w-5 h-5 mr-3" /> Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for Song or Artist"
                className="w-full bg-[#2A2A2A] rounded-full py-2 pl-10 pr-4 text-sm text-[#EBE7CD] focus:outline-none focus:ring-2 focus:ring-white"
                value={searchValue}
                onChange={handleSearchChange}
              />
            </div>
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

        {/* Main rectangle */}
        <div className="flex-1 bg-[#1A1A1A] rounded-lg p-6">
          {/* Profile section */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full mr-6"></div>
              <div>
                <p className="text-sm text-gray-400">Artist Profile</p>
                <h2 className="text-4xl font-bold mb-2">{artistProfile.display_name}</h2>
                <p className="text-sm text-gray-400 mb-4">{artistProfile.album_count} Albums, {artistProfile.song_count} Songs</p>
                <div className="flex space-x-4">
                  <Link
                    to="/newalbum"
                    className="bg-[#2A2A2A] text-[#EBE7CD] px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#3A3A3A] transition-colors"
                  >
                    Add New Album
                  </Link>
                </div>
              </div>
            </div>
            <Link to="/useredit" className="text-gray-400 hover:text-white">
              <Edit2 className="w-5 h-5" />
            </Link>
          </div>

          {/* Latest Album */}
          <div className="bg-[#2A2A2A] rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Latest Album</h3>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-2xl font-bold mb-2">{latestAlbum.name}</h4>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Streams: {latestAlbum.streams.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">Likes/Saves: {latestAlbum.likesSaves.toLocaleString()}</p>
                </div>
              </div>
              <button className="bg-[#1ED760] text-black px-4 py-2 rounded-full text-sm hover:bg-[#1DB954] transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Artist;