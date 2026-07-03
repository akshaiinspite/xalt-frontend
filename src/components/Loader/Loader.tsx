import { useState, useEffect } from 'react';
import './Loader.css';

const LOG_LINES = [
  'INITIALIZING SYS_CORE...',
  'CONNECTING TO X.ALT CORE NETWORK...',
  'GFX_RENDERER: VULKAN_ACTIVE',
  'SYNCING STAGE LAYOUTS...',
  'DECRYPTING PORTFOLIO NODES...',
  'COMPILING SHADERS...',
  'OPTIMIZING IMMERSIVE ASSETS...',
  'ESTABLISHING SECURE COMMUNICATIONS...',
  'READY FOR TRANSMISSION.'
];

const Loader = ({ onFinish }: { onFinish?: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [activeLogIndex, setActiveLogIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Increase progress counter
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 2;
        if (next >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return next;
      });
    }, 45);

    return () => clearInterval(progressInterval);
  }, []);

  // Cycle console logs based on loading progress
  useEffect(() => {
    const logIndex = Math.min(
      Math.floor((progress / 100) * LOG_LINES.length),
      LOG_LINES.length - 1
    );
    setActiveLogIndex(logIndex);

    if (progress === 100) {
      const timer = setTimeout(() => {
        setLoading(false);
        if (onFinish) {
          setTimeout(onFinish, 600); // Wait for slide-up transition to finish
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [progress, onFinish]);

  return (
    <div className={`loader-container ${!loading ? 'fade-out' : ''}`}>
      {/* Background cyber grid scanline overlay */}
      <div className="loader-scanline-grid"></div>

      <div className="loader-content">
        {/* Symmetrical glowing red chevron graphic */}
        <div className="loader-chevron-logo">
          <div className="chevron-bar chevron-left"></div>
          <div className="chevron-bar chevron-right"></div>
        </div>

        {/* Big percentage counter */}
        <div className="loader-percentage-container">
          <span className="loader-percentage-number">
            {progress.toString().padStart(3, '0')}
          </span>
          <span className="loader-percentage-symbol">%</span>
        </div>

        {/* Loading progress track */}
        <div className="loader-track-container">
          <div 
            className="loader-progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Dynamic system log details */}
        <div className="loader-console-log">
          <span className="console-prompt">&gt;&gt;</span>
          <span className="console-text">{LOG_LINES[activeLogIndex]}</span>
        </div>
      </div>
    </div>
  );
};

export default Loader;
