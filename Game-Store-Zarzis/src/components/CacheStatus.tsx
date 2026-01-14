import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database } from 'lucide-react';

interface CacheStatusProps {
  className?: string;
}

const CacheStatus = ({ className = '' }: CacheStatusProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheStatus, setCacheStatus] = useState<'checking' | 'cached' | 'uncached'>('checking');
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check cache status
    const checkCache = async () => {
      try {
        if ('serviceWorker' in navigator && 'caches' in window) {
          const cacheNames = await caches.keys();
          const hasCache = cacheNames.some(name => name.includes('gamestore'));
          setCacheStatus(hasCache ? 'cached' : 'uncached');
        } else {
          setCacheStatus('uncached');
        }
      } catch (error) {
        setCacheStatus('uncached');
      }
    };

    checkCache();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus && isOnline) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-md transition-all duration-300 ${
        isOnline
          ? 'bg-green-500/10 border-green-500/20 text-green-400'
          : 'bg-red-500/10 border-red-500/20 text-red-400'
      } ${className}`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Online</span>
          {cacheStatus === 'cached' && (
            <>
              <Database className="w-4 h-4 ml-2" />
              <span className="text-xs">Cached</span>
            </>
          )}
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Offline</span>
          {cacheStatus === 'cached' && (
            <>
              <Database className="w-4 h-4 ml-2" />
              <span className="text-xs">Using Cache</span>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CacheStatus;
