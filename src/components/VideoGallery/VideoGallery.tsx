import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { ScrollRevealText } from '../ScrollRevealText/ScrollRevealText';
import { useVideoAutoPause } from '../../hooks/useVideoAutoPause';
import './VideoGallery.css';

// Import videos
const vid1 = '/video/video-gallery/movie-motion-poster-4.min.mp4';
const vid2 = '/video/video-gallery/movie-motion-poster-6.min.mp4';
const vid3 = '/video/video-gallery/pre-viz-1.min.mp4';
const vid4 = '/video/video-gallery/pre-viz-2.min.mp4';

const videos = [
  { id: 'vid1', src: vid1 },
  { id: 'vid2', src: vid2 },
  { id: 'vid3', src: vid3 },
  { id: 'vid4', src: vid4 },
];

const VideoPlayer = ({ 
  video, 
  index,
  activeAudioId, 
  setActiveAudioId 
}: { 
  video: typeof videos[0], 
  index: number,
  activeAudioId: string | null, 
  setActiveAudioId: (id: string | null) => void 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Detect if the video container is at least 10% in the viewport
  const isInView = useInView(containerRef, { amount: 0.1 });

  useVideoAutoPause(videoRef);

  const isMuted = activeAudioId !== video.id;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // If the video leaves the viewport and it was playing audio, mute it
  useEffect(() => {
    if (!isInView && !isMuted) {
      setActiveAudioId(null);
    }
  }, [isInView, isMuted, setActiveAudioId]);

  const toggleAudio = () => {
    if (isMuted) {
      setActiveAudioId(video.id);
    } else {
      setActiveAudioId(null);
    }
  };

  return (
    <motion.div 
      ref={containerRef}
      className="video-grid-item"
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.4, ease: [0.19, 1.0, 0.22, 1.0], delay: index % 2 !== 0 ? 0.15 : 0 }}
    >
      <div className="video-wrapper">
        <video 
          ref={videoRef}
          src={video.src} 
          className="gallery-video"
          autoPlay 
          loop 
          muted={true} 
          playsInline
        />
        <button className="audio-toggle-btn" onClick={toggleAudio} aria-label="Toggle Audio">
          {isMuted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          )}
        </button>
      </div>
    </motion.div>
  );
};

const VideoGallery = () => {
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

  const introText = "Explore our cinematic world. We blend pure imagination with precision to push boundaries.";

  return (
    <section className="video-gallery-section">
      <div className="gallery-intro-text">
        <ScrollRevealText text={introText} elementType="p" splitBy="word" className="" />
      </div>

      <div className="video-grid">
        {videos.map((video, idx) => (
          <VideoPlayer 
            key={video.id} 
            video={video} 
            index={idx}
            activeAudioId={activeAudioId}
            setActiveAudioId={setActiveAudioId}
          />
        ))}
      </div>
    </section>
  );
};

export default VideoGallery;
