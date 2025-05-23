import React from 'react';

/**
 * BlankPage component that shows only the layout structure (header, navigation, footer)
 * @returns {JSX.Element} Blank page component
 */
function BlankPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* This page intentionally left blank - only header, sidebar, and footer will show */}
      <div className="flex items-center justify-center h-64 text-blue-400 text-xl font-light">
        Trang trắng để hiển thị layout (Header, Navigation và Footer)
      </div>
    </div>
  );
}

export default BlankPage; 