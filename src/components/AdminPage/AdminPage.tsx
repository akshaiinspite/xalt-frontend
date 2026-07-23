import React, { useState, useEffect } from 'react';
import './AdminPage.css';
import logoImg from '../../assets/images/logo/xalt-studios-logo.webp';
import { toast } from 'react-toastify';
import { API_BASE_URL, getMediaUrl } from '../../config';
import { AutoPauseVideo } from '../AutoPauseVideo/AutoPauseVideo';

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
  onRemove?: () => void;
}

// Detect file type from URL
const isVideoUrl = (url: string) => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].split('#')[0];
  return !!(
    cleanUrl.match(/\.(mp4|webm|ogg|mov|m4v)$/i) || 
    (url.includes('/uploads/') && (url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm') || url.toLowerCase().endsWith('.mov')))
  );
};

const FileUploadWidget: React.FC<FileUploadWidgetProps> = ({
  value,
  onChange,
  acceptType,
  onRemove
}) => {
  const [urlInput, setUrlInput] = useState(value || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Keep urlInput in sync when value changes externally
  React.useEffect(() => {
    setUrlInput(value || '');
  }, [value]);

  const handleBlur = () => {
    onChange(urlInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onChange(urlInput);
    }
  };

  const handleClear = () => {
    setUrlInput('');
    onChange('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('xalt_admin_token');
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }
      toast.success('File uploaded successfully!');
      setUrlInput(data.url);
      onChange(data.url);
    })
    .catch(err => {
      toast.error('File upload failed: ' + err.message);
      console.error(err);
    })
    .finally(() => {
      setIsUploading(false);
    });
  };

  return (
    <div className="cdn-link-widget" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <input 
        type="text" 
        placeholder={`Enter CDN ${acceptType === 'image' ? 'Image' : acceptType === 'video' ? 'Video' : 'Media'} URL...`}
        value={urlInput}
        onChange={(e) => {
          setUrlInput(e.target.value);
          onChange(e.target.value);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{ 
          width: '100%', 
          padding: '10px 14px', 
          fontSize: '0.85rem', 
          border: '1px solid #d1d5db', 
          borderRadius: '4px', 
          background: '#fff', 
          color: '#1f2937', 
          height: '42px',
          boxSizing: 'border-box'
        }}
      />
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept={acceptType === 'image' ? 'image/*' : acceptType === 'video' ? 'video/*' : 'image/*,video/*'} 
        onChange={handleFileChange}
      />
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', boxSizing: 'border-box', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="dashboard-btn primary"
          disabled={isUploading}
          style={{ 
            padding: '0 16px', 
            height: '36px', 
            margin: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
            borderRadius: '4px',
            lineHeight: '1',
            fontSize: '0.75rem',
            flexShrink: 0
          }}
        >
          {isUploading ? 'Uploading...' : 'Browse...'}
        </button>
        {value && (
          <button 
            type="button" 
            onClick={handleClear}
            className="dashboard-btn secondary"
            style={{ 
              padding: '0 16px', 
              height: '36px', 
              margin: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxSizing: 'border-box',
              borderRadius: '4px',
              lineHeight: '1',
              fontSize: '0.75rem',
              flexShrink: 0
            }}
          >
            Clear
          </button>
        )}
        {onRemove && (
          <button 
            type="button" 
            onClick={onRemove}
            className="dashboard-btn delete"
            style={{ 
              padding: '0 16px', 
              height: '36px', 
              margin: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxSizing: 'border-box',
              borderRadius: '4px',
              lineHeight: '1',
              fontSize: '0.75rem',
              flexShrink: 0,
              marginLeft: 'auto'
            }}
          >
            Remove
          </button>
        )}
      </div>

      {value && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '8px 12px' }}>
          {isVideoUrl(value) ? (
            <AutoPauseVideo preload="metadata" 
              src={getMediaUrl(value)} 
              muted 
              playsInline 
              autoPlay 
              loop 
              style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #d1d5db' }} 
            />
          ) : (
            <img 
              src={getMediaUrl(value)} 
              alt="Preview" 
              style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #d1d5db' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=70&auto=format&fit=crop';
              }} 
            />
          )}
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }} title={value}>
            Active URL: {value}
          </span>
        </div>
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
  const [dbStatus, setDbStatus] = useState<string>('Checking...');

  // Dashboard Tabs: 'careers' | 'projects' | 'home' | 'team' | 'about'
  const [activeTab, setActiveTab] = useState<'careers' | 'projects' | 'home' | 'team' | 'about'>('careers');
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // --- About State ---
  const [aboutPhotos, setAboutPhotos] = useState<any[]>([]);
  const [newAboutPhoto, setNewAboutPhoto] = useState<{
    key: string;
    title: string;
    label: string;
    imageUrl: string;
    imageUrls: string[];
  }>({
    key: '',
    title: '',
    label: '',
    imageUrl: '',
    imageUrls: []
  });
  const [editingAboutPhotoId, setEditingAboutPhotoId] = useState<string | null>(null);
  const [aboutFeedback, setAboutFeedback] = useState({ type: '', message: '' });

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
    videoUrl: '/video/show-reel/showreel.mp4',
    heroVideoUrl: '/uploads/logo video xalt.mp4',
  });
  const [reelFeedback, setReelFeedback] = useState({ type: '', message: '' });

  // --- Homepage Expertise State ---
  const [expertiseItems, setExpertiseItems] = useState<any[]>([]);
  const [newExpertise, setNewExpertise] = useState({
    title: '',
    category: '',
    description: '',
    image: '',
    link: '',
    order: 0
  });
  const [editingExpertiseId, setEditingExpertiseId] = useState<string | null>(null);
  const [expertiseFeedback, setExpertiseFeedback] = useState({ type: '', message: '' });

  // --- Teams State ---
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    role: '',
    department: 'CREATIVE_3D_LAB',
    bio: '',
    gradient: 'linear-gradient(135deg, #161616 0%, #700a18 100%)',
    image: '',
    empNo: '',
    order: 1
  });
  const [editingTeamMemberId, setEditingTeamMemberId] = useState<string | null>(null);
  const [teamFeedback, setTeamFeedback] = useState({ type: '', message: '' });

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

  const scrollToForm = (formId: string) => {
    setTimeout(() => {
      const element = document.getElementById(formId);
      if (element) {
        const lenis = (window as any).lenis;
        if (lenis) {
          lenis.scrollTo(element, { duration: 1.0, offset: -20 });
        } else {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
  };


  const fetchDbStatus = () => {
    fetch(`${API_BASE_URL}/admin/status`)
      .then(res => res.json())
      .then(data => {
        if (data && data.database) {
          setDbStatus(data.database);
        } else {
          setDbStatus('In-Memory Fallback');
        }
      })
      .catch(() => setDbStatus('Offline'));
  };

  // Check login state on mount
  useEffect(() => {
    fetchDbStatus();
    const token = localStorage.getItem('xalt_admin_token');
    if (token) {
      // Validate token
      fetch(`${API_BASE_URL}/admin/verify`, {
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
      fetchDbStatus();
      fetchJobs();
      fetchPortfolio();
      fetchReel();
      fetchExpertise();
      fetchTeamMembers();
      fetchAboutPhotos();
    }
  }, [isLoggedIn]);

  // --- Fetch API calls ---
  const fetchJobs = () => {
    fetch(`${API_BASE_URL}/jobs`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setJobs(data);
        } else {
          setJobs([]);
        }
      })
      .catch(err => {
        console.error('Error fetching jobs:', err);
        setJobs([]);
      });
  };

  const fetchPortfolio = () => {
    fetch(`${API_BASE_URL}/portfolio`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPortfolio(data);
        } else {
          setPortfolio([]);
        }
      })
      .catch(err => {
        console.error('Error fetching portfolio:', err);
        setPortfolio([]);
      });
  };

  const fetchReel = () => {
    fetch(`${API_BASE_URL}/reels`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          const item = Array.isArray(data) ? data[0] : data;
          if (item) {
            setReel({ 
              title: item.title || 'X.ALT Showreel', 
              videoUrl: item.videoUrl || '/video/show-reel/showreel.mp4',
              heroVideoUrl: item.heroVideoUrl || '/uploads/logo video xalt.mp4'
            });
          }
        }
      })
      .catch(err => console.error('Error fetching showreel:', err));
  };

  const fetchExpertise = () => {
    fetch(`${API_BASE_URL}/expertise`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setExpertiseItems(data);
        } else {
          setExpertiseItems([]);
        }
      })
      .catch(err => {
        console.error('Error fetching expertise:', err);
        setExpertiseItems([]);
      });
  };

  const fetchTeamMembers = () => {
    fetch(`${API_BASE_URL}/team-members`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setTeamMembers(sorted);
        }
      })
      .catch(err => console.error('Error fetching team members:', err));
  };

  // --- Expertise CRUD Handlers ---
  const handleExpertiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('xalt_admin_token');

    const url = editingExpertiseId 
      ? `${API_BASE_URL}/expertise/${editingExpertiseId}` 
      : `${API_BASE_URL}/expertise`;
    const method = editingExpertiseId ? 'PUT' : 'POST';
    
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newExpertise)
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save expertise item');
      }
      setExpertiseFeedback({ 
        type: 'success', 
        message: editingExpertiseId ? 'Expertise item updated successfully!' : 'Expertise item created successfully!' 
      });
      toast.success(editingExpertiseId ? 'Expertise item updated successfully!' : 'Expertise item created successfully!');
      setNewExpertise({ title: '', category: '', description: '', image: '', link: '', order: 0 });
      setEditingExpertiseId(null);
      fetchExpertise();
      setTimeout(() => setExpertiseFeedback({ type: '', message: '' }), 3000);
    })
    .catch(err => {
      setExpertiseFeedback({ type: 'error', message: err.message });
      toast.error('Failed to save expertise item: ' + err.message);
      setTimeout(() => setExpertiseFeedback({ type: '', message: '' }), 4000);
    });
  };

  const startEditExpertise = (item: any) => {
    setEditingExpertiseId(item._id);
    setNewExpertise({
      title: item.title,
      category: item.category,
      description: item.description,
      image: item.image,
      link: item.link || '',
      order: item.order !== undefined ? item.order : 0
    });
    scrollToForm('expertise-form-container');
  };

  const cancelEditExpertise = () => {
    setEditingExpertiseId(null);
    setNewExpertise({ title: '', category: '', description: '', image: '', link: '', order: 0 });
  };

  const handleDeleteExpertise = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Decommission Expertise Item',
      message: 'Are you sure you want to permanently decommission this expertise item? This action will remove it from the live Homepage.',
      onConfirm: () => {
        const token = localStorage.getItem('xalt_admin_token');
        fetch(`${API_BASE_URL}/expertise/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(async res => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Failed to delete expertise item');
          }
          if (editingExpertiseId === id) {
            cancelEditExpertise();
          }
          toast.success('Expertise item successfully decommissioned.');
          fetchExpertise();
        })
        .catch(err => {
          toast.error('Error deleting expertise item: ' + err.message);
        });
      }
    });
  };

  // --- Teams CRUD Handlers ---
  const handleTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('xalt_admin_token');

    const url = editingTeamMemberId 
      ? `${API_BASE_URL}/team-members/${editingTeamMemberId}` 
      : `${API_BASE_URL}/team-members`;
    const method = editingTeamMemberId ? 'PUT' : 'POST';
    
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newTeamMember)
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save team member');
      }
      setTeamFeedback({ 
        type: 'success', 
        message: editingTeamMemberId ? 'Team member updated successfully!' : 'Team member created successfully!' 
      });
      toast.success(editingTeamMemberId ? 'Team member updated successfully!' : 'Team member created successfully!');
      setNewTeamMember({ name: '', role: '', department: 'CREATIVE_3D_LAB', bio: '', gradient: 'linear-gradient(135deg, #161616 0%, #700a18 100%)', image: '', empNo: '', order: 1 });
      setEditingTeamMemberId(null);
      fetchTeamMembers();
      setTimeout(() => setTeamFeedback({ type: '', message: '' }), 3000);
    })
    .catch(err => {
      setTeamFeedback({ type: 'error', message: err.message });
      toast.error('Failed to save team member: ' + err.message);
      setTimeout(() => setTeamFeedback({ type: '', message: '' }), 4000);
    });
  };

  const startEditTeamMember = (member: any) => {
    setEditingTeamMemberId(member._id);
    setNewTeamMember({
      name: member.name,
      role: member.role,
      department: member.department || 'CREATIVE_3D_LAB',
      bio: member.bio || '',
      gradient: member.gradient || 'linear-gradient(135deg, #161616 0%, #700a18 100%)',
      image: member.image || '',
      empNo: member.empNo || '',
      order: member.order !== undefined ? member.order : 1
    });
    scrollToForm('team-form-container');
  };

  const cancelEditTeamMember = () => {
    setEditingTeamMemberId(null);
    setNewTeamMember({ name: '', role: '', department: 'CREATIVE_3D_LAB', bio: '', gradient: 'linear-gradient(135deg, #161616 0%, #700a18 100%)', image: '', empNo: '', order: 1 });
  };

  const handleDeleteTeamMember = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Team Member',
      message: 'Are you sure you want to permanently delete this team member? This action will remove them from the live About page.',
      onConfirm: () => {
        const token = localStorage.getItem('xalt_admin_token');
        fetch(`${API_BASE_URL}/team-members/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(async res => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Failed to delete team member');
          }
          if (editingTeamMemberId === id) {
            cancelEditTeamMember();
          }
          toast.success('Team member successfully deleted.');
          fetchTeamMembers();
        })
        .catch(err => {
          toast.error('Error deleting team member: ' + err.message);
        });
      }
    });
  };

  // --- About CRUD Handlers ---
  const fetchAboutPhotos = () => {
    fetch(`${API_BASE_URL}/about`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAboutPhotos(data);
        }
      })
      .catch(err => console.error('Error fetching about photos:', err));
  };

  const handleAboutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('xalt_admin_token');

    const url = editingAboutPhotoId 
      ? `${API_BASE_URL}/about/${editingAboutPhotoId}` 
      : `${API_BASE_URL}/about`;
    const method = editingAboutPhotoId ? 'PUT' : 'POST';
    
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newAboutPhoto)
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save about photo');
      }
      setAboutFeedback({ 
        type: 'success', 
        message: editingAboutPhotoId ? 'About photo updated successfully!' : 'About photo created successfully!' 
      });
      toast.success(editingAboutPhotoId ? 'About photo updated successfully!' : 'About photo created successfully!');
      setNewAboutPhoto({ key: '', title: '', label: '', imageUrl: '', imageUrls: [] });
      setEditingAboutPhotoId(null);
      fetchAboutPhotos();
      setTimeout(() => setAboutFeedback({ type: '', message: '' }), 3000);
    })
    .catch(err => {
      setAboutFeedback({ type: 'error', message: err.message });
      toast.error('Failed to save about photo: ' + err.message);
      setTimeout(() => setAboutFeedback({ type: '', message: '' }), 4000);
    });
  };

  const startEditAboutPhoto = (photo: any) => {
    setEditingAboutPhotoId(photo._id);
    setNewAboutPhoto({
      key: photo.key,
      title: photo.title || '',
      label: photo.label || '',
      imageUrl: photo.imageUrl || '',
      imageUrls: Array.isArray(photo.imageUrls) && photo.imageUrls.length > 0
        ? photo.imageUrls
        : (photo.imageUrl ? [photo.imageUrl] : [])
    });
    scrollToForm('about-form-container');
  };

  const cancelEditAboutPhoto = () => {
    setEditingAboutPhotoId(null);
    setNewAboutPhoto({ key: '', title: '', label: '', imageUrl: '', imageUrls: [] });
  };

  const handleDeleteAboutPhoto = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete About Photo Slot',
      message: 'Are you sure you want to permanently delete this photo slot entry? This will revert it to the static default on the live site.',
      onConfirm: () => {
        const token = localStorage.getItem('xalt_admin_token');
        fetch(`${API_BASE_URL}/about/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(async res => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Failed to delete about photo');
          }
          if (editingAboutPhotoId === id) {
            cancelEditAboutPhoto();
          }
          toast.success('About photo successfully deleted.');
          fetchAboutPhotos();
        })
        .catch(err => {
          toast.error('Error deleting about photo: ' + err.message);
        });
      }
    });
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

    fetch(`${API_BASE_URL}/admin/login`, {
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
      // Local fallback for offline/development accessibility
      if (email === 'admin@gmail.com' && password === 'xaltadmin') {
        localStorage.setItem('xalt_admin_token', 'offline-handshake-bypass-token');
        setIsLoggedIn(true);
        toast.success('Access Granted (Local Offline Fallback established).');
      } else {
        setLoginError(err.message || 'Network error connecting to backend.');
        toast.error(err.message || 'Network error connecting to backend.');
      }
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
      ? `${API_BASE_URL}/jobs/${editingJobId}` 
      : `${API_BASE_URL}/jobs`;
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
    scrollToForm('career-form-container');
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
        fetch(`${API_BASE_URL}/jobs/${id}`, {
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

    fetch(`${API_BASE_URL}/portfolio/categories/${editingCategory.id}`, {
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
      ? `${API_BASE_URL}/portfolio/subcategories/${editingSubcategory._id}`
      : `${API_BASE_URL}/portfolio/subcategories`;
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
        image: editingSubcategory.image,
        video: editingSubcategory.video || ''
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
        fetch(`${API_BASE_URL}/portfolio/subcategories/${id}`, {
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
      ? `${API_BASE_URL}/projects/${editingProject._id}` 
      : `${API_BASE_URL}/projects`;
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
        year: editingProject.year || editingProject.code,
        code: editingProject.code || editingProject.year,
        client: editingProject.client || '',
        image: editingProject.image,
        video: editingProject.video || '',
        galleryImages: editingProject.galleryImages || []
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
        fetch(`${API_BASE_URL}/projects/${id}`, {
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

    fetch(`${API_BASE_URL}/reels`, {
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
            className={`sidebar-nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('home');
              setIsMobileSidebarOpen(false);
            }}
          >
            <svg className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home Menu</span>
          </button>

          <button 
            className={`sidebar-nav-btn ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('team');
              setIsMobileSidebarOpen(false);
            }}
          >
            <svg className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Teams Menu</span>
          </button>

          <button 
            className={`sidebar-nav-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('about');
              setIsMobileSidebarOpen(false);
            }}
          >
            <svg className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>About Menu</span>
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
            <h1>
              {activeTab === 'careers' 
                ? 'Careers Openings' 
                : activeTab === 'projects' 
                ? 'Projects Portfolio' 
                : activeTab === 'home' 
                ? 'Home Menu' 
                : activeTab === 'team'
                ? 'Teams Menu'
                : 'About Menu'}
            </h1>
            <p className="workspace-breadcrumbs">
              Console / {
                activeTab === 'careers' 
                  ? 'Careers Manager' 
                  : activeTab === 'projects' 
                  ? 'Portfolio Manager' 
                  : activeTab === 'home' 
                  ? 'Home Manager' 
                  : activeTab === 'team'
                  ? 'Teams Menu'
                  : 'About Menu'
              }
            </p>
          </div>

          <div className="workspace-status-badge">
            <span className={`status-dot ${dbStatus === 'MongoDB' ? 'green' : dbStatus === 'Offline' ? 'red' : 'orange'}`}></span>
            <span className="status-text">
              {dbStatus === 'MongoDB' 
                ? 'Server Sync Online (MongoDB Connected)' 
                : dbStatus === 'In-Memory Fallback'
                ? 'Server Sync Online (In-Memory Fallback)'
                : dbStatus === 'Offline'
                ? 'Server Offline'
                : 'Checking Server Sync...'}
            </span>
          </div>
        </header>

        <div className="workspace-content">
          
          {/* TAB 1: CAREERS MANAGER */}
          {activeTab === 'careers' && (
            <div className="dashboard-grid">
              
              {/* Add/Edit Career Form */}
              <div className="dashboard-card" id="career-form-container">
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
                        <div className="dashboard-form-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                          <button type="submit" className="dashboard-btn primary">Save Changes</button>
                          <button type="button" className="dashboard-btn secondary" onClick={() => setEditingCategory(null)}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div className="category-overview-display" style={{ marginTop: '15px' }}>
                        <p style={{ margin: '0', fontSize: '0.9rem', color: '#374151', lineHeight: '1.4' }}>{cat.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Subcategories Workspace Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ textTransform: 'uppercase', fontSize: '1.1rem', fontWeight: '600' }}>Sub-Categories</h3>
                    <button 
                      className="dashboard-btn primary" 
                      onClick={() => {
                        setEditingSubcategory({ categoryId: cat.id, title: '', description: '', image: '', video: '' });
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
                        <div className="dashboard-form-group">
                          <label>SHOWCASE VIDEO URL (FOR IMMERSIVE CATEGORY SINGLE VIDEO SHOWCASE)</label>
                          <FileUploadWidget 
                            value={editingSubcategory.video || ''} 
                            onChange={url => setEditingSubcategory({ ...editingSubcategory, video: url })}
                            acceptType="video"
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
                                <div className="dashboard-form-group">
                                  <label>SHOWCASE VIDEO URL (FOR IMMERSIVE CATEGORY SINGLE VIDEO SHOWCASE)</label>
                                  <FileUploadWidget 
                                    value={editingSubcategory.video || ''} 
                                    onChange={url => setEditingSubcategory({ ...editingSubcategory, video: url })}
                                    acceptType="video"
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
                                  <img src={getMediaUrl(sub.image)} alt={sub.title} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} onError={e => {
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
                                      video: sub.video || '',
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
                                  setEditingProject({ categoryId: cat.id, subcategoryTitle: sub.title, title: '', tag: '', year: '', code: '', client: '', image: '', video: '', galleryImages: [] });
                                  setIsAddingProject(true);
                                }}
                              >
                                + Add Project Card
                              </button>
                            </div>

                            {/* Add Project Form inline */}
                            {isAddingProject && editingProject && editingProject.subcategoryTitle === sub.title && !editingProject._id && (
                              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                                <h5 style={{ margin: '0 0 15px 0', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ADD PROJECT TO {sub.title.toUpperCase()}</h5>
                                <form onSubmit={handleProjectSave} className="dashboard-form" style={{ gap: '15px' }}>
                                  <div className="dashboard-form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                    <div className="dashboard-form-group">
                                      <label>PROJECT TITLE</label>
                                      <input 
                                        type="text" 
                                        placeholder="e.g. Chronos Identity" 
                                        value={editingProject.title} 
                                        onChange={e => setEditingProject({ ...editingProject, title: e.target.value })}
                                        style={{ height: '38px', fontSize: '0.85rem' }}
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
                                        style={{ height: '38px', fontSize: '0.85rem' }}
                                        required 
                                      />
                                    </div>
                                    <div className="dashboard-form-group">
                                      <label>PROJECT YEAR</label>
                                      <input 
                                        type="text" 
                                        placeholder="e.g. 2026" 
                                        value={editingProject.year || editingProject.code || ''} 
                                        onChange={e => setEditingProject({ ...editingProject, year: e.target.value, code: e.target.value })}
                                        style={{ height: '38px', fontSize: '0.85rem' }}
                                        required 
                                      />
                                    </div>
                                    <div className="dashboard-form-group">
                                      <label>CLIENT</label>
                                      <input 
                                        type="text" 
                                        placeholder="e.g. Chronos Inc." 
                                        value={editingProject.client || ''} 
                                        onChange={e => setEditingProject({ ...editingProject, client: e.target.value })}
                                        style={{ height: '38px', fontSize: '0.85rem' }}
                                        required 
                                      />
                                    </div>
                                  </div>
                                  <div className="dashboard-form-group">
                                    <label>PROJECT MEDIA (IMAGE, VIDEO, OR CDN LINK)</label>
                                    <FileUploadWidget 
                                      value={editingProject.video || editingProject.image} 
                                      onChange={url => {
                                        const isVid = isVideoUrl(url);
                                        setEditingProject({
                                          ...editingProject,
                                          image: isVid ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop' : url,
                                          video: isVid ? url : ''
                                        });
                                      }}
                                      acceptType="any"
                                    />
                                  </div>
                                  <div className="dashboard-form-group" style={{ marginTop: '10px' }}>
                                    <label>ADDITIONAL GALLERY IMAGES / VIDEOS ({editingProject.galleryImages?.length || 0})</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                                      {editingProject.galleryImages && editingProject.galleryImages.map((imgUrl: string, idx: number) => (
                                        <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', marginBottom: '8px' }}>
                                          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', width: '20px', marginTop: '12px', textAlign: 'center' }}>{idx + 1}.</span>
                                          <div style={{ flex: 1, minWidth: 0 }}>
                                            <FileUploadWidget 
                                              value={imgUrl}
                                              onChange={(url) => {
                                                const updated = [...(editingProject.galleryImages || [])];
                                                updated[idx] = url;
                                                setEditingProject((prev: any) => ({
                                                  ...prev,
                                                  galleryImages: updated
                                                }));
                                              }}
                                              acceptType="any"
                                              onRemove={() => {
                                                const updated = (editingProject.galleryImages || []).filter((_: any, i: number) => i !== idx);
                                                setEditingProject((prev: any) => ({
                                                  ...prev,
                                                  galleryImages: updated
                                                }));
                                              }}
                                            />
                                          </div>
                                        </div>
                                      ))}
                                      <button 
                                        type="button" 
                                        className="dashboard-btn primary" 
                                        style={{ alignSelf: 'flex-start', padding: '4px 10px', fontSize: '0.75rem', margin: 0 }}
                                        onClick={() => {
                                          setEditingProject((prev: any) => ({
                                            ...prev,
                                            galleryImages: [...(prev.galleryImages || []), '']
                                          }));
                                        }}
                                      >
                                        + Add Gallery Image / Video
                                      </button>
                                    </div>
                                    <small className="field-hint" style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '4px', display: 'block' }}>// Add multiple images that will appear as a gallery modal section when clicking this project video.</small>
                                  </div>
                                  <div className="dashboard-form-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                                    <button type="button" className="dashboard-btn secondary" style={{ padding: '8px 16px', fontSize: '0.78rem', margin: 0 }} onClick={() => {
                                      setIsAddingProject(false);
                                      setEditingProject(null);
                                    }}>Cancel</button>
                                    <button type="submit" className="dashboard-btn primary" style={{ padding: '8px 16px', fontSize: '0.78rem', margin: 0 }}>Create Project</button>
                                  </div>
                                </form>
                              </div>
                            )}

                            {/* Projects Grid List */}
                            <div className="subcategory-projects-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                              {sub.galleryItems && sub.galleryItems.map((proj: any) => (
                                <div 
                                  key={proj._id || proj.year || proj.code} 
                                  className="project-grid-item" 
                                  style={{ 
                                    background: '#f9fafb', 
                                    border: '1px solid #e5e7eb', 
                                    borderRadius: '6px', 
                                    padding: '12px',
                                    gridColumn: editingProject && editingProject._id === proj._id ? '1 / -1' : 'auto'
                                  }}
                                >
                                  {editingProject && editingProject._id === proj._id ? (
                                    <form onSubmit={handleProjectSave} className="dashboard-form" style={{ gap: '10px' }}>
                                      <div className="dashboard-form-group" style={{ marginBottom: '6px' }}>
                                        <label style={{ fontSize: '0.62rem' }}>TITLE</label>
                                        <input 
                                          type="text" 
                                          value={editingProject.title} 
                                          onChange={e => setEditingProject({ ...editingProject, title: e.target.value })}
                                          style={{ padding: '5px 8px', fontSize: '0.78rem', height: '32px' }}
                                          required 
                                        />
                                      </div>
                                      <div className="dashboard-form-group" style={{ marginBottom: '6px' }}>
                                        <label style={{ fontSize: '0.62rem' }}>TAG</label>
                                        <input 
                                          type="text" 
                                          value={editingProject.tag} 
                                          onChange={e => setEditingProject({ ...editingProject, tag: e.target.value })}
                                          style={{ padding: '5px 8px', fontSize: '0.78rem', height: '32px' }}
                                          required 
                                        />
                                      </div>
                                      <div className="dashboard-form-group" style={{ marginBottom: '6px' }}>
                                        <label style={{ fontSize: '0.62rem' }}>YEAR</label>
                                        <input 
                                          type="text" 
                                          value={editingProject.year || editingProject.code || ''} 
                                          onChange={e => setEditingProject({ ...editingProject, year: e.target.value, code: e.target.value })}
                                          style={{ padding: '5px 8px', fontSize: '0.78rem', height: '32px' }}
                                          required 
                                        />
                                      </div>
                                      <div className="dashboard-form-group" style={{ marginBottom: '6px' }}>
                                        <label style={{ fontSize: '0.62rem' }}>CLIENT</label>
                                        <input 
                                          type="text" 
                                          value={editingProject.client || ''} 
                                          onChange={e => setEditingProject({ ...editingProject, client: e.target.value })}
                                          style={{ padding: '5px 8px', fontSize: '0.78rem', height: '32px' }}
                                          required 
                                        />
                                      </div>
                                      <div className="dashboard-form-group" style={{ marginBottom: '4px' }}>
                                        <label style={{ fontSize: '0.62rem' }}>PROJECT MEDIA (IMAGE, VIDEO, OR CDN LINK)</label>
                                        <FileUploadWidget 
                                          value={editingProject.video || editingProject.image} 
                                          onChange={url => {
                                            const isVid = isVideoUrl(url);
                                            setEditingProject({
                                              ...editingProject,
                                              image: isVid ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop' : url,
                                              video: isVid ? url : ''
                                            });
                                          }}
                                          acceptType="any"
                                        />
                                      </div>
                                      <div className="dashboard-form-group" style={{ marginTop: '10px', marginBottom: '8px' }}>
                                        <label style={{ fontSize: '0.62rem' }}>ADDITIONAL GALLERY IMAGES / VIDEOS ({editingProject.galleryImages?.length || 0})</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                                          {editingProject.galleryImages && editingProject.galleryImages.map((imgUrl: string, idx: number) => (
                                            <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', marginBottom: '8px' }}>
                                              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', width: '20px', marginTop: '12px', textAlign: 'center' }}>{idx + 1}.</span>
                                              <div style={{ flex: 1, minWidth: 0 }}>
                                                <FileUploadWidget 
                                                  value={imgUrl}
                                                  onChange={(url) => {
                                                    const updated = [...(editingProject.galleryImages || [])];
                                                    updated[idx] = url;
                                                    setEditingProject((prev: any) => ({
                                                      ...prev,
                                                      galleryImages: updated
                                                    }));
                                                  }}
                                                  acceptType="any"
                                                  onRemove={() => {
                                                    const updated = (editingProject.galleryImages || []).filter((_: any, i: number) => i !== idx);
                                                    setEditingProject((prev: any) => ({
                                                      ...prev,
                                                      galleryImages: updated
                                                    }));
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          ))}
                                          <button 
                                            type="button" 
                                            className="dashboard-btn primary" 
                                            style={{ alignSelf: 'flex-start', padding: '4px 10px', fontSize: '0.75rem', margin: 0 }}
                                            onClick={() => {
                                              setEditingProject((prev: any) => ({
                                                ...prev,
                                                galleryImages: [...(prev.galleryImages || []), '']
                                              }));
                                            }}
                                          >
                                            + Add Gallery Image / Video
                                          </button>
                                        </div>
                                      </div>
                                      <div className="dashboard-form-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #f3f4f6', paddingTop: '8px', marginTop: '4px' }}>
                                        <button type="button" className="dashboard-btn secondary" style={{ padding: '5px 12px', fontSize: '0.7rem', margin: 0 }} onClick={() => setEditingProject(null)}>Cancel</button>
                                        <button type="submit" className="dashboard-btn primary" style={{ padding: '5px 12px', fontSize: '0.7rem', margin: 0 }}>Save</button>
                                      </div>
                                    </form>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <img src={getMediaUrl(proj.image)} alt={proj.title} style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '3px' }} onError={e => {
                                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=50&auto=format&fit=crop';
                                        }} />
                                        <div style={{ overflow: 'hidden' }}>
                                          <h6 style={{ margin: '0 0 2px 0', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                            {proj.title}
                                          </h6>
                                          <span style={{ fontSize: '0.65rem', color: '#e10600', fontWeight: '600', display: 'block' }}>
                                            {proj.year || proj.code}
                                          </span>
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '8px', marginTop: '4px' }}>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                          <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>Tag: {proj.tag}</span>
                                          {proj.video && (
                                            <span style={{ fontSize: '0.6rem', color: '#fff', background: '#e10600', padding: '1px 6px', borderRadius: '3px', fontWeight: '600' }}>VIDEO</span>
                                          )}
                                        </div>
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
                                              year: proj.year || proj.code,
                                              code: proj.code || proj.year,
                                              client: proj.client || '',
                                              image: proj.image,
                                              video: proj.video || '',
                                              galleryImages: proj.galleryImages || []
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
          
          {/* TAB 3: HOME MENU MANAGER (SHOWREEL & EXPERTISE ITEMS) */}
          {activeTab === 'home' && (
            <div className="dashboard-grid">
              
              {/* Showreel Section */}
              <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
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
                    <label>SHOWREEL VIDEO SOURCE LINK (DIRECT MP4)</label>
                    <FileUploadWidget 
                      value={reel.videoUrl} 
                      onChange={url => setReel({ ...reel, videoUrl: url })}
                      acceptType="video"
                    />
                    <small className="field-hint">// Supports file uploads or absolute URLs targeting direct video formats.</small>
                  </div>

                  <div className="dashboard-form-group" style={{ marginTop: '16px' }}>
                    <label>HERO LOGO VIDEO SOURCE LINK (CDN/DIRECT MP4)</label>
                    <FileUploadWidget 
                      value={reel.heroVideoUrl} 
                      onChange={url => setReel({ ...reel, heroVideoUrl: url })}
                      acceptType="video"
                    />
                    <small className="field-hint">// The cinematic logo loop video that plays at the top of the homepage.</small>
                  </div>

                  <div className="dashboard-form-actions">
                    <button type="submit" className="dashboard-btn primary">
                      Update Transmission Source
                    </button>
                  </div>
                </form>
              </div>

              {/* Add/Edit Expertise Card */}
              <div className="dashboard-card" id="expertise-form-container">
                <div className="dashboard-card-header">
                  <h3>{editingExpertiseId ? 'Edit Expertise Item' : 'Add Expertise Item'}</h3>
                  <p>{editingExpertiseId ? 'Modify details for the selected homepage item.' : 'Enter details for the new homepage item.'}</p>
                </div>

                {expertiseFeedback.message && (
                  <div className={`feedback-alert ${expertiseFeedback.type}`}>
                    {expertiseFeedback.message}
                  </div>
                )}

                <form onSubmit={handleExpertiseSubmit} className="dashboard-form">
                  <div className="dashboard-form-group">
                    <label>TITLE</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Films & Entertainment"
                      value={newExpertise.title}
                      onChange={(e) => setNewExpertise({ ...newExpertise, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="dashboard-form-group">
                    <label>SUBTITLE / CATEGORY</label>
                    <input 
                      type="text" 
                      placeholder="e.g. VFX & Post Production"
                      value={newExpertise.category}
                      onChange={(e) => setNewExpertise({ ...newExpertise, category: e.target.value })}
                      required
                    />
                  </div>

                  <div className="dashboard-form-group">
                    <label>DESCRIPTION</label>
                    <textarea 
                      rows={4}
                      placeholder="Enter description summary for the homepage expertise section..."
                      value={newExpertise.description}
                      onChange={(e) => setNewExpertise({ ...newExpertise, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="dashboard-form-group">
                    <label>IMAGE</label>
                    <FileUploadWidget 
                      value={newExpertise.image} 
                      onChange={url => setNewExpertise({ ...newExpertise, image: url })}
                      acceptType="image"
                    />
                  </div>

                  <div className="dashboard-form-actions">
                    <button type="submit" className="dashboard-btn primary">
                      {editingExpertiseId ? 'Save Changes' : 'Add Expertise Item'}
                    </button>
                    {editingExpertiseId && (
                      <button type="button" className="dashboard-btn secondary" onClick={cancelEditExpertise}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Active Expertise List */}
              <div className="dashboard-card">
                <div className="dashboard-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3>Homepage Expertise Items ({expertiseItems.length})</h3>
                    <p>Currently active sections in "What We Do" and "OUR EXPERTISE" grids on the homepage.</p>
                  </div>
                  <button 
                    type="button" 
                    className="dashboard-btn primary"
                    style={{ margin: 0, padding: '8px 16px', fontSize: '0.8rem' }}
                    onClick={() => {
                      cancelEditExpertise();
                      scrollToForm('expertise-form-container');
                    }}
                  >
                    + Add Expertise Item
                  </button>
                </div>

                <div className="dashboard-list-scroller">
                  {expertiseItems.length === 0 ? (
                    <div className="dashboard-empty-state">
                      <span>No active expertise items found.</span>
                    </div>
                  ) : (
                    expertiseItems.map((item) => (
                      <div key={item._id} className="dashboard-list-item">
                        <div className="list-item-header" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                          <img 
                            src={getMediaUrl(item.image)} 
                            alt={item.title} 
                            style={{ width: '70px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #e5e7eb' }} 
                            onError={e => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=70&auto=format&fit=crop';
                            }}
                          />
                          <div>
                            <span className="item-title" style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{item.title}</span>
                            <span className="item-meta" style={{ fontSize: '0.75rem', color: '#e10600', fontWeight: 'bold', display: 'block' }}>{item.category}</span>
                          </div>
                        </div>
                        <p className="list-item-description" style={{ marginTop: '8px', fontSize: '0.8rem', color: '#6b7280' }}>{item.description}</p>
                        
                        <div className="list-item-actions" style={{ marginTop: '8px' }}>
                          <button 
                            className="list-action-btn edit"
                            onClick={() => startEditExpertise(item)}
                          >
                            Edit
                          </button>
                          <button 
                            className="list-action-btn delete"
                            onClick={() => handleDeleteExpertise(item._id)}
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

          {activeTab === 'team' && (
            <div className="dashboard-grid animate-fade-in">
              
              {/* Form Card */}
              <div className="dashboard-card" id="team-form-container">
                <div className="dashboard-card-header">
                  <h3>{editingTeamMemberId ? 'Edit Team Member' : 'Add Team Member'}</h3>
                  <p>{editingTeamMemberId ? 'Update team member details and profile image.' : 'Enter details for the new team member.'}</p>
                </div>

                {teamFeedback.message && (
                  <div className={`feedback-alert ${teamFeedback.type}`}>
                    {teamFeedback.message}
                  </div>
                )}

                <form onSubmit={handleTeamSubmit} className="dashboard-form">
                  <div className="dashboard-form-group">
                    <label>FULL NAME</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Alex Mercer"
                      value={newTeamMember.name}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="dashboard-form-group">
                    <label>ROLE / DESIGNATION</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Founder / CEO"
                      value={newTeamMember.role}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                      required
                    />
                  </div>

                  <div className="dashboard-form-row">
                    <div className="dashboard-form-group">
                      <label>EMPLOYEE NUMBER</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 05"
                        value={newTeamMember.empNo}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, empNo: e.target.value })}
                      />
                    </div>
                    <div className="dashboard-form-group">
                      <label>DISPLAY ORDER</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 1 (Lower numbers show first)"
                        value={newTeamMember.order}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, order: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>

                  <div className="dashboard-form-group">
                    <label>PROFILE PHOTO</label>
                    <FileUploadWidget 
                      value={newTeamMember.image}
                      onChange={(url) => setNewTeamMember({ ...newTeamMember, image: url })}
                      acceptType="image"
                    />
                    <small className="field-hint">// Upload profile photo (JPG, PNG, WebP) or paste a CDN URL.</small>
                  </div>

                  <div className="dashboard-form-group">
                    <label>DEPARTMENT SECTION</label>
                    <input 
                      type="text" 
                      placeholder="e.g. ADMINISTRATIVE CORE"
                      value={newTeamMember.department}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, department: e.target.value })}
                      required
                    />
                  </div>

                  <div className="dashboard-form-group">
                    <label>BIO SUMMARY</label>
                    <textarea 
                      rows={5}
                      placeholder="Enter team member bio details..."
                      value={newTeamMember.bio}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, bio: e.target.value })}
                      required
                    />
                  </div>

                  <div className="dashboard-form-actions">
                    <button type="submit" className="dashboard-btn primary">
                      {editingTeamMemberId ? 'Save Changes' : 'Add Team Member'}
                    </button>
                    {editingTeamMemberId && (
                      <button type="button" className="dashboard-btn secondary" onClick={cancelEditTeamMember}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* List Card */}
              <div className="dashboard-card">
                <div className="dashboard-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3>Active Team Members ({teamMembers.length})</h3>
                    <p>Current team members displayed on the About page.</p>
                  </div>
                  <button 
                    type="button" 
                    className="dashboard-btn primary"
                    style={{ margin: 0, padding: '8px 16px', fontSize: '0.8rem' }}
                    onClick={() => {
                      cancelEditTeamMember();
                      scrollToForm('team-form-container');
                    }}
                  >
                    + Add Team Member
                  </button>
                </div>

                <div className="dashboard-list-scroller">
                  {teamMembers.length === 0 ? (
                    <div className="dashboard-empty-state">
                      <span>No team members found.</span>
                    </div>
                  ) : (
                    teamMembers.map((member) => (
                      <div key={member._id} className="dashboard-list-item">
                        <div className="list-item-header" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                          {member.image ? (
                            <img 
                              src={getMediaUrl(member.image)} 
                              alt={member.name} 
                              style={{ 
                                width: '50px', 
                                height: '50px', 
                                borderRadius: '8px', 
                                objectFit: 'cover',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                              }} 
                            />
                          ) : (
                            <div 
                              style={{ 
                                width: '50px', 
                                height: '50px', 
                                borderRadius: '8px', 
                                background: member.gradient || 'var(--color-primary-dark)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                fontFamily: 'Share Tech Mono, monospace'
                              }}
                            >
                              {member.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="item-title" style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{member.name}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-primary, #e10600)', fontWeight: 600, display: 'block', margin: '2px 0' }}>{member.role || 'No Role Assigned'}</span>
                            <span style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                              {member.department ? member.department.replace(/_/g, ' ') : 'CREATIVE 3D LAB'}
                            </span>
                          </div>
                          <div style={{ marginLeft: 'auto' }}>
                            <span style={{ fontSize: '0.72rem', background: '#dc2626', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                              Order: {member.order !== undefined ? member.order : 0}
                            </span>
                          </div>
                        </div>
                        <p className="list-item-description" style={{ marginTop: '8px', fontSize: '0.8rem', color: '#6b7280' }}>
                          {member.bio}
                        </p>

                        
                        <div className="list-item-actions" style={{ marginTop: '8px' }}>
                          <button 
                            className="list-action-btn edit"
                            onClick={() => startEditTeamMember(member)}
                          >
                            Edit
                          </button>
                          <button 
                            className="list-action-btn delete"
                            onClick={() => handleDeleteTeamMember(member._id)}
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

          {activeTab === 'about' && (
            <div className="dashboard-grid animate-fade-in">
              
              {/* Form Card */}
              <div className="dashboard-card" id="about-form-container">
                <div className="dashboard-card-header">
                  <h3>{editingAboutPhotoId ? 'Edit About Photo' : 'Add About Photo'}</h3>
                  <p>{editingAboutPhotoId ? 'Update photo details and image URL.' : 'Enter details for a new photo card.'}</p>
                </div>

                {aboutFeedback.message && (
                  <div className={`feedback-alert ${aboutFeedback.type}`}>
                    {aboutFeedback.message}
                  </div>
                )}

                <form onSubmit={handleAboutSubmit} className="dashboard-form">
                  <div className="dashboard-form-group">
                    <label>IDENTIFIER KEY</label>
                    <select
                      value={newAboutPhoto.key}
                      onChange={(e) => setNewAboutPhoto({ ...newAboutPhoto, key: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '0.85rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        background: '#fff',
                        color: '#1f2937',
                        height: '42px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">Select photo slot/position...</option>
                      <option value="about_us_1">About Us - Workspace Image 1</option>
                      <option value="about_us_2">About Us - Artists Image 2</option>
                      <option value="studio_floor_1">Studio Floor - VFX Bay Image 3</option>
                      <option value="studio_floor_2">Studio Floor - Audio Suite Image 4</option>
                    </select>
                    <small className="field-hint">// Selecting a key binds it to the corresponding image frame on the About Page.</small>
                  </div>

                  <div className="dashboard-form-group">
                    <label>TITLE / ALT TEXT</label>
                    <input 
                      type="text" 
                      placeholder="e.g. VFX Synthesis Bay"
                      value={newAboutPhoto.title}
                      onChange={(e) => setNewAboutPhoto({ ...newAboutPhoto, title: e.target.value })}
                    />
                  </div>

                  <div className="dashboard-form-group">
                    <label>LABEL TEXT (FOR STUDIO FLOOR)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. // ZONE_01: VFX SYNTHESIS BAY"
                      value={newAboutPhoto.label}
                      onChange={(e) => setNewAboutPhoto({ ...newAboutPhoto, label: e.target.value })}
                    />
                  </div>

                  <div className="dashboard-form-group">
                    <label>PRIMARY PHOTO IMAGE URL</label>
                    <FileUploadWidget 
                      value={newAboutPhoto.imageUrl}
                      onChange={(url) => setNewAboutPhoto(prev => {
                        const updatedUrls = [...(prev.imageUrls || [])];
                        if (updatedUrls.length === 0) {
                          updatedUrls.push(url);
                        } else {
                          updatedUrls[0] = url;
                        }
                        return {
                          ...prev,
                          imageUrl: url,
                          imageUrls: updatedUrls
                        };
                      })}
                      acceptType="image"
                    />
                    <small className="field-hint">// Upload main about photo or paste a CDN URL.</small>
                  </div>

                  <div className="dashboard-form-group" style={{ marginTop: '15px' }}>
                    <label>ADDITIONAL SLIDER GALLERY IMAGES ({newAboutPhoto.imageUrls?.length || 0})</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                      {newAboutPhoto.imageUrls && newAboutPhoto.imageUrls.map((imgUrl, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: '#6b7280', width: '20px' }}>{idx + 1}.</span>
                          <div style={{ flex: 1 }}>
                            <FileUploadWidget 
                              value={imgUrl}
                              onChange={(url) => {
                                const updated = [...(newAboutPhoto.imageUrls || [])];
                                updated[idx] = url;
                                setNewAboutPhoto(prev => ({
                                  ...prev,
                                  imageUrl: idx === 0 ? url : prev.imageUrl,
                                  imageUrls: updated
                                }));
                              }}
                              acceptType="image"
                            />
                          </div>
                          <button 
                            type="button" 
                            className="dashboard-btn delete" 
                            style={{ padding: '0 12px', height: '42px', margin: 0 }}
                            onClick={() => {
                              const updated = (newAboutPhoto.imageUrls || []).filter((_, i) => i !== idx);
                              setNewAboutPhoto(prev => ({
                                ...prev,
                                imageUrl: prev.imageUrl === imgUrl ? (updated[0] || '') : prev.imageUrl,
                                imageUrls: updated
                              }));
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button 
                        type="button" 
                        className="dashboard-btn primary" 
                        style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => {
                          setNewAboutPhoto(prev => ({
                            ...prev,
                            imageUrls: [...(prev.imageUrls || []), '']
                          }));
                        }}
                      >
                        + Add Slider Image
                      </button>
                    </div>
                    <small className="field-hint">// Add multiple images here. When multiple images are added, this slot will automatically become an interactive slider/carousel on the website.</small>
                  </div>

                  <div className="dashboard-form-actions">
                    <button type="submit" className="dashboard-btn primary">
                      {editingAboutPhotoId ? 'Save Changes' : 'Add Photo'}
                    </button>
                    {editingAboutPhotoId && (
                      <button type="button" className="dashboard-btn secondary" onClick={cancelEditAboutPhoto}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* List Card */}
              <div className="dashboard-card">
                <div className="dashboard-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3>Active About Page Photos ({aboutPhotos.length})</h3>
                    <p>Current images displayed on the About Us and Studio Floor sections.</p>
                  </div>
                  <button 
                    type="button" 
                    className="dashboard-btn primary"
                    style={{ margin: 0, padding: '8px 16px', fontSize: '0.8rem' }}
                    onClick={() => {
                      cancelEditAboutPhoto();
                      scrollToForm('about-form-container');
                    }}
                  >
                    + Add Photo
                  </button>
                </div>

                <div className="dashboard-list-scroller">
                  {aboutPhotos.length === 0 ? (
                    <div className="dashboard-empty-state">
                      <span>No photos found.</span>
                    </div>
                  ) : (
                    aboutPhotos.map((photo) => (
                      <div key={photo._id} className="dashboard-list-item">
                        <div className="list-item-header" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                          <img 
                            src={getMediaUrl(photo.imageUrl)} 
                            alt={photo.title || photo.key} 
                            style={{ 
                              width: '70px', 
                              height: '50px', 
                              borderRadius: '6px', 
                              objectFit: 'cover',
                              border: '1px solid rgba(0, 0, 0, 0.1)'
                            }} 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=70&auto=format&fit=crop';
                            }}
                          />
                          <div>
                            <span className="item-title" style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{photo.title || 'No Title'}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-primary, #e10600)', fontWeight: 600, display: 'block', margin: '2px 0' }}>
                              Key Slot: {photo.key}
                            </span>
                            {photo.label && (
                              <span style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                                {photo.label}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="list-item-actions" style={{ marginTop: '8px' }}>
                          <button 
                            className="list-action-btn edit"
                            onClick={() => startEditAboutPhoto(photo)}
                          >
                            Edit
                          </button>
                          <button 
                            className="list-action-btn delete"
                            onClick={() => handleDeleteAboutPhoto(photo._id)}
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
