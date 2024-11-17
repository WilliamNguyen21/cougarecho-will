import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Home, Settings, Menu, PlusCircle, User, Play, Edit2, Loader, X, Music, LogOut } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

// Mock API
const mockApi = {
  fetchAdminProfile: () => new Promise(resolve => 
    setTimeout(() => resolve({ name: 'anailemone', playlists: 70 }), 500)
  ),
  fetchIssues: () => new Promise(resolve => 
    setTimeout(() => resolve([
      { id: 1, name: 'Skinny', flags: 10 },
      { id: 2, name: 'Lunch', flags: 5 },
    ]), 500)
  ),
  removeSong: (songId) => new Promise(resolve => 
    setTimeout(() => resolve(), 500)
  ),
};

// Modal Component
const Modal = ({ isOpen, onClose, onConfirm, songName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2A2A2A] p-6 rounded-lg max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#EBE7CD]">Confirm Removal</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-[#EBE7CD]">
            <X size={20} />
          </button>
        </div>
        <p className="text-[#EBE7CD] mb-2">Are you sure you want to remove "{songName}"?</p>
        <p className="text-sm text-gray-400 mb-6">This action will notify the artist.</p>
        <div className="flex justify-end space-x-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-[#EBE7CD] rounded hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-[#EBE7CD] rounded hover:bg-red-700 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminProfile, setAdminProfile] = useState({ name: '', playlists: 0 });
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [songToRemove, setSongToRemove] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [profileData, issuesData] = await Promise.all([
          mockApi.fetchAdminProfile(),
          mockApi.fetchIssues()
        ]);
        setAdminProfile(profileData);
        setIssues(issuesData);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showReportDropdown && !event.target.closest('.report-dropdown')) {
        setShowReportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showReportDropdown]);

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

  const handleActivityTracking = () => {
    navigate('/tracking');
  };

  const handleRemoveSong = async (songId, songName) => {
    setSongToRemove({ id: songId, name: songName });
    setModalOpen(true);
  };

  const confirmRemoveSong = async () => {
    if (songToRemove) {
      try {
        await mockApi.removeSong(songToRemove.id);
        setIssues(issues.filter(issue => issue.id !== songToRemove.id));
        setModalOpen(false);
        setSongToRemove(null);
      } catch (err) {
        console.error('Error removing song:', err);
        alert('Failed to remove the song. Please try again.');
      }
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value.length > 0) {
      navigate(`/search?q=${encodeURIComponent(value)}`, { replace: true });
    } else {
      navigate('/admin', { replace: true });
    }
  };

  const handleGenerateReport = (type) => {
    console.log(`Generating ${type} report...`);
    // Add your report generation logic here
    setShowReportDropdown(false);
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
                <li><Link to="/library" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center"><Music className="w-5 h-5 mr-3" /> Your Library</Link></li>
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-32 h-32 bg-gray-700 rounded-full mr-6"></div>
                <div>
                  <p className="text-sm text-gray-400">Profile</p>
                  <h2 className="text-4xl font-bold">{adminProfile.name}</h2>
                  <p className="text-sm text-gray-400">{adminProfile.playlists} Playlists</p>
                </div>
              </div>
              <Link to="/useredit" className="text-gray-400 hover:text-white">
                <Edit2 className="w-5 h-5" />
              </Link>
            </div>
            
            {/* Buttons section */}
            <div className="flex space-x-4 mt-4">
              <div className="relative report-dropdown">
                <button
                  onClick={() => setShowReportDropdown(!showReportDropdown)}
                  className="bg-[#1ED760] hover:bg-[#1db954] text-black font-semibold py-3 px-6 rounded-full transition-colors duration-200"
                >
                  Generate Report
                </button>
                {showReportDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-[#2A2A2A] rounded-lg shadow-lg overflow-hidden z-50">
                    <button
                      onClick={() => handleGenerateReport('song')}
                      className="w-full px-4 py-2 text-left text-[#EBE7CD] hover:bg-[#3A3A3A] transition-colors"
                    >
                      Song Report
                    </button>
                    <button
                      onClick={() => handleGenerateReport('user')}
                      className="w-full px-4 py-2 text-left text-[#EBE7CD] hover:bg-[#3A3A3A] transition-colors"
                    >
                      User Report
                    </button>
                    <button
                      onClick={() => handleGenerateReport('artist')}
                      className="w-full px-4 py-2 text-left text-[#EBE7CD] hover:bg-[#3A3A3A] transition-colors"
                    >
                      Artist Report
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleActivityTracking}
                className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#EBE7CD] font-semibold py-3 px-6 rounded-full transition-colors duration-200"
              >
                Activity Tracking System
              </button>
            </div>
          </div>

          {/* Issues section */}
          <div>
            <h3 className="text-xl font-bold mb-4">All Issues</h3>
            <div className="grid grid-cols-1 gap-4">
              {issues.map((issue) => (
                <div key={issue.id} className="bg-[#2A2A2A] p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Play className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{issue.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-4 text-sm text-gray-400">{issue.flags} Flags</span>
                    <button 
                      className="text-gray-400 text-sm hover:text-white"
                      onClick={() => handleRemoveSong(issue.id, issue.name)}
                    >
                      Remove Song
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmRemoveSong}
        songName={songToRemove?.name}
      />
    </div>
  );
};

export default Admin;