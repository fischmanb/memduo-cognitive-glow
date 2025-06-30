
import React, { useState, useEffect } from 'react';
import { removeBackground, loadImage } from '../utils/backgroundRemoval';

const Header = () => {
  const [processedLogoUrl, setProcessedLogoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processLogo = async () => {
      try {
        console.log('Starting logo background removal...');
        
        // Fetch the original image
        const response = await fetch('/lovable-uploads/766b3c52-b410-4ef2-ada9-da155fa645d3.png');
        const blob = await response.blob();
        
        // Load as image element
        const imageElement = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        
        // Create URL for processed image
        const url = URL.createObjectURL(processedBlob);
        setProcessedLogoUrl(url);
        
        console.log('Logo background removal completed successfully');
      } catch (error) {
        console.error('Failed to remove background from logo:', error);
        // Fallback to original image
        setProcessedLogoUrl('/lovable-uploads/766b3c52-b410-4ef2-ada9-da155fa645d3.png');
      } finally {
        setIsProcessing(false);
      }
    };

    processLogo();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center">
          {isProcessing ? (
            <div className="h-12 w-32 bg-white/10 animate-pulse rounded"></div>
          ) : (
            <img 
              src={processedLogoUrl || '/lovable-uploads/766b3c52-b410-4ef2-ada9-da155fa645d3.png'} 
              alt="MemDuo" 
              className="h-12 w-auto"
              style={{
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
