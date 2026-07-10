import './BrandVideoSection.css';

const BrandVideoSection = () => {
  return (
    <section className="brand-logo-hero-section">
      <div className="brand-logo-hero-glow"></div>
      <video
        className="brand-logo-hero-video"
        src="/uploads/logo video xalt.mp4"
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
