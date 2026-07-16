import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import emailjs from '@emailjs/browser';
import './ContactPage.css';

// ----------------------------------------------------
// SPECIALIZED WEBGL THREE.JS PLEXUS BACKGROUND (MINIMAL & PROFESSIONAL)
// ----------------------------------------------------
const ContactThreeBackground = () => {
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
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Subtle drifting dust/particles (minimal white/silver stars style)
    const particleCount = 60;
    const positions = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Slow drift velocity
      velocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: (Math.random() - 0.5) * 0.003,
        z: (Math.random() - 0.5) * 0.003,
      });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.035,
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Mouse movement parallax camera movement
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth parallax camera easing
      targetX += (mouseX - targetX) * 0.03;
      targetY += (mouseY - targetY) * 0.03;

      camera.position.x = targetX * 1.5;
      camera.position.y = targetY * 1.5;
      camera.lookAt(scene.position);

      // Slow drift particles
      const posArray = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += velocities[i].x;
        posArray[i * 3 + 1] += velocities[i].y;
        posArray[i * 3 + 2] += velocities[i].z;

        // Bounce off boundaries
        if (Math.abs(posArray[i * 3]) > 6) velocities[i].x *= -1;
        if (Math.abs(posArray[i * 3 + 1]) > 6) velocities[i].y *= -1;
        if (Math.abs(posArray[i * 3 + 2]) > 6) velocities[i].z *= -1;
      }
      geometry.attributes.position.needsUpdate = true;

      // Gentle spin
      particleSystem.rotation.y = elapsed * 0.005;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="contact-three-canvas" />;
};

// ----------------------------------------------------
// CONTACT PAGE COMPONENT
// ----------------------------------------------------
const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    message: '',
  });

  const [activeField, setActiveField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const formRef = useRef<HTMLDivElement>(null);
  const emailFormRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.location.hash.includes('focus=true')) {
      const timer = setTimeout(() => {
        const input = nameInputRef.current || document.querySelector('input[name="name"]') as HTMLInputElement;
        if (input) {
          input.focus({ preventScroll: true });
          
          const lenisInstance = (window as any).lenis;
          if (lenisInstance && formRef.current) {
            lenisInstance.scrollTo(formRef.current, { 
              offset: -100, 
              duration: 1.5,
              immediate: false
            });
          } else {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 600);

      window.history.replaceState(null, '', '#contact');
      return () => clearTimeout(timer);
    }
  }, []);

  // Subtle 3D Card Tilt Mouse Tracker
  const handleFormMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!formRef.current) return;
    const rect = formRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const normX = x / (rect.width / 2);
    const normY = y / (rect.height / 2);

    formRef.current.style.transform = `perspective(1200px) rotateY(${normX * 3}deg) rotateX(${-normY * 3}deg) translateZ(5px)`;
  };

  const handleFormMouseLeave = () => {
    if (!formRef.current) return;
    formRef.current.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg) translateZ(0deg)';
  };

  const handleFocus = (fieldName: string) => {
    setActiveField(fieldName);
  };

  const handleBlur = () => {
    setActiveField(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus('error');
      setErrorMessage('Please fill in all required fields.');
      setTimeout(() => {
        setSubmitStatus('idle');
        setErrorMessage(null);
      }, 3000);
      return;
    }

    setIsSubmitting(true);

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'your_service_id';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CONTACT || 'your_contact_template_id';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key';

    emailjs.sendForm(serviceId, templateId, emailFormRef.current!, { publicKey })
      .then(() => {
        setIsSubmitting(false);
        setSubmitStatus('success');
        setFormData({ name: '', contactNumber: '', email: '', message: '' });
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 5000);
      })
      .catch((err) => {
        console.error('EmailJS Error:', err);
        setIsSubmitting(false);
        setSubmitStatus('error');
        setErrorMessage(err?.text || err?.message || 'An error occurred while sending the email.');
        setTimeout(() => {
          setSubmitStatus('idle');
          setErrorMessage(null);
        }, 5000);
      });
  };

  return (
    <div className="contact-page">
      <ContactThreeBackground />

      <div className="contact-content-wrapper">
        <div className="contact-header-section">
          <div className="brand-accent-chevron-group">
            <span className="accent-badge-text">CONNECT WITH X.ALT</span>
          </div>

          <div className="contact-heading-group">
            <div className="contact-backdrop-text">GET IN TOUCH</div>
            <h1 className="contact-fore-title">GET IN TOUCH</h1>
          </div>
        </div>

        <div className="contact-grid">
          
          {/* Left Column: Coordinates & Information details */}
          <div className="contact-info-panel">
            <p className="contact-subtitle-text">
              Have a visionary project in mind or want to collaborate? Contact our studio to share your creative vision.
            </p>

            <div className="contact-info-cards">
              
              {/* Address Card */}
              <div className="info-card-item">
                <div className="info-card-header">
                  <span className="info-card-idx">[01]</span>
                  <span className="info-card-label">HEADQUARTERS LOCATION</span>
                </div>
                <div className="info-card-body">
                  <h4 className="info-card-title">X Alt Studios Pvt. Ltd</h4>
                  <p className="info-card-details">
                    2nd floor, Door no: 14/378 C, C1 A&A Arcade,<br />
                    Metro Nagar, Maradu, Kochi,<br />
                    Kerala 682304
                  </p>
                </div>
              </div>

              {/* Telephone Card */}
              <div className="info-card-item">
                <div className="info-card-header">
                  <span className="info-card-idx">[02]</span>
                  <span className="info-card-label">TELECOMMUNICATION</span>
                </div>
                <div className="info-card-body">
                  <a href="tel:+919633322321" className="info-card-link">
                    +91 96333 22321
                  </a>
                  <p className="info-card-meta">Mon - Sat | 09:00 - 18:00 IST</p>
                </div>
              </div>

              {/* Email Card */}
              <div className="info-card-item">
                <div className="info-card-header">
                  <span className="info-card-idx">[03]</span>
                  <span className="info-card-label">EMAIL INQUIRIES</span>
                </div>
                <div className="info-card-body">
                  <a href="mailto:infos@xaltstudios.com" className="info-card-link">
                    infos@xaltstudios.com
                  </a>
                  <p className="info-card-meta">Direct Inquiries & Briefings</p>
                </div>
              </div>

              {/* Social Media Card */}
              <div className="info-card-item">
                <div className="info-card-header">
                  <span className="info-card-idx">[04]</span>
                  <span className="info-card-label">DIGITAL SPACES</span>
                </div>
                <div className="info-card-body">
                  <div className="contact-social-icons">
                    <a href="https://www.instagram.com/xaltstudios/?hl=en" target="_blank" rel="noopener noreferrer" className="contact-social-link" aria-label="Instagram">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#E4405F">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                      </svg>
                    </a>
                    <a href="https://www.behance.net/XAltStudio" target="_blank" rel="noopener noreferrer" className="contact-social-link" aria-label="Behance">
                      <svg width="20" height="20" viewBox="0 0 16 16" fill="#0057ff">
                        <path d="M4.654 3c.461 0 .887.035 1.278.14.39.07.711.216.996.391s.497.426.641.747c.14.32.216.711.216 1.137 0 .496-.106.922-.356 1.242-.215.32-.566.606-.997.817.606.176 1.067.496 1.348.922s.461.957.461 1.563c0 .496-.105.922-.285 1.278a2.3 2.3 0 0 1-.782.887c-.32.215-.711.39-1.137.496a5.3 5.3 0 0 1-1.278.176L0 12.803V3zm-.285 3.978c.39 0 .71-.105.957-.285.246-.18.355-.497.355-.887 0-.216-.035-.426-.105-.567a1 1 0 0 0-.32-.355 1.8 1.8 0 0 0-.461-.176c-.176-.035-.356-.035-.567-.035H2.17v2.31c0-.005 2.2-.005 2.2-.005zm.105 4.193c.215 0 .426-.035.606-.07.176-.035.356-.106.496-.216s.25-.215.356-.39c.07-.176.14-.391.14-.641 0-.496-.14-.852-.426-1.102-.285-.215-.676-.32-1.137-.32H2.17v2.734h2.305zm6.858-.035q.428.427 1.278.426c.39 0 .746-.106 1.032-.286q.426-.32.53-.64h1.74c-.286.851-.712 1.457-1.278 1.848-.566.355-1.243.566-2.06.566a4.1 4.1 0 0 1-1.527-.285 2.8 2.8 0 0 1-1.137-.782 2.85 2.85 0 0 1-.712-1.172c-.175-.461-.25-.957-.25-1.528 0-.531.07-1.032.25-1.493.18-.46.426-.852.747-1.207.32-.32.711-.606 1.137-.782a4 4 0 0 1 1.493-.285c.606 0 1.137.105 1.598.355.46.25.817.532 1.102.958.285.39.496.851.641 1.348.07.496.105.996.07 1.563h-5.15c0 .58.21 1.11.496 1.396m2.24-3.732c-.25-.25-.642-.391-1.103-.391-.32 0-.566.07-.781.176s-.356.25-.496.39a.96.96 0 0 0-.25.497c-.036.175-.07.32-.07.46h3.196c-.07-.526-.25-.882-.497-1.132zm-3.127-3.728h3.978v.957h-3.978z"/>
                      </svg>
                    </a>
                    <a href="https://in.linkedin.com/company/x-alt-studios" target="_blank" rel="noopener noreferrer" className="contact-social-link" aria-label="LinkedIn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#0077B5">
                        <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9H7.12v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zm15.11 13.02h-3.56v-5.6c0-1.34-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.7h-3.56V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/>
                      </svg>
                    </a>
                  </div>
                  <p className="info-card-meta">Follow Us & Check Our Works</p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Sleek Contact Form */}
          <div className="contact-form-panel">
            <div 
              ref={formRef}
              className="cyber-form-wrapper"
              onMouseMove={handleFormMouseMove}
              onMouseLeave={handleFormMouseLeave}
            >
              
              <div className="form-header-bar">
                <span className="form-header-status">SEND A MESSAGE</span>
                <span className="form-header-line"></span>
              </div>

              <form ref={emailFormRef} onSubmit={handleSubmit} className="cyber-form">
                
                {/* Name Input */}
                <div className={`form-group ${activeField === 'name' ? 'focused' : ''} ${formData.name ? 'has-value' : ''}`}>
                  <label className="form-label">
                    <span className="label-index">01.</span> FULL NAME <span className="req">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => handleFocus('name')}
                    onBlur={handleBlur}
                    placeholder="Enter your name"
                    className="form-input"
                    required
                  />
                </div>

                {/* Email Input */}
                <div className={`form-group ${activeField === 'email' ? 'focused' : ''} ${formData.email ? 'has-value' : ''}`}>
                  <label className="form-label">
                    <span className="label-index">02.</span> EMAIL ADDRESS <span className="req">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                    placeholder="name@company.com"
                    className="form-input"
                    required
                  />
                </div>

                {/* Contact Number Input */}
                <div className={`form-group ${activeField === 'contactNumber' ? 'focused' : ''} ${formData.contactNumber ? 'has-value' : ''}`}>
                  <label className="form-label">
                    <span className="label-index">03.</span> CONTACT NUMBER
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    onFocus={() => handleFocus('contactNumber')}
                    onBlur={handleBlur}
                    placeholder="+91 XXXXX XXXXX"
                    className="form-input"
                  />
                </div>

                {/* Message Textarea */}
                <div className={`form-group ${activeField === 'message' ? 'focused' : ''} ${formData.message ? 'has-value' : ''}`}>
                  <label className="form-label">
                    <span className="label-index">04.</span> MESSAGE <span className="req">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => handleFocus('message')}
                    onBlur={handleBlur}
                    placeholder="Describe your creative vision..."
                    className="form-input form-textarea"
                    rows={4}
                    required
                  />
                </div>

                {/* Submit Feedback Bar */}
                {submitStatus === 'success' && (
                  <div className="submit-message success">
                    <span>Thank you. Your message has been sent successfully. We will get in touch with you shortly.</span>
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="submit-message error">
                    <span>{errorMessage || 'Please fill in all required fields.'}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`form-submit-btn ${isSubmitting ? 'submitting' : ''}`}
                >
                  <span className="submit-btn-text">
                    {isSubmitting ? 'SENDING MESSAGE...' : 'SEND MESSAGE'}
                  </span>
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
