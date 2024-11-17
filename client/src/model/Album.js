export class Album {
    constructor(artist_name, album_name ) {
        this.artist_name = artist_name;
        this.album_name = album_name;
    }
    getName() {
        return this.album_name;
    }
}