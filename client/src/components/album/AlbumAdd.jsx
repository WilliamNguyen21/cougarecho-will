import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Form from 'react-bootstrap/Form';

class Album {
    constructor(album_name, release_date, image, desc = "") {
        this.album_name = album_name;
        this.release_date = release_date;
        this.image = image;
        this.desc = desc;
    }
}

export function AlbumAdd() {
    const [editMode, setEditMode] = useState(true);
    const [album, setAlbum] = useState({
        albumName: "",
        releaseDate: "",
        image: "",
        desc: ""
    })
    const handleChange = (e) => {
        setAlbum(prev => ({ ...prev, [e.target.name]: e.target.value }))
        console.log(album.albumName)
    }
    const handleDateChange = (date) => {
        setAlbum({ ...album, releaseDate: date });
    };
    const handleSubmit = () => {
        console.log("Submit")
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" name='albumName' value={album.albumName} onChange={handleChange} readOnly={!editMode} />
            </Form.Group>
            <Form.Group className="mb-3" >
                <Form.Label>Release Date</Form.Label>


                <DatePicker
                    closeOnScroll={(e) => e.target === document}
                    selected={album.releaseDate}
                    onChange={handleDateChange}
                    peekNextMonth
                    //showMonthDropdown
                    //showYearDropdown
                    dropdownMode="select"
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Select Release Date"
                    required
                    readOnly={!editMode}
                />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={3} name='desc' value={album.desc} onChange={handleChange} readOnly={!editMode} />
            </Form.Group>
            <Form.Group >

                <Button onClick={() => setEditMode(!editMode)} variant="light" type="button">
                    {!editMode ? 'Edit' : 'Save'}
                </Button>

            </Form.Group>

        </Form>
    );
}