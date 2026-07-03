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
      {/* Huge faded typography behind content */}
      <div className="about-backdrop-text">X.ALT STUDIO</div>
      
      <div className="our-story-container">
        <div className="our-story-split-grid">
          
          {/* Left Column: Badge & Title */}
          <motion.div 
            className="our-story-left-col"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="story-badge">STUDIO PROFILE</div>
            <h2 className="story-title">
              WHO <span className="title-highlight">WE ARE</span>
            </h2>
          </motion.div>
          
          {/* Right Column: Descriptions & Stats Layout */}
          <motion.div 
            className="our-story-right-col"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          >
            <div className="about-description-box">
              <span className="about-accent-line"></span>
              <p className="about-intro-text">
                We are a team of visionary creators, tech innovators, and visual artists pushing the boundaries of what is possible in the digital realm.
              </p>
              <p>
                X.ALT Studio bridges the gap between raw imagination and technical execution. We craft high-end visual effects, interactive 3D assets, and immersive XR experiences that do not just tell a story—they transport audiences entirely.
              </p>
            </div>

            <div className="story-stats-layout">
              <div className="stat-item">
                <h3 className="stat-number">
                  <AnimatedCounter target={250} suffix="+" />
                </h3>
                <p className="stat-label">Projects Completed</p>
              </div>

              <div className="stat-item">
                <h3 className="stat-number">
                  <AnimatedCounter target={120} suffix="+" />
                </h3>
                <p className="stat-label">Happy Clients</p>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};

export default OurStory;
