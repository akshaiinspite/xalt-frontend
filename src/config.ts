// Dynamically resolve API Base URL based on environment
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || 
                    hostname === '127.0.0.1' || 
                    /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname);
    if (isLocal) {
      return `http://${hostname}:5015/api`;
    }
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim().length > 0 && !envUrl.includes('localhost')) {
    return envUrl;
  }
  return 'https://api.xaltstudios.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

// A robust helper to rewrite media URLs dynamically based on environment
export const getMediaUrl = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();

  // If already a full HTTP(S) URL, return directly
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  const isLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  );

  const baseMediaDomain = isLocal 
    ? `http://${window.location.hostname}:5015`
    : 'https://api.xaltstudios.com';
  
  if (trimmed.startsWith('/src/assets/images/')) {
    const filename = trimmed.substring(trimmed.lastIndexOf('/') + 1);
    return `${baseMediaDomain}/uploads/${filename}`;
  }
  
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const relativePath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${baseMediaDomain}${relativePath}`;
  }

  return trimmed;
};
