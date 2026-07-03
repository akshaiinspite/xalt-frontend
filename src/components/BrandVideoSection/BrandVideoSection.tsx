import './BrandVideoSection.css';
import logoImg from '../../assets/images/logo/xalt-studios-logo.webp';

const BrandVideoSection = () => {
  return (
    <section className="brand-logo-hero-section">
      <div className="brand-logo-hero-glow"></div>
      <img src={logoImg} alt="X.ALT Studios" className="brand-logo-hero-img" />
    </section>
  );
};

export default BrandVideoSection;
