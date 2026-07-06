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
  
  const formRef = useRef<HTMLDivElement>(null);
  const emailFormRef = useRef<HTMLFormElement>(null);

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
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }

    setIsSubmitting(true);

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'your_service_id';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CONTACT || 'your_contact_template_id';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key';

    emailjs.sendForm(serviceId, templateId, emailFormRef.current!, publicKey)
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
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 5000);
      });
  };

  return (
    <div className="contact-page">
      <ContactThreeBackground />

      <div className="contact-content-wrapper">
        <div className="contact-header-section">
          <div className="brand-accent-chevron-group">
            <span className="accent-chevron-red">&gt;&gt;</span>
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
                  <p className="info-card-meta">Mon - Sat // 09:00 - 18:00 IST</p>
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
                    <span>Please fill in all required fields.</span>
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
                  <span className="submit-btn-arrow">&gt;&gt;</span>
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
