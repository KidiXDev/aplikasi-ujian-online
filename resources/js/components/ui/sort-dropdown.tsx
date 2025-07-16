import React from 'react';
import { router } from '@inertiajs/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface SortOption {
    value: string;
    label: string;
}

interface SortDropdownProps {
    currentValue?: string;
    options: SortOption[];
    routeName: string;
    routeParams?: Record<string, string | number>;
    className?: string;
}

export function SortDropdown({ 
    currentValue, 
    options, 
    routeName, 
    routeParams = {},
    className = "w-40"
}: SortDropdownProps) {
    const handleSortChange = (sortValue: string) => {
        const currentParams = route().params || {};
        
        router.visit(route(routeName, routeParams), {
            data: {
                ...currentParams,
                sort: sortValue,
                page: 1, // Reset to first page when sorting
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <Select value={currentValue || 'newest'} onValueChange={handleSortChange}>
                <SelectTrigger className={className}>
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
