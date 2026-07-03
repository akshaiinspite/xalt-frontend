import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './AboutPage.css';

// Import images
import studioWorkspaceImg from '../../assets/images/about/studio_workspace.png';
import designArtistsImg from '../../assets/images/about/design_artists.png';
import studioFloorVfxImg from '../../assets/images/about/studio_floor_vfx.png';
import studioFloorAudioImg from '../../assets/images/about/studio_floor_audio.png';

gsap.registerPlugin(ScrollTrigger);

// ----------------------------------------------------
// THREE.JS BACKGROUND COMPONENT
// ----------------------------------------------------
const ThreeBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Particles (Red space dust)
    const particlesCount = 180;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 18;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.045,
      color: 0xe10600,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // Large floating sphere mesh
    const sphereGeometry = new THREE.SphereGeometry(2.4, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xe10600,
      wireframe: true,
      transparent: true,
      opacity: 0.05,
    });
    const wireframeSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(wireframeSphere);

    // Torus knot mesh
    const knotGeometry = new THREE.TorusKnotGeometry(0.7, 0.22, 100, 10);
    const knotMaterial = new THREE.MeshBasicMaterial({
      color: 0xff3344,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const torusKnot = new THREE.Mesh(knotGeometry, knotMaterial);
    torusKnot.position.set(-4, -2, -3);
    scene.add(torusKnot);

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Anim Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      wireframeSphere.rotation.y = elapsedTime * 0.035;
      wireframeSphere.rotation.x = elapsedTime * 0.012;

      torusKnot.rotation.y = -elapsedTime * 0.06;
      torusKnot.rotation.z = elapsedTime * 0.03;

      particleSystem.rotation.y = elapsedTime * 0.008;

      // Smooth camera interpolation
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      camera.position.x = targetX * 1.5;
      camera.position.y = targetY * 1.5;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      particlesGeometry.dispose();
      particlesMaterial.dispose();
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      knotGeometry.dispose();
      knotMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="three-background-canvas" />;
};

// ----------------------------------------------------
// 3D TILT TEAM CARD COMPONENT (With Zoom & Wide Expand)
// ----------------------------------------------------
interface TeamMember {
  name: string;
  role: string;
  gradient: string;
}

interface TeamCardProps {
  member: TeamMember;
  index: number;
  isClicked: boolean;
  onCardClick: (e: React.MouseEvent) => void;
}

const TeamCard = ({ member, index, isClicked, onCardClick }: TeamCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isClicked) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = rect.width / 2;
    const yc = rect.height / 2;

    const angleX = -(y - yc) / 14;
    const angleY = (x - xc) / 14;

    setCoords({ x: angleY, y: angleX });

    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    card.style.setProperty('--x', `${px}%`);
    card.style.setProperty('--y', `${py}%`);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!isClicked) {
      setCoords({ x: 0, y: 0 });
    }
  };

  const cardStyle = {
    background: member.gradient,
    transform: isClicked
      ? 'perspective(1000px) scale3d(1.05, 1.05, 1.05) translateZ(30px)'
      : isHovered
      ? `perspective(1000px) rotateX(${coords.y}deg) rotateY(${coords.x}deg) scale3d(1.03, 1.03, 1.03)`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    zIndex: isClicked ? 99 : isHovered ? 20 : 2,
    transition: isHovered && !isClicked ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), width 0.6s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease',
  };

  const idNumber = String(index + 1).padStart(2, '0');

  // Hardcoded profiles for visual flair
  const getDepartment = () => {
    if (index === 0) return 'ADMINISTRATIVE_CORE';
    if (index === 1) return 'OPERATION_MGMT';
    return 'CREATIVE_3D_LAB';
  };

  const getDossierBio = () => {
    if (index === 0) {
      return 'Key visionary behind X.ALT. Directs administrative strategies, business partnerships, and structural expansion plans to redefine digital design standards.';
    }
    if (index === 1) {
      return 'Supervises studio workflow, project milestones, and resource allocation. Bridges organizational systems with production pipelines for flawless delivery.';
    }
    return 'Specializes in hyper-realistic 3D environment architecture, displacement shading, and immersive rendering techniques to develop state-of-the-art visual assets.';
  };


  return (
    <div
      ref={cardRef}
      className={`team-card-new ${isHovered ? 'hovered' : ''} ${isClicked ? 'clicked' : ''}`}
      style={cardStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onCardClick}
    >
      <div className="card-shine" />
      
      {/* Evidence Top HUD Header */}
      <div className="evidence-card-top-hud">
        <span className="hud-corner-bracket bracket-tl">[</span>
        <span className="hud-status-text">
          {isClicked ? 'SECURE_DOSSIER // DECRYPTED' : 'ENCRYPTED_FILE // RESTRICTED'}
        </span>
        <span className="hud-open-text">{isClicked ? '>> ACCESSING DATA' : '>> CLICK TO DECRYPT'}</span>
        <span className="hud-corner-bracket bracket-tr">]</span>
      </div>

      <div className="card-inner-new">
        {/* Active close mark */}
        {isClicked && (
          <div className="card-close-indicator">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="3" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        )}

        <div className="evidence-card-columns">
          
          {/* LEFT PANEL: Avatar, Name and Basic Info */}
          <div className="evidence-left-panel">
            
            {/* Side HUD Rotated monospaces */}
            <div className="evidence-side-vertical-right">
              X.ALT INTEL // FILE_{idNumber}
            </div>
            <div className="evidence-side-vertical-left">
              · · · · · · · · · · · ·
            </div>

            {/* HUD Surveillance photo container with scanlines */}
            <div className="card-avatar-container">
              <div className="avatar-scanlines"></div>
              <div className="avatar-red-circle"></div>
              
              <svg className="avatar-hud-ring" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" fill="none" />
                <circle cx="50" cy="50" r="45" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" strokeDasharray="10 8" className="spinning-hud" />
              </svg>

              <svg viewBox="0 0 24 24" className="avatar-placeholder-svg" fill="none" stroke="currentColor" strokeWidth="0.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <div className="evidence-card-basic-details">
              <div className="evidence-index-label">EVIDENCE #{idNumber}</div>
              <h3 className="team-member-name">{member.name}</h3>
              <p className="team-member-role">{member.role}</p>
            </div>

          </div>

          {/* RIGHT PANEL: Dossier Details (Slides open when clicked) */}
          <div className="evidence-right-panel">
            <div className="dossier-panel-header">
              <span className="dossier-tag">RESTRICTED DOSSIER // FILE_{idNumber}</span>
              <span className="dossier-status-dot"></span>
            </div>
            
            <div className="dossier-bio-section">
              <h4 className="dossier-subheading">DEPARTMENT</h4>
              <p className="dossier-dept-text" style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.75rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                {getDepartment().replace(/_/g, ' ')}
              </p>
            </div>

            <div className="dossier-bio-section" style={{ marginTop: '8px' }}>
              <h4 className="dossier-subheading">SUMMARY PROFILE</h4>
              <p className="dossier-bio-text">{getDossierBio()}</p>
            </div>
          </div>

        </div>

        {/* Action Button at the bottom */}
        <div className="evidence-action-btn">
          {isClicked ? '[ DISMISS DOSSIER ]' : '[ DECRYPT DATA FILE ]'}
        </div>

      </div>
    </div>
  );
};

// ----------------------------------------------------
// MAIN ABOUT US PAGE COMPONENT (Consolidated 2 Sections)
// ----------------------------------------------------
const AboutPage = () => {
  const aboutSectionRef = useRef<HTMLDivElement>(null);
  const teamSectionRef = useRef<HTMLDivElement>(null);
  const teamCardsRowRef = useRef<HTMLDivElement>(null);
  const scrollerWrapperRef = useRef<HTMLDivElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  
  const aboutLeftRef = useRef<HTMLDivElement>(null);
  const aboutRightRef = useRef<HTMLDivElement>(null);

  const [activeMember, setActiveMember] = useState<string | null>(null);
  const [hoverDirection, setHoverDirection] = useState<'left' | 'right' | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const teamMembers: TeamMember[] = [
    {
      name: 'Alex Mercer',
      role: 'Founder / CEO',
      gradient: 'linear-gradient(135deg, #050505 0%, #300006 100%)',
    },
    {
      name: 'Sarah Connor',
      role: 'Manager',
      gradient: 'linear-gradient(135deg, #101012 0%, #440d16 100%)',
    },
    {
      name: 'David Miller',
      role: 'Senior 3D Environment Artist',
      gradient: 'linear-gradient(135deg, #1b0206 0%, #520510 100%)',
    },
    {
      name: 'Michael Chen',
      role: 'Senior 3D Environment Artist',
      gradient: 'linear-gradient(135deg, #161616 0%, #700a18 100%)',
    },
    {
      name: 'Marcus Vance',
      role: 'Creative Director',
      gradient: 'linear-gradient(135deg, #120318 0%, #4a030a 100%)',
    },
    {
      name: 'Liam Vance',
      role: 'Partner',
      gradient: 'linear-gradient(135deg, #040108 0%, #350218 100%)',
    },
  ];

  // Mouse wheel scroll horizontal listener
  useEffect(() => {
    const scroller = scrollerWrapperRef.current;
    if (!scroller) return;

    const handleScrollerWheel = (e: WheelEvent) => {
      if (window.innerWidth > 1024 && !activeMember) {
        e.preventDefault();
        const delta = e.deltaY || e.deltaX;
        const lenis = (window as any).lenis;
        if (lenis) {
          lenis.scrollTo(window.scrollY + delta, { immediate: true });
        } else {
          window.scrollBy(0, delta);
        }
      }
    };

    scroller.addEventListener('wheel', handleScrollerWheel, { passive: false });
    return () => {
      scroller.removeEventListener('wheel', handleScrollerWheel);
    };
  }, [activeMember]);

  // Logic to handle continuous scrolling when hovering navigation arrows
  useEffect(() => {
    if (!hoverDirection || activeMember) return;

    const scrollTriggerInstance = ScrollTrigger.getById('teamPinTrigger');
    const lenis = (window as any).lenis;
    const scrollSpeed = hoverDirection === 'right' ? 8 : -8;
    let rAFId: number;

    const tick = () => {
      if (scrollTriggerInstance) {
        // Desktop pinned horizontal scrolling
        const totalScroll = scrollTriggerInstance.end - scrollTriggerInstance.start;
        const teamCardsRow = teamCardsRowRef.current;
        if (teamCardsRow) {
          const totalHorizontalWidth = teamCardsRow.scrollWidth - teamCardsRow.clientWidth;
          const ratio = totalScroll / (totalHorizontalWidth || 1);
          const deltaY = scrollSpeed * ratio;
          
          const targetScroll = Math.min(
            scrollTriggerInstance.end,
            Math.max(scrollTriggerInstance.start, window.scrollY + deltaY)
          );
          
          if (lenis) {
            lenis.scrollTo(targetScroll, { immediate: true });
          } else {
            window.scrollTo(0, targetScroll);
          }
        }
      } else {
        // Mobile/Tablet horizontal scroll
        const teamCardsRow = teamCardsRowRef.current;
        if (teamCardsRow) {
          teamCardsRow.scrollLeft += scrollSpeed;
        }
      }
      rAFId = requestAnimationFrame(tick);
    };

    rAFId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rAFId);
    };
  }, [hoverDirection, activeMember]);

  const handleArrowClick = (dir: 'left' | 'right') => {
    const scrollTriggerInstance = ScrollTrigger.getById('teamPinTrigger');
    
    if (scrollTriggerInstance) {
      const currentScroll = window.scrollY;
      const totalScroll = scrollTriggerInstance.end - scrollTriggerInstance.start;
      const teamCardsRow = teamCardsRowRef.current;
      if (!teamCardsRow) return;

      const totalHorizontalWidth = teamCardsRow.scrollWidth - teamCardsRow.clientWidth;
      const ratio = totalScroll / (totalHorizontalWidth || 1);
      const step = 360 * ratio;

      const targetScroll = dir === 'right'
        ? Math.min(scrollTriggerInstance.end, currentScroll + step)
        : Math.max(scrollTriggerInstance.start, currentScroll - step);

      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(targetScroll, { duration: 0.85 });
      } else {
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    } else {
      const teamCardsRow = teamCardsRowRef.current;
      if (teamCardsRow) {
        const step = 340;
        const targetScroll = dir === 'right' 
          ? teamCardsRow.scrollLeft + step 
          : teamCardsRow.scrollLeft - step;
          
        teamCardsRow.scrollTo({
          left: targetScroll,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = progressTrackRef.current;
    const scrollTriggerInstance = ScrollTrigger.getById('teamPinTrigger');
    if (!track || !scrollTriggerInstance) return;

    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;

    const targetScroll = scrollTriggerInstance.start + (scrollTriggerInstance.end - scrollTriggerInstance.start) * percentage;

    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(targetScroll, { duration: 0.85 });
    } else {
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const mm = gsap.matchMedia();

    // 1. All Viewports (Standard Reveals & Parallax)
    mm.add("all", () => {
      if (aboutSectionRef.current && aboutLeftRef.current && aboutRightRef.current) {
        const tl = gsap.timeline();
        tl.fromTo(
          '.about-hero-backdrop-text',
          { opacity: 0, x: -100 },
          { opacity: 1, x: 0, duration: 1.2, ease: 'power4.out' }
        );
        tl.fromTo(
          '.about-hero-fore-title',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.8'
        );
        tl.fromTo(
          aboutLeftRef.current.querySelectorAll('.story-body-text-new p, .story-badge-new, .story-inspiration-title, .story-red-line-decor'),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' },
          '-=0.5'
        );
        
        // Right Images reveal
        gsap.fromTo(
          '.story-offset-wrapper',
          { opacity: 0, x: 100, rotate: 3 },
          {
            opacity: 1,
            x: 0,
            rotate: 0,
            duration: 1.4,
            stagger: 0.25,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: aboutSectionRef.current,
              start: 'top 70%',
            },
          }
        );

        // Parallax scroll on the two stacked images
        gsap.to('.story-offset-wrapper.wrap-1', {
          y: -60,
          scrollTrigger: {
            trigger: aboutSectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });

        gsap.to('.story-offset-wrapper.wrap-2', {
          y: 40,
          scrollTrigger: {
            trigger: aboutSectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });

        // Studio Floor Reveal
        gsap.fromTo(
          '.floor-intro-text-block, .floor-img-frame',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.studio-floor-section',
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });

    // 2. TEAM SECTION HORIZONTAL PIN SCROLL (Only on Desktop Viewports)
    mm.add("(min-width: 1025px)", () => {
      if (teamSectionRef.current && teamCardsRowRef.current) {
        const teamSection = teamSectionRef.current;
        const teamCardsRow = teamCardsRowRef.current;

        const getScrollAmount = () => {
          const leftStickyPanelWidth = window.innerWidth * 0.35;
          return teamCardsRow.scrollWidth - (window.innerWidth - leftStickyPanelWidth);
        };

        gsap.to(teamCardsRow, {
          x: () => -getScrollAmount(),
          ease: 'none',
          scrollTrigger: {
            id: 'teamPinTrigger',
            trigger: teamSection,
            pin: true,
            scrub: 1,
            start: 'top top',
            end: () => `+=${getScrollAmount()}`,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              setScrollProgress(self.progress * 100);
            }
          },
        });

        // Team cards reveal
        gsap.fromTo(
          '.team-card-new',
          { opacity: 0, y: 80, scale: 0.92 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: teamSection,
              start: 'top 65%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });

    // Mobile/Tablet Team Card animation (standard vertical fade reveal, no pin)
    mm.add("(max-width: 1024px)", () => {
      if (teamSectionRef.current) {
        gsap.fromTo(
          '.team-card-new',
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: teamSectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });

    // Refresh ScrollTrigger to let Lenis register correct scroll heights
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);

    return () => {
      mm.revert();
      clearTimeout(timer);
    };
  }, []);

  const handleOutsideClick = () => {
    setActiveMember(null);
  };

  const handleCardClick = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    if (activeMember === name) {
      setActiveMember(null);
    } else {
      setActiveMember(name);
      
      // Auto-scroll the clicked card into the center of the screen
      const cardElement = e.currentTarget as HTMLDivElement;
      setTimeout(() => {
        const scrollTriggerInstance = ScrollTrigger.getById('teamPinTrigger');
        if (scrollTriggerInstance && cardElement) {
          const row = teamCardsRowRef.current;
          if (row) {
            const cardLeftInRow = cardElement.offsetLeft;
            const cardWidth = 540; // simplified width
            
            const stickyWidth = window.innerWidth * 0.35;
            const viewableWidth = window.innerWidth - stickyWidth;
            const desiredLeftInViewport = stickyWidth + (viewableWidth - cardWidth) / 2;
            
            const targetX = desiredLeftInViewport - cardLeftInRow - stickyWidth;
            
            const totalScroll = scrollTriggerInstance.end - scrollTriggerInstance.start;
            const totalHorizontalWidth = row.scrollWidth - viewableWidth;
            
            const scrollPercent = Math.max(0, Math.min(1, (-targetX) / (totalHorizontalWidth || 1)));
            const targetScrollY = scrollTriggerInstance.start + totalScroll * scrollPercent;
            
            const lenis = (window as any).lenis;
            if (lenis) {
              lenis.scrollTo(targetScrollY, { duration: 0.85, ease: 'power2.out' });
            } else {
              window.scrollTo({
                top: targetScrollY,
                behavior: 'smooth'
              });
            }
          }
        }
      }, 100);
    }
  };

  return (
    <div className="about-page" onClick={handleOutsideClick}>
      <ThreeBackground />

      {/* SECTION 1: ABOUT US (Consolidated with Text and Office Photos) */}
      <section ref={aboutSectionRef} className="about-section-consolidated" id="about-hero">
        
        {/* Concentric rings background pattern */}
        <div className="story-concentric-bg-radial">
          <div className="concentric-ring-circle ring-1"></div>
          <div className="concentric-ring-circle ring-2"></div>
          <div className="concentric-ring-circle ring-3"></div>
        </div>

        <div className="consolidated-grid-new">
          
          {/* Left Column: Heading, Badge, Subheadings & Story Text */}
          <div ref={aboutLeftRef} className="about-text-column-new">
            <div className="brand-accent-chevron-group">
              <span className="accent-chevron-red">&gt;&gt;</span>
              <span className="accent-badge-text">STUDIO PROFILE</span>
            </div>

            <div className="cinematic-heading-group">
              <div className="about-hero-backdrop-text">ABOUT US</div>
              <h1 className="about-hero-fore-title">ABOUT US</h1>
            </div>

            <div className="story-badge-new">THE CHRONICLE</div>
            <h2 className="story-inspiration-title">
              FINDING INSPIRATION <br />
              <span className="red-glow-span">IN EVERY TURN</span>
            </h2>
            <div className="story-red-line-decor"></div>

            <div className="story-body-text-new">
              <span className="story-decor-corner-indicator"></span>
              <p>
                "X.Alt is a visionary visual media company, deriving its name from 
                <strong> 'exalted,'</strong> symbolizing unparalleled excellence and power. 
                With an alternate interpretation suggesting it as the premier alternative 
                for subject X, X.Alt promises innovative and dynamic solutions in the 
                realm of visual media."
              </p>
              <p>
                Our studio bridges the gap between raw imagination and technical execution. 
                We craft high-end visual effects, interactive 3D assets, and immersive XR 
                experiences that do not just tell a story—they transport audiences entirely.
              </p>
            </div>
          </div>

          {/* Right Column: Stacked Premium Office Images */}
          <div ref={aboutRightRef} className="about-photos-column-new">
            <div className="story-offset-wrapper wrap-1">
              <img
                src={studioWorkspaceImg}
                alt="X.Alt Modern Creative Studio Workspace"
                className="story-parallax-img"
              />
              <div className="img-glass-overlay-new"></div>
            </div>

            <div className="story-offset-wrapper wrap-2">
              <img
                src={designArtistsImg}
                alt="X.Alt Design Artists at Workstations"
                className="story-parallax-img"
              />
              <div className="img-glass-overlay-new"></div>
            </div>
          </div>

        </div>

      </section>

      {/* SECTION 1.5: STUDIO FLOOR */}
      <section className="studio-floor-section" id="about-floor">
        
        {/* Surveillance Corner HUD Indicators */}
        <div className="surveillance-hud-overlay tl">
          <span className="rec-dot-pulse"></span>
          <span className="hud-mono-red">CAM_07 [SECURE]</span>
          <span className="hud-divider">//</span>
          <span className="hud-mono-green">FACILITY_MONITOR</span>
        </div>

        <div className="surveillance-hud-overlay tr">
          <span className="hud-mono-gray">FLOOR_PLAN: V4.01</span>
          <span className="hud-divider">//</span>
          <span className="hud-mono-red-blink">ONLINE</span>
        </div>

        <div className="studio-floor-container">
          
          <div className="floor-grid-split">
            
            {/* Left Column: Title & Text Content */}
            <div className="floor-text-column">
              <div className="floor-badge-group">
                <span className="accent-chevron-red">&gt;&gt;</span>
                <span className="accent-badge-text">PHYSICAL ARCHITECTURE</span>
              </div>

              <div className="cinematic-heading-group">
                <div className="floor-backdrop-text">FACILITY</div>
                <h2 className="floor-fore-title">STUDIO FLOOR</h2>
              </div>

              <div className="floor-intro-text-block">
                <p>
                  Spanning across two custom-designed levels, the X.Alt Studio space is architected for peak creative synergy and technological horsepower. We integrate high-speed computing pipelines with acoustic optimization to bridge the gap between imagination and execution.
                </p>
                <p>
                  From raw environment synthesis to post-production color mastering and multi-channel sound staging, our floor plan is designed to streamline workflow collaboration between digital artists and directors.
                </p>
              </div>
            </div>

            {/* Right Column: Stacked / Offset Images */}
            <div className="floor-images-column">
              <div className="floor-img-frame frame-1">
                <img src={studioFloorVfxImg} alt="VFX Synthesis Bay" className="floor-display-img" />
                <div className="floor-frame-overlay">
                  <span className="frame-label">// ZONE_01: VFX SYNTHESIS BAY</span>
                </div>
                <div className="floor-scanlines"></div>
              </div>

              <div className="floor-img-frame frame-2">
                <img src={studioFloorAudioImg} alt="Sonic Resonance Lab" className="floor-display-img" />
                <div className="floor-frame-overlay">
                  <span className="frame-label">// ZONE_02: SONIC MIXING SUITE</span>
                </div>
                <div className="floor-scanlines"></div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 2: TEAM (OUR TEAM) */}
      <section ref={teamSectionRef} className="team-section-new" id="about-team">
        
        {/* Surveillance Corner HUD Indicators */}
        <div className="surveillance-hud-overlay tl">
          <span className="rec-dot-pulse"></span>
          <span className="hud-mono-red">CAM_04 [REC]</span>
          <span className="hud-divider">//</span>
          <span className="hud-mono-green">SIGNAL_STRONG</span>
        </div>

        <div className="surveillance-hud-overlay tr">
          <span className="hud-mono-gray">SECTOR: PERSONNEL_INTEL</span>
          <span className="hud-divider">//</span>
          <span className="hud-mono-red-blink">SCANNING: ACTIVE</span>
        </div>

        <div className="team-header-split-sticky">
          <div className="team-header-container">
            
            <div className="team-badge-group">
              <span className="accent-chevron-red">&gt;&gt;</span>
              <span className="accent-badge-text">CREATIVE MINDSET</span>
            </div>

            <div className="cinematic-heading-group">
              <div className="about-team-backdrop-text">OUR TEAM</div>
              <h2 className="about-team-fore-title">OUR TEAM</h2>
            </div>

            <div className="team-subtitle-column">
              <h3 className="team-intro-heading">
                A SPACE PUSHING THE BOUNDARIES <br />
                <span className="cta-highlight">OF VISUAL STORYTELLING.</span>
              </h3>
              <p className="team-intro-desc">
                We believe in the power of visuals to transport audiences and ignite emotions. 
                <strong> Click on any card below to decrypt and reveal personnel dossiers.</strong>
              </p>
            </div>

            {/* Interactive Scroll Nav Arrows */}
            <div className="team-navigation-arrows">
              <button 
                className="team-nav-arrow-btn prev-btn" 
                onClick={() => handleArrowClick('left')}
                onMouseEnter={() => setHoverDirection('left')}
                onMouseLeave={() => setHoverDirection(null)}
                aria-label="Scroll team left"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              
              <button 
                className="team-nav-arrow-btn next-btn" 
                onClick={() => handleArrowClick('right')}
                onMouseEnter={() => setHoverDirection('right')}
                onMouseLeave={() => setHoverDirection(null)}
                aria-label="Scroll team right"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>

          </div>
        </div>

        <div ref={scrollerWrapperRef} className="team-horizontal-scroller">
          <div 
            ref={teamCardsRowRef} 
            className={`team-cards-row-new ${activeMember ? 'has-active-card' : ''}`}
          >
            {teamMembers.map((member, index) => (
              <TeamCard 
                key={index} 
                index={index}
                member={member} 
                isClicked={activeMember === member.name}
                onCardClick={(e) => handleCardClick(e, member.name)}
              />
            ))}
          </div>
        </div>

        {/* Custom Progress Slider Bar */}
        <div className="team-progress-slider-container">
          <div className="team-progress-track" ref={progressTrackRef} onClick={handleTrackClick}>
            <div 
              className="team-progress-bar" 
              style={{ width: `${scrollProgress}%` }}
            ></div>
          </div>
          <div className="team-progress-labels">
            <span className="telemetry-label">SYSTEM_INDEX</span>
            <span className="telemetry-val">{Math.min(6, Math.max(1, Math.round(scrollProgress / 16.6) + 1))} // 06</span>
          </div>
        </div>

      </section>
    </div>
  );
};

export default AboutPage;
