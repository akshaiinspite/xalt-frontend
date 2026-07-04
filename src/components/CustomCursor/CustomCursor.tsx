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
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      const target = e.target as HTMLElement;
      if (!target) return;

      let pointerFound = false;
      let wideFound = false;
      let hoverLabel = '>> ACCESS';

      // Check if hovering inside a wide interactive card first
      const wideContainer = target.closest('.service-card, .team-card-new, .board-subcard, .gallery-sharp-slot');
      if (wideContainer) {
        pointerFound = true;
        wideFound = true;
        if (
          wideContainer.classList.contains('service-card') || 
          wideContainer.classList.contains('board-subcard') ||
          wideContainer.classList.contains('gallery-sharp-slot')
        ) {
          hoverLabel = '>> CLICK TO OPEN';
        } else {
          hoverLabel = '>> CLICK TO OPEN';
        }
      } else {
        // Standard walk up for other interactive elements
        let el: HTMLElement | null = target;
        while (el) {
          const tag = el.tagName.toLowerCase();
          const style = window.getComputedStyle(el);
          
          if (
            style.cursor === 'pointer' ||
            tag === 'a' ||
            tag === 'button' ||
            el.classList.contains('team-nav-arrow-btn') ||
            el.classList.contains('form-submit-btn') ||
            el.classList.contains('nav-link') ||
            el.classList.contains('hamburger-btn')
          ) {
            pointerFound = true;
            if (el.classList.contains('nav-link') || tag === 'a') {
              hoverLabel = '>> NAVIGATE';
            } else if (el.classList.contains('form-submit-btn')) {
              hoverLabel = '>> TRANSMIT';
            } else if (el.classList.contains('inline-video-wrapper') || el.classList.contains('play-btn')) {
              hoverLabel = '>> PLAY REEL';
            } else {
              hoverLabel = '>> ACCESS';
            }
            break;
          }
          el = el.parentElement;
        }
      }

      isHoveringPointer = pointerFound;
      isHoveringWide = wideFound;

      if (!pointerFound) {
        const tag = target.tagName.toLowerCase();
        const textTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'li', 'label', 'textarea', 'input'];
        isHoveringText = textTags.includes(tag) || target.closest('p') !== null;
      } else {
        isHoveringText = false;
      }

      // Prepare coordinate template
      if (isHoveringPointer) {
        currentLabelText = hoverLabel;
      } else if (isHoveringText) {
        currentLabelText = 'TXT_SELECT';
      } else {
        currentLabelText = `X: ${Math.round(targetX)} Y: ${Math.round(targetY)}`;
      }
    };

    const animate = () => {
      // 0.35 easing factor matches the snappy tracking on Killian Herzer's site
      currentX += (targetX - currentX) * 0.35;
      currentY += (targetY - currentY) * 0.35;

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      if (dotRef.current) {
        if (isHoveringWide) {
          dotRef.current.className = 'custom-cursor-dot wide pointer';
        } else if (isHoveringPointer) {
          dotRef.current.className = 'custom-cursor-dot pointer';
        } else if (isHoveringText) {
          dotRef.current.className = 'custom-cursor-dot text';
        } else {
          dotRef.current.className = 'custom-cursor-dot';
        }
      }

      if (labelRef.current) {
        labelRef.current.textContent = currentLabelText;
        if (isHoveringWide) {
          labelRef.current.className = 'custom-cursor-label wide pointer';
        } else if (isHoveringPointer) {
          labelRef.current.className = 'custom-cursor-label pointer';
        } else if (isHoveringText) {
          labelRef.current.className = 'custom-cursor-label text';
        } else {
          labelRef.current.className = 'custom-cursor-label';
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

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
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
