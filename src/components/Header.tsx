
import React from 'react';

const Header = () => {
  return (
    <header className="relative z-10 px-4 pt-0">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center">
          <img 
            src="/lovable-uploads/b8c23cd3-4a1d-4cc1-81fc-9b1d0f9ea54a.png" 
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
