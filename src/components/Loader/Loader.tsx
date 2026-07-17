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

  useEffect(() => {
    let currentProgress = 0;
    // Deliberate speed loop for 10-stage professional sequence (~7-8 seconds total)
    const interval = setInterval(() => {
      let increment = Math.floor(Math.random() * 2) + 1; // 1% to 2% increments
      
      if (currentProgress >= 48 && currentProgress <= 76) {
        increment = Math.random() > 0.65 ? 1 : 2;
      } else if (currentProgress >= 90 && currentProgress < 99) {
        increment = 1;
      }

      currentProgress = Math.min(100, currentProgress + increment);
      setProgress(currentProgress);

      if (currentProgress === 100) {
        clearInterval(interval);
      }
    }, 80); // Fast but smooth progression matching the earlier feel

    return () => clearInterval(interval);
  }, []);

  // Handle welcome phase and exit transition
  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setLoading(false);
        if (onFinish) {
          setTimeout(onFinish, 850); // Wait for container transition to finish
        }
      }, 1500); // Allow reading time for welcome stage
      
      return () => clearTimeout(timer);
    }
  }, [progress, onFinish]);

  const currentStageIdx = getStageIndex(progress);
  const currentStageText = STAGES[currentStageIdx];

  return (
    <div className={`loader-container ${!loading ? 'fade-out' : ''}`}>
      {/* Background cyber grid scanline overlay */}
      <div className="loader-scanline-grid"></div>

      <div className="loader-content">
        {/* Symmetrical glowing red chevron graphic (resembles slanted red eyes) */}
        <div className="loader-chevron-logo">
          <div className="chevron-bar chevron-left"></div>
          <div className="chevron-bar chevron-right"></div>
        </div>

        {/* Big monospace percentage counter */}
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

        {/* Dynamic status line utilizing current stages */}
        <div className="loader-console-log">
          <span className="console-prompt">&gt;&gt;</span>
          <span className="console-text">
            {progress === 100 ? 'WELCOME.' : `${currentStageText.toUpperCase()}.`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Loader;
