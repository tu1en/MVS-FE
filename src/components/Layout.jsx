import { useState, useEffect } from 'react';
import Footer from './Footer';
import Header from './Header';
import NavigationBar from './NavigationBar';
import { useSelector } from 'react-redux';

/**
 * Layout component that wraps the application with Header and Footer
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render between header and footer
 * @returns {JSX.Element} Layout with header, content area, and footer
 */
function Layout({ children }) {
  // State to track if sidebar is collapsed
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isLogin, role } = useSelector((state) => state.auth);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const token = localStorage.getItem('token');

  // Listen for custom sidebar toggle event
  useEffect(() => {
    // Check if user is logged in
    // setIsLoggedIn(!!token);

    const handleSidebarToggle = (event) => {
      setIsSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarToggled', handleSidebarToggle);
    return () => {
      window.removeEventListener('sidebarToggled', handleSidebarToggle);
    };
  }, [isLogin]);

  if (!isLogin) {
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