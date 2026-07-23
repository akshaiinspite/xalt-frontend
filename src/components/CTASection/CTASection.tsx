import './CTASection.css';
import ctaBannerImg from '../../assets/images/img/cta_banner_portal.png';
import { ProgressiveImage } from '../ProgressiveImage/ProgressiveImage';

const CTASection = () => {
  return (
    <section className="cta-section" id="contact">
      <div className="cta-card-wrapper">
        <ProgressiveImage src={ctaBannerImg} alt="VFX Portal Banner" className="cta-card-bg" loading="lazy" decoding="async" />
        <div className="cta-card-overlay"></div>
        <div className="cta-card-glow"></div>
        
        <div className="cta-container">
          {/* Left Side: Title */}
          <div className="cta-left-col">
            <span className="cta-subtitle">Get In Touch</span>
            <h2 className="cta-heading">
              READY TO CRAFT<br />
              <span className="cta-highlight">BEYOND REALITY?</span>
            </h2>
          </div>

          {/* Right Side: Details and CTAs */}
          <div className="cta-right-col">
            <p className="cta-description">
              Let us collaborate to build breathtaking digital worlds and cinematic experiences that elevate your brand to the next dimension.
            </p>

            <div className="cta-button-group">
              <button 
                className="btn-primary cta-btn"
                onClick={() => window.location.hash = '#contact?focus=true'}
              >
                Let's Talk
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;



