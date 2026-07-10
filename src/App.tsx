import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Classic Components
import BrandVideoSection from './components/BrandVideoSection/BrandVideoSection';
import OurStory from './components/OurStory/OurStory';
import ServicesGrid from './components/ServicesGrid/ServicesGrid';
import Showreel from './components/Showreel/Showreel';
import Header from './components/Header/Header';
import CTASection from './components/CTASection/CTASection';
import Footer from './components/Footer/Footer';
import AboutPage from './components/AboutPage/AboutPage';
import CustomCursor from './components/CustomCursor/CustomCursor';
import ContactPage from './components/ContactPage/ContactPage';
import ProjectsPage from './components/ProjectsPage/ProjectsPage';
import CareersPage from './components/CareersPage/CareersPage';
import Loader from './components/Loader/Loader';
import AdminPage from './components/AdminPage/AdminPage';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'about' | 'projects' | 'contact' | 'careers' | 'admin'>('home');
  const [isLoaderFinished, setIsLoaderFinished] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      // Check pathname redirect first
      if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')) {
        window.history.replaceState(null, '', '/');
        window.location.hash = '#admin';
        return;
      }

      if (window.location.hash === '#about') {
        setCurrentTab('about');
      } else if (window.location.hash.startsWith('#projects')) {
        setCurrentTab('projects');
      } else if (window.location.hash.startsWith('#contact')) {
        setCurrentTab('contact');
      } else if (window.location.hash.startsWith('#careers')) {
        setCurrentTab('careers');
      } else if (window.location.hash.startsWith('#admin')) {
        setCurrentTab('admin');
      } else {
        setCurrentTab('home');
      }
    };

    // Check initial hash
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Initialize Lenis and Sync with GSAP Ticker
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false, // Turn off autoRaf to sync with GSAP Ticker
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential scroll ease
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    // Expose lenis instance globally for navigation links
    (window as any).lenis = lenis;

    // Reset scroll position to top immediately on transition
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });

    // Update ScrollTrigger on Lenis Scroll
    lenis.on('scroll', ScrollTrigger.update);

    // Synchronize Lenis frames with GSAP ticker loop
    const updateRaf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateRaf);
    gsap.ticker.lagSmoothing(0);

    // Refresh layout and reset scroll coordinates after transition/render delay
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });
      lenis.resize();
      ScrollTrigger.refresh();
    }, 50);

    return () => {
      lenis.destroy();
      (window as any).lenis = null;
      gsap.ticker.remove(updateRaf);
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

      {/* Conditional Rendering of Pages */}
      {currentTab === 'about' && <AboutPage />}
      {currentTab === 'projects' && <ProjectsPage />}
      {currentTab === 'contact' && <ContactPage />}
      {currentTab === 'careers' && <CareersPage />}
      {currentTab === 'admin' && <AdminPage />}
      {currentTab === 'home' && (
        <>
          {/* Brand Video Section (spafax-style reference video) */}
          <BrandVideoSection />

          {/* Showreel */}
          <Showreel />

          {/* Our Story Section */}
          <OurStory />

          {/* Services Grid Section */}
          <ServicesGrid />

          {/* CTA Section */}
          <CTASection />
        </>
      )}

      {/* Footer */}
      {currentTab !== 'admin' && <Footer />}
      <ToastContainer theme="dark" position="bottom-right" autoClose={3000} />
    </>
  );
}

export default App;
