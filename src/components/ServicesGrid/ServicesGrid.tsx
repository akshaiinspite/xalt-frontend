import './ServicesGrid.css';
import imgFilms from '../../assets/images/image-galley/gallery-img-1.jpg';
import imgCommercial from '../../assets/images/image-galley/gallery-img-3.jpg';
import imgArvr from '../../assets/images/image-galley/gallery-img-5.jpg';

const services = [
  {
    id: 1,
    title: 'Films & Entertainment',
    category: 'VFX & Post Production',
    description: 'We curate and aggregate breathtaking visual sequences for feature films, leveraging deep relationships across the worldwide entertainment industry.',
    image: imgFilms
  },
  {
    id: 2,
    title: 'Commercial Projects',
    category: 'CGI & Motion Design',
    description: 'Seamlessly integrating premium tech aesthetics with robust design systems to elevate modern brand identities and digital experiences.',
    image: imgCommercial
  },
  {
    id: 3,
    title: 'AR & VR Experiences',
    category: 'Spatial Computing',
    description: 'Immersive digital environments and spatial computing solutions that bridge the physical and virtual worlds for interactive storytelling.',
    image: imgArvr
  }
];

const ServicesGrid = () => {
  const handleCardClick = (id: number) => {
    const hashes: { [key: number]: string } = {
      1: '#projects/films',
      2: '#projects/commercial',
      3: '#projects/immersive'
    };
    const targetHash = hashes[id] || '#projects';
    const lenisInstance = (window as any).lenis;
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { immediate: true });
    }
    window.scrollTo(0, 0);
    window.location.hash = targetHash;
  };

  return (
    <section className="services-section" id="services">
      <div className="services-container">
        
        <div className="services-header">
          <span className="services-subtitle">What We Do</span>
          <h2 className="services-heading">
            OUR <span className="services-highlight">EXPERTISE</span>
          </h2>
        </div>

        <div className="services-grid-layout">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="service-card"
              onClick={() => handleCardClick(service.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Image Container */}
              <div className="service-card-img-box">
                <img src={service.image} alt={service.title} className="service-card-img" />
                <div className="service-card-overlay"></div>
                <div className="service-card-glow-red"></div>
              </div>

              {/* Card Content */}
              <div className="service-card-content">
                <div className="service-card-category">{service.category}</div>
                <h3 className="service-card-title">{service.title}</h3>
                <p className="service-card-desc">{service.description}</p>
                
                <button className="service-card-btn">
                  Read More
                  <span className="btn-arrow">&rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ServicesGrid;
