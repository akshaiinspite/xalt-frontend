import { motion, type Variants } from 'framer-motion';
import './Hero.css';
import Header from '../Header/Header';
import HeroText from '../HeroText/HeroText';
import PendulumLamp from './PendulumLamp';
import heroCharacter from '../../assets/images/hero/hero-img.png';

const Hero = ({ isLoaderFinished = true }: { isLoaderFinished?: boolean }) => {
  const lampVariants: Variants = {
    hidden: { y: "-100%", opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 1.5, ease: [0.19, 1.0, 0.22, 1.0], delay: 1.2 } 
    }
  };

  const characterVariants: Variants = {
    hidden: { y: "15%", scale: 1.05, opacity: 0 },
    visible: { 
      y: 0, 
      scale: 1, 
      opacity: 1, 
      transition: { duration: 2, ease: [0.19, 1.0, 0.22, 1.0], delay: 1.4 } 
    }
  };

  const scrollIndicatorVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.2, delay: 1.8, ease: "easeOut" } }
  };

  return (
    <div className="hero-container">
      {/* Animated gradient background */}
      <div className="hero-gradient-bg"></div>

      {/* Swinging Pendulum Lamp in top center */}
      <motion.div
        initial="hidden"
        animate={isLoaderFinished ? "visible" : "hidden"}
        variants={lampVariants}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}
      >
        <PendulumLamp />
      </motion.div>
      
      {/* CGI Character Silhouette (multiply blend mode makes the white background disappear) */}
      <motion.img 
        src={heroCharacter} 
        alt="Hero VFX Character" 
        className="hero-character-silhouette"
        initial="hidden"
        animate={isLoaderFinished ? "visible" : "hidden"}
        variants={characterVariants}
      />
      
      {/* Foreground content */}
      <div className="hero-content">
        <Header />
        <HeroText isLoaderFinished={isLoaderFinished} />
        
        {/* Scroll Down Indicator */}
        <motion.div 
          className="scroll-down-indicator"
          initial="hidden"
          animate={isLoaderFinished ? "visible" : "hidden"}
          variants={scrollIndicatorVariants}
        >
          <span className="scroll-text">SCROLL DOWN</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="scroll-arrow">
            <path d="M12 4V20M12 20L5 13M12 20L19 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
