import React, { useState, useEffect } from 'react';

interface Album {
  cover_image: string;
  title: string;
  artist: { name: string };
  release_date: string;
  songs: { id: number; track_number: number; title: string; duration: string }[];
}

interface AlbumPageProps {
  id: string;
}

const AlbumPage: React.FC<AlbumPageProps> = ({ id }) => {
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        const response = await fetch(`/api/albums/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch album data');
        }
        const data: Album = await response.json(); // Typecast response data
        setAlbum(data);
      } catch (err: any) { // Ensure error is cast properly
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!album) return <div>No album found</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-4">
          <img 
            src={album.cover_image} 
            alt={`${album.title} cover`} 
            className="w-32 h-32 object-cover rounded-md"
          />
          <div>
            <h1 className="text-3xl font-bold">{album.title}</h1>
            <p className="text-lg">{album.artist.name}</p>
            <p className="text-sm text-gray-500">
              Released on {new Date(album.release_date).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Tracks</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left pb-2 w-[50px]">#</th>
              <th className="text-left pb-2">Title</th>
              <th className="text-right pb-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            {album.songs.map((song) => (
              <tr key={song.id} className="border-b last:border-b-0">
                <td className="py-2 font-medium">{song.track_number}</td>
                <td className="py-2">{song.title}</td>
                <td className="py-2 text-right">{song.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlbumPage;
