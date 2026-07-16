import { useState, useEffect } from 'react';
import './Loader.css';

const STAGES = [
  'Initializing',
  'Loading Assets',
  'Modeling',
  'Texturing',
  'Lighting',
  'Rendering',
  'Compositing',
  'Optimizing',
  'Finalizing',
  'Welcome'
];

const getStageIndex = (p: number) => {
  if (p === 100) return 9; // Welcome
  if (p >= 90) return 8;   // Finalizing
  if (p >= 78) return 7;   // Optimizing
  if (p >= 65) return 6;   // Compositing
  if (p >= 48) return 5;   // Rendering
  if (p >= 38) return 4;   // Lighting
  if (p >= 28) return 3;   // Texturing
  if (p >= 18) return 2;   // Modeling
  if (p >= 8) return 1;    // Loading Assets
  return 0;                // Initializing
};

const Loader = ({ onFinish }: { onFinish?: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [welcomeActive, setWelcomeActive] = useState(false);

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      // Variable speed for realistic loading feedback
      let increment = Math.floor(Math.random() * 4) + 2; // 2% to 5% default
      
      if (currentProgress >= 48 && currentProgress <= 76) {
        // Slower rendering & compositing phase
        increment = Math.random() > 0.45 ? 1 : 2;
      } else if (currentProgress >= 90 && currentProgress < 99) {
        // Slow down near finalizing
        increment = 1;
      } else if (currentProgress === 99) {
        increment = 1;
      }

      currentProgress = Math.min(100, currentProgress + increment);
      setProgress(currentProgress);

      if (currentProgress === 100) {
        clearInterval(interval);
      }
    }, 70);

    return () => clearInterval(interval);
  }, []);

  // Handle welcome phase and exit transition
  useEffect(() => {
    if (progress === 100) {
      setWelcomeActive(true);
      const fadeTimer = setTimeout(() => {
        setLoading(false);
        if (onFinish) {
          setTimeout(onFinish, 900); // Allow slide split animation to complete
        }
      }, 1500); // 1.5s reading time for welcome before entering site
      
      return () => clearTimeout(fadeTimer);
    }
  }, [progress, onFinish]);

  const currentStageIdx = getStageIndex(progress);
  const currentStageText = STAGES[currentStageIdx];

  return (
    <div className={`broed-loader-container ${!loading ? 'reveal-site' : ''} ${welcomeActive ? 'welcome-active' : ''}`}>
      {/* Cyber Grid Scanlines */}
      <div className="loader-scanline-overlay"></div>

      {/* TOP RED PANEL */}
      <div className="broed-panel broed-panel-top">
        <div className="broed-panel-inner">
          <div className="broed-telemetry-row">
            <span className="telemetry-tag">[ X.ALT PIPELINE PRELOADER ]</span>
            <span className="telemetry-status">SYS_STATUS // ONLINE</span>
          </div>
        </div>
      </div>

      {/* MIDDLE APERTURE SLIT */}
      <div className="broed-slit">
        <div className="broed-slit-bg"></div>
        <div className="broed-slit-content">
          {/* Progress percentage on top */}
          <div className="broed-percentage-indicator">
            <span className="percentage-number">{progress.toString().padStart(3, '0')}</span>
            <span className="percentage-lbl">/ 100</span>
          </div>

          {/* Main Huge Stage Text with key-based re-render for slide-up CSS animation */}
          <div className="broed-stage-text-container">
            <span key={currentStageIdx} className={`broed-stage-text ${welcomeActive ? 'welcome-text' : ''}`}>
              {progress === 100 ? 'WELCOME' : currentStageText.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM RED PANEL */}
      <div className="broed-panel broed-panel-bottom">
        <div className="broed-panel-inner">
          {/* Animated red-lined progress indicator */}
          <div className="broed-progressbar-track">
            <div className="broed-progressbar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          
          <div className="broed-telemetry-row">
            <span className="telemetry-tag">BUILDING VIRTUAL FRAMEWORK</span>
            <span className="telemetry-status">LOAD_RATIO // {progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
