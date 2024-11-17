import React from 'react';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#005743]">
      <main>{children}</main>
    </div>
  );
};