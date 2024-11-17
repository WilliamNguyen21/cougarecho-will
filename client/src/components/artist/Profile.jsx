import { useState } from 'react';
import Button from 'react-bootstrap/Button';

import Form from 'react-bootstrap/Form';

class ArtistProfileClass {
  constructor(name, country, bio) {
    this.name = name;
    this.country = country;
    this.bio = bio;
  }
  setName(name) {
    this.name = name;
  }
  setCountry(country) {
    this.country = country;
  }
  setBio(bio) {
    this.bio = bio;
  }
}

export function ArtistProfile() {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(new ArtistProfileClass("","",""))
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");

  const handleButtonClick = () => {
    if(editMode){
      setName("")
    }
  }

  return (
    <Form>
      <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
        <Form.Label>Name</Form.Label>
        <Form.Control type="text" readOnly={!editMode} placeholder="name@example.com" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
        <Form.Label>Country</Form.Label>
        <Form.Control type="text" readOnly={!editMode} placeholder="name@example.com" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
        <Form.Label>Bio</Form.Label>
        <Form.Control as="textarea" readOnly={!editMode} rows={3} />
      </Form.Group>
      <Form.Group >

      <Button onClick={() => setEditMode(!editMode)} variant="light" type="button">
        {!editMode ? 'Edit' : 'Revert'}
      </Button>
      {
        editMode ? (
          <Button variant="light" type="submit">Submit</Button>
        ) : (<></>)
      }
      </Form.Group>
    
    </Form>
  );
}