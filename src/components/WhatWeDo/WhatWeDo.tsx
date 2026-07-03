import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ScrollRevealText } from '../ScrollRevealText/ScrollRevealText';
import { AnimatedUnderline } from '../AnimatedUnderline/AnimatedUnderline';
import './WhatWeDo.css';

import imgCommercial from '../../assets/images/services/commercial_landscape.png';
import imgFilms from '../../assets/images/services/films_landscape.png';
import imgArvr from '../../assets/images/services/arvr_landscape.png';

const services = [
  {
    id: 1,
    title: 'Films & Entertainment',
    description: 'We curate and aggregate breathtaking visual sequences for feature films, leveraging deep relationships across the worldwide entertainment industry.',
    image: imgFilms
  },
  {
    id: 2,
    title: 'Commercial Projects',
    description: 'Seamlessly integrating premium tech aesthetics with robust design systems to elevate modern brand identities and digital experiences.',
    image: imgCommercial
  },
  {
    id: 3,
    title: 'AR & VR Experiences',
    description: 'Immersive digital environments and spatial computing solutions that bridge the physical and virtual worlds for interactive storytelling.',
    image: imgArvr
  }
];



const AnimatedScrollCard = ({ service, index, scrollYProgress }: { service: any, index: number, scrollYProgress: any }) => {
  // Define perfectly mapped entry and exit windows for each card.
  // This allows cards to smoothly scale down and drop away as they exit, matching the entry animation.
  let inputRange: number[];
  let scaleRange: number[];
  let yRange: number[];
  let rotateRange: number[];

  if (index === 0) {
    // Card 1 starts fully visible, then exits between 0.15 and 0.45
    inputRange = [0, 0.15, 0.45, 1];
    scaleRange = [1, 1, 0.8, 0.8];
    yRange = [0, 0, 150, 150];
    rotateRange = [0, 0, -8, -8];
  } else if (index === 1) {
    // Card 2 enters 0.15->0.45, stays stuck 0.45->0.60, exits 0.60->0.90
    inputRange = [0, 0.15, 0.45, 0.60, 0.90, 1];
    scaleRange = [0.8, 0.8, 1, 1, 0.8, 0.8];
    yRange = [150, 150, 0, 0, 150, 150];
    rotateRange = [8, 8, 0, 0, -8, -8];
  } else {
    // Card 3 enters 0.60->0.90, never exits
    inputRange = [0, 0.60, 0.90, 1];
    scaleRange = [0.8, 0.8, 1, 1];
    yRange = [150, 150, 0, 0];
    rotateRange = [8, 8, 0, 0];
  }

  const scale = useTransform(scrollYProgress, inputRange, scaleRange);
  const y = useTransform(scrollYProgress, inputRange, yRange);
  const rotate = useTransform(scrollYProgress, inputRange, rotateRange);

  // Extract the entry phase timings for the text reveal animation
  let start = 0;
  let end = 0.15;
  if (index === 1) {
    start = 0.15;
    end = 0.45;
  } else if (index === 2) {
    start = 0.60;
    end = 0.90;
  }

  const handleExploreClick = () => {
    const hashes = ['#projects/films', '#projects/commercial', '#projects/immersive'];
    const targetHash = hashes[index] || '#projects';
    const lenisInstance = (window as any).lenis;
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { immediate: true });
    }
    window.scrollTo(0, 0);
    window.location.hash = targetHash;
  };

  return (
    <motion.div 
      className="scroll-card"
      style={{ scale, y, rotate }}
    >
      <div 
        style={{ cursor: 'pointer', width: 'fit-content' }}
        onClick={handleExploreClick}
      >
        <ScrollRevealText 
          text={service.title} 
          className="scroll-card-title" 
          elementType="h3" 
          globalProgress={scrollYProgress}
          globalRange={[start, end]}
          splitBy="character"
        />
      </div>
      <div className="scroll-card-inner">
        <div 
          className="scroll-card-image-wrapper"
          style={{ cursor: 'pointer' }}
          onClick={handleExploreClick}
        >
          <img src={service.image} alt={service.title} className="scroll-card-image" />
        </div>
        <div className="scroll-card-content">
          <ScrollRevealText 
            text={service.description} 
            className="scroll-card-desc" 
            elementType="p" 
            globalProgress={scrollYProgress}
            globalRange={[start, end]}
            splitBy="word"
          />
          <button className="explore-btn" onClick={handleExploreClick}>EXPLORE PROJECT &rarr;</button>
        </div>
      </div>
    </motion.div>
  );
};

const WhatWeDo = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 15vh", "end end"] // Starts strictly when the container hits the sticky top position
  });

  // Maps the scroll progress into perfectly balanced stepped 'sticky' zones.
  const x = useTransform(
    scrollYProgress,
    [0, 0.15, 0.45, 0.60, 0.90, 1],
    ["0%", "0%", "-33.33%", "-33.33%", "-66.66%", "-66.66%"]
  );

  return (
    <section className="what-we-do-wrapper" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      
      <div className="section-title-wrapper" style={{ paddingTop: '8rem', paddingLeft: '4rem', paddingRight: '4rem', marginBottom: '4rem' }}>
        <div style={{ display: 'inline-block' }}>
          <ScrollRevealText text="What We Do" />
          <AnimatedUnderline color="#ff1a1a" />
        </div>
      </div>

      <div ref={targetRef} className="horizontal-scroll-container">
        <div className="sticky-scroll-wrapper">
          <motion.div style={{ x }} className="horizontal-scroll-track">
          {services.map((service, index) => (
            <AnimatedScrollCard 
              key={service.id} 
              service={service} 
              index={index} 
              scrollYProgress={scrollYProgress} 
            />
          ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
