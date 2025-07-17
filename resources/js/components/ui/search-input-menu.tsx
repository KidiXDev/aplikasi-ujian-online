import { router } from "@inertiajs/react";
import { Search } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { Input } from "./input";

interface SearchInputMenuProps {
    defaultValue?: string;
    placeholder?: string;
    routeName: string;
    routeParams?: Record<string, string | number>;
    paramName?: string;
    width?: string;
}

export function SearchInputMenu({
    defaultValue = "",
    placeholder = "Search...",
    routeName,
    routeParams = {},
    paramName = "search",
    width = "w-[300px]"
}: SearchInputMenuProps) {
    const [searchValue, setSearchValue] = useState(defaultValue);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialLoad = useRef(true);
    const lastSearchValue = useRef(defaultValue);
    const isSearching = useRef(false);

    // Sync dengan defaultValue saat props berubah, tapi hanya jika berbeda
    useEffect(() => {
        if (defaultValue !== lastSearchValue.current && !isSearching.current) {
            setSearchValue(defaultValue);
            lastSearchValue.current = defaultValue;
        }
    }, [defaultValue]);

    // Fungsi untuk melakukan search
    const performSearch = useCallback((value: string) => {
        if (isSearching.current) return;
        
        isSearching.current = true;
        
        // Get current URL parameters to preserve existing filters
        const currentParams = new URLSearchParams(window.location.search);
        const existingParams = Object.fromEntries(currentParams);
        
        const searchData = {
            ...existingParams,
            [paramName]: value.trim() || undefined,
            page: 1
        };

        // Remove undefined values
        Object.keys(searchData).forEach(key => {
            if (searchData[key] === undefined) {
                delete searchData[key];
            }
        });

        router.visit(route(routeName), {
            data: searchData,
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => {
                isSearching.current = false;
                lastSearchValue.current = value;
            }
        });
    }, [routeName, paramName]);

    // Debounced search - hanya trigger jika user benar-benar mengetik
    useEffect(() => {
        // Skip initial load
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }

        // Skip jika value sama dengan yang terakhir di-search
        if (searchValue === lastSearchValue.current) {
            return;
        }

        // Skip jika sedang dalam proses search
        if (isSearching.current) {
            return;
        }

        // Clear timeout sebelumnya
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set timeout baru
        timeoutRef.current = setTimeout(() => {
            performSearch(searchValue);
        }, 500);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [searchValue, performSearch]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchValue(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            // Clear timeout dan langsung search
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            
            const value = (e.target as HTMLInputElement).value;
            performSearch(value);
        }
    };

    return (
        <div className={`relative ${width}`}>
            <Input
                type="text"
                placeholder={placeholder}
                className="pl-10"
                value={searchValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isSearching.current}
            />
            <Search className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform" />
        </div>
    );
}
