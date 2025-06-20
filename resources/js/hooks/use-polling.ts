import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef } from 'react';

interface UsePollingOptions {
    interval: number; // in milliseconds
    onlyKeys?: string[]; // keys to reload in Inertia request
    enabled?: boolean; // whether polling is enabled
    key?: string | number; // unique key that will restart polling when changed
}

/**
 * Custom hook for polling data at regular intervals using Inertia.js
 *
 * @param options - Configuration options for polling
 * @param options.interval - Polling interval in milliseconds
 * @param options.onlyKeys - Array of keys to reload in Inertia request (optional)
 * @param options.enabled - Whether polling is enabled (default: true)
 * @param options.key - Unique key that will restart polling when changed (optional)
 *
 * @example
 * // Basic usage
 * usePolling({
 *   interval: 3000,
 *   onlyKeys: ['studentsData', 'stats']
 * });
 *
 * @example
 * // With key to restart when it changes
 * usePolling({
 *   interval: 5000,
 *   onlyKeys: ['data'],
 *   key: userId,
 *   enabled: isActive
 * });
 *
 * @returns Object with methods to control polling
 */
export function usePolling({ interval, onlyKeys, enabled = true, key }: UsePollingOptions) {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const startPolling = useCallback(() => {
        clearPolling(); // Clear any existing interval

        if (!enabled) return;

        intervalRef.current = setInterval(() => {
            router.reload({
                only: onlyKeys,
            });
        }, interval);
    }, [interval, onlyKeys, enabled, clearPolling]);

    useEffect(() => {
        startPolling();
        return clearPolling;
    }, [startPolling, clearPolling, key]); // Include key in dependencies to restart when it changes

    return {
        start: startPolling,
        stop: clearPolling,
        restart: startPolling,
    };
}
