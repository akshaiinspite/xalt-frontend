import React, { useRef } from 'react';
import type { VideoHTMLAttributes } from 'react';
import { useVideoAutoPause } from '../../hooks/useVideoAutoPause';

/**
 * A drop-in replacement for the standard HTML5 <video> element.
 * Automatically pauses when scrolled out of view to save CPU/GPU resources.
 */
export const AutoPauseVideo: React.FC<VideoHTMLAttributes<HTMLVideoElement>> = (props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useVideoAutoPause(videoRef);

  return (
    <video ref={videoRef} {...props}>
      {props.children}
    </video>
  );
};
