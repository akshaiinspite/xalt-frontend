import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ScrollRevealText } from '../ScrollRevealText/ScrollRevealText';
import './ThreeColumnGallery.css';

import img1 from '../../assets/images/img/img-1.jpg';
import img2 from '../../assets/images/img/img-2.jpg';
import img3 from '../../assets/images/img/img-3.jpg';
import { ProgressiveImage } from '../ProgressiveImage/ProgressiveImage';

const ThreeColumnGallery = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth out the scroll progress for a buttery physical feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Spread animations for the left and right cards to "fan out"
  const spreadXLeft = useTransform(smoothProgress, [0.15, 0.55], ["0%", "-90%"]);
  const spreadXRight = useTransform(smoothProgress, [0.15, 0.55], ["0%", "90%"]);
  
  const rotateLeft = useTransform(smoothProgress, [0.15, 0.55], [0, -5]);
  const rotateRight = useTransform(smoothProgress, [0.15, 0.55], [0, 5]);
  // Removed yDrop: The rotation alone is enough to fan them out, dropping them physically pushes them off screen.

  // Title fade in animation (happens right as they finish spreading)
  const titleOpacity = useTransform(smoothProgress, [0.45, 0.75], [0, 1]);
  const titleY = useTransform(smoothProgress, [0.45, 0.75], [20, 0]);

  return (
    <>
      {/* Paragraph Section - Scrolls naturally! */}
      <section className="gallery-intro-section">
        <div className="three-column-intro-wrapper">
          <ScrollRevealText 
            text="Immerse yourself in our meticulously crafted digital environments, where every detail is designed to captivate and inspire." 
            elementType="p" 
            splitBy="word" 
            className="three-column-paragraph-top" 
          />
        </div>
      </section>

      {/* Gallery Section - Full screen sticky animation! */}
      <section ref={containerRef} className="three-column-gallery">
        <div className="sticky-gallery-wrapper">

        {/* The Stacked Cards Container */}
        <div className="gallery-cards-container">
          
          {/* Card 1 (Moves Left) */}
          <motion.div 
            className="gallery-card"
            style={{ x: spreadXLeft, rotate: rotateLeft, zIndex: 1 }}
          >
            <div className="gallery-card-img-wrapper">
              <ProgressiveImage src={img1} alt="Feature 1"  loading="lazy" decoding="async" />
            </div>
            <motion.h3 style={{ opacity: titleOpacity, y: titleY }} className="gallery-card-title">Cinematic Visuals</motion.h3>
          </motion.div>
          
          {/* Card 3 (Moves Right) */}
          <motion.div 
            className="gallery-card right-card"
            style={{ x: spreadXRight, rotate: rotateRight }}
          >
            <div className="gallery-card-img-wrapper">
              <ProgressiveImage src={img3} alt="Feature 3"  loading="lazy" decoding="async" />
            </div>
            <motion.h3 className="gallery-card-title" style={{ opacity: titleOpacity, y: titleY }}>Design System</motion.h3>
          </motion.div>

          {/* Card 2 (Center - Stays in the middle, top of the stack) */}
          <motion.div 
            className="gallery-card center-card"
            style={{ zIndex: 3 }}
          >
            <div className="gallery-card-img-wrapper">
              <ProgressiveImage src={img2} alt="Feature 2"  loading="lazy" decoding="async" />
            </div>
            <motion.h3 style={{ opacity: titleOpacity, y: titleY }} className="gallery-card-title">Virtual Environments</motion.h3>
          </motion.div>

        </div>
      </div>
    </section>
    </>
  );
};

export default ThreeColumnGallery;
