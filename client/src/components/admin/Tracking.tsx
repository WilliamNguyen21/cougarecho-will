import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, PlusCircle, User, Home, Settings, Trash2, X, Music, LogOut, ChevronDown } from 'lucide-react';

interface Activity {
  id: number;
  date: string;
}

type SortOption = "Newest to Oldest" | "Oldest to Newest";

const SORT_OPTIONS: SortOption[] = [
  "Newest to Oldest",
  "Oldest to Newest"
];

const TrackingList: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuExpanded, setIsMenuExpanded] = useState<boolean>(false);
  const [accountType, setAccountType] = useState<string>('admin');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>('Newest to Oldest');
  const [activities, setActivities] = useState<Activity[]>([
    { id: 1, date: '04/04/2024' },
    { id: 2, date: '04/15/2024' }
  ]);

  useEffect(() => {
    document.title = 'Activity Tracking';
    fetchAccountType();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.sort-dropdown')) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAccountType = (): void => {
    setTimeout(() => {
      const types = ['listener', 'admin', 'artist'];
      setAccountType(types[Math.floor(Math.random() * types.length)]);
    }, 1000);
  };

  const handleAddNew = (): void => {
    navigate('/newtrack');
  };

  const handleCreatePlaylist = (): void => {
    navigate('/newplaylist');
  };

  const handleLogout = (): void => {
    localStorage.removeItem('userToken');
    sessionStorage.clear();
    navigate('/#', { 
      state: { 
        showLogoutMessage: true,
        message: "You've been logged out successfully" 
      } 
    });
  };

  const handleSort = (sortOption: SortOption): void => {
    setSelectedSort(sortOption);
    const sortedActivities = [...activities].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOption === 'Newest to Oldest' ? dateB - dateA : dateA - dateB;
    });
    setActivities(sortedActivities);
    setShowSortDropdown(false);
  };

  const handleDeleteClick = (activity: Activity): void => {
    setActivityToDelete(activity);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = (): void => {
    if (activityToDelete) {
      setActivities(activities.filter(activity => activity.id !== activityToDelete.id));
      setShowDeleteModal(false);
      setActivityToDelete(null);
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
          <button onClick={handleAddNew} className="w-10 h-10 bg-[#282828] rounded-full flex items-center justify-center text-[#1ED760] hover:text-white" aria-label="Add">
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
                <li><button onClick={handleAddNew} className="text-[#FAF5CE] hover:text-[#1ED760] flex items-center"><PlusCircle className="w-5 h-5 mr-3" /> Add New Track</button></li>
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

        {/* Activity Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-[#FAF5CE] mb-6">Activity Tracking System</h1>
            
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg text-[#FAF5CE]">Activity Sort by Date</h2>
                  <div className="relative sort-dropdown">
                    <div
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className="flex items-center gap-2 bg-[#282828] px-4 py-2 rounded-lg cursor-pointer hover:bg-[#333333] transition-colors"
                    >
                      <span className="text-[#FAF5CE]">{selectedSort}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${showSortDropdown ? 'transform rotate-180' : ''}`} />
                    </div>
                    {showSortDropdown && (
                      <div className="absolute mt-1 w-full bg-[#282828] border border-[#333333] rounded-lg py-1 z-50">
                        {SORT_OPTIONS.map((option) => (
                          <div
                            key={option}
                            className="px-4 py-2 hover:bg-[#333333] cursor-pointer"
                            onClick={() => handleSort(option)}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleAddNew}
                  className="bg-[#4a8f4f] text-[#FAF5CE] px-4 py-2 rounded-md hover:bg-[#5aa55f] transition-colors"
                >
                  + Add New
                </button>
              </div>

              {/* Activity List */}
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="border border-[#FAF5CE] rounded p-3 flex items-center"
                  >
                    <button
                      onClick={() => handleDeleteClick(activity)}
                      className="text-[#FAF5CE] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 mr-4" />
                    </button>
                    <span className="text-[#FAF5CE]">{activity.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-[#282828] p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-[#FAF5CE] mb-4">Are you sure?</h3>
            <p className="text-[#FAF5CE] mb-6">
              Are you sure you want to delete this activity? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-[#333333] text-[#FAF5CE] rounded-lg hover:bg-[#404040] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-[#FAF5CE] rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingList;
