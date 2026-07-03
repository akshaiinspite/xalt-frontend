import { motion, type Variants } from 'framer-motion';
import './HeroText.css';

const HeroText = ({ isLoaderFinished = true }: { isLoaderFinished?: boolean }) => {
  const words = "Crafting digital realities".split(" ");

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2
      }
    }
  };

  const wordVariants: Variants = {
    hidden: { 
      y: "120%", 
      rotateZ: 6 
    },
    visible: { 
      y: 0, 
      rotateZ: 0, 
      transition: { 
        duration: 1.4, 
        ease: [0.19, 1.0, 0.22, 1.0] // Very sleek, cinematic ease out curve
      } 
    }
  };

  const eyebrowVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1.2, delay: 0.8, ease: "easeOut" } 
    }
  };

  return (
    <main className="main-content">
      <div className="bottom-content">
        <motion.span 
          className="hero-eyebrow"
          initial="hidden"
          animate={isLoaderFinished ? "visible" : "hidden"}
          variants={eyebrowVariants}
        >
          WE ARE
        </motion.span>
        
        <motion.h1 
          className="hero-title"
          variants={containerVariants}
          initial="hidden"
          animate={isLoaderFinished ? "visible" : "hidden"}
          style={{ display: "flex", flexWrap: "wrap", margin: 0, padding: 0 }}
        >
          {words.map((word, index) => (
            // The clipping mask is critical here. No opacity changes, just clean geometry.
            <span key={index} style={{ overflow: "hidden", display: "inline-block", paddingRight: "0.25em", paddingBottom: "0.2em", marginBottom: "-0.2em" }}>
              <motion.span 
                variants={wordVariants} 
                style={{ display: "inline-block", transformOrigin: "bottom left" }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h1>
      </div>
    </main>
  );
};

export default HeroText;
