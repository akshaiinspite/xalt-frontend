import { useEffect, useState, lazy, Suspense } from 'react';
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

// ─── Lazy-loaded page components (code-split into separate chunks) ───
const AboutPage = lazy(() => import('./components/AboutPage/AboutPage'));
const ProjectsPage = lazy(() => import('./components/ProjectsPage/ProjectsPage'));
const ContactPage = lazy(() => import('./components/ContactPage/ContactPage'));
const CareersPage = lazy(() => import('./components/CareersPage/CareersPage'));
const AdminPage = lazy(() => import('./components/AdminPage/AdminPage'));

// ─── Lazy-loaded heavy home sections ─────────────────────────────────
const BrandVideoSection = lazy(() => import('./components/BrandVideoSection/BrandVideoSection'));
const Showreel = lazy(() => import('./components/Showreel/Showreel'));
const OurStory = lazy(() => import('./components/OurStory/OurStory'));
const ServicesGrid = lazy(() => import('./components/ServicesGrid/ServicesGrid'));
const CTASection = lazy(() => import('./components/CTASection/CTASection'));

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
        setIsLoaderFinished(true);
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
      </Suspense>

      {/* Footer */}
      {currentTab !== 'admin' && <Footer />}
      <ToastContainer theme="dark" position="bottom-right" autoClose={3000} />
    </>
  );
}

export default App;
