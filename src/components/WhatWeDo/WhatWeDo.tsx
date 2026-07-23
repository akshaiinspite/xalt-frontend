import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ScrollRevealText } from '../ScrollRevealText/ScrollRevealText';
import { AnimatedUnderline } from '../AnimatedUnderline/AnimatedUnderline';
import './WhatWeDo.css';
import { API_BASE_URL, getMediaUrl } from '../../config';

import imgCommercial from '../../assets/images/services/commercial_landscape.png';
import imgFilms from '../../assets/images/services/films_landscape.png';
import imgArvr from '../../assets/images/services/arvr_landscape.png';
import { ProgressiveImage } from '../ProgressiveImage/ProgressiveImage';

const DEFAULT_SERVICES = [
  {
    _id: 'default-films',
    title: 'Films & Entertainment',
    description: 'We curate and aggregate breathtaking visual sequences for feature films, leveraging deep relationships across the worldwide entertainment industry.',
    image: imgFilms,
    link: '#projects/films'
  },
  {
    _id: 'default-commercial',
    title: 'Commercial Projects',
    description: 'Seamlessly integrating premium tech aesthetics with robust design systems to elevate modern brand identities and digital experiences.',
    image: imgCommercial,
    link: '#projects/commercial'
  },
  {
    _id: 'default-arvr',
    title: 'AR & VR Experiences',
    description: 'Immersive digital environments and spatial computing solutions that bridge the physical and virtual worlds for interactive storytelling.',
    image: imgArvr,
    link: '#projects/immersive'
  }
];

const AnimatedScrollCard = ({ 
  service, 
  index, 
  total,
  scrollYProgress 
}: { 
  service: any, 
  index: number, 
  total: number,
  scrollYProgress: any 
}) => {
  // Define perfectly mapped entry and exit windows for each card dynamically.
  let inputRange: number[];
  let scaleRange: number[];
  let yRange: number[];
  let rotateRange: number[];

  const maxWeight = Math.max(1, (total - 1) * 3 + 1);

  if (total <= 1) {
    inputRange = [0, 1];
    scaleRange = [1, 1];
    yRange = [0, 0];
    rotateRange = [0, 0];
  } else if (index === 0) {
    // Card 1 starts fully visible, then exits
    inputRange = [0, 1 / maxWeight, 3 / maxWeight, 1];
    scaleRange = [1, 1, 0.8, 0.8];
    yRange = [0, 0, 150, 150];
    rotateRange = [0, 0, -8, -8];
  } else if (index === total - 1) {
    // Last Card enters, never exits
    inputRange = [0, ((index - 1) * 3 + 1) / maxWeight, (index * 3) / maxWeight, 1];
    scaleRange = [0.8, 0.8, 1, 1];
    yRange = [150, 150, 0, 0];
    rotateRange = [8, 8, 0, 0];
  } else {
    // Middle Cards enter and exit
    inputRange = [
      0, 
      ((index - 1) * 3 + 1) / maxWeight, 
      (index * 3) / maxWeight, 
      (index * 3 + 1) / maxWeight, 
      ((index + 1) * 3) / maxWeight, 
      1
    ];
    scaleRange = [0.8, 0.8, 1, 1, 0.8, 0.8];
    yRange = [150, 150, 0, 0, 150, 150];
    rotateRange = [8, 8, 0, 0, -8, -8];
  }

  const scale = useTransform(scrollYProgress, inputRange, scaleRange);
  const y = useTransform(scrollYProgress, inputRange, yRange);
  const rotate = useTransform(scrollYProgress, inputRange, rotateRange);

  // Extract the entry phase timings for the text reveal animation
  let start = 0;
  let end = 1 / maxWeight;
  if (index > 0) {
    start = ((index - 1) * 3 + 1) / maxWeight;
    end = (index * 3) / maxWeight;
  }

  const handleExploreClick = () => {
    const targetHash = service.link || '#projects';
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
          <ProgressiveImage src={getMediaUrl(service.image)} alt={service.title} className="scroll-card-image"  loading="lazy" decoding="async" />
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
  const [services, setServices] = useState<any[]>(DEFAULT_SERVICES);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/expertise`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setServices(data);
        }
      })
      .catch(err => {
        console.warn('Backend offline or error loading expertise, using default local data.', err);
      });
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 15vh", "end end"] // Starts strictly when the container hits the sticky top position
  });

  // Calculate dynamic sticky scroll mapping keys
  const total = services.length;
  const maxWeight = Math.max(1, (total - 1) * 3 + 1);
  const scrollKeys: number[] = [];
  const scrollValues: string[] = [];

  if (total <= 1) {
    scrollKeys.push(0, 1);
    scrollValues.push("0%", "0%");
  } else {
    for (let k = 0; k < total; k++) {
      scrollKeys.push((k * 3) / maxWeight);
      scrollKeys.push((k * 3 + 1) / maxWeight);
      
      const percent = -(k * 100) / total + "%";
      scrollValues.push(percent, percent);
    }
  }

  // Maps the scroll progress into perfectly balanced stepped 'sticky' zones.
  const x = useTransform(scrollYProgress, scrollKeys, scrollValues);

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
              key={service._id || service.id} 
              service={service} 
              index={index} 
              total={total}
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
