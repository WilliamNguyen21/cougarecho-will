import React, { createContext, useState } from 'react';

export const UserContext = createContext();


export const UserProvider = ({ children }) => {
    // State to hold the user data
    const [user, setUser] = useState({ user_id: '', username: '', role_id: -1 });

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};
