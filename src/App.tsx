import { useEffect, useState, Suspense } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Always-visible lightweight components (eagerly loaded)
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import CustomCursor from './components/CustomCursor/CustomCursor';
import Loader from './components/Loader/Loader';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Page & Section Components (Eagerly loaded for complete build bundle)
import AboutPage from './components/AboutPage/AboutPage';
import ProjectsPage from './components/ProjectsPage/ProjectsPage';
import ContactPage from './components/ContactPage/ContactPage';
import CareersPage from './components/CareersPage/CareersPage';
import AdminPage from './components/AdminPage/AdminPage';

import BrandVideoSection from './components/BrandVideoSection/BrandVideoSection';
import Showreel from './components/Showreel/Showreel';
import OurStory from './components/OurStory/OurStory';
import ServicesGrid from './components/ServicesGrid/ServicesGrid';
import CTASection from './components/CTASection/CTASection';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'about' | 'projects' | 'contact' | 'careers' | 'admin'>(() => {
    if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')) {
      return 'admin';
    }
    const hash = window.location.hash;
    if (hash === '#about') return 'about';
    if (hash.startsWith('#projects')) return 'projects';
    if (hash.startsWith('#contact')) return 'contact';
    if (hash.startsWith('#careers')) return 'careers';
    if (hash.startsWith('#admin')) return 'admin';
    return 'home';
  });

  const [isLoaderFinished, setIsLoaderFinished] = useState(() => {
    const isAdmin = window.location.pathname === '/admin' || 
                    window.location.pathname.startsWith('/admin/') || 
                    window.location.hash.startsWith('#admin');
    return isAdmin;
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')) {
        window.history.replaceState(null, '', '/');
        window.location.hash = '#admin';
        return;
      }

      const hash = window.location.hash;
      if (hash === '#about') {
        setCurrentTab('about');
      } else if (hash.startsWith('#projects')) {
        setCurrentTab('projects');
      } else if (hash.startsWith('#contact')) {
        setCurrentTab('contact');
      } else if (hash.startsWith('#careers')) {
        setCurrentTab('careers');
      } else if (hash.startsWith('#admin')) {
        setCurrentTab('admin');
        setIsLoaderFinished(true);
      } else {
        setCurrentTab('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Initialize Lenis with native RAF for zero physics delta jumps
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    (window as any).lenis = lenis;

    // Reset scroll offset
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });

    // Synchronize Lenis with native browser requestAnimationFrame loop
    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Sync GSAP ScrollTrigger updates
    const handleLenisScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on('scroll', handleLenisScroll);

    // Refresh layout and reset scroll coordinates after transition
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });
      lenis.resize();
      ScrollTrigger.refresh();
    }, 120);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off('scroll', handleLenisScroll);
      lenis.destroy();
      (window as any).lenis = null;
      clearTimeout(timer);
    };
  }, [currentTab]);

  return (
    <>
      {/* Custom interactive red hover halo cursor */}
      {currentTab !== 'admin' && <CustomCursor />}

      {/* Intro system loader preloader */}
      {!isLoaderFinished && <Loader onFinish={() => setIsLoaderFinished(true)} />}

      {/* Navigation Header */}
      {currentTab !== 'admin' && <Header />}

      {/* Suspense boundary for all lazy-loaded pages and sections */}
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}>
        {/* Conditional Rendering of Pages */}
        {currentTab === 'about' && <AboutPage />}
        {currentTab === 'projects' && <ProjectsPage />}
        {currentTab === 'contact' && <ContactPage />}
        {currentTab === 'careers' && <CareersPage />}
        {currentTab === 'admin' && <AdminPage />}
        {currentTab === 'home' && (
          <>
            <BrandVideoSection />
            <Showreel />
            <OurStory />
            <ServicesGrid />
            <CTASection />
          </>
        )}
      </Suspense>

      {/* Footer */}
      {currentTab !== 'admin' && <Footer />}
      <ToastContainer theme="dark" position="bottom-right" autoClose={3000} />
    </>
  );
}

export default App;
