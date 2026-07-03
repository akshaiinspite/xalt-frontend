import './ProjectsSection.css';
import img1 from '../../assets/images/image-galley/gallery-img-5.jpg';
import img2 from '../../assets/images/image-galley/gallery-img-1.jpg';
import img3 from '../../assets/images/image-galley/gallery-img-2.jpg';
import img4 from '../../assets/images/image-galley/gallery-img-3.jpg';
import img5 from '../../assets/images/image-galley/gallery-img-4.jpg';
import img6 from '../../assets/images/image-galley/gallery-img-6.jpg';

const projects = [
  {
    id: 1,
    title: 'Neon Reality XR',
    category: 'AR & VR EXPERIENCE',
    image: img1
  },
  {
    id: 2,
    title: 'Cypher VFX Film',
    category: 'FILM & ENTERTAINMENT',
    image: img2
  },
  {
    id: 3,
    title: 'Metaverse Hub',
    category: 'AR & VR EXPERIENCE',
    image: img3
  },
  {
    id: 4,
    title: 'Primal Beats Commercial',
    category: 'COMMERCIAL PROJECT',
    image: img4
  },
  {
    id: 5,
    title: 'Synthetix CGI',
    category: 'FILM & ENTERTAINMENT',
    image: img5
  },
  {
    id: 6,
    title: 'Future Retro 3D',
    category: 'COMMERCIAL PROJECT',
    image: img6
  }
];

const ProjectsSection = () => {
  return (
    <section className="featured-section" id="portfolio">
      <div className="featured-container">
        
        {/* Title Header */}
        <div className="featured-header">
          <span className="featured-subtitle">Portfolio</span>
          <h2 className="section-title-huge">Featured Work</h2>
        </div>

        {/* Top Grid: Large left + 2 stacked right */}
        <div className="featured-top-grid">
          {/* Left Large Card */}
          <div className="project-grid-card large-left">
            <div className="project-image-box">
              <img src={projects[0].image} alt={projects[0].title} />
              <div className="project-overlay-dark"></div>
              <div className="project-overlay-red"></div>
              <div className="project-animated-border"></div>
            </div>
            <div className="project-text-box">
              <span className="project-tag-category">{projects[0].category}</span>
              <h3 className="project-card-title-text">{projects[0].title}</h3>
            </div>
          </div>

          {/* Right Stacked Column */}
          <div className="featured-right-column">
            {/* Card 2 */}
            <div className="project-grid-card stacked-right">
              <div className="project-image-box">
                <img src={projects[1].image} alt={projects[1].title} />
                <div className="project-overlay-dark"></div>
                <div className="project-overlay-red"></div>
                <div className="project-animated-border"></div>
              </div>
              <div className="project-text-box">
                <span className="project-tag-category">{projects[1].category}</span>
                <h3 className="project-card-title-text">{projects[1].title}</h3>
              </div>
            </div>

            {/* Card 3 */}
            <div className="project-grid-card stacked-right">
              <div className="project-image-box">
                <img src={projects[2].image} alt={projects[2].title} />
                <div className="project-overlay-dark"></div>
                <div className="project-overlay-red"></div>
                <div className="project-animated-border"></div>
              </div>
              <div className="project-text-box">
                <span className="project-tag-category">{projects[2].category}</span>
                <h3 className="project-card-title-text">{projects[2].title}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row Grid: 3 smaller project cards */}
        <div className="featured-bottom-grid">
          {projects.slice(3).map((project) => (
            <div key={project.id} className="project-grid-card bottom-card">
              <div className="project-image-box">
                <img src={project.image} alt={project.title} />
                <div className="project-overlay-dark"></div>
                <div className="project-overlay-red"></div>
                <div className="project-animated-border"></div>
              </div>
              <div className="project-text-box">
                <span className="project-tag-category">{project.category}</span>
                <h3 className="project-card-title-text">{project.title}</h3>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ProjectsSection;

