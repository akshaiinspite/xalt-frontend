import { useRef, useState, useEffect } from 'react';
import './Showreel.css';
import showreelVideo from '../../assets/video/show-reel/showreel.mp4';

const Showreel = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoUrl, setVideoUrl] = useState(showreelVideo);

  useEffect(() => {
    fetch('http://localhost:5000/api/reels')
      .then(res => res.json())
      .then(data => {
        if (data && data.videoUrl) {
          if (data.videoUrl.startsWith('http') || (data.videoUrl.startsWith('/') && !data.videoUrl.includes('src/assets'))) {
            setVideoUrl(data.videoUrl);
          }
        }
      })
      .catch(err => console.warn('Backend offline, using local showreel video.', err));
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <section className="showreel-section" id="projects">
      {/* Full screen video background */}
      <div className="showreel-video-bg-wrapper">
        <video 
          ref={videoRef}
          className="showreel-video-bg"
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Cinematic dark & red overlays */}
        <div className="showreel-overlay-dark"></div>
        <div className="showreel-overlay-red-glow"></div>
        <div className="showreel-vignette"></div>
      </div>

      <div className="showreel-content-container">
        <div className="showreel-text-wrapper">
          <span className="showreel-subtitle">Showcase</span>
          <h2 className="showreel-title">
            SHOW <span className="showreel-title-highlight">REEL</span>
          </h2>
          <p className="showreel-description">
            Experience our high-fidelity virtual productions, cinematic visual effects, and groundbreaking immersive experiences.
          </p>
        </div>

        {/* Interactive Audio Toggle Button */}
        <div className="showreel-play-button-wrapper">
          <button className="showreel-play-button" onClick={toggleMute} aria-label="Toggle Audio">
            <div className="play-button-circle">
              {isMuted ? (
                // Mute / Speaker off icon
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="play-icon">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
              ) : (
                // Volume up / Speaker on icon
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="play-icon">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              )}
            </div>
            <span className="play-button-text">
              {isMuted ? 'Unmute Audio' : 'Mute Audio'}
            </span>
          </button>
        </div>
      </div>
      
      {/* Scroll indicator for the next section */}
      <div className="showreel-scroll-indicator">
        <span className="scroll-line"></span>
        <span className="scroll-text">Scroll to Explore</span>
      </div>
    </section>
  );
};

export default Showreel;


