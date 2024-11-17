import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Search, Home, Settings, Menu, PlusCircle, User, Play, Pause, Edit2, Check, X, Music, LogOut, Image as ImageIcon } from 'lucide-react';
import axios from '../../api/axios';


interface PlaylistData {
  playlist_id: string;
  title: string;  // Changed from name to match backend
  user_id: string; // Changed from creator to match backend
  created_at: string;
  updated_at: string;
  avatar: string | null;
  songs: SongData[];
}
interface SongData {
  song_id: string;
  song_name: string;
  artist_name: string;
  album_name: string;
  duration: number;
  created_at: string;
}

const PlaylistPage = () => {
  const { playlist_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [playlistData, setPlaylistData] = useState({
    playlist_id: '',
    name: '',
    creator: '',
    songCount: 0,
    image: null,
    songs: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token || !playlist_id) {
          navigate('/login');
          return;
        }

        // Fetch playlist details and songs
        const response = await axios.get(`/api/playlist/${playlist_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setPlaylistData(response.data);
        setEditedName(response.data.title);
        setError(null);
      } catch (err) {
        console.error('Error fetching playlist:', err);
        setError('Failed to load playlist');
      } finally {
        setIsLoading(false);
      }
    };

    if (playlist_id) {
      fetchPlaylist();
    }
  }, [playlist_id, navigate]);

  const handleLogout = () => {
    navigate('/#', { state: { message: "You've been logged out" } });
  };

  const handleSearchSongs = async (query) => {
    if (query.length > 2) {
      try {
        const results = await mockApi.searchDatabaseSongs(query);
        setSearchResults(results.filter(result => 
          !playlistData.songs.some(song => song.song_id === result.song_id)
        ));
      } catch (err) {
        console.error('Error searching songs:', err);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAddSong = async (song: SongData) => {
    try {
      await axios.post(`/api/playlist/${playlist_id}/song`, {
        song_id: song.song_id,
        active: 1
      });

      // Update local state to reflect the change
      setPlaylistData(prev => ({
        ...prev,
        songs: [...prev.songs, song],
        songCount: prev.songCount + 1
      }));

      setSearchResults(prev => prev.filter(s => s.song_id !== song.song_id));
    } catch (err) {
      console.error('Error adding song:', err);
      setError('Failed to add song to playlist');
    }
  };
  const handleRemoveSong = async (song_id: string) => {
    try {
      await axios.delete(`/api/playlist/${playlist_id}/song/${song_id}`);
      
      // Update local state
      setPlaylistData(prev => ({
        ...prev,
        songs: prev.songs.filter(s => s.song_id !== song_id),
        songCount: prev.songCount - 1
      }));
    } catch (err) {
      console.error('Error removing song:', err);
      setError('Failed to remove song from playlist');
    }
  };
  const handleEditName = async () => {
    try {
      await axios.put(`/api/playlist/${playlist_id}`, {
        title: editedName,
      });

      setPlaylistData(prev => ({
        ...prev,
        title: editedName
      }));
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Error updating playlist name:', err);
      setError('Failed to update playlist name');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await axios.put(`/api/playlist/${playlist_id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update local state with new image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPlaylistData(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to update playlist image');
    }
  };

  const handleDeletePlaylist = async () => {
    try {
      await axios.delete(`/api/playlist/${playlist_id}`);
      navigate('/userlibrary');
    } catch (err) {
      console.error('Error deleting playlist:', err);
      setError('Failed to delete playlist');
    }
  };

  const togglePlayPause = (songId) => {
    setPlayingSongId(playingSongId === songId ? null : songId);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDateAdded = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
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
          <Link to="/newplaylist" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-[#EBE7CD] hover:text-white" aria-label="Add">
            <PlusCircle className="w-6 h-6" />
          </Link>
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
                <li><Link to="/newplaylist" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center"><PlusCircle className="w-5 h-5 mr-3" /> Create Playlist</Link></li>
              </ul>
            </nav>
            <div className="mt-auto">
              <Link to="/useredit" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center mt-4">
                <User className="w-5 h-5 mr-3" /> Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center mt-4"
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
                value={searchQuery}
                onChange={(e) => handleSearchSongs(e.target.value)}
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

        {/* Playlist content */}
        <div className="flex-1 bg-[#1A1A1A] rounded-lg p-6">
          <div className="flex items-center mb-6">
            <div className="w-40 h-40 bg-[#2A2A2A] rounded-lg mr-6 relative overflow-hidden">
              {playlistData.image ? (
                <img src={playlistData.image} alt="Playlist cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-[#EBE7CD] opacity-50" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <div>
              {isEditing ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-4xl font-bold bg-[#2A2A2A] text-[#EBE7CD] rounded px-2 py-1 mr-2"
                  />
                  <button onClick={handleEditName} className="text-[#1ED760]">
                    <Check className="w-6 h-6" />
                  </button>
                  <button onClick={() => setIsEditing(false)} className="text-red-500 ml-2">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <h2 className="text-4xl font-bold mb-2 flex items-center">
                  {playlistData.name}
                  <button onClick={() => setIsEditing(true)} className="ml-2 text-gray-400 hover:text-white">
                    <Edit2 className="w-5 h-5" />
                  </button>
                </h2>
              )}
              <p className="text-[#A0616A]">{playlistData.creator}</p>
              <p className="text-sm text-[#EBE7CD] opacity-75 mt-1">{playlistData.songCount} songs</p>
            </div>
          </div>

          {/* Songs list */}
          <div className="mb-4">
            <div className="grid grid-cols-4 text-sm font-bold text-[#EBE7CD] opacity-75 mb-2">
              <span></span>
              <span>Title</span>
              <span>Date Added</span>
              <span>Duration</span>
            </div>
            {playlistData.songs.map((song) => (
              <div key={song.song_id} className="grid grid-cols-4 text-sm py-2 hover:bg-[#2A2A2A] rounded items-center">
                <button onClick={() => togglePlayPause(song.song_id)} className="text-[#1ED760] hover:text-white">
                  {playingSongId === song.song_id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <span>{song.title} - {song.artist}</span>
                <span>{formatDateAdded(song.dateAdded)}</span>
                <span>{formatDuration(song.duration)}</span>
              </div>
            ))}
          </div>

          {/* Add songs section */}
          <div className="mt-4">
            <button
              onClick={() => setIsAddingSong(!isAddingSong)}
              className="bg-[#2A2A2A] text-[#EBE7CD] px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#3A3A3A] transition-colors"
            >
              Add Song
            </button>

            {isAddingSong && searchResults.length > 0 && (
              <div className="mt-4 bg-[#2A2A2A] rounded-lg p-4">
                {searchResults.map((song) => (
                  <div key={song.song_id} className="flex justify-between items-center py-2 hover:bg-[#383838] rounded px-2">
                    <div>
                      <div className="text-sm font-semibold">{song.title}</div>
                      <div className="text-xs text-gray-400">{song.artist}</div>
                    </div>
                    <button
                      onClick={() => handleAddSong(song)}
                      className="bg-[#1ED760] text-black px-3 py-1 rounded-full text-sm"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;