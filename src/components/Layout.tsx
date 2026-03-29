import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      <Navbar />
      <main className={`flex-grow ${isHomePage ? '' : 'pt-28 lg:pt-32'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
