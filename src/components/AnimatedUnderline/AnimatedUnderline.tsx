import { motion } from 'framer-motion';

export const AnimatedUnderline = ({ color = '#ff1a1a', delay = 0.3 }: { color?: string, delay?: number }) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '12px', marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
      
      {/* Background track (dim) */}
      <motion.div 
        style={{ position: 'absolute', top: '5px', left: 0, height: '2px', backgroundColor: color, opacity: 0.2 }}
        initial={{ width: 0 }}
        whileInView={{ width: '100%' }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.8, delay }}
      />
      
      {/* Main bright line */}
      <motion.div 
        style={{ position: 'absolute', top: '5px', left: 0, height: '2px', backgroundColor: color, boxShadow: `0 0 15px ${color}, 0 0 5px ${color}` }}
        initial={{ width: 0 }}
        whileInView={{ width: '100%' }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: delay + 0.2 }}
      />
      
      {/* Small trailing accent line */}
      <motion.div 
        style={{ position: 'absolute', top: '10px', left: '5%', height: '1px', backgroundColor: color, opacity: 0.6 }}
        initial={{ width: 0 }}
        whileInView={{ width: '30%' }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1, ease: "easeOut", delay: delay + 0.5 }}
      />

      {/* Laser / Scanner Head */}
      <motion.div 
        style={{ 
          position: 'absolute', 
          top: '3px', 
          width: '6px', 
          height: '6px', 
          backgroundColor: '#fff', 
          borderRadius: '50%', 
          boxShadow: `0 0 15px 4px ${color}` 
        }}
        initial={{ left: '0%', opacity: 0 }}
        whileInView={{ left: 'calc(100% - 6px)', opacity: [0, 1, 1, 0] }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: delay + 0.2 }}
      />
      
      {/* Tech grid/barcode markings on the right */}
      <motion.div 
        style={{ position: 'absolute', top: '2px', right: '-15px', display: 'flex', gap: '3px' }}
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ delay: delay + 1.2, duration: 0.5 }}
      >
        <div style={{ width: '2px', height: '8px', backgroundColor: color, opacity: 0.8 }} />
        <div style={{ width: '2px', height: '8px', backgroundColor: color, opacity: 0.5 }} />
        <div style={{ width: '2px', height: '8px', backgroundColor: color, opacity: 0.2 }} />
      </motion.div>

    </div>
  );
};
