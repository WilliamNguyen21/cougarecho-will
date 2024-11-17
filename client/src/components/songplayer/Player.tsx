import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, ChevronDown, ChevronUp } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl: string;
}

interface MusicPlayerProps {
  currentSong: Song | null;
  userId: string; // Add userId prop for database operations
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ currentSong, userId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songProgress, setSongProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check if song is liked when song changes
  useEffect(() => {
    if (currentSong) {
      checkIfSongIsLiked();
    }
  }, [currentSong]);

  // Check if song is liked by user
  const checkIfSongIsLiked = async () => {
    if (!currentSong || !userId) return;

    try {
      const response = await fetch(`/api/likes/check?userId=${userId}&songId=${currentSong.id}`);
      const data = await response.json();
      setIsLiked(data.isLiked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  // Handle liking/unliking songs
  const toggleLike = async () => {
    if (!currentSong || !userId) return;

    try {
      if (isLiked) {
        // Remove like
        await fetch(`/api/likes`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            song_id: currentSong.id
          })
        });
      } else {
        // Add like
        await fetch(`/api/likes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            song_id: currentSong.id
          })
        });
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Initialize audio when song changes
  useEffect(() => {
    if (currentSong) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = currentSong.audioUrl;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentSong]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Update progress bar
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateProgress = () => {
        setSongProgress((audio.currentTime / audio.duration) * 100);
      };

      audio.addEventListener('timeupdate', updateProgress);
      return () => audio.removeEventListener('timeupdate', updateProgress);
    }
  }, []);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (!currentSong) return null;

  return (
    <div className={`fixed transition-all duration-300 ease-in-out bg-[#121212] text-[#EBE7CD] z-50
      ${isExpanded ? 'inset-0' : 'bottom-0 left-0 right-0 h-16'}`}>
      
      {/* Full Player View */}
      {isExpanded && (
        <div className="h-full flex flex-col p-8">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={toggleExpanded}
              className="text-[#1ED760] hover:text-white"
            >
              <ChevronDown className="w-8 h-8" />
            </button>
          </div>
          
          <div className="flex-grow flex items-center justify-center">
            <div className="w-64 h-64 bg-[#282828] rounded-lg overflow-hidden">
              {currentSong.coverUrl && (
                <img 
                  src={currentSong.coverUrl} 
                  alt={`${currentSong.title} cover`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          <div className="max-w-xl mx-auto w-full space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">{currentSong.title}</h2>
              <p className="text-gray-400">{currentSong.artist}</p>
            </div>

            <div className="flex justify-center items-center space-x-8">
              <SkipBack className="w-8 h-8 cursor-pointer hover:text-[#1ED760]" />
              <button
                onClick={togglePlay}
                className="w-16 h-16 bg-[#1ED760] rounded-full flex items-center justify-center hover:bg-[#1DB954]"
              >
                {isPlaying ? 
                  <Pause className="w-8 h-8 text-black" /> : 
                  <Play className="w-8 h-8 text-black" />
                }
              </button>
              <SkipForward className="w-8 h-8 cursor-pointer hover:text-[#1ED760]" />
            </div>

            <div className="w-full bg-[#282828] rounded-full h-1">
              <div 
                className="bg-[#1ED760] h-1 rounded-full" 
                style={{ width: `${songProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer Player View */}
      {!isExpanded && (
        <div className="h-full flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleExpanded}
              className="text-[#1ED760] hover:text-white"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 bg-[#282828] rounded overflow-hidden">
              {currentSong.coverUrl && (
                <img 
                  src={currentSong.coverUrl} 
                  alt={`${currentSong.title} cover`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div>
              <p className="font-medium">{currentSong.title}</p>
              <p className="text-sm text-gray-400">{currentSong.artist}</p>
            </div>
            <button 
              onClick={toggleLike}
              className="focus:outline-none"
            >
              <Heart 
                className={`w-5 h-5 ${isLiked ? 'fill-[#1ED760] text-[#1ED760]' : 'text-gray-400 hover:text-white'}`} 
              />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <SkipBack className="w-5 h-5 cursor-pointer hover:text-[#1ED760]" />
            <button
              onClick={togglePlay}
              className="w-8 h-8 bg-[#1ED760] rounded-full flex items-center justify-center hover:bg-[#1DB954]"
            >
              {isPlaying ? 
                <Pause className="w-4 h-4 text-black" /> : 
                <Play className="w-4 h-4 text-black" />
              }
            </button>
            <SkipForward className="w-5 h-5 cursor-pointer hover:text-[#1ED760]" />
          </div>

          <div className="w-1/3">
            <div className="w-full bg-[#282828] rounded-full h-1">
              <div 
                className="bg-[#1ED760] h-1 rounded-full" 
                style={{ width: `${songProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;