
import React from 'react';

const Header = () => {
  return (
    <header className="relative z-10 px-4 pt-0">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center">
          <img 
            src="/lovable-uploads/7b4c7179-5f77-44b2-8117-fba1f5c3a4a8.png" 
            alt="MemDuo" 
            className="h-64 w-auto mb-5"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))',
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
