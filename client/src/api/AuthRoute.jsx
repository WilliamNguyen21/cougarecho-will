import React, { useContext, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../context/UserContext';


// Authenticated route component
const AuthRoute = ({ role }) => {
    const [token] = useState(() =>
        localStorage.getItem('token'))
    const { user } = useContext(UserContext)

    return token && role <= user.role_id ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AuthRoute;