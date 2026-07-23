import React, { useState, useRef } from 'react';
import { useInView } from 'framer-motion';

/**
 * A drop-in replacement for the standard HTML5 <img> element.
 * It waits until it's near the viewport to request the full image,
 * and fades in smoothly once loaded.
 */
interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  rootMargin?: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({ 
  src, 
  className = '', 
  style, 
  onLoad,
  rootMargin = '800px 0px', // Increased default margin so it loads way before scrolling into view
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Only start loading when the image is within the specified margin of entering the viewport
  const isInView = useInView(imgRef, { once: true, margin: rootMargin as any });

  return (
    <img
      ref={imgRef}
      src={isInView ? src : undefined}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
        // Optional: show a faint background while loading
        backgroundColor: isLoaded ? 'transparent' : 'rgba(255,255,255,0.05)',
      }}
      onLoad={(e) => {
        setIsLoaded(true);
        if (onLoad) onLoad(e);
      }}
      decoding="async"
      {...props}
    />
  );
};
