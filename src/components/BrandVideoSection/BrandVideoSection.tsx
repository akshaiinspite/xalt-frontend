import { useEffect, useState } from 'react';
import './BrandVideoSection.css';
import { API_BASE_URL, getMediaUrl } from '../../config';

const BrandVideoSection = () => {
  const [videoUrl, setVideoUrl] = useState('/uploads/logo video xalt.mp4');

  useEffect(() => {
    fetch(`${API_BASE_URL}/reels`)
      .then(res => res.json())
      .then(data => {
        if (data && data.heroVideoUrl) {
          if (data.heroVideoUrl.startsWith('http') || (data.heroVideoUrl.startsWith('/') && !data.heroVideoUrl.includes('src/assets'))) {
            setVideoUrl(data.heroVideoUrl);
          }
        }
      })
      .catch(err => console.warn('Backend offline, using default brand video.', err));
  }, []);

  return (
    <section className="brand-logo-hero-section">
      <div className="brand-logo-hero-glow"></div>
      <video
        className="brand-logo-hero-video"
        src={getMediaUrl(videoUrl)}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="brand-logo-hero-overlay"></div>
    </section>
  );
};

export default BrandVideoSection;
