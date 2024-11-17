import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Confirm = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/homepage');
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex h-screen bg-[#0B3B24]">
      <div className="w-1/2 p-12 flex flex-col justify-between bg-[#0B3B24]">
        <Link
          to="/"
          className="text-[#FAF5CE] text-2xl font-bold hover:text-[#FFFAD6] transition-colors duration-300"
        >
          echo
        </Link>
        <div className="flex flex-col justify-center h-full">
          <h1 className="text-7xl font-bold text-[#FAF5CE] mb-8">You're in!</h1>
          <p className="text-xl text-[#FAF5CE] mb-4">Welcome to echo. Start exploring and enjoying music!</p>
          <p className="text-lg text-[#FAF5CE]">Redirecting to homepage in 5 seconds...</p>
        </div>
        <div></div> {/* Spacer */}
      </div>
      <div className="w-1/2 bg-[#1C1C1C] flex justify-center items-center relative">
        <img
          src="/public/assets/undraw_celebrating_rtuv 2.png"
          alt="Celebration"
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.svg.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22300%22%20height%3D%22300%22%20fill%3D%22%23cccccc%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-size%3D%2220%22%3EImage%20not%20found%3C%2Ftext%3E%3C%2Fsvg%3E';
            console.error('Error loading image:', e);
          }}
        />
      </div>
    </div>
  );
};

export default Confirm;