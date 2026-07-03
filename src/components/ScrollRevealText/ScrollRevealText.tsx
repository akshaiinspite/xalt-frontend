import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const ScrollRevealText = ({ 
  text, 
  className = "section-title", 
  elementType: Component = "h2", 
  globalProgress, 
  globalRange,
  splitBy = "character"
}: { 
  text: string, 
  className?: string, 
  elementType?: any, 
  globalProgress?: any, 
  globalRange?: [number, number],
  splitBy?: "character" | "word"
}) => {
  const container = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 80%", "end 50%"]
  });

  const sourceProgress = globalProgress || scrollYProgress;
  const mappedProgress = useTransform(sourceProgress, globalRange || [0, 1], [0, 1]);

  const words = text.split(" ");
  return (
    <Component className={className} ref={container} style={{ display: 'flex', gap: '0.25em', flexWrap: 'wrap' }}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + (1 / words.length);
        
        if (splitBy === "word") {
          return <Char key={i} char={word} progress={mappedProgress} range={[start, end]} />;
        }
        
        return <Word key={i} word={word} progress={mappedProgress} range={[start, end]} />;
      })}
    </Component>
  );
};

const Word = ({ word, progress, range }: { word: string, progress: any, range: [number, number] }) => {
  const characters = word.split("");
  const amount = range[1] - range[0];
  const step = amount / characters.length;
  
  return (
    <span style={{ display: 'inline-flex' }}>
      {characters.map((char, i) => {
        const start = range[0] + (i * step);
        const end = range[0] + ((i + 1) * step);
        return <Char key={i} char={char} progress={progress} range={[start, end]} />
      })}
    </span>
  );
};

const Char = ({ char, progress, range }: { char: string, progress: any, range: [number, number] }) => {
  const opacity = useTransform(progress, range, [0.1, 1]);
  return (
    <motion.span style={{ opacity }}>
      {char}
    </motion.span>
  );
};
