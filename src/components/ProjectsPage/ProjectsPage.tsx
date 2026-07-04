import { useEffect, useState } from 'react';
import gsap from 'gsap';
import './ProjectsPage.css';

// Import images
import commercialHero from '../../assets/images/services/commercial_landscape.png';
import filmsHero from '../../assets/images/services/films_landscape.png';
import arvrHero from '../../assets/images/services/arvr_landscape.png';

import commercialVfx from '../../assets/images/gallery/commercial_vfx.png';
import cinematicPreviz from '../../assets/images/gallery/cinematic_previz.png';
import arVrFloat from '../../assets/images/gallery/ar_vr.png';

import designArtists from '../../assets/images/about/design_artists.png';
import studioWorkspace from '../../assets/images/about/studio_workspace.png';
import workstationVfx from '../../assets/images/img/workstation_vfx_studio.png';

import img1 from '../../assets/images/img/img-1.jpg';
import img2 from '../../assets/images/img/img-2.jpg';
import img3 from '../../assets/images/img/img-3.jpg';

import logoImg from '../../assets/images/logo/xalt-studios-logo.webp';

interface GalleryItem {
  title: string;
  tag: string;
  code: string;
  image: string;
  video?: string;
}

interface SubCategory {
  title: string;
  description: string;
  image: string;
  galleryItems: GalleryItem[];
}

interface CategorySection {
  id: string;
  title: string;
  description: string;
  heroImage: string;
  subCategories: SubCategory[];
}

const CATEGORIES_DATA: CategorySection[] = [
  {
    id: 'commercial',
    title: 'COMMERCIAL PROJECTS',
    description: 'We create high-end commercial visual experiences for brands, corporations, real estate, hospitality, retail, and luxury businesses through cinematic storytelling and cutting-edge production.',
    heroImage: commercialHero,
    subCategories: [
      {
        title: 'Corporate Films',
        description: 'Brand introductions and company profile films.',
        image: img1,
        galleryItems: [
          { title: 'Aether Brand Anthem', tag: 'Cinematography', code: 'FILM_AE_01', image: img1 },
          { title: 'Chronos Identity', tag: 'Visual Narrative', code: 'FILM_CH_02', image: img2 },
          { title: 'Zenith Corp Profile', tag: 'Documentary', code: 'FILM_ZE_03', image: img3 },
          { title: 'Apex Annual Report', tag: 'Data Motion', code: 'FILM_AP_04', image: studioWorkspace },
          { title: 'Vortex Intro Hook', tag: 'Sound Sync', code: 'FILM_VO_05', image: designArtists },
          { title: 'Summit Executive Shot', tag: 'Interview', code: 'FILM_SU_06', image: workstationVfx }
        ]
      },
      {
        title: 'Product Photography',
        description: 'High-end ecommerce and lifestyle product shoots.',
        image: img2,
        galleryItems: [
          { title: 'Helios Watch Shoot', tag: 'Lighting', code: 'PHOTO_HE_01', image: img2 },
          { title: 'Lumina Cosmetics', tag: 'Macro Focus', code: 'PHOTO_LU_02', image: img3 },
          { title: 'Nova Footwear Pack', tag: 'Studio Packshot', code: 'PHOTO_NO_03', image: img1 },
          { title: 'Polaris Tech Deck', tag: 'Abstract', code: 'PHOTO_PO_04', image: studioWorkspace },
          { title: 'Solace Apparel Look', tag: 'Outdoor', code: 'PHOTO_SO_05', image: designArtists },
          { title: 'Onyx Automobile Stills', tag: 'Automotive', code: 'PHOTO_ON_06', image: workstationVfx }
        ]
      },
      {
        title: 'Architectural Visualization',
        description: 'Cinematic interior and exterior property renders.',
        image: studioWorkspace,
        galleryItems: [
          { title: 'Nexus Glass Pavilion', tag: '3D Render', code: 'ARCH_NE_01', image: studioWorkspace },
          { title: 'Strata Desert Villa', tag: 'V-Ray Render', code: 'ARCH_ST_02', image: designArtists },
          { title: 'Vertex Urban Loft', tag: 'Interior', code: 'ARCH_VE_03', image: workstationVfx },
          { title: 'Apex Tower Exterior', tag: 'Daylight', code: 'ARCH_AP_04', image: img1 },
          { title: 'Oasis Wellness Center', tag: 'Lumen Render', code: 'ARCH_OA_05', image: img2 },
          { title: 'Canyon Minimal House', tag: 'Cinematic Arch', code: 'ARCH_CA_06', image: img3 }
        ]
      },
      {
        title: 'Real Estate Media',
        description: 'Drone coverage, HDR visuals and virtual tours.',
        image: img3,
        galleryItems: [
          { title: 'Vista Ridge Aerials', tag: 'Drone 4K', code: 'REAL_VI_01', image: img3 },
          { title: 'Marina Penthouse Tour', tag: 'Gimbal Walk', code: 'REAL_MA_02', image: img1 },
          { title: 'Ridgeview Estates HDR', tag: 'Photography', code: 'REAL_RI_03', image: img2 },
          { title: 'Lakeside Manor Drone', tag: 'Photogrammetry', code: 'REAL_LA_04', image: studioWorkspace },
          { title: 'Peak Horizon Suite', tag: 'Virtual Reality', code: 'REAL_PE_05', image: designArtists },
          { title: 'Crestwood Luxury Tour', tag: 'Intro Film', code: 'REAL_CR_06', image: workstationVfx }
        ]
      },
      {
        title: 'Advertising Campaigns',
        description: 'Vibrant digital ads and social media commercial films.',
        image: designArtists,
        galleryItems: [
          { title: 'Ignite Beverage Spot', tag: 'Commercial CGI', code: 'AD_IG_01', image: designArtists },
          { title: 'Revolt Fitness Campaign', tag: 'Fast Cut', code: 'AD_RE_02', image: workstationVfx },
          { title: 'Echo Audio Launch', tag: 'Abstract Motion', code: 'AD_EC_03', image: studioWorkspace },
          { title: 'Volt E-Bike Rollout', tag: 'Action Sequence', code: 'AD_VO_04', image: img1 },
          { title: 'Pulse App Promo', tag: 'UX Animation', code: 'AD_PU_05', image: img2 },
          { title: 'Nova Watch Campaign', tag: 'Cinematography', code: 'AD_NO_06', image: img3 }
        ]
      }
    ]
  },
  {
    id: 'films',
    title: 'FILMS & ENTERTAINMENT',
    description: 'Bringing stories to life with cinematic production, visual effects, immersive editing, and professional filmmaking.',
    heroImage: filmsHero,
    subCategories: [
      {
        title: 'Movie Previz',
        description: 'Pre-visualization and structural blockouts.',
        image: img1,
        galleryItems: [
          { title: 'Ares Chase Previz', tag: 'Action Blockout', code: 'PREV_AR_01', image: img1 },
          { title: 'Nebula Arrival Previz', tag: 'Sci-Fi Composition', code: 'PREV_NE_02', image: img2 },
          { title: 'Subway Encounter', tag: 'Choreography', code: 'PREV_SU_03', image: img3 },
          { title: 'Canyon Flight Run', tag: 'Camera Animation', code: 'PREV_CA_04', image: studioWorkspace },
          { title: 'Rooftop Escape Stunt', tag: 'Blockout', code: 'PREV_RO_05', image: designArtists },
          { title: 'Volcano Base Infiltration', tag: 'Set Design', code: 'PREV_VO_06', image: workstationVfx }
        ]
      },
      {
        title: 'Motion Poster',
        description: 'Dynamic animated poster designs.',
        image: img2,
        galleryItems: [
          { title: 'Dark Matter Poster', tag: 'Motion Design', code: 'POST_DA_01', image: img2 },
          { title: 'Hyperion Genesis', tag: 'Loop Animation', code: 'POST_HY_02', image: img3 },
          { title: 'Lost Signal Poster', tag: 'Glitch Effect', code: 'POST_LO_03', image: img1 },
          { title: 'Neon Phantom Key Art', tag: '2.5D Parallax', code: 'POST_NE_04', image: studioWorkspace },
          { title: 'Vanguard Reborn Poster', tag: 'Character Loop', code: 'POST_VA_05', image: designArtists },
          { title: 'Outpost 09 Poster', tag: 'Atmospheric Glow', code: 'POST_OU_06', image: workstationVfx }
        ]
      },
      {
        title: 'CGI & VFX',
        description: 'Immersive visual effects and realistic 3D environments.',
        image: commercialVfx,
        galleryItems: [
          { title: 'Nova City Destruction', tag: 'VFX Simulation', code: 'VFX_NO_01', image: commercialVfx },
          { title: 'Cybernetic Mech Rig', tag: '3D CGI Asset', code: 'VFX_ME_02', image: cinematicPreviz },
          { title: 'Cosmic Singularity Blackhole', tag: 'Particle System', code: 'VFX_CO_03', image: workstationVfx },
          { title: 'Deep Space Nebula', tag: 'Volumetrics', code: 'VFX_DE_04', image: img1 },
          { title: 'Ancient Ruin Matte Painting', tag: 'Matte Paint', code: 'VFX_AN_05', image: img2 },
          { title: 'Alien Jungle Environment', tag: 'Procedural Gen', code: 'VFX_AL_06', image: img3 }
        ]
      },
      {
        title: 'Lyrical Video',
        description: 'Aesthetic wordplay and audio-reactive animations.',
        image: img3,
        galleryItems: [
          { title: 'Resonance Lyric Film', tag: 'Typography', code: 'LYR_RE_01', image: img3 },
          { title: 'Synthetix Beat Loop', tag: 'Audio Reactive', code: 'LYR_SY_02', image: img1 },
          { title: 'Afterglow Lyrics', tag: 'Kinetic Type', code: 'LYR_AF_03', image: img2 },
          { title: 'Phantom Echo Video', tag: 'Glitch Motion', code: 'LYR_PH_04', image: studioWorkspace },
          { title: 'Primal Pulse Lyric Art', tag: 'Retro Glow', code: 'LYR_PR_05', image: designArtists },
          { title: 'Void Whispers Video', tag: 'Abstract Layout', code: 'LYR_VO_06', image: workstationVfx }
        ]
      },
      {
        title: 'Title Animation',
        description: 'High-impact title cards and credits sequencings.',
        image: filmsHero,
        galleryItems: [
          { title: 'Chronos Main Title', tag: '3D Extrusion', code: 'TITL_CH_01', image: filmsHero },
          { title: 'Vector Glitch Intro', tag: 'Title Cards', code: 'TITL_VE_02', image: img1 },
          { title: 'Spectrum Opener', tag: 'Lens Flare FX', code: 'TITL_SP_03', image: img2 },
          { title: 'Ghost Protocol Credits', tag: 'Kinetic Design', code: 'TITL_GH_04', image: studioWorkspace },
          { title: 'Rogue Nexus Sequence', tag: 'Procedural HUD', code: 'TITL_RO_05', image: designArtists },
          { title: 'Apex Legend Opener', tag: 'Matte Texturing', code: 'TITL_AP_06', image: workstationVfx }
        ]
      }
    ]
  },
  {
    id: 'immersive',
    title: 'AR & VR EXPERIENCES',
    description: 'Creating interactive digital experiences using Augmented Reality, Virtual Reality, Mixed Reality, and immersive technologies.',
    heroImage: arvrHero,
    subCategories: [
      {
        title: 'Augmented Reality',
        description: 'Interactive AR showcases and packaging enhancements.',
        image: img3,
        galleryItems: [
          { title: 'HoloPack AR Filter', tag: 'WebAR Dev', code: 'AR_HO_01', image: img3 },
          { title: 'Solace Apparel Try-On', tag: 'Body Tracking', code: 'AR_SO_02', image: img1 },
          { title: 'Lumina Smart Guide', tag: 'SLAM Tracking', code: 'AR_LU_03', image: img2 },
          { title: 'Quantum Game UI', tag: 'Image Target', code: 'AR_QU_04', image: studioWorkspace },
          { title: 'Chronos Watch View', tag: 'Wrist Tracker', code: 'AR_CH_05', image: designArtists },
          { title: 'Apex Product AR Show', tag: '3D Overlay', code: 'AR_AP_06', image: workstationVfx }
        ]
      },
      {
        title: 'Virtual Reality',
        description: 'Immersive VR virtual walkthroughs and simulation training.',
        image: arVrFloat,
        galleryItems: [
          { title: 'Aether Training Ground', tag: 'Unreal Engine', code: 'VR_AE_01', image: arVrFloat },
          { title: 'Vista Ridge Oculus Tour', tag: '360 Stereo', code: 'VR_VI_02', image: img1 },
          { title: 'Deep Space VR Flight', tag: 'Physics Engine', code: 'VR_DE_03', image: img2 },
          { title: 'Zenith Facility Sim', tag: 'Interactive', code: 'VR_ZE_04', image: studioWorkspace },
          { title: 'Vortex Synth Concert', tag: 'Audio Sync', code: 'VR_VO_05', image: designArtists },
          { title: 'Summit Climb Experience', tag: 'VR Sandbox', code: 'VR_SU_06', image: workstationVfx }
        ]
      },
      {
        title: 'Mixed Reality',
        description: 'Hybrid presentations and next-gen enterprise tools.',
        image: img1,
        galleryItems: [
          { title: 'Strata HoloLens Layout', tag: 'MR Toolkit', code: 'MR_ST_01', image: img1 },
          { title: 'Helios Collab Sandbox', tag: 'Spatial Anchor', code: 'MR_HE_02', image: img2 },
          { title: 'Marina Design Room', tag: 'LiDAR Mesh', code: 'MR_MA_03', image: img3 },
          { title: 'Lakeside Smart Board', tag: 'Gesture Recognizer', code: 'MR_LA_04', image: studioWorkspace },
          { title: 'Outpost Factory Guide', tag: 'Dynamic HUD', code: 'MR_OU_05', image: designArtists },
          { title: 'Canyon Flight Map', tag: 'Spatial Audio', code: 'MR_CA_06', image: workstationVfx }
        ]
      },
      {
        title: 'Metaverse Solutions',
        description: 'Digital avatars and real-time virtual events spaces.',
        image: img2,
        galleryItems: [
          { title: 'Nova Hub Auditorium', tag: 'Spatial Dev', code: 'META_NO_01', image: img2 },
          { title: 'Horizon Meeting Suite', tag: 'Web3 Mesh', code: 'META_HO_02', image: img3 },
          { title: 'Aether Digital Twins', tag: 'NVIDIA Omniverse', code: 'META_AE_03', image: img1 },
          { title: 'Apex Virtual Expo', tag: 'Realtime Unity', code: 'META_AP_04', image: studioWorkspace },
          { title: 'Pulse Avatar Gear', tag: 'ReadyPlayerMe', code: 'META_PU_05', image: designArtists },
          { title: 'Solace Plaza Social', tag: 'Multiplayer', code: 'META_SO_06', image: workstationVfx }
        ]
      },
      {
        title: 'Interactive Installations',
        description: 'Exhibition displays, museum panels, and event activations.',
        image: studioWorkspace,
        galleryItems: [
          { title: 'Zenith Projection Room', tag: 'Mapping', code: 'INST_ZE_01', image: studioWorkspace },
          { title: 'Nova Kinetic Wall', tag: 'Sensor Sync', code: 'INST_NO_02', image: designArtists },
          { title: 'Lumina Mirror Feed', tag: 'Computer Vision', code: 'INST_LU_03', image: workstationVfx },
          { title: 'Chronos Historic Map', tag: 'Touch Screen', code: 'INST_CH_04', image: img1 },
          { title: 'Primal Beats Chamber', tag: 'Lighting Desk', code: 'INST_PR_05', image: img2 },
          { title: 'Aether Core Helix', tag: 'Laser System', code: 'INST_AE_06', image: img3 }
        ]
      }
    ]
  }
];

const getMediaUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  // Convert legacy local paths that might be stored in the database to backend uploads
  if (url.startsWith('/src/assets/images/')) {
    const filename = url.substring(url.lastIndexOf('/') + 1);
    return `http://localhost:5000/uploads/${filename}`;
  }
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `http://localhost:5000${cleanUrl}`;
  }
  return url;
};

const ProjectsPage = () => {
  const [categoriesData, setCategoriesData] = useState<CategorySection[]>(CATEGORIES_DATA);
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState<number>(1); // Default: Films & Entertainment
  const [selectedSubcategoryIdx, setSelectedSubcategoryIdx] = useState<number>(2); // Default: CGI & VFX
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  
  // viewMode controls: 'board' (Evidence Board) vs 'gallery' (Detailed New Page)
  const [viewMode, setViewMode] = useState<'board' | 'gallery'>('board');

  useEffect(() => {
    fetch('http://localhost:5000/api/portfolio')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setCategoriesData(data);
        }
      })
      .catch(err => {
        console.warn('Backend offline or error loading portfolio, using static projects data.', err);
      });
  }, []);



  // Scroll window to top when changing views or subcategories
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [viewMode, selectedSubcategoryIdx, selectedCategoryIdx]);

  const handleSelect = (categoryIdx: number, subcategoryIdx: number) => {
    const catIds = ['commercial', 'films', 'immersive'];
    const catId = catIds[categoryIdx] || 'films';
    window.location.hash = `#projects/${catId}/${subcategoryIdx}`;
    setActiveDropdown(null);
  };

  const handleCategorySelect = (categoryIdx: number) => {
    const catIds = ['commercial', 'films', 'immersive'];
    const catId = catIds[categoryIdx] || 'films';
    window.location.hash = `#projects/${catId}`;
    setActiveDropdown(null);
  };

  // Synchronize selected category with URL hash
  useEffect(() => {
    const handleHashCheck = () => {
      const hash = window.location.hash;
      const parts = hash.split('/'); // e.g. ["#projects", "films", "2"] or ["#projects", "films"]

      if (parts[0] === '#projects') {
        let categoryIdx = -1;
        let subcategoryIdx = 0;
        let targetViewMode: 'board' | 'gallery' = 'board';

        const catId = parts[1];
        if (catId === 'commercial') {
          categoryIdx = 0;
        } else if (catId === 'films') {
          categoryIdx = 1;
          subcategoryIdx = 2; // Default to CGI & VFX for films when not specified
        } else if (catId === 'immersive') {
          categoryIdx = 2;
        }

        // If no category ID is specified, default to Films & Entertainment
        if (!catId) {
          categoryIdx = 1;
          subcategoryIdx = 2;
          targetViewMode = 'board';
        }

        if (categoryIdx !== -1) {
          if (parts[2] !== undefined) {
            const parsedSubIdx = parseInt(parts[2], 10);
            if (!isNaN(parsedSubIdx) && parsedSubIdx >= 0 && categoriesData[categoryIdx] && parsedSubIdx < categoriesData[categoryIdx].subCategories.length) {
              subcategoryIdx = parsedSubIdx;
              targetViewMode = 'gallery';
            }
          }
          
          setSelectedCategoryIdx(categoryIdx);
          setSelectedSubcategoryIdx(subcategoryIdx);
          setViewMode(targetViewMode);
        }
      }
    };

    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => {
      window.removeEventListener('hashchange', handleHashCheck);
    };
  }, []);

  useEffect(() => {
    if (viewMode === 'board') {
      gsap.fromTo(
        '.board-header',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.board-subcard',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.1 }
      );
    } else if (viewMode === 'gallery') {
      gsap.fromTo(
        '.gallery-new-header-split',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.gallery-sharp-slot',
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', delay: 0.15 }
      );
    }
  }, [viewMode, selectedCategoryIdx, selectedSubcategoryIdx]);

  const renderHighlightedTitle = (title: string) => {
    const words = title.split(' ');
    if (words.length <= 1) return title;
    
    if (title.includes('&')) {
      const parts = title.split('&');
      return (
        <>
          {parts[0]} & <span className="board-title-highlight">{parts[1].trim()}</span>
        </>
      );
    }
    
    const lastWord = words[words.length - 1];
    const firstPart = words.slice(0, -1).join(' ');
    return (
      <>
        {firstPart} <span className="board-title-highlight">{lastWord}</span>
      </>
    );
  };

  const activeCategory = categoriesData[selectedCategoryIdx] || categoriesData[0] || null;
  const activeSubcategory = activeCategory?.subCategories[selectedSubcategoryIdx] || activeCategory?.subCategories[0] || null;

  if (!activeCategory || !activeSubcategory) {
    return (
      <div className="projects-page-new loading-state" style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#070709', color: '#ffffff', fontFamily: 'monospace' }}>
        // LOADING PROJECT NODES...
      </div>
    );
  }

  return (
    <div className="projects-page-new">
      


      {/* TOP DROPDOWN NAVIGATION BAR */}
      <div className="projects-nav-bar">
        <div className="nav-logo-area" onClick={() => window.location.hash = '#home'}>
          <img src={logoImg} alt="Xalt Studio" className="projects-nav-logo" />
        </div>

        <div className="projects-dropdowns-group">
          {categoriesData.map((cat, idx) => (
            <div 
              key={cat.id}
              className={`proj-dropdown-wrapper ${activeDropdown === idx ? 'expanded' : ''}`}
              onMouseEnter={() => setActiveDropdown(idx)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                className={`proj-dropdown-trigger ${selectedCategoryIdx === idx ? 'active' : ''}`}
                onClick={() => handleCategorySelect(idx)}
              >
                <span>{cat.title}</span>
                <span className="dropdown-caret">▼</span>
              </button>
              <div className="proj-dropdown-menu">
                {cat.subCategories.map((sub, sIdx) => (
                  <div 
                    key={sIdx} 
                    className={`proj-dropdown-item ${selectedCategoryIdx === idx && selectedSubcategoryIdx === sIdx ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(idx, sIdx);
                    }}
                  >
                    {sub.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VIEW STATE 1: EVIDENCE BOARD (ACCORDION SELECTION) */}
      {viewMode === 'board' ? (
        <div className="projects-board-section">
          <div className="board-header">
            <div className="board-meta">
              <span className="rec-blink-dot"></span>
              <span className="board-tag">// SYSTEM: EVIDENCE_BOARD</span>
              <span className="board-status">SECTOR: SELECT_NODE</span>
            </div>
            <h2 className="board-category-title">
              {renderHighlightedTitle(activeCategory.title)}
            </h2>

            {/* Direct category hopping shortcuts */}
            <div className="board-category-shortcuts">
              <span className="shortcut-label">// HOP TO:</span>
              <div className="shortcut-buttons">
                {categoriesData.map((cat, idx) => {
                  const isActive = selectedCategoryIdx === idx;
                  return (
                    <button
                      key={cat.id}
                      className={`board-shortcut-btn ${isActive ? 'active' : ''}`}
                      onClick={() => handleCategorySelect(idx)}
                    >
                      <span className="btn-bracket">[</span>
                      <span className="btn-text">{cat.title}</span>
                      <span className="btn-bracket">]</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="board-desc-box">
              <span className="board-desc-line"></span>
              <p className="board-category-desc">{activeCategory.description}</p>
            </div>
          </div>

          {/* SUBCATEGORY CARDS BOARD (Accordion layout with straight edges & cyber telemetry) */}
          <div className="board-cards-grid">
            {activeCategory.subCategories.map((sub, sIdx) => {
              const isSelected = selectedSubcategoryIdx === sIdx;
              return (
                <div 
                  key={sIdx} 
                  className={`board-subcard ${isSelected ? 'active-card' : ''}`}
                  onClick={() => handleSelect(selectedCategoryIdx, sIdx)}
                >
                  {/* Cyber Corner Brackets */}
                  <div className="card-corners">
                    <span className="corner tl"></span>
                    <span className="corner tr"></span>
                    <span className="corner bl"></span>
                    <span className="corner br"></span>
                  </div>

                  <div className="board-subcard-header">
                    <span className="board-subcard-title">{sub.title}</span>
                  </div>
                  
                  <div className="board-subcard-img-container">
                    <img src={getMediaUrl(sub.image)} alt={sub.title} className="board-subcard-img" />
                    <div className="board-subcard-filter"></div>
                  </div>

                  {/* High-tech telemetry data displayed on card */}
                  <div className="card-telemetry-overlay">
                    <div className="telemetry-line"><span>NODE:</span> <span>0{sIdx + 1}_VFX</span></div>
                    <div className="telemetry-line"><span>SYS_DB:</span> <span>XALT_LOC_X</span></div>
                    <div className="telemetry-line"><span>INTEGRITY:</span> <span className="telemetry-status-red">DECRYPT_READY</span></div>
                  </div>

                  <div className="board-subcard-indicator">
                    <span>{isSelected ? '>> ACTIVE NODE' : '>> CLICK TO OPEN'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW STATE 2: NEW GALLERY PAGE LAYOUT */
        <div className="gallery-new-page-container">
          
          {/* SPLIT HERO HEADER: Left Text content, Right Category Image */}
          <div className="gallery-new-header-split">
            <div className="gallery-header-left">
              <div className="gallery-breadcrumb-bar">
                <span className="gallery-header-mono">// SECTOR: {activeCategory.title} / {activeSubcategory.title.toUpperCase()}</span>
              </div>
              <span className="gallery-category-badge">{activeCategory.title}</span>
              <h1 className="gallery-sharp-title">{activeSubcategory.title}</h1>
              <div className="gallery-desc-wrapper">
                <span className="gallery-desc-accent-line"></span>
                <p className="gallery-sharp-desc">{activeSubcategory.description}</p>
              </div>
              <div className="gallery-header-actions">
                <button 
                  className="gallery-back-button"
                  onClick={() => setViewMode('board')}
                >
                  ← BACK TO {activeCategory.title}
                </button>
                
                <div className="gallery-minimal-nav-header">
                  <span className="nav-footer-label">// JUMP TO OTHER SECTORS:</span>
                  <div className="nav-footer-links">
                    {activeCategory.subCategories.map((sub, sIdx) => (
                      <span key={sIdx} className="nav-footer-link-wrapper">
                        <button 
                          className={`nav-footer-text-link ${sIdx === selectedSubcategoryIdx ? 'active' : ''}`}
                          onClick={() => setSelectedSubcategoryIdx(sIdx)}
                        >
                          {sub.title}
                        </button>
                        {sIdx < activeCategory.subCategories.length - 1 && (
                          <span className="nav-footer-slash">/</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="gallery-header-right">
              <div className="gallery-hero-image-wrapper">
                <div className="slot-corners">
                  <span className="corner tl"></span>
                  <span className="corner tr"></span>
                  <span className="corner bl"></span>
                  <span className="corner br"></span>
                </div>
                <img 
                  src={getMediaUrl(activeSubcategory.image)} 
                  alt={activeSubcategory.title} 
                  className="gallery-hero-image" 
                />
                <div className="gallery-hero-image-overlay"></div>
              </div>
            </div>
          </div>

          {/* Grid of Sharp Detailed Project Cells */}
          <div className="gallery-sharp-grid">
            {activeSubcategory.galleryItems.map((item, idx) => (
              <div 
                key={idx} 
                className="gallery-sharp-slot"
              >
                {/* Cyber Corner Brackets */}
                <div className="slot-corners">
                  <span className="corner tl"></span>
                  <span className="corner tr"></span>
                  <span className="corner bl"></span>
                  <span className="corner br"></span>
                </div>

                <div className="slot-img-wrapper">
                  {item.video ? (
                    <video 
                      src={getMediaUrl(item.video)} 
                      poster={getMediaUrl(item.image)} 
                      muted 
                      loop 
                      playsInline 
                      autoPlay
                      className="slot-preview-img" 
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  ) : (
                    <img src={getMediaUrl(item.image)} alt={item.title} className="slot-preview-img" />
                  )}
                  <div className="slot-cyber-overlay"></div>
                </div>

                <div className="slot-interactive-hud">
                  <div className="hud-line">
                    <span className="hud-label">PROJECT:</span>
                    <span className="hud-val">{item.title}</span>
                  </div>
                  <div className="hud-line">
                    <span className="hud-label">TYPE:</span>
                    <span className="hud-val">{item.tag}</span>
                  </div>
                  <div className="hud-line">
                    <span className="hud-label">CODE:</span>
                    <span className="hud-val text-red">{item.code}</span>
                  </div>
                </div>

                <div className="slot-bottom-telemetry">
                  <span>SECURE_FILE_0{idx + 1}</span>
                  <span>SYSTEM_LOAD_OK</span>
                </div>
              </div>
            ))}
          </div>



        </div>
      )}

    </div>
  );
};

export default ProjectsPage;
