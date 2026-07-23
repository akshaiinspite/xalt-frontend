import { useState, useRef } from 'react';
import type { MouseEvent } from 'react';
import './PortfolioSection.css';

// Import images from assets
import img1 from '../../assets/images/gallery/ar_vr.png';
import img2 from '../../assets/images/gallery/cinematic_previz.png';
import img3 from '../../assets/images/gallery/commercial_vfx.png';
import img4 from '../../assets/images/image-galley/gallery-img-1.jpg';
import img5 from '../../assets/images/image-galley/gallery-img-2.jpg';
import img6 from '../../assets/images/image-galley/gallery-img-3.jpg';
import { ProgressiveImage } from '../ProgressiveImage/ProgressiveImage';

const portfolioItems = [
  {
    id: 1,
    title: 'Neon Odyssey',
    category: 'VFX Production',
    image: img2,
    sizeClass: 'masonry-medium'
  },
  {
    id: 2,
    title: 'XR Cyber City',
    category: 'AR/VR Experience',
    image: img1,
    sizeClass: 'masonry-wide'
  },
  {
    id: 3,
    title: 'Valkyrie Ascending',
    category: 'Film CGI',
    image: img3,
    sizeClass: 'masonry-medium'
  },
  {
    id: 4,
    title: 'Solitude Virtual',
    category: 'Spatial Design',
    image: img4,
    sizeClass: 'masonry-medium'
  },
  {
    id: 5,
    title: 'Retro-Futurism',
    category: 'Motion Graphics',
    image: img5,
    sizeClass: 'masonry-wide'
  },
  {
    id: 6,
    title: 'Alpha Sentinels',
    category: 'VFX Previz',
    image: img6,
    sizeClass: 'masonry-large'
  }
];

const MasonryCard = ({ item }: { item: typeof portfolioItems[0] }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate normalized coords (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setCoords({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  // 3D Tilt translation on hover
  const cardStyle = {
    transform: isHovered 
      ? `perspective(1000px) rotateY(${coords.x * 12}deg) rotateX(${coords.y * -12}deg) translateY(-5px)`
      : 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0px)',
    transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
  };

  const glowStyle = {
    left: `${(coords.x + 0.5) * 100}%`,
    top: `${(coords.y + 0.5) * 100}%`,
    opacity: isHovered ? 0.3 : 0
  };

  return (
    <div 
      ref={cardRef}
      className={`portfolio-masonry-card ${item.sizeClass}`}
      style={cardStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ProgressiveImage src={item.image} alt={item.title} className="masonry-card-img"  loading="lazy" decoding="async" />
      <div className="masonry-card-dark-overlay"></div>
      <div className="masonry-card-red-overlay"></div>
      <div className="masonry-card-glow-glow" style={glowStyle}></div>
      
      <div className="masonry-card-details">
        <span className="masonry-card-category">{item.category}</span>
        <h4 className="masonry-card-title">{item.title}</h4>
      </div>
    </div>
  );
};

const PortfolioSection = () => {
  return (
    <section className="portfolio-grid-section" id="portfolio-masonry">
      <div className="portfolio-grid-container">
        
        <div className="portfolio-grid-header">
          <span className="portfolio-grid-subtitle">Gallery</span>
          <h2 className="section-title-huge">Project Grid</h2>
        </div>

        <div className="portfolio-masonry-layout">
          {portfolioItems.map((item) => (
            <MasonryCard key={item.id} item={item} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default PortfolioSection;
