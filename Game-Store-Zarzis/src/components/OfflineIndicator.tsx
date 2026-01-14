import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const OfflineIndicator = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const { t } = useLanguage();

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className={cn(
            "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50",
            "bg-destructive/90 text-destructive-foreground backdrop-blur-sm",
            "p-4 rounded-lg shadow-lg border border-destructive/50",
            "flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300"
        )}>
            <WifiOff className="w-5 h-5 shrink-0" />
            <div className="flex-1 text-sm">
                <p className="font-semibold">No Internet Connection</p>
                <p className="opacity-90">You are currently offline. Some features may be limited.</p>
            </div>
        </div>
    );
};

export default OfflineIndicator;
