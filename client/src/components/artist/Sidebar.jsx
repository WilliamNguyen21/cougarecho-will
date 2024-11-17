import { useState } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';


const ArtistSidebar = ({ onMenuItemClick }) => {

    const [collapsed, setCollapsed] = useState(true);

    const handleMouseEnter = () => {
        setCollapsed(false);
    }
    const handleMouseExit = () => {
        setCollapsed(true);
    }
    return (
        <>
            <Sidebar collapsed={collapsed} onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseExit}>
                <Menu
                    menuItemStyles={{
                        button: {
                            // the active class will be added automatically by react router
                            // so we can use it to style the active menu item
                            [`&.active`]: {
                                backgroundColor: '#13395e',
                                color: '#b6c8d9',
                            },
                        },
                    }}
                >

                    <MenuItem onClick={() => onMenuItemClick("profile")}> Profile</MenuItem>
                    <MenuItem onClick={() => onMenuItemClick("album")}> Albums</MenuItem>
                    <MenuItem onClick={() => onMenuItemClick("album-add")}> Add Album</MenuItem>
                    <MenuItem onClick={() => onMenuItemClick("song")}> Songs</MenuItem>

                </Menu>
            </Sidebar>
        </>
    );
}
    ;

export { ArtistSidebar };