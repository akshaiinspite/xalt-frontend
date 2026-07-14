import { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProjectsPage, setIsProjectsPage] = useState(window.location.hash.startsWith('#projects'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'projects' | 'contact' | 'careers' | 'admin'>('home');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const handleHash = () => {
      if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')) {
        window.history.replaceState(null, '', '/');
        window.location.hash = '#admin';
        return;
      }

      const hash = window.location.hash;
      setIsProjectsPage(hash.startsWith('#projects'));
      if (hash === '#about') {
        setActiveTab('about');
      } else if (hash.startsWith('#projects')) {
        setActiveTab('projects');
      } else if (hash.startsWith('#contact')) {
        setActiveTab('contact');
      } else if (hash.startsWith('#careers')) {
        setActiveTab('careers');
      } else if (hash.startsWith('#admin')) {
        setActiveTab('admin');
      } else {
        setActiveTab('home');
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('hashchange', handleHash);
    
    // Check initial scroll/hash state
    handleScroll();
    handleHash();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetHash: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const lenisInstance = (window as any).lenis;

    if (window.location.hash === targetHash) {
      // Smooth scroll to top if already on this tab
      if (lenisInstance) {
        lenisInstance.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Instantly reset scroll offsets before updating tab hash
      if (lenisInstance) {
        lenisInstance.scrollTo(0, { immediate: true });
      }
      window.scrollTo(0, 0);
      window.location.hash = targetHash;
    }
  };

  const handleDropdownClick = (e: React.MouseEvent<HTMLAnchorElement>, targetHash: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const lenisInstance = (window as any).lenis;
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { immediate: true });
    }
    window.scrollTo(0, 0);
    window.location.hash = targetHash;
  };

  const handleLogoClick = () => {
    setIsMobileMenuOpen(false);
    window.location.hash = '#home';
    const lenisInstance = (window as any).lenis;
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
    <header className={`header ${isScrolled || isProjectsPage || isMobileMenuOpen ? 'scrolled' : ''}`}>
      <div className="header-logo" style={{ cursor: 'pointer' }} onClick={handleLogoClick}>
        <img src="/uploads/XALT LOGO - VERT (1).png" alt="Xalt Studio" className="logo" />
      </div>
      
      <nav className="nav-links">
        <a href="#home" className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={(e) => handleLinkClick(e, '#home')}>
          {activeTab === 'home' && <span className="active-dot"></span>}
          Home
        </a>
        <span className="nav-separator">/</span>
        <a href="#about" className={`nav-link ${activeTab === 'about' ? 'active' : ''}`} onClick={(e) => handleLinkClick(e, '#about')}>
          {activeTab === 'about' && <span className="active-dot"></span>}
          Studio
        </a>
        <span className="nav-separator">/</span>
        <div className="nav-dropdown-wrapper">
          <a href="#projects" className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`} onClick={(e) => handleLinkClick(e, '#projects')}>
            {activeTab === 'projects' && <span className="active-dot"></span>}
            Projects <span className="caret">▼</span>
          </a>
          <div className="header-dropdown-menu">
            <a href="#projects/commercial" className="header-dropdown-item" onClick={(e) => handleDropdownClick(e, '#projects/commercial')}>
              Commercial Projects
            </a>
            <a href="#projects/films" className="header-dropdown-item" onClick={(e) => handleDropdownClick(e, '#projects/films')}>
              Films & Entertainment
            </a>
            <a href="#projects/immersive" className="header-dropdown-item" onClick={(e) => handleDropdownClick(e, '#projects/immersive')}>
              AR & VR Experiences
            </a>
          </div>
        </div>
        <span className="nav-separator">/</span>
        <a href="#careers" className={`nav-link ${activeTab === 'careers' ? 'active' : ''}`} onClick={(e) => handleLinkClick(e, '#careers')}>
          {activeTab === 'careers' && <span className="active-dot"></span>}
          Careers
        </a>
        <span className="nav-separator">/</span>
        <a href="#contact" className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`} onClick={(e) => handleLinkClick(e, '#contact')}>
          {activeTab === 'contact' && <span className="active-dot"></span>}
          Connect
        </a>
      </nav>
      
      <div className="header-menu-btn">
        <button className={`hamburger-btn ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
            {isMobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="4" y1="8" x2="20" y2="8"></line>
                <line x1="4" y1="16" x2="20" y2="16"></line>
              </>
            )}
          </svg>
        </button>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}>
        <nav className="mobile-nav-links">
          <a href="#home" className={`mobile-nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={(e) => handleLinkClick(e, '#home')}>
            Home
          </a>
          <a href="#about" className={`mobile-nav-link ${activeTab === 'about' ? 'active' : ''}`} onClick={(e) => handleLinkClick(e, '#about')}>
            Studio
          </a>
          
          <div className="mobile-projects-wrapper">
            <span className="mobile-projects-label">Projects</span>
            <div className="mobile-projects-sublinks">
              <a href="#projects/commercial" className={`mobile-sub-link ${window.location.hash.startsWith('#projects/commercial') ? 'active' : ''}`} onClick={(e) => handleDropdownClick(e, '#projects/commercial')}>
                Commercial Projects
              </a>
              <a href="#projects/films" className={`mobile-sub-link ${window.location.hash.startsWith('#projects/films') ? 'active' : ''}`} onClick={(e) => handleDropdownClick(e, '#projects/films')}>
                Films & Entertainment
              </a>
              <a href="#projects/immersive" className={`mobile-sub-link ${window.location.hash.startsWith('#projects/immersive') ? 'active' : ''}`} onClick={(e) => handleDropdownClick(e, '#projects/immersive')}>
                AR & VR Experiences
              </a>
            </div>
          </div>

          <a href="#careers" className={`mobile-nav-link ${activeTab === 'careers' ? 'active' : ''}`} onClick={(e) => handleLinkClick(e, '#careers')}>
            Careers
          </a>

          <a href="#contact" className={`mobile-nav-link ${activeTab === 'contact' ? 'active' : ''}`} onClick={(e) => handleLinkClick(e, '#contact')}>
            Connect
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
