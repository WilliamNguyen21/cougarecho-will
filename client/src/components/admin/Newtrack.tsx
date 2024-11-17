import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Settings, Menu, PlusCircle, User, X, Music, LogOut, Save, Circle, ChevronDown } from 'lucide-react';

const REASONS = [
  "Ban song",
  "Flag artist",
  "Delete user"
];

const NewTrack = () => {
  const navigate = useNavigate();
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [accountType, setAccountType] = useState('admin');
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedReason, setSelectedReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [trackData, setTrackData] = useState({
    activity: '',
    details: ''
  });

  useEffect(() => {
    document.title = 'New Track Entry';
    fetchAccountType();

    const handleClickOutside = (event) => {
      if (!event.target.closest('.reason-dropdown')) {
        setShowReasonDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAccountType = () => {
    setTimeout(() => {
      const types = ['listener', 'admin', 'artist'];
      setAccountType(types[Math.floor(Math.random() * types.length)]);
    }, 1000);
  };

  const handleDateSelection = (newDate) => {
    setSelectedDate(newDate);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedReason) {
      alert('Please select a reason');
      return;
    }

    if (!trackData.activity) {
      alert('Please enter an activity description');
      return;
    }

    const trackToSave = {
      date: selectedDate,
      reason: selectedReason,
      ...trackData
    };

    try {
      console.log('Saving track:', trackToSave);
      setSuccessMessage('Track saved successfully!');
      setTimeout(() => {
        navigate('/tracking');
      }, 2000);
    } catch (error) {
      console.error('Error saving track:', error);
      alert('Failed to save track. Please try again.');
    }
  };

  return (
    <div className="bg-black text-[#FAF5CE] min-h-screen flex font-sans">
      {/* Sidebar */}
      <div className={`w-16 flex flex-col items-center py-4 bg-black border-r border-[#333333] transition-all duration-300 ease-in-out ${isMenuExpanded ? 'w-64' : 'w-16'}`}>
        <div className="flex flex-col items-center space-y-4 mb-8">
          <button onClick={() => setIsMenuExpanded(!isMenuExpanded)} className="text-[#1ED760] hover:text-white" aria-label="Menu">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow"></div>
        <div className="mt-auto flex flex-col items-center space-y-4 mb-4">
          <button onClick={handleCreatePlaylist} className="w-10 h-10 bg-[#282828] rounded-full flex items-center justify-center text-[#1ED760] hover:text-white" aria-label="Add">
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
          <div className="bg-black w-64 h-full p-4">
            <button onClick={() => setIsMenuExpanded(false)} className="mb-8 text-[#1ED760]">
              <X className="w-6 h-6" />
            </button>
            <nav>
              <ul className="space-y-4">
                <li><Link to="/homepage" className="text-[#FAF5CE] hover:text-[#1ED760] flex items-center"><Home className="w-5 h-5 mr-3" /> Home</Link></li>
                <li><Link to="/userlibrary" className="text-[#FAF5CE] hover:text-[#1ED760] flex items-center"><Music className="w-5 h-5 mr-3" /> Your Library</Link></li>
                <li><button onClick={handleCreatePlaylist} className="text-[#FAF5CE] hover:text-[#1ED760] flex items-center"><PlusCircle className="w-5 h-5 mr-3" /> Create Playlist</button></li>
              </ul>
            </nav>
            <div className="mt-auto">
              <Link to="/useredit" className="text-[#FAF5CE] hover:text-[#1ED760] flex items-center mt-4">
                <User className="w-5 h-5 mr-3" /> Profile ({accountType})
              </Link>
              <button onClick={handleLogout} className="text-[#FAF5CE] hover:text-[#1ED760] flex items-center mt-4 w-full">
                <LogOut className="w-5 h-5 mr-3" /> Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-black p-4 flex justify-end items-center">
          <div className="flex items-center space-x-4">
            <Link to="/homepage" className="text-[#1ED760] hover:text-white">
              <Home className="w-6 h-6" />
            </Link>
            <Link to="/useredit" className="text-[#1ED760] hover:text-white">
              <Settings className="w-6 h-6" />
            </Link>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#FAF5CE] mb-2">New Activity Track</h1>
            </div>

            {successMessage && (
              <div className="bg-[#1ED760] text-black p-4 rounded-lg mb-6">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-[#282828] rounded-lg p-6">
              <div className="mb-6">
                <label className="block text-[#FAF5CE] mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateSelection(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg py-2 px-3 text-[#FAF5CE]"
                  required
                />
              </div>

              <div className="mb-6 relative reason-dropdown">
                <label className="block text-[#FAF5CE] mb-2">Reason</label>
                <div 
                  onClick={() => setShowReasonDropdown(!showReasonDropdown)}
                  className="flex items-center justify-between w-full bg-[#1A1A1A] border border-[#333333] rounded-lg py-2 px-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Circle className="w-5 h-5 text-[#FAF5CE]" />
                    <span className="text-[#FAF5CE]">
                      {selectedReason || "Select reason"}
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showReasonDropdown ? 'transform rotate-180' : ''}`} />
                </div>
                {showReasonDropdown && (
                  <div className="absolute w-full mt-1 bg-[#1A1A1A] border border-[#333333] rounded-lg py-1 z-50">
                    {REASONS.map((reason) => (
                      <div
                        key={reason}
                        className="px-3 py-2 hover:bg-[#282828] cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          setSelectedReason(reason);
                          setShowReasonDropdown(false);
                        }}
                      >
                        <Circle className="w-4 h-4" />
                        {reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-[#FAF5CE] mb-2">Activity</label>
                <input
                  type="text"
                  value={trackData.activity}
                  onChange={(e) => setTrackData({...trackData, activity: e.target.value})}
                  placeholder="Enter activity description"
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg py-2 px-3 text-[#FAF5CE]"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-[#FAF5CE] mb-2">Details</label>
                <textarea
                  value={trackData.details}
                  onChange={(e) => setTrackData({...trackData, details: e.target.value})}
                  placeholder="Enter additional details"
                  rows="4"
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg py-2 px-3 text-[#FAF5CE] resize-none"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/tracking')}
                  className="px-4 py-2 bg-[#333333] text-[#FAF5CE] rounded-lg hover:bg-[#404040] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1ED760] text-black rounded-lg hover:bg-[#1DB954] transition-colors flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Track
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTrack;