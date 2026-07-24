import { useEffect, useRef } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let isHoveringPointer = false;
    let isHoveringText = false;
    let isHoveringWide = false;
    let currentLabelText = '';
    
    let lastDotClass = '';
    let lastLabelClass = '';
    let lastLabelText = '';
    let animId: number;

    const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, .team-nav-arrow-btn, .form-submit-btn, .nav-link, .hamburger-btn, .inline-video-wrapper, .play-btn';
    const WIDE_SELECTOR = '.service-card, .team-card-new, .board-subcard, .gallery-sharp-slot';

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      const target = e.target as HTMLElement;
      if (!target) return;

      let pointerFound = false;
      let wideFound = false;
      let hoverLabel = '>> ACCESS';

      // 1. Check wide container match first (zero reflow, fast DOM check)
      const wideContainer = target.closest(WIDE_SELECTOR) as HTMLElement | null;
      if (wideContainer) {
        pointerFound = true;
        wideFound = true;
        hoverLabel = '>> CLICK TO OPEN';
      } else {
        // 2. Check general interactive elements match
        const interactiveEl = target.closest(INTERACTIVE_SELECTOR) as HTMLElement | null;
        if (interactiveEl) {
          pointerFound = true;
          if (interactiveEl.classList.contains('nav-link') || interactiveEl.tagName === 'A') {
            hoverLabel = '>> NAVIGATE';
          } else if (interactiveEl.classList.contains('form-submit-btn')) {
            hoverLabel = '>> TRANSMIT';
          } else if (interactiveEl.classList.contains('inline-video-wrapper') || interactiveEl.classList.contains('play-btn')) {
            hoverLabel = '>> PLAY REEL';
          } else {
            hoverLabel = '>> ACCESS';
          }
        }
      }

      isHoveringPointer = pointerFound;
      isHoveringWide = wideFound;

      if (!pointerFound) {
        const tag = target.tagName;
        const textTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'LI', 'LABEL'];
        isHoveringText = textTags.includes(tag) || target.closest('p') !== null;
      } else {
        isHoveringText = false;
      }

      if (isHoveringPointer) {
        currentLabelText = hoverLabel;
      } else if (isHoveringText) {
        currentLabelText = 'TXT_SELECT';
      } else {
        currentLabelText = 'X.ALT_STUDIO';
      }
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.35;
      currentY += (targetY - currentY) * 0.35;

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      // Calculate target class names
      let targetDotClass = 'custom-cursor-dot';
      let targetLabelClass = 'custom-cursor-label';

      if (isHoveringWide) {
        targetDotClass = 'custom-cursor-dot wide pointer';
        targetLabelClass = 'custom-cursor-label wide pointer';
      } else if (isHoveringPointer) {
        targetDotClass = 'custom-cursor-dot pointer';
        targetLabelClass = 'custom-cursor-label pointer';
      } else if (isHoveringText) {
        targetDotClass = 'custom-cursor-dot text';
        targetLabelClass = 'custom-cursor-label text';
      }

      // DOM updates ONLY when value changes (prevents 60/120fps DOM invalidation)
      if (dotRef.current && lastDotClass !== targetDotClass) {
        dotRef.current.className = targetDotClass;
        lastDotClass = targetDotClass;
      }

      if (labelRef.current) {
        if (lastLabelClass !== targetLabelClass) {
          labelRef.current.className = targetLabelClass;
          lastLabelClass = targetLabelClass;
        }
        if (lastLabelText !== currentLabelText) {
          labelRef.current.textContent = currentLabelText;
          lastLabelText = currentLabelText;
        }
      }

      animId = requestAnimationFrame(animate);
    };

    const handleMouseDown = () => {
      if (dotRef.current) dotRef.current.classList.add('clicking');
    };

    const handleMouseUp = () => {
      if (dotRef.current) dotRef.current.classList.remove('clicking');
    };

    const handleMouseLeave = () => {
      if (containerRef.current) containerRef.current.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      if (containerRef.current) containerRef.current.style.opacity = '1';
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div ref={containerRef} className="custom-cursor-container">
      <div ref={dotRef} className="custom-cursor-dot" />
      <div ref={labelRef} className="custom-cursor-label" />
    </div>
  );
};

export default CustomCursor;
