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
    }, 125); // 125ms interval for smooth progression of 10 stages

    return () => clearInterval(interval);
  }, []);

  // Handle welcome phase and exit transition
  useEffect(() => {
    if (progress === 100) {
      setWelcomeActive(true);
      const fadeTimer = setTimeout(() => {
        setLoading(false);
        if (onFinish) {
          setTimeout(onFinish, 900); // Allow panels split animation to complete
        }
      }, 1500); // 1.5s reading time for welcome before entering site
      
      return () => clearTimeout(fadeTimer);
    }
  }, [progress, onFinish]);

  const currentStageIdx = getStageIndex(progress);
  const currentStageText = STAGES[currentStageIdx];

  // Helper to split text into styled spans matching the ONTMOET reference pattern
  const renderStyledText = (text: string) => {
    const words = text.toUpperCase().split(' ');
    let globalLetterCount = 0;

    return words.map((word, wordIdx) => {
      const letters = word.split('');
      const len = letters.length;

      const renderedLetters = letters.map((char, charIdx) => {
        globalLetterCount++;

        // Pattern: Last 3 letters of a word are Outline, Outline, Solid. Rest are Solid.
        let isOutline = false;
        if (len > 3) {
          if (charIdx === len - 3 || charIdx === len - 2) {
            isOutline = true;
          }
        } else if (len > 1) {
          // For very short words, just make the last character outline
          if (charIdx === len - 1) {
            isOutline = true;
          }
        }

        return (
          <span 
            key={charIdx} 
            className="loader-char-wrapper"
            style={{ 
              animationDelay: `${globalLetterCount * 0.015}s`
            }}
          >
            <span className={`loader-char ${isOutline ? 'char-outline' : 'char-solid'}`}>
              {char}
            </span>
          </span>
        );
      });

      return (
        <span key={wordIdx} style={{ display: 'inline-flex', alignItems: 'flex-end' }}>
          {renderedLetters}
          {wordIdx < words.length - 1 && (
            <span className="loader-space">&nbsp;</span>
          )}
        </span>
      );
    });
  };

  const activeText = progress === 100 ? 'WELCOME' : currentStageText;

  return (
    <div className={`broed-loader-container ${!loading ? 'reveal-site' : ''} ${welcomeActive ? 'welcome-active' : ''}`}>
      {/* Sliding Red brand color Panels */}
      <div className="loader-half-panel panel-top"></div>
      <div className="loader-half-panel panel-bottom"></div>

      {/* Central Typographic Container */}
      <div className="loader-center-content">
        <div key={currentStageIdx} className="loader-text-wrapper">
          {renderStyledText(activeText)}
        </div>
      </div>

      <div className="loader-progress-percentage">
        {progress}%
      </div>
    </div>
  );
};

export default Loader;

