import React, { Component, useState } from 'react';
import { ArtistSidebar } from './Sidebar';
import { ArtistProfile } from './Profile';
import { ArtistAblumView } from './ArtistAblumView';
//import { ArtistSongView } from './ArtistSongView';
import { AlbumAdd } from '../album/AlbumAdd';
import './Styles.css'
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

export function ArtistHome(props = "") {
    const [display, setDisplay] = useState(props)

    function GetDisplay() {
        switch (display) {
            case 'profile':
                return <ArtistProfile />;
            case 'album':
                return <ArtistAblumView />;
            case 'song':
                return <> </>;
            case 'album-add':
                return <AlbumAdd />;
            default:
                return <></>;
        }
    }
    return (
        <Container >
            <Row>
                <Col>

                    <ArtistSidebar onMenuItemClick={setDisplay} />
                </Col>
                <Col>

                    <GetDisplay />
                </Col>
            </Row>



        </Container>

    )

};