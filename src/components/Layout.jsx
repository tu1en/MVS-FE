import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import '../styles/vietnamese-fonts.css';
import Header from './Header';
import NavigationBar from './NavigationBar';

/**
 * Layout component that wraps the application with Header
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render between header and content area
 * @returns {JSX.Element} Layout with header and content area
 */
function Layout({ children }) {
  // State to track if sidebar is collapsed
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  
  // Get authentication state from Redux
  const { isLogin } = useSelector((state) => state.auth);

  // Check login status from both Redux and localStorage for reliability
  useEffect(() => {
    const token = localStorage.getItem('token');
    const hasValidToken = !!token;
    const reduxLoginIsTrue = isLogin === true;
    
    // User is logged in if either redux state is true OR valid token exists
    const userLoggedIn = reduxLoginIsTrue || hasValidToken;
    setIsUserLoggedIn(userLoggedIn);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Layout login status:', { 
        reduxLogin: isLogin, 
        tokenExists: hasValidToken, 
        finalStatus: userLoggedIn 
      });
    }
  }, [isLogin]);

  // Listen for custom sidebar toggle event
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setIsSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarToggled', handleSidebarToggle);
    return () => {
      window.removeEventListener('sidebarToggled', handleSidebarToggle);
    };
  }, []);

  if (!isUserLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen bg-white vietnamese-text">
        <Header />
        <div className="flex flex-1 pt-16">
          <NavigationBar />
          <main className="flex-grow w-full">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white vietnamese-text">
      <Header />
      <div className="flex flex-1 pt-16">
        <NavigationBar />
        <main className={`flex-grow w-full transition-all duration-300 px-4 md:px-6 py-6
          ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;