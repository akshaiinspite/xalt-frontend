import { motion } from 'framer-motion';
import { ScrollRevealText } from '../ScrollRevealText/ScrollRevealText';
import './ImageGallery.css';

import imgPreviz from '../../assets/images/image-galley/gallery-img-1.jpg';
import imgArVr from '../../assets/images/image-galley/gallery-img-3.jpg';
import imgVfx from '../../assets/images/image-galley/gallery-img-2.jpg';
import img4 from '../../assets/images/image-galley/gallery-img-4.jpg';
import img5 from '../../assets/images/image-galley/gallery-img-5.jpg';
import img6 from '../../assets/images/image-galley/gallery-img-6.jpg';

const galleryItems = [
  
  {
    id: 'item-1',
    image: imgArVr,
    title: 'AR/VR Environments',
    subtitle: 'Spatial Computing, B2C',
  },
  {
    id: 'item-2',
    image: imgPreviz,
    title: 'Cinematic Pre-viz',
    subtitle: 'Films, Storytelling, 3D',
  },
  {
    id: 'item-3',
    image: imgVfx,
    title: 'Commercial VFX',
    subtitle: 'Advertising, Products, B2B',
  },
  {
    id: 'item-4',
    image: img4,
    title: 'Interactive Media',
    subtitle: 'Web3, Platforms, Gaming',
  },
  {
    id: 'item-5',
    image: img5,
    title: 'Brand Identity',
    subtitle: 'Design, Strategy, UI/UX',
  },
  {
    id: 'item-6',
    image: img6,
    title: 'Premium Audio',
    subtitle: 'Mixing, Mastering, Quality',
  },
];

const ImageGallery = () => {
  return (
    <section className="image-gallery-section">
      <div className="image-gallery-title-wrapper">
        <ScrollRevealText text="A glimpse into our recent studio projects and visual explorations." elementType="p" className="image-gallery-para" splitBy="word" />
      </div>

      <div className="image-grid">
        {galleryItems.map((item, index) => (
          <motion.div 
            key={item.id}
            className="image-card"
            initial={{ y: 80, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.2, ease: [0.19, 1.0, 0.22, 1.0], delay: index * 0.2 }}
          >
            <div className="image-wrapper">
              <img src={item.image} alt={item.title} className="gallery-image" />
            </div>
            <div className="image-details">
              <h3 className="image-title">{item.title}</h3>
              <p className="image-subtitle">{item.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ImageGallery;
