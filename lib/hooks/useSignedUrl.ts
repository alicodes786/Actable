import { useState, useEffect } from 'react';
import { getSecureImageUrl } from '@/db/submissions';

// Shared interval ID
let globalInterval: NodeJS.Timeout | null = null;
const REFRESH_INTERVAL = 45 * 60 * 1000; // 45 minutes
const activeUrls = new Set<string>();

export function useSignedUrl(path: string | null) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!path) return;

        const refreshUrl = async () => {
            try {
                const newUrl = await getSecureImageUrl(path);
                setUrl(newUrl);
                console.log('New URL generated at:', new Date().toISOString());
            } catch (error) {
                console.error('Failed to refresh signed URL:', error);
            }
        };

        // Add path to active URLs and create interval if needed
        activeUrls.add(path);
        if (!globalInterval) {
            refreshUrl();
            globalInterval = setInterval(() => {
                activeUrls.forEach(async (activePath) => {
                    try {
                        const newUrl = await getSecureImageUrl(activePath);
                        // Trigger re-render for components using this path
                        window.dispatchEvent(new CustomEvent('url-refreshed', {
                            detail: { path: activePath, url: newUrl }
                        }));
                    } catch (error) {
                        console.error('Failed to refresh URL:', error);
                    }
                });
            }, REFRESH_INTERVAL);
        } else {
            refreshUrl();
        }

        return () => {
            activeUrls.delete(path);
            if (activeUrls.size === 0 && globalInterval) {
                clearInterval(globalInterval);
                globalInterval = null;
            }
        };
    }, [path]);

    return url;
} 