import { useState, useEffect } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

const CacheManager = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Listen for service worker updates
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Check for updates every 5 minutes
        const checkForUpdates = () => {
          reg.update().then(() => {
            if (reg.installing || reg.waiting) {
              setUpdateAvailable(true);
            }
          });
        };

        // Initial check
        checkForUpdates();

        // Set up periodic checks
        const interval = setInterval(checkForUpdates, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
      });

      // Listen for controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Send message to service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        // Reload to fetch fresh content
        window.location.reload();
      } catch (error) {
        logger.error('Failed to clear cache:', error);
      }
    }
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-background/95 backdrop-blur-md border border-border rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <RefreshCw className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">Update Available</h4>
          <p className="text-xs text-muted-foreground mb-3">
            A new version is available. Refresh to get the latest features and improvements.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleUpdate}
              className="h-8 px-3 text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Update
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              className="h-8 px-3 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheManager;
