// Dynamically resolve API Base URL based on where the app is running
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // If a production API URL is provided in the environment, use it
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  // Fallback for local network access:
  // If we are accessing the app via a local IP (e.g., http://192.168.1.50:5173),
  // dynamically talk to the backend on that same IP but port 5000.
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Check if it's a local network IP address or localhost
    const isLocal = hostname === 'localhost' || 
                    hostname === '127.0.0.1' || 
                    /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname);
    
    if (isLocal) {
      return `http://${hostname}:5000/api`;
    }
  }

  // Default fallback (e.g., when building or deployed on Vercel with local env vars or without env vars)
  // If the envUrl contains localhost/127.0.0.1 and we are not running locally, it is a local dev URL
  // accidentally bundled or configured for production. In this case, ignore it and use the live backend.
  return 'https://api.xaltstudios.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

// A robust helper to rewrite media URLs dynamically.
// If the database returns a localhost URL, this function will rewrite it
// to use the correct domain/IP of the backend.
export const getMediaUrl = (url: string): string => {
  if (!url) return '';
  
  // If the URL is a relative path or legacy asset path
  if (url.startsWith('/src/assets/images/')) {
    const filename = url.substring(url.lastIndexOf('/') + 1);
    url = `/uploads/${filename}`;
  }
  
  // Get the base backend host (e.g., "http://192.168.1.100:5000" or "https://backend-production.com")
  const apiBase = API_BASE_URL;
  const backendOrigin = apiBase.replace(/\/api\/?$/, ''); // Remove trailing "/api"
  
  // If the url contains localhost:5000, rewrite the hostname to match the current backendOrigin
  if (url.includes('localhost:5000')) {
    return url.replace('http://localhost:5000', backendOrigin);
  }
  
  // If the url is relative (e.g., "/uploads/file.jpg"), prepend the backend origin
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${backendOrigin}${cleanPath}`;
  }
  
  return url;
};
