import React, { useState, useEffect } from 'react';
import './AdminPage.css';
import logoImg from '../../assets/images/logo/xalt-studios-logo.webp';
import { toast } from 'react-toastify';

interface Job {
  _id: string;
  title: string;
  experience: string;
  location: string;
  description: string;
}
interface FileUploadWidgetProps {
  value: string;
  onChange: (url: string) => void;
  acceptType: 'image' | 'video' | 'any';
}

const FileUploadWidget: React.FC<FileUploadWidgetProps> = ({
  value,
  onChange,
  acceptType
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadFile = (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('xalt_admin_token');

    // We use XMLHttpRequest to track upload progress
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:5000/api/upload', true);
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          onChange(response.url);
          toast.success('File uploaded successfully!');
        } catch (error) {
          toast.error('Failed to parse upload response.');
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          toast.error(response.message || 'Upload failed.');
        } catch (error) {
          toast.error(`Upload failed with status ${xhr.status}`);
        }
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      toast.error('Network error during file upload.');
    };

    xhr.send(formData);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  // Detect file type from URL
  const isVideoUrl = (url: string) => {
    return !!(
      url.match(/\.(mp4|webm|ogg|mov)$/i) || 
      (url.includes('/uploads/') && (url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm') || url.toLowerCase().endsWith('.mov')))
    );
  };

  const hasValue = !!value;

  return (
    <div className="premium-upload-widget">
      {isUploading ? (
        <div className="upload-progress-container">
          <div className="upload-progress-text">
            <span>Uploading file...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="upload-progress-bar-bg">
            <div className="upload-progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      ) : hasValue ? (
        <div className="upload-preview-container">
          {isVideoUrl(value) ? (
            <video className="upload-preview-media" src={value} muted playsInline />
          ) : (
            <img 
              className="upload-preview-media" 
              src={value} 
              alt="Preview" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=70&auto=format&fit=crop';
              }} 
            />
          )}
          <div className="upload-preview-info">
            <span className="upload-preview-name" title={value}>{value.substring(value.lastIndexOf('/') + 1)}</span>
            <span className="upload-preview-size" title={value} style={{ fontSize: '0.65rem', color: '#6b7280', wordBreak: 'break-all' }}>{value}</span>
          </div>
          <div className="upload-preview-actions">
            <button type="button" className="upload-remove-btn" onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>
      ) : (
        <label 
          className={`upload-dropzone ${dragActive ? 'dragging' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            style={{ display: 'none' }} 
            onChange={handleChange}
            accept={acceptType === 'image' ? 'image/*' : acceptType === 'video' ? 'video/*' : 'image/*,video/*'}
          />
          <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="upload-text">
            <strong>Click to upload</strong> or drag & drop
          </span>
          <span className="upload-hint">
            {acceptType === 'image' ? 'Supports JPEG, PNG, WEBP, SVG, GIF' : acceptType === 'video' ? 'Supports MP4, WEBM, MOV' : 'Images or Videos up to 100MB'}
          </span>
        </label>
      )}
    </div>
  );
};

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dashboard Tabs: 'careers' | 'projects' | 'showreel'
  const [activeTab, setActiveTab] = useState<'careers' | 'projects' | 'showreel'>('careers');
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // --- Careers State ---
  const [jobs, setJobs] = useState<Job[]>([]);
  const [newJob, setNewJob] = useState({
    title: '',
    experience: '',
    location: '',
    description: '',
  });
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobFeedback, setJobFeedback] = useState({ type: '', message: '' });

  // --- Projects/Portfolio Hierarchy State ---
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('commercial');
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<any | null>(null);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [isAddingProject, setIsAddingProject] = useState<boolean>(false);
  const [projectFeedback, setProjectFeedback] = useState({ type: '', message: '' });

  // --- Showreel State ---
  const [reel, setReel] = useState({
    title: 'X.ALT Showreel',
    videoUrl: '/src/assets/videos/showreel.mp4',
  });
  const [reelFeedback, setReelFeedback] = useState({ type: '', message: '' });

  // --- Confirmation Modal State ---
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Check login state on mount
  useEffect(() => {
    const token = localStorage.getItem('xalt_admin_token');
    if (token) {
      // Validate token
      fetch('http://localhost:5000/api/admin/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('xalt_admin_token');
        }
      })
      .catch(() => {
        // Fallback to locally logged-in mode for test convenience if server is offline but token exists
        setIsLoggedIn(true);
      });
    }
  }, []);

  // Fetch Dashboard data once logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchJobs();
      fetchPortfolio();
      fetchReel();
    }
  }, [isLoggedIn]);

  // --- Fetch API calls ---
  const fetchJobs = () => {
    fetch('http://localhost:5000/api/jobs')
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(err => console.error('Error fetching jobs:', err));
  };

  const fetchPortfolio = () => {
    fetch('http://localhost:5000/api/portfolio')
      .then(res => res.json())
      .then(data => setPortfolio(data))
      .catch(err => console.error('Error fetching portfolio:', err));
  };

  const fetchReel = () => {
    fetch('http://localhost:5000/api/reels')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setReel({ title: data.title, videoUrl: data.videoUrl });
        }
      })
      .catch(err => console.error('Error fetching showreel:', err));
  };

  // --- Auth Handlers ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('Email and Password are required.');
      return;
    }

    setIsSubmitting(true);
    setLoginError('');

    fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      localStorage.setItem('xalt_admin_token', data.token);
      setIsLoggedIn(true);
      toast.success('Access Granted: Secure handshake established.');
    })
    .catch(err => {
      setLoginError(err.message || 'Network error connecting to backend.');
      toast.error(err.message || 'Network error connecting to backend.');
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('xalt_admin_token');
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
  };

  // --- Job Vacancy CRUD ---
  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('xalt_admin_token');

    const url = editingJobId 
      ? `http://localhost:5000/api/jobs/${editingJobId}` 
      : 'http://localhost:5000/api/jobs';
    const method = editingJobId ? 'PUT' : 'POST';
    
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newJob)
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save job');
      }
      setJobFeedback({ 
        type: 'success', 
        message: editingJobId ? 'Vacancy updated successfully!' : 'Vacancy created and broadcasted!' 
      });
      toast.success(editingJobId ? 'Vacancy updated successfully!' : 'Vacancy created and broadcasted!');
      setNewJob({ title: '', experience: '', location: '', description: '' });
      setEditingJobId(null);
      fetchJobs();
      setTimeout(() => setJobFeedback({ type: '', message: '' }), 3000);
    })
    .catch(err => {
      setJobFeedback({ type: 'error', message: err.message });
      toast.error('Failed to save vacancy: ' + err.message);
      setTimeout(() => setJobFeedback({ type: '', message: '' }), 4000);
    });
  };

  const startEditJob = (job: Job) => {
    setEditingJobId(job._id);
    setNewJob({
      title: job.title,
      experience: job.experience,
      location: job.location,
      description: job.description
    });
  };

  const cancelEditJob = () => {
    setEditingJobId(null);
    setNewJob({ title: '', experience: '', location: '', description: '' });
  };

  const handleDeleteJob = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Decommission Vacancy Node',
      message: 'Are you sure you want to permanently decommission this job opening? This action will remove it from the live Careers portal.',
      onConfirm: () => {
        const token = localStorage.getItem('xalt_admin_token');
        fetch(`http://localhost:5000/api/jobs/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(async res => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Failed to delete vacancy');
          }
          if (editingJobId === id) {
            cancelEditJob();
          }
          toast.success('Vacancy successfully decommissioned.');
          fetchJobs();
        })
        .catch(err => {
          toast.error('Error deleting vacancy: ' + err.message);
        });
      }
    });
  };

  // --- Portfolio Hierarchy CRUD Handlers ---
  const handleCategorySave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const token = localStorage.getItem('xalt_admin_token');

    fetch(`http://localhost:5000/api/portfolio/categories/${editingCategory.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: editingCategory.title,
        description: editingCategory.description,
        heroImage: editingCategory.heroImage
      })
    })
    .then(async res => {
      if (!res.ok) throw new Error('Failed to update category details');
      setProjectFeedback({ type: 'success', message: 'Category details updated successfully!' });
      toast.success('Category details updated successfully!');
      setEditingCategory(null);
      fetchPortfolio();
      setTimeout(() => setProjectFeedback({ type: '', message: '' }), 3000);
    })
    .catch(err => {
      setProjectFeedback({ type: 'error', message: err.message });
      toast.error('Failed to update category: ' + err.message);
      setTimeout(() => setProjectFeedback({ type: '', message: '' }), 4000);
    });
  };

  const handleSubcategorySave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubcategory) return;
    const token = localStorage.getItem('xalt_admin_token');

    const url = editingSubcategory._id 
      ? `http://localhost:5000/api/portfolio/subcategories/${editingSubcategory._id}`
      : 'http://localhost:5000/api/portfolio/subcategories';
    const method = editingSubcategory._id ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        category: editingSubcategory.categoryId,
        title: editingSubcategory.title,
        description: editingSubcategory.description,
        image: editingSubcategory.image
      })
    })
    .then(async res => {
      if (!res.ok) throw new Error('Failed to save subcategory');
      setProjectFeedback({ 
        type: 'success', 
        message: editingSubcategory._id ? 'Subcategory details updated!' : 'New subcategory created!' 
      });
      toast.success(editingSubcategory._id ? 'Subcategory details updated!' : 'New subcategory created!');
      setEditingSubcategory(null);
      setIsAddingSubcategory(false);
      fetchPortfolio();
      setTimeout(() => setProjectFeedback({ type: '', message: '' }), 3000);
    })
    .catch(err => {
      setProjectFeedback({ type: 'error', message: err.message });
      toast.error('Failed to save subcategory: ' + err.message);
      setTimeout(() => setProjectFeedback({ type: '', message: '' }), 4000);
    });
  };

  const handleSubcategoryDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Purge Subcategory Division',
      message: 'Are you sure you want to delete this subcategory? This will also permanently purge all projects belonging to it.',
      onConfirm: () => {
        const token = localStorage.getItem('xalt_admin_token');
        fetch(`http://localhost:5000/api/portfolio/subcategories/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(async res => {
          if (!res.ok) throw new Error('Failed to delete subcategory');
          setProjectFeedback({ type: 'success', message: 'Subcategory deleted successfully!' });
          toast.success('Subcategory deleted successfully!');
          fetchPortfolio();
          setTimeout(() => setProjectFeedback({ type: '', message: '' }), 3000);
        })
        .catch(err => {
          setProjectFeedback({ type: 'error', message: err.message });
          toast.error('Failed to delete subcategory: ' + err.message);
          setTimeout(() => setProjectFeedback({ type: '', message: '' }), 4000);
        });
      }
    });
  };

  const handleProjectSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    const token = localStorage.getItem('xalt_admin_token');

    const url = editingProject._id 
      ? `http://localhost:5000/api/projects/${editingProject._id}` 
      : 'http://localhost:5000/api/projects';
    const method = editingProject._id ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        category: editingProject.categoryId,
        subcategory: editingProject.subcategoryTitle,
        title: editingProject.title,
        tag: editingProject.tag,
        code: editingProject.code,
        image: editingProject.image
      })
    })
    .then(async res => {
      if (!res.ok) throw new Error('Failed to save project');
      setProjectFeedback({ 
        type: 'success', 
        message: editingProject._id ? 'Project details updated!' : 'Project created successfully!' 
      });
      toast.success(editingProject._id ? 'Project details updated!' : 'Project created successfully!');
      setEditingProject(null);
      setIsAddingProject(false);
      fetchPortfolio();
      setTimeout(() => setProjectFeedback({ type: '', message: '' }), 3000);
    })
    .catch(err => {
      setProjectFeedback({ type: 'error', message: err.message });
      toast.error('Failed to save project: ' + err.message);
      setTimeout(() => setProjectFeedback({ type: '', message: '' }), 4000);
    });
  };

  const handleProjectDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Project Asset',
      message: 'Are you sure you want to permanently delete this project from the portfolio gallery?',
      onConfirm: () => {
        const token = localStorage.getItem('xalt_admin_token');
        fetch(`http://localhost:5000/api/projects/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(async res => {
          if (!res.ok) throw new Error('Failed to delete project');
          setProjectFeedback({ type: 'success', message: 'Project deleted successfully!' });
          toast.success('Project deleted successfully!');
          fetchPortfolio();
          setTimeout(() => setProjectFeedback({ type: '', message: '' }), 3000);
        })
        .catch(err => {
          setProjectFeedback({ type: 'error', message: err.message });
          toast.error('Failed to delete project: ' + err.message);
          setTimeout(() => setProjectFeedback({ type: '', message: '' }), 4000);
        });
      }
    });
  };

  // --- Showreel Update ---
  const handleReelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('xalt_admin_token');

    fetch('http://localhost:5000/api/reels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(reel)
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update reel');
      }
      setReelFeedback({ type: 'success', message: 'Reel configuration updated!' });
      toast.success('Reel configuration updated!');
      fetchReel();
      setTimeout(() => setReelFeedback({ type: '', message: '' }), 3000);
    })
    .catch(err => {
      setReelFeedback({ type: 'error', message: err.message });
      toast.error('Failed to update showreel: ' + err.message);
      setTimeout(() => setReelFeedback({ type: '', message: '' }), 4000);
    });
  };

  // ----------------------------------------------------
  // LOGIN SCREEN (Maintains website design touch)
  // ----------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-glow"></div>
        <div className="admin-login-card">
          <div className="card-corners">
            <span className="corner tl"></span>
            <span className="corner tr"></span>
            <span className="corner bl"></span>
            <span className="corner br"></span>
          </div>

          <div className="admin-login-logo">
            <img src={logoImg} alt="X.ALT Studio" />
          </div>

          <div className="admin-login-header">
            <span className="login-telemetry">// SECURE NODE ACCESS</span>
            <h2 className="login-title">ADMIN CONTROLS</h2>
          </div>

          {loginError && (
            <div className="admin-error-bar">
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="admin-login-form">
            <div className={`admin-input-group ${activeField === 'email' ? 'focused' : ''}`}>
              <label className="admin-label">EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setActiveField('email')}
                onBlur={() => setActiveField(null)}
                className="admin-input"
                required
              />
            </div>

            <div className={`admin-input-group ${activeField === 'password' ? 'focused' : ''}`}>
              <label className="admin-label">ACCESS KEY / PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setActiveField('password')}
                onBlur={() => setActiveField(null)}
                className="admin-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="admin-submit-btn"
            >
              <span>{isSubmitting ? 'ESTABLISHING HANDSHAKE...' : 'LOG IN TO DECRYPT'}</span>
              <span className="btn-arrow">&gt;&gt;</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  return (
    <div className="admin-dashboard-layout">
      {/* MOBILE HEADER BAR */}
      <div className="admin-mobile-header">
        <button className="mobile-menu-toggle" onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        <div className="mobile-logo-container">
          <img src={logoImg} alt="X.ALT" className="mobile-logo" />
          <span className="mobile-logo-text">Control Studio</span>
        </div>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)}></div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`admin-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={logoImg} alt="X.ALT" className="sidebar-logo" />
          <span className="sidebar-title">Control Studio</span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`sidebar-nav-btn ${activeTab === 'careers' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('careers');
              setIsMobileSidebarOpen(false);
            }}
          >
            <svg className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Careers Openings</span>
          </button>
          
          <button 
            className={`sidebar-nav-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('projects');
              setIsMobileSidebarOpen(false);
            }}
          >
            <svg className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Projects Portfolio</span>
          </button>

          <button 
            className={`sidebar-nav-btn ${activeTab === 'showreel' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('showreel');
              setIsMobileSidebarOpen(false);
            }}
          >
            <svg className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Showreel Source</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="profile-avatar">A</div>
            <div className="profile-info">
              <span className="profile-name">Administrator</span>
              <span className="profile-role">admin@gmail.com</span>
            </div>
          </div>
          
          <button className="admin-disconnect-btn" onClick={() => {
            handleLogout();
            setIsMobileSidebarOpen(false);
          }}>
            <svg className="disconnect-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Disconnect Session</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="admin-workspace">
        <header className="workspace-header">
          <div className="workspace-title-area">
            <h1>{activeTab === 'careers' ? 'Careers Openings' : activeTab === 'projects' ? 'Projects Portfolio' : 'Showreel Source'}</h1>
            <p className="workspace-breadcrumbs">Console / {activeTab === 'careers' ? 'Careers Manager' : activeTab === 'projects' ? 'Portfolio Manager' : 'Showreel Config'}</p>
          </div>

          <div className="workspace-status-badge">
            <span className="status-dot green"></span>
            <span className="status-text">Server Sync Online (In-Memory Fallback)</span>
          </div>
        </header>

        <div className="workspace-content">
          
          {/* TAB 1: CAREERS MANAGER */}
          {activeTab === 'careers' && (
            <div className="dashboard-grid">
              
              {/* Add/Edit Career Form */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h3>{editingJobId ? 'Edit Vacancy Node' : 'Create Vacancy Node'}</h3>
                  <p>{editingJobId ? 'Modify details for the selected vacancy opening.' : 'Initialize and broadcast a new vacancy vacancy.'}</p>
                </div>

                {jobFeedback.message && (
                  <div className={`feedback-alert ${jobFeedback.type}`}>
                    {jobFeedback.message}
                  </div>
                )}

                <form onSubmit={handleJobSubmit} className="dashboard-form">
                  <div className="dashboard-form-group">
                    <label>JOB TITLE</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Lead 3D CGI Artist"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="dashboard-form-row">
                    <div className="dashboard-form-group">
                      <label>EXPERIENCE REQUIRED</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 5+ Years"
                        value={newJob.experience}
                        onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                        required
                      />
                    </div>
                    <div className="dashboard-form-group">
                      <label>LOCATION</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Kochi Studio / Hybrid"
                        value={newJob.location}
                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="dashboard-form-group">
                    <label>JOB DESCRIPTION</label>
                    <textarea 
                      rows={6}
                      placeholder="Enter vacancy description, required tech stack, and key responsibilities..."
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="dashboard-form-actions">
                    <button type="submit" className="dashboard-btn primary">
                      {editingJobId ? 'Save Changes' : 'Initialize Vacancy Node'}
                    </button>
                    {editingJobId && (
                      <button type="button" className="dashboard-btn secondary" onClick={cancelEditJob}>
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Active Careers List */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h3>Active Vacancies ({jobs.length})</h3>
                  <p>Currently broadcasted jobs on the careers page portal.</p>
                </div>

                <div className="dashboard-list-scroller">
                  {jobs.length === 0 ? (
                    <div className="dashboard-empty-state">
                      <span>No active vacancies found. Standby for node injection.</span>
                    </div>
                  ) : (
                    jobs.map((job) => (
                      <div key={job._id} className="dashboard-list-item">
                        <div className="list-item-header">
                          <span className="item-title">{job.title}</span>
                          <span className="item-meta">{job.experience} | {job.location}</span>
                        </div>
                        <p className="list-item-description">{job.description}</p>
                        
                        <div className="list-item-actions">
                          <button 
                            className="list-action-btn edit"
                            onClick={() => startEditJob(job)}
                          >
                            Edit
                          </button>
                          <button 
                            className="list-action-btn delete"
                            onClick={() => handleDeleteJob(job._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PROJECTS PORTFOLIO */}
          {activeTab === 'projects' && (
            <div className="dashboard-portfolio-hierarchy" style={{ display: 'flex', flexDirection: 'column' }}>
              
              {projectFeedback.message && (
                <div className={`feedback-alert ${projectFeedback.type}`} style={{ marginBottom: '20px' }}>
                  {projectFeedback.message}
                </div>
              )}

              {/* Category Selector Tabs */}
              <div className="portfolio-category-selector" style={{ display: 'flex', gap: '15px', marginBottom: '25px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
                {portfolio.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCatId(cat.id);
                      setEditingCategory(null);
                      setEditingSubcategory(null);
                      setIsAddingSubcategory(false);
                      setEditingProject(null);
                      setIsAddingProject(false);
                    }}
                    className={`portfolio-cat-tab ${selectedCatId === cat.id ? 'active' : ''}`}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: selectedCatId === cat.id ? '3px solid #e10600' : '3px solid transparent',
                      padding: '10px 20px',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      color: selectedCatId === cat.id ? '#e10600' : '#4b5563',
                      textTransform: 'uppercase',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>

              {/* Active Category Details Workspace */}
              {portfolio.filter(cat => cat.id === selectedCatId).map(cat => (
                <div key={cat.id} className="category-detail-workspace">
                  
                  {/* Category Header Card */}
                  <div className="dashboard-card" style={{ marginBottom: '25px' }}>
                    <div className="dashboard-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3>{cat.title} Overview</h3>
                        <p>Manage the main banner text, description, and settings for this sector.</p>
                      </div>
                      <button 
                        className="dashboard-btn primary"
                        onClick={() => setEditingCategory(cat)}
                      >
                        Edit Sector Info
                      </button>
                    </div>

                    {editingCategory && editingCategory.id === cat.id ? (
                      <form onSubmit={handleCategorySave} className="dashboard-form" style={{ marginTop: '20px', padding: '15px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ marginBottom: '15px', textTransform: 'uppercase' }}>Edit Sector: {cat.title}</h4>
                        <div className="dashboard-form-group">
                          <label>SECTOR TITLE</label>
                          <input 
                            type="text" 
                            value={editingCategory.title} 
                            onChange={e => setEditingCategory({ ...editingCategory, title: e.target.value })}
                            required 
                          />
                        </div>
                        <div className="dashboard-form-group">
                          <label>SECTOR DESCRIPTION</label>
                          <textarea 
                            value={editingCategory.description} 
                            onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                            required 
                            rows={3}
                          />
                        </div>
                        <div className="dashboard-form-group">
                          <label>SECTOR HERO BANNER IMAGE</label>
                          <FileUploadWidget 
                            value={editingCategory.heroImage} 
                            onChange={url => setEditingCategory({ ...editingCategory, heroImage: url })}
                            acceptType="image"
                          />
                        </div>
                        <div className="dashboard-form-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                          <button type="submit" className="dashboard-btn primary">Save Changes</button>
                          <button type="button" className="dashboard-btn secondary" onClick={() => setEditingCategory(null)}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div className="category-overview-display" style={{ marginTop: '15px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <img src={cat.heroImage} alt={cat.title} style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb' }} onError={e => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop';
                        }} />
                        <div>
                          <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#6b7280' }}><strong>Hero Image:</strong> {cat.heroImage}</p>
                          <p style={{ margin: '0', fontSize: '0.9rem', color: '#374151', lineHeight: '1.4' }}>{cat.description}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subcategories Workspace Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ textTransform: 'uppercase', fontSize: '1.1rem', fontWeight: '600' }}>Sub-Categories</h3>
                    <button 
                      className="dashboard-btn primary" 
                      onClick={() => {
                        setEditingSubcategory({ categoryId: cat.id, title: '', description: '', image: '' });
                        setIsAddingSubcategory(true);
                      }}
                    >
                      + Add New Sub-Category
                    </button>
                  </div>

                  {/* Add New Subcategory Form */}
                  {isAddingSubcategory && editingSubcategory && !editingSubcategory._id && (
                    <div className="dashboard-card" style={{ marginBottom: '20px', border: '1px solid #3b82f6', background: '#f0fdf4' }}>
                      <div className="dashboard-card-header">
                        <h3>Add New Sub-Category</h3>
                        <p>Create a new sub-category node under {cat.title}.</p>
                      </div>
                      <form onSubmit={handleSubcategorySave} className="dashboard-form">
                        <div className="dashboard-form-group">
                          <label>SUBCATEGORY TITLE</label>
                          <input 
                            type="text" 
                            placeholder="e.g. CGI & VFX" 
                            value={editingSubcategory.title} 
                            onChange={e => setEditingSubcategory({ ...editingSubcategory, title: e.target.value })}
                            required 
                          />
                        </div>
                        <div className="dashboard-form-group">
                          <label>DESCRIPTION / CLASSIFICATION SUMMARY</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Immersive visual effects and realistic 3D environments." 
                            value={editingSubcategory.description} 
                            onChange={e => setEditingSubcategory({ ...editingSubcategory, description: e.target.value })}
                            required 
                          />
                        </div>
                        <div className="dashboard-form-group">
                          <label>PREVIEW IMAGE URL</label>
                          <FileUploadWidget 
                            value={editingSubcategory.image} 
                            onChange={url => setEditingSubcategory({ ...editingSubcategory, image: url })}
                            acceptType="image"
                          />
                        </div>
                        <div className="dashboard-form-actions">
                          <button type="submit" className="dashboard-btn primary">Create Sub-Category</button>
                          <button type="button" className="dashboard-btn secondary" onClick={() => {
                            setIsAddingSubcategory(false);
                            setEditingSubcategory(null);
                          }}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Subcategories List */}
                  <div className="subcategories-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    {cat.subCategories.length === 0 ? (
                      <div className="dashboard-empty-state" style={{ padding: '30px' }}>
                        <span>No sub-categories created for this sector.</span>
                      </div>
                    ) : (
                      cat.subCategories.map((sub: any) => (
                        <div key={sub._id || sub.title} className="dashboard-card" style={{ borderLeft: '4px solid #10b981', padding: '20px' }}>
                          
                          <div className="subcategory-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '15px', borderBottom: '1px solid #f3f4f6' }}>
                            {editingSubcategory && editingSubcategory._id === sub._id ? (
                              <form onSubmit={handleSubcategorySave} className="dashboard-form" style={{ width: '100%' }}>
                                <h4 style={{ marginBottom: '15px' }}>Edit Sub-Category: {sub.title}</h4>
                                <div className="dashboard-form-group">
                                  <label>TITLE</label>
                                  <input 
                                    type="text" 
                                    value={editingSubcategory.title} 
                                    onChange={e => setEditingSubcategory({ ...editingSubcategory, title: e.target.value })}
                                    required 
                                  />
                                </div>
                                <div className="dashboard-form-group">
                                  <label>DESCRIPTION</label>
                                  <input 
                                    type="text" 
                                    value={editingSubcategory.description} 
                                    onChange={e => setEditingSubcategory({ ...editingSubcategory, description: e.target.value })}
                                    required 
                                  />
                                </div>
                                <div className="dashboard-form-group">
                                  <label>IMAGE URL</label>
                                  <FileUploadWidget 
                                    value={editingSubcategory.image} 
                                    onChange={url => setEditingSubcategory({ ...editingSubcategory, image: url })}
                                    acceptType="image"
                                  />
                                </div>
                                <div className="dashboard-form-actions" style={{ display: 'flex', gap: '10px' }}>
                                  <button type="submit" className="dashboard-btn primary">Save Changes</button>
                                  <button type="button" className="dashboard-btn secondary" onClick={() => setEditingSubcategory(null)}>Cancel</button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                  <img src={sub.image} alt={sub.title} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} onError={e => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop';
                                  }} />
                                  <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', textTransform: 'uppercase', fontWeight: '600' }}>{sub.title}</h4>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '0.82rem', color: '#4b5563' }}>{sub.description}</p>
                                    <small style={{ color: '#9ca3af' }}>Image path: {sub.image}</small>
                                  </div>
                                </div>
                                <div className="list-item-actions" style={{ margin: 0, paddingTop: 0, border: 'none' }}>
                                  <button 
                                    className="list-action-btn edit" 
                                    onClick={() => setEditingSubcategory({ 
                                      _id: sub._id, 
                                      categoryId: cat.id, 
                                      title: sub.title, 
                                      description: sub.description, 
                                      image: sub.image,
                                      galleryItems: sub.galleryItems 
                                    })}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    className="list-action-btn delete" 
                                    onClick={() => handleSubcategoryDelete(sub._id || '')}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Gallery items under this subcategory */}
                          <div className="subcategory-gallery-workspace" style={{ marginTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <h5 style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em', color: '#6b7280' }}>
                                Gallery Projects ({sub.galleryItems?.length || 0})
                              </h5>
                              <button 
                                className="dashboard-btn primary"
                                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                onClick={() => {
                                  setEditingProject({ categoryId: cat.id, subcategoryTitle: sub.title, title: '', tag: '', code: '', image: '' });
                                  setIsAddingProject(true);
                                }}
                              >
                                + Add Project Card
                              </button>
                            </div>

                            {/* Add Project Form inline */}
                            {isAddingProject && editingProject && editingProject.subcategoryTitle === sub.title && !editingProject._id && (
                              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px dashed #3b82f6', marginBottom: '15px' }}>
                                <h5 style={{ margin: '0 0 10px 0', fontSize: '0.8rem' }}>ADD PROJECT TO {sub.title.toUpperCase()}</h5>
                                <form onSubmit={handleProjectSave} className="dashboard-form">
                                  <div className="dashboard-form-row">
                                    <div className="dashboard-form-group">
                                      <label>PROJECT TITLE</label>
                                      <input 
                                        type="text" 
                                        placeholder="e.g. Chronos Identity" 
                                        value={editingProject.title} 
                                        onChange={e => setEditingProject({ ...editingProject, title: e.target.value })}
                                        required 
                                      />
                                    </div>
                                    <div className="dashboard-form-group">
                                      <label>PRIMARY TAG</label>
                                      <input 
                                        type="text" 
                                        placeholder="e.g. Visual Narrative" 
                                        value={editingProject.tag} 
                                        onChange={e => setEditingProject({ ...editingProject, tag: e.target.value })}
                                        required 
                                      />
                                    </div>
                                  </div>
                                  <div className="dashboard-form-row">
                                    <div className="dashboard-form-group">
                                      <label>PROJECT CODE / SKU</label>
                                      <input 
                                        type="text" 
                                        placeholder="e.g. FILM_CH_02" 
                                        value={editingProject.code} 
                                        onChange={e => setEditingProject({ ...editingProject, code: e.target.value })}
                                        required 
                                      />
                                    </div>
                                    <div className="dashboard-form-group">
                                      <label>IMAGE PATH</label>
                                      <FileUploadWidget 
                                        value={editingProject.image} 
                                        onChange={url => setEditingProject({ ...editingProject, image: url })}
                                        acceptType="image"
                                      />
                                    </div>
                                  </div>
                                  <div className="dashboard-form-actions" style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                    <button type="submit" className="dashboard-btn primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Create Project</button>
                                    <button type="button" className="dashboard-btn secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => {
                                      setIsAddingProject(false);
                                      setEditingProject(null);
                                    }}>Cancel</button>
                                  </div>
                                </form>
                              </div>
                            )}

                            {/* Projects Grid List */}
                            <div className="subcategory-projects-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                              {sub.galleryItems && sub.galleryItems.map((proj: any) => (
                                <div key={proj._id || proj.code} className="project-grid-item" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px' }}>
                                  {editingProject && editingProject._id === proj._id ? (
                                    <form onSubmit={handleProjectSave} className="dashboard-form" style={{ gap: '8px' }}>
                                      <div className="dashboard-form-group" style={{ marginBottom: '8px' }}>
                                        <label style={{ fontSize: '0.65rem' }}>TITLE</label>
                                        <input 
                                          type="text" 
                                          value={editingProject.title} 
                                          onChange={e => setEditingProject({ ...editingProject, title: e.target.value })}
                                          style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto' }}
                                          required 
                                        />
                                      </div>
                                      <div className="dashboard-form-group" style={{ marginBottom: '8px' }}>
                                        <label style={{ fontSize: '0.65rem' }}>TAG</label>
                                        <input 
                                          type="text" 
                                          value={editingProject.tag} 
                                          onChange={e => setEditingProject({ ...editingProject, tag: e.target.value })}
                                          style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto' }}
                                          required 
                                        />
                                      </div>
                                      <div className="dashboard-form-group" style={{ marginBottom: '8px' }}>
                                        <label style={{ fontSize: '0.65rem' }}>CODE</label>
                                        <input 
                                          type="text" 
                                          value={editingProject.code} 
                                          onChange={e => setEditingProject({ ...editingProject, code: e.target.value })}
                                          style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto' }}
                                          required 
                                        />
                                      </div>
                                      <div className="dashboard-form-group" style={{ marginBottom: '8px' }}>
                                        <label style={{ fontSize: '0.65rem' }}>IMAGE URL</label>
                                        <FileUploadWidget 
                                          value={editingProject.image} 
                                          onChange={url => setEditingProject({ ...editingProject, image: url })}
                                          acceptType="image"
                                        />
                                      </div>
                                      <div className="dashboard-form-actions" style={{ display: 'flex', gap: '6px' }}>
                                        <button type="submit" className="dashboard-btn primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>Save</button>
                                        <button type="button" className="dashboard-btn secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => setEditingProject(null)}>Cancel</button>
                                      </div>
                                    </form>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <img src={proj.image} alt={proj.title} style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '3px' }} onError={e => {
                                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=50&auto=format&fit=crop';
                                        }} />
                                        <div style={{ overflow: 'hidden' }}>
                                          <h6 style={{ margin: '0 0 2px 0', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                            {proj.title}
                                          </h6>
                                          <span style={{ fontSize: '0.65rem', color: '#e10600', fontWeight: '600', display: 'block' }}>
                                            {proj.code}
                                          </span>
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '8px', marginTop: '4px' }}>
                                        <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>Tag: {proj.tag}</span>
                                        <div className="list-item-actions" style={{ margin: 0, paddingTop: 0, border: 'none', gap: '5px' }}>
                                          <button 
                                            className="list-action-btn edit" 
                                            style={{ padding: '3px 8px', fontSize: '0.65rem' }}
                                            onClick={() => setEditingProject({ 
                                              _id: proj._id, 
                                              categoryId: cat.id, 
                                              subcategoryTitle: sub.title, 
                                              title: proj.title, 
                                              tag: proj.tag, 
                                              code: proj.code, 
                                              image: proj.image 
                                            })}
                                          >
                                            Edit
                                          </button>
                                          <button 
                                            className="list-action-btn delete" 
                                            style={{ padding: '3px 8px', fontSize: '0.65rem' }}
                                            onClick={() => handleProjectDelete(proj._id || '')}
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      ))
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* TAB 3: SHOWREEL CONFIG */}
          {activeTab === 'showreel' && (
            <div className="dashboard-single-card-container">
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h3>Homepage Reel Transmission Source</h3>
                  <p>Configure the primary MP4 streaming source of the main homepage showcase video.</p>
                </div>

                {reelFeedback.message && (
                  <div className={`feedback-alert ${reelFeedback.type}`}>
                    {reelFeedback.message}
                  </div>
                )}

                <form onSubmit={handleReelSubmit} className="dashboard-form">
                  <div className="dashboard-form-group">
                    <label>SHOWREEL PORTAL TITLE</label>
                    <input 
                      type="text" 
                      value={reel.title}
                      onChange={(e) => setReel({ ...reel, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="dashboard-form-group">
                    <label>VIDEO SOURCE LINK (DIRECT MP4)</label>
                    <FileUploadWidget 
                      value={reel.videoUrl} 
                      onChange={url => setReel({ ...reel, videoUrl: url })}
                      acceptType="video"
                    />
                    <small className="field-hint">// Supports file uploads or absolute URLs targeting direct video formats.</small>
                  </div>

                  <div className="dashboard-form-actions">
                    <button type="submit" className="dashboard-btn primary">
                      Update Transmission Source
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* PREMIUM CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="confirm-modal-overlay" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>
          <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="confirm-modal-title">{confirmModal.title}</h3>
            <p className="confirm-modal-message">{confirmModal.message}</p>
            <div className="confirm-modal-actions">
              <button
                className="confirm-modal-btn cancel"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              >
                Cancel
              </button>
              <button
                className="confirm-modal-btn danger"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
