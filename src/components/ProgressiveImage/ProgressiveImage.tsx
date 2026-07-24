import React, { useState, useRef, useEffect } from 'react';

interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  rootMargin?: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({ 
  src, 
  className = '', 
  style, 
  onLoad,
  width,
  height,
  loading = 'lazy',
  rootMargin = '600px 0px',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Transform image URL to .webp if available
  const getOptimizedSrc = (originalSrc?: string) => {
    if (!originalSrc) return undefined;
    if (typeof originalSrc === 'string') {
      if ((originalSrc.includes('/uploads/') || originalSrc.includes('/assets/')) && (originalSrc.endsWith('.jpg') || originalSrc.endsWith('.jpeg') || originalSrc.endsWith('.png'))) {
        if (!originalSrc.includes('-240.')) {
          return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        }
      }
    }
    return originalSrc;
  };

  const finalSrc = getOptimizedSrc(src);

  // Respect native browser lazy loading & instant cached image checks
  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, [finalSrc]);

  return (
    <img
      ref={imgRef}
      src={finalSrc}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
      width={width}
      height={height}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0.85,
        transition: 'opacity 0.2s ease-out',
      }}
      onLoad={(e) => {
        setIsLoaded(true);
        if (onLoad) onLoad(e);
      }}
      decoding="async"
      loading={loading}
      {...props}
    />
  );
};
