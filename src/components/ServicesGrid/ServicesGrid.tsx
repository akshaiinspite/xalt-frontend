import { useState, useEffect } from 'react';
import './ServicesGrid.css';
import imgFilms from '../../assets/images/image-galley/gallery-img-1.jpg';
import imgCommercial from '../../assets/images/image-galley/gallery-img-3.jpg';
import imgArvr from '../../assets/images/image-galley/gallery-img-5.jpg';

import { API_BASE_URL, getMediaUrl } from '../../config';

// Original images mapped by order — these never change
const LOCAL_IMAGES: { [key: number]: string } = {
  0: imgFilms,
  1: imgCommercial,
  2: imgArvr
};

const DEFAULT_SERVICES = [
  {
    _id: 'default-films',
    title: 'Films & Entertainment',
    category: 'VFX & Post Production',
    description: 'We curate and aggregate breathtaking visual sequences for feature films, leveraging deep relationships across the worldwide entertainment industry.',
    link: '#projects/films',
    order: 0
  },
  {
    _id: 'default-commercial',
    title: 'Commercial Projects',
    category: 'CGI & Motion Design',
    description: 'Seamlessly integrating premium tech aesthetics with robust design systems to elevate modern brand identities and digital experiences.',
    link: '#projects/commercial',
    order: 1
  },
  {
    _id: 'default-arvr',
    title: 'AR & VR Experiences',
    category: 'Spatial Computing',
    description: 'Immersive digital environments and spatial computing solutions that bridge the physical and virtual worlds for interactive storytelling.',
    link: '#projects/immersive',
    order: 2
  }
];

const ServicesGrid = () => {
  const [services, setServices] = useState<any[]>(DEFAULT_SERVICES);

  useEffect(() => {
    fetch(`${API_BASE_URL}/expertise`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setServices(data);
        }
      })
      .catch(() => {
        // Backend offline — keep defaults
      });
  }, []);

  const handleCardClick = (service: any) => {
    const targetHash = service.link || '#projects';
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
          {services.map((service, index) => (
            <div 
              key={service._id || index} 
              className="service-card"
              onClick={() => handleCardClick(service)}
            >
              {/* Image Container covers the entire card */}
              <div className="service-card-img-box">
                {/* Cyber Corner Brackets */}
                <div className="card-corners">
                  <span className="corner tl"></span>
                  <span className="corner tr"></span>
                  <span className="corner bl"></span>
                  <span className="corner br"></span>
                </div>
                
                <img src={getMediaUrl(service.image) || LOCAL_IMAGES[index] || imgFilms} alt={service.title} className="service-card-img" />
                <div className="service-card-overlay"></div>
                <div className="service-card-glow-red"></div>
              </div>

              {/* Text overlay content */}
              <div className="service-card-content">
                <span className="service-card-category">{service.category}</span>
                <h3 className="service-card-title">{service.title}</h3>
                <p className="service-card-desc">{service.description}</p>
                
                <button className="service-card-btn view-project-btn">
                  VIEW PROJECT
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
