import { useEffect, useRef, useState } from 'react';
import './ClassicHero.css';
import heroVideo from '../../assets/video/hero/hero.mp4';

const ClassicHero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [elementTop, setElementTop] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    
    if (heroRef.current) {
      setElementTop(heroRef.current.offsetTop);
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (heroRef.current) {
        setElementTop(heroRef.current.offsetTop);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute scroll offset relative to the section's position on the page
  const relativeScroll = Math.max(0, scrollY - elementTop);

  const parallaxTransform = {
    transform: `translateY(${relativeScroll * 0.4}px) scale(${1 + relativeScroll * 0.0005})`,
  };

  return (
    <div ref={heroRef} className="classic-hero" id="home">
      {/* Background Video with Slow Zoom / Parallax */}
      <div className="hero-video-wrapper" style={parallaxTransform}>
        <video 
          className="hero-video-bg" 
          src={heroVideo} 
          autoPlay 
          loop 
          muted 
          playsInline 
        />
      </div>

      {/* Overlays */}
      <div className="hero-overlay-dark"></div>
      <div className="hero-overlay-red-glow"></div>
      <div className="hero-vignette"></div>

      {/* Floating Particles (Rendered dynamically using CSS animation) */}
      <div className="hero-particles">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="hero-particle" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${10 + Math.random() * 15}s`,
              transform: `scale(${0.5 + Math.random() * 1.5})`,
            }}
          />
        ))}
      </div>

      {/* Red Glowing Circle Behind Text */}
      <div className="hero-text-glow"></div>
      
      {/* Content Container */}
      <div className="classic-hero-content">
        <div className="hero-badge-wrapper">
          <div className="hero-badge">
            <span className="badge-icon">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px', color: 'var(--color-primary)', filter: 'drop-shadow(0 0 4px var(--color-primary))' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="1"></circle>
              </svg>
            </span>
            Next-Gen VFX & XR Studio
          </div>
        </div>

        <h1 className="hero-main-title">
          <span className="title-row">CREATING</span>
          <span className="title-row title-highlighted">DIGITAL</span>
          <span className="title-row">EXPERIENCES</span>
        </h1>

        <p className="hero-subtitle">
          We push the limits of visual reality, crafting bespoke virtual environments, cutting-edge VFX, and commercial masterpieces.
        </p>

        <div className="hero-ctas">
          <a href="#portfolio" className="btn-primary">
            Explore Our Work
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
          <a href="#contact" className="btn-secondary">
            Contact Us
          </a>
        </div>
      </div>

      {/* Floating Scroll Indicator */}
      <div className="hero-scroll-indicator">
        <span className="scroll-mouse">
          <span className="scroll-wheel"></span>
        </span>
        <span className="scroll-text">Scroll Down</span>
      </div>
    </div>
  );
};

export default ClassicHero;


