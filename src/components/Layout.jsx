import { useState, useEffect } from 'react';
import Footer from './Footer';
import Header from './Header';
import NavigationBar from './NavigationBar';

function Layout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    console.log(token);

    const handleSidebarToggle = (event) => {
      setIsSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarToggled', handleSidebarToggle);
    return () => {
      window.removeEventListener('sidebarToggled', handleSidebarToggle);
    };
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
      <Header />
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <div className="flex flex-1 pt-16">
        <NavigationBar />
        <main className={`flex-grow w-full transition-all duration-300 px-4 md:px-6 py-6
          ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
          {children}
        </main>
      </div>
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <Footer />
      </div>
    </div>
  );
}

export default Layout;