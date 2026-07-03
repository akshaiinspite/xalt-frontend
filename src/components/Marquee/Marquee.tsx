import './Marquee.css';

interface MarqueeProps {
  variant?: 'default' | 'small';
}

const Marquee = ({ variant = 'default' }: MarqueeProps) => {
  // We repeat the text enough times to ensure it fills the screen and allows for a seamless loop.
  const words = ['INSPIRE', '+', 'INNOVATE', '+', 'IMPACT', '+'];
  
  // We duplicate the array to create the seamless loop
  const content = [...words, ...words, ...words, ...words];

  return (
    <section className={`marquee-container variant-${variant}`}>
      <div className="marquee-content">
        {content.map((item, index) => (
          <span 
            key={index} 
            className={`marquee-item variant-${variant} ${item === '+' ? 'marquee-plus' : 'marquee-word'}`}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
};

export default Marquee;

