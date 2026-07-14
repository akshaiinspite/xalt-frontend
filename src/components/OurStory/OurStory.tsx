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
      


      <div className="our-story-container">
        <motion.div 
          className="our-story-content-block"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.0, ease: "easeOut" }}
        >
          
          <h2 className="story-title">WHO WE <span className="story-highlight">ARE</span></h2>
          
          <div className="about-description-box">
            <p className="about-hud-text">
              At X.ALT Studios, we are a team of visionary creators, tech innovators, and visual artists pushing the boundaries of what is possible in the digital realm.
            </p>
            <p className="about-hud-text">
              X.ALT Studio bridges the gap between raw imagination and technical execution. We craft high-end visual effects, interactive 3D assets, and immersive XR experiences that do not just tell a story—they transport audiences entirely.
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
