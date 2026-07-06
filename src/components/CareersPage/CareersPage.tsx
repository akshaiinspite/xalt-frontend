import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import emailjs from '@emailjs/browser';
import './CareersPage.css';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../config';

// ----------------------------------------------------
// THREE.JS PLEXUS BACKGROUND FOR CAREERS
// ----------------------------------------------------
const CareersThreeBackground = () => {
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

    const particleCount = 70;
    const positions = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

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
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

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

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      targetX += (mouseX - targetX) * 0.03;
      targetY += (mouseY - targetY) * 0.03;

      camera.position.x = targetX * 1.5;
      camera.position.y = targetY * 1.5;
      camera.lookAt(scene.position);

      const posArray = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += velocities[i].x;
        posArray[i * 3 + 1] += velocities[i].y;
        posArray[i * 3 + 2] += velocities[i].z;

        if (Math.abs(posArray[i * 3]) > 6) velocities[i].x *= -1;
        if (Math.abs(posArray[i * 3 + 1]) > 6) velocities[i].y *= -1;
        if (Math.abs(posArray[i * 3 + 2]) > 6) velocities[i].z *= -1;
      }
      geometry.attributes.position.needsUpdate = true;
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

  return <div ref={containerRef} className="careers-three-canvas" />;
};

// ----------------------------------------------------
// DUMMY VACANCY DETAILS
// ----------------------------------------------------
interface Job {
  id: string;
  title: string;
  experience: string;
  location: string;
  description: string;
}

const DUMMY_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Lead 3D CGI Artist',
    experience: '5+ Years',
    location: 'Kochi Studio / Hybrid',
    description: 'Expertise in Blender/Cinema4D, photorealistic lighting, octane/redshift rendering, and liquid simulations to lead our Kochi CGI division. Ability to lead visual design concepts from script to screen.',
  },
  {
    id: 'job-2',
    title: 'Senior Creative Developer',
    experience: '4+ Years',
    location: 'Remote / Kochi',
    description: 'Join our engineering team to build premium interactive portfolios and web experiences. Strong proficiency in React, Three.js, GSAP/Framer Motion, and WebGL shaders is required.',
  },
  {
    id: 'job-3',
    title: 'Motion Designer & Compositor',
    experience: '3+ Years',
    location: 'Kochi Studio',
    description: 'Advanced compositing and motion graphics artist wanted. High proficiency in After Effects, Premiere Pro, and VFX compositing to craft cinematic animations, dynamic cuts, and audio-reactive showreels.',
  },
];

// ----------------------------------------------------
// CAREERS PAGE COMPONENT
// ----------------------------------------------------
const CareersPage = () => {
  const [jobs, setJobs] = useState<Job[]>(DUMMY_JOBS);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/jobs`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data.map((j: any) => ({
            id: j._id || j.id,
            title: j.title,
            experience: j.experience,
            location: j.location,
            description: j.description
          }));
          setJobs(mapped);
        }
      })
      .catch(err => {
        console.warn('Backend offline or error fetching jobs, using local dummy jobs.', err);
      });
  }, []);
  
  // --- Form State ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
  });
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [careersFile, setCareersFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emailFormRef = useRef<HTMLFormElement>(null);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

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

  const handleFocus = (fieldName: string) => setActiveField(fieldName);
  const handleBlur = () => setActiveField(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // --- CV Upload Progress Simulation ---
  const simulateFileUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds the 10MB limit.');
        return;
      }
      setCareersFile(selectedFile);
      simulateFileUpload();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      const validExtensions = ['.pdf', '.csv', '.doc', '.docx', '.txt'];
      const fileExt = droppedFile.name.substring(droppedFile.name.lastIndexOf('.')).toLowerCase();
      if (!validExtensions.includes(fileExt)) {
        toast.error('Unsupported file type. Please upload PDF, CSV, DOC, DOCX or TXT files.');
        return;
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds the 10MB limit.');
        return;
      }
      setCareersFile(droppedFile);

      // Programmatically assign the dropped file to the file input DOM element
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
      }

      simulateFileUpload();
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCareersFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.contactNumber || !careersFile) {
      setSubmitStatus('error');
      setErrorMessage('Please complete all fields and attach CV before transmitting.');
      setTimeout(() => {
        setSubmitStatus('idle');
        setErrorMessage(null);
      }, 3000);
      return;
    }

    setIsSubmitting(true);

    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('email', formData.email);
    submissionData.append('contactNumber', formData.contactNumber);
    submissionData.append('job_title', selectedJob?.title || 'General Application');
    submissionData.append('resume', careersFile);

    fetch(`${API_BASE_URL}/contact/careers`, {
      method: 'POST',
      body: submissionData,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Server error occurred.');
        }
        setIsSubmitting(false);
        setSubmitStatus('success');
        setFormData({ name: '', email: '', contactNumber: '' });
        setCareersFile(null);
        setTimeout(() => {
          setSubmitStatus('idle');
          closeModal();
        }, 3000);
      })
      .catch((err) => {
        console.error('Careers submission error:', err);
        setIsSubmitting(false);
        setSubmitStatus('error');
        setErrorMessage(err.message || 'An error occurred while sending the email.');
        setTimeout(() => {
          setSubmitStatus('idle');
          setErrorMessage(null);
        }, 5000);
      });
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    // Lock body scroll while modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    setFormData({ name: '', email: '', contactNumber: '' });
    setCareersFile(null);
    setSubmitStatus('idle');
    // Unlock body scroll
    document.body.style.overflow = '';
  };

  return (
    <div className="careers-page">
      <CareersThreeBackground />

      <div className="careers-content-wrapper">
        
        {/* Careers Header */}
        <div className="careers-header-section">
          <div className="brand-accent-chevron-group">
            <span className="accent-chevron-red">&gt;&gt;</span>
            <span className="accent-badge-text">JOIN X.ALT CREATIVE CO.</span>
          </div>

          <div className="careers-heading-group">
            <div className="careers-backdrop-text">CAREERS</div>
            <h1 className="careers-fore-title">CAREERS</h1>
          </div>
        </div>

        {/* Full-width Grid of Vacancies */}
        <div className="careers-full-panel">
          <p className="careers-subtitle-text">
            We are constantly seeking digital architects, boundary-pushing CGI artists, and innovative developers to join our elite studio. Select an active vacancy below to initialize your application.
          </p>

          <div className="careers-jobs-grid">
            {jobs.length === 0 ? (
              <div className="careers-empty-state" style={{ gridColumn: 'span 3', padding: '60px 40px', border: '1.5px dashed rgba(255, 255, 255, 0.06)', textAlign: 'center', fontFamily: "'Share Tech Mono', monospace", color: 'rgba(255, 255, 255, 0.35)', fontSize: '0.85rem', letterSpacing: '0.08em' }}>
                // NO ACTIVE VACANCIES AT THIS MOMENT. STANDBY FOR TRANSMISSION SOURCE.
              </div>
            ) : (
              jobs.map((job, idx) => (
                <div 
                  key={job.id} 
                  className="job-card-item"
                  onClick={() => handleJobClick(job)}
                >
                  {/* Tech Deco Corner brackets */}
                  <div className="card-corners">
                    <span className="corner tl"></span>
                    <span className="corner tr"></span>
                    <span className="corner bl"></span>
                    <span className="corner br"></span>
                  </div>

                  <div className="job-card-header">
                    <span className="job-card-experience">{job.experience} Experience</span>
                    <span className="job-card-location">[{job.location}]</span>
                  </div>
                  <div className="job-card-body">
                    <span className="job-index-badge">0{idx + 1}.</span>
                    <h3 className="job-card-title">{job.title}</h3>
                    <p className="job-card-desc">{job.description}</p>
                  </div>
                  <div className="job-card-footer">
                    <button className="job-card-apply-btn">
                      INITIALIZE APPLICATION &gt;&gt;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ----------------------------------------------------
         APPLICATION MODAL OVERLAY
         ---------------------------------------------------- */}
      {isModalOpen && selectedJob && (
        <div className="careers-modal-overlay" onClick={closeModal} data-lenis-prevent>
          <div 
            ref={formRef}
            className="cyber-form-wrapper careers-modal-card"
            onClick={(e) => e.stopPropagation()}
            onMouseMove={handleFormMouseMove}
            onMouseLeave={handleFormMouseLeave}
          >
            {/* Close Button */}
            <button className="close-modal-btn" onClick={closeModal} aria-label="Close modal">
              <span>[ CLOSE TRANSMISSION ]</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="form-header-bar">
              <span className="form-header-status">TRANSMITTING CV</span>
              <span className="form-header-line"></span>
            </div>

            <div className="prefilled-position-header">
              <div className="prefilled-position-badge">APPLYING FOR</div>
              <h2 className="prefilled-position-title">{selectedJob.title}</h2>
              <div className="prefilled-position-meta">
                <span>{selectedJob.experience} Experience</span>
                <span className="meta-separator">//</span>
                <span>{selectedJob.location}</span>
              </div>
            </div>

            <form ref={emailFormRef} onSubmit={handleSubmit} className="cyber-form">
              <input type="hidden" name="job_title" value={selectedJob.title} />
              
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
                  <span className="label-index">03.</span> CONTACT NUMBER <span className="req">*</span>
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
                  required
                />
              </div>

              {/* CV Attachment Upload Zone */}
              <div className="form-group file-upload-group">
                <label className="form-label">
                  <span className="label-index">04.</span> ATTACH CV / RESUME <span className="req">*</span>
                </label>
                <div 
                  className={`drag-drop-zone ${isDragActive ? 'drag-active' : ''} ${careersFile ? 'has-file' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    name="resume"
                    onChange={handleFileChange} 
                    accept=".pdf,.csv,.doc,.docx,.txt"
                    className="hidden-file-input"
                    style={{ display: 'none' }}
                  />
                  
                  {!careersFile ? (
                    <div className="upload-prompt">
                      <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                      </svg>
                      <span className="upload-text">DRAG & DROP CV OR <span className="browse-link">BROWSE</span></span>
                      <span className="upload-meta">PDF, CSV, DOC, DOCX, TXT (MAX 10MB)</span>
                    </div>
                  ) : (
                    <div className="uploaded-file-display" onClick={(e) => e.stopPropagation()}>
                      <div className="file-icon-wrapper">
                        <svg className="doc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <div className="file-info-details">
                        <div className="file-name-row">
                          <span className="file-name">{careersFile.name}</span>
                          <button type="button" className="remove-file-btn" onClick={handleRemoveFile}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="file-size-row">
                          <span>{(careersFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                          {isUploading && <span className="upload-progress-text">{uploadProgress}%</span>}
                        </div>
                        {isUploading && (
                          <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Feedback Bar */}
              {submitStatus === 'success' && (
                <div className="submit-message success">
                  <span>CV transmitted successfully. Our talent team will initiate contact.</span>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="submit-message error">
                  <span>{errorMessage || 'Please complete all fields and attach CV before transmitting.'}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`form-submit-btn ${isSubmitting ? 'submitting' : ''}`}
              >
                <span className="submit-btn-text">
                  {isSubmitting ? 'TRANSMITTING CV...' : 'SUBMIT APPLICATION'}
                </span>
                <span className="submit-btn-arrow">&gt;&gt;</span>
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareersPage;
