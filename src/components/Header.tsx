
import React from 'react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/766b3c52-b410-4ef2-ada9-da155fa645d3.png" 
            alt="MemDuo" 
            className="h-16 w-auto brightness-0 invert"
            style={{
              filter: 'brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
