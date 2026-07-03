import './WhyChooseUs.css';

const whyData = [
  {
    id: 1,
    title: 'Personalized Support',
    description: 'Work with dedicated consultants who understand your business goals and unique vision.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )
  },
  {
    id: 2,
    title: 'With You Every Step',
    description: 'We stay with you from the first consultation to post-launch, ensuring a seamless experience.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
    )
  },
  {
    id: 3,
    title: 'Unmatched Quality',
    description: 'We push the boundaries of XR and VFX to deliver premium, industry-leading visual experiences.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    )
  },
  {
    id: 4,
    title: 'Technical Mastery',
    description: 'Our team perfectly bridges the gap between traditional storytelling and digital production.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
      </svg>
    )
  }
];

const WhyChooseUs = () => {
  return (
    <section className="why-section" id="why-us">
      <div className="why-container">
        
        {/* Left Side: Huge Typography */}
        <div className="why-left-content">
          <span className="why-subtitle">Excellence</span>
          <h2 className="why-main-title">
            WHY<br />
            PARTNER<br />
            <span className="why-title-red">WITH US</span>
          </h2>
          <p className="why-left-desc">
            We do not just execute projects; we redefine what is visually possible. Work with a studio that treats your project like an award-winning masterwork.
          </p>
        </div>
        
        {/* Right Side: Feature Cards */}
        <div className="why-right-grid">
          {whyData.map((item) => (
            <div key={item.id} className="why-feature-card">
              <div className="why-card-icon-box">
                {item.icon}
              </div>
              <h3 className="why-card-title">{item.title}</h3>
              <p className="why-card-desc">{item.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;

