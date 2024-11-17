import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';


export function Topbar() {
    return (
        <>
            <Navbar bg="light" data-bs-theme="light">
                <Container>
                    <Navbar.Brand component={<Link to="/counter"/>}>Navbar</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="/counter">Home</Nav.Link>
                        <Nav.Link component={<Link to="/counter"/>}>Home</Nav.Link>
                        <Nav.Link component={<Link to="/counter"/>}>Home</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
        </>
    );
}