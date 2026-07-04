import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './OurStory.css';

interface CounterProps {
  target: number;
  duration?: number;
  suffix?: string;
}

const AnimatedCounter = ({ target, duration = 1500, suffix = '' }: CounterProps) => {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    const end = target;
    const totalFrames = Math.round(duration / 16);
    let frame = 0;

    const animate = () => {
      frame++;
      const progress = frame / totalFrames;
      // Ease out quad
      const currentCount = Math.round(end * (progress * (2 - progress)));
      
      if (frame < totalFrames) {
        setCount(currentCount);
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, target, duration]);

  return <span ref={counterRef}>{count}{suffix}</span>;
};

const OurStory = () => {
  return (
    <section className="our-story-section" id="about">
      {/* Cinematic Red Overlays and Background elements */}
      <div className="cinematic-bg-darken"></div>
      <div className="cinematic-bg-red-wash"></div>
      <div className="light-flare"></div>
      <div className="light-streak"></div>
      
      {/* Outer and Inner Chevrons via SVG */}
      <div className="chevron-svg-container">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chevron-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(225, 6, 0, 0.08)" />
              <stop offset="60%" stopColor="rgba(225, 6, 0, 0.02)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </linearGradient>
          </defs>
          
          {/* Main Chevron Gradient Fill */}
          <polygon 
            points="0,0 50,0 85,50 50,100 0,100 35,50" 
            fill="url(#chevron-grad)" 
          />
          
          {/* Glowing Outer Edge 1 (Primary Bold) */}
          <polyline 
            points="50,0 85,50 50,100" 
            fill="none" 
            stroke="rgba(225, 6, 0, 0.35)" 
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing Outer Edge 2 (Secondary Accent) */}
          <polyline 
            points="46,0 81,50 46,100" 
            fill="none" 
            stroke="rgba(255, 69, 0, 0.20)" 
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Subtle Inner Edge (Left) */}
          <polyline 
            points="0,0 35,50 0,100" 
            fill="none" 
            stroke="rgba(225, 6, 0, 0.15)" 
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* HUD Tech Elements at Top-Left */}
          <rect x="5" y="8" width="15" height="2" fill="rgba(225, 6, 0, 0.25)" />
          <rect x="22" y="8" width="6" height="2" fill="rgba(225, 6, 0, 0.25)" />
        </svg>
      </div>

      <div className="our-story-container">
        <motion.div 
          className="our-story-content-block"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.0, ease: "easeOut" }}
        >
          <div className="story-badge">// SECURE NODE ACCESS: STUDIO PROFILE</div>
          
          <h2 className="story-title">WHO WE <span className="story-highlight">ARE</span></h2>
          
          <div className="about-description-box">
            <p className="about-hud-text">
              AT XALT STUDIOS, WE ARE A TEAM OF VISIONARY CREATORS, TECH INNOVATORS, AND VISUAL ARTISTS PUSHING THE BOUNDARIES OF WHAT IS POSSIBLE IN THE DIGITAL REALM.
            </p>
            <p className="about-hud-text">
              X.ALT STUDIO BRIDGES THE GAP BETWEEN RAW IMAGINATION AND TECHNICAL EXECUTION. WE CRAFT HIGH-END VISUAL EFFECTS, INTERACTIVE 3D ASSETS, AND IMMERSIVE XR EXPERIENCES THAT DO NOT JUST TELL A STORY—THEY TRANSPORT AUDIENCES ENTIRELY.
            </p>
          </div>

          <div className="telemetry-stats">
            <div className="telemetry-item">
              <span className="telemetry-label">PROJECTS COMPLETED:</span>
              <span className="telemetry-val">
                <AnimatedCounter target={250} suffix="+" />
              </span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-label">HAPPY CLIENTS:</span>
              <span className="telemetry-val">
                <AnimatedCounter target={120} suffix="+" />
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OurStory;
