import React, { useRef, useState, useEffect } from 'react';
import { useInView, motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import './RevealText.css';

// Import the videos
import vid1 from '../../assets/video/para/movie-motion-poster-1.min.mp4';
import vid2 from '../../assets/video/para/movie-motion-poster-2.min.mp4';
import vid3 from '../../assets/video/para/pre-viz-1.min.mp4';
import vid4 from '../../assets/video/para/pre-viz-2.min.mp4';

interface HoverVideoProps {
  src: string;
  id: string;
  activeAudioId: string | null;
  onToggleAudio: (id: string) => void;
}

const HoverVideo = ({ src, id, activeAudioId, onToggleAudio }: HoverVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPlayingAudio = activeAudioId === id;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isPlayingAudio;
    }
  }, [isPlayingAudio]);

  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleAudio(id);
  };

  return (
    <span className="inline-video-wrapper">
      <video 
        ref={videoRef} 
        src={src} 
        autoPlay 
        loop 
        muted={!isPlayingAudio}
        playsInline 
        className="inline-video" 
      />
      <button className="audio-toggle" onClick={handleAudioClick}>
        {!isPlayingAudio ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        )}
      </button>
    </span>
  );
};

const RevealWord = ({ 
  children, progress, start, end 
}: { 
  children: React.ReactNode, progress: MotionValue<number>, start: number, end: number 
}) => {
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  return <motion.span style={{ opacity }} className="reveal-word">{children}</motion.span>;
};

const RevealText = () => {
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const trackerRef = useRef<HTMLDivElement>(null);
  const opacityTrackerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0 });
  
  // Track opacity using a dedicated 100vh tracker to perfectly restore the original animation timing
  const { scrollYProgress: opacityProgress } = useScroll({
    target: opacityTrackerRef,
    offset: ["start 70%", "center center"] 
  });

  useEffect(() => {
    if (!isInView) setActiveAudioId(null);
  }, [isInView]);

  const handleToggleAudio = (id: string) => {
    setActiveAudioId(prev => prev === id ? null : id);
  };

  const contentArray = [
    { type: 'text', val: "Your" },
    { type: 'video', src: vid1, id: 'vid1' },
    { type: 'text', val: "ultimate" },
    { type: 'text', val: "creative" },
    { type: 'text', val: "team" },
    { type: 'text', val: "extension" },
    { type: 'video', src: vid2, id: 'vid2' },
    { type: 'text', val: "to" },
    { type: 'text', val: "execute" },
    { type: 'text', val: "ambitious" },
    { type: 'text', val: "ideas" },
    { type: 'video', src: vid3, id: 'vid3' },
    { type: 'text', val: "faster" },
    { type: 'text', val: "and" },
    { type: 'text', val: "radically" },
    { type: 'video', src: vid4, id: 'vid4' },
    { type: 'text', val: "smarter." }
  ];

  return (
    <div ref={trackerRef} style={{ position: "relative", height: "300vh", marginBottom: "-100vh" }}>
      <div ref={opacityTrackerRef} style={{ position: "absolute", top: 0, width: "100%", height: "100vh", pointerEvents: "none", visibility: "hidden" }} />
      <section className="reveal-text-container" ref={sectionRef}>
        <div className="reveal-text-wrapper">
        <h2 className="inline-video-heading">
          {contentArray.map((item, i) => {
            // Restore original opacity math
            const start = i / contentArray.length;
            const end = start + (1 / contentArray.length);
            
            return (
              <React.Fragment key={i}>
                <RevealWord progress={opacityProgress} start={start} end={end}>
                  {item.type === 'text' ? (
                    item.val
                  ) : (
                    <HoverVideo 
                      src={item.src!} 
                      id={item.id!} 
                      activeAudioId={activeAudioId} 
                      onToggleAudio={handleToggleAudio} 
                    />
                  )}
                </RevealWord>
                {i < contentArray.length - 1 && " "}
              </React.Fragment>
            );
          })}
        </h2>
        </div>
      </section>
    </div>
  );
};

export default RevealText;
