import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Automatically pauses a video when it leaves the viewport, and plays it when it enters.
 * This is crucial for performance to prevent background videos from decoding when off-screen.
 * 
 * @param videoRef The ref to the video element.
 * @param rootMargin Optional root margin for the IntersectionObserver.
 */
export const useVideoAutoPause = (videoRef: RefObject<HTMLVideoElement | null>, rootMargin = '50px 0px') => {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Play the video when it enters the viewport
            video.play().catch(e => {
              // Ignore play interruptions (e.g. user hasn't interacted with document yet)
              console.debug('Autoplay prevented or interrupted', e);
            });
          } else {
            // Pause the video when it leaves the viewport
            video.pause();
          }
        });
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [videoRef, rootMargin]);
};
