import Stack from 'react-bootstrap/Stack';
import { Album } from '../../model/Album';
import { AlbumViewCard } from '../album/AlbumViewCard';



function AlbumCard(album) {
  return (
    <div>ArtistAblumView</div>
  )
}

export function ArtistAblumView() {
  const tempAlbums = [new Album("t", "First"), new Album("s", "Second")];
  return (
    <Stack gap={3}>
      {tempAlbums.map((album, index) => (
        <AlbumViewCard />
        //<div key={index} className="p-2">{album.album_name}</div>

      ))}
      <AlbumViewCard />
    </Stack>
  );
}


