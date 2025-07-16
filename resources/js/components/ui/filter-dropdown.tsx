import React from 'react';
import { router } from '@inertiajs/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface FilterOption {
    value: string;
    label: string;
}

interface FilterDropdownProps {
    label: string;
    currentValue?: string;
    options: FilterOption[];
    routeName: string;
    routeParams?: Record<string, string | number>;
    paramName: string;
    placeholder?: string;
    className?: string;
}

export function FilterDropdown({ 
    label, 
    currentValue, 
    options, 
    routeName, 
    routeParams = {}, 
    paramName,
    placeholder = "Select option",
    className = "w-40"
}: FilterDropdownProps) {
    const handleChange = (value: string) => {
        const currentParams = route().params || {};
        
        router.visit(route(routeName, routeParams), {
            data: {
                ...currentParams,
                [paramName]: value === 'all' ? undefined : value,
                page: 1, // Reset to first page when filtering
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{label}:</span>
            <Select value={currentValue || 'all'} onValueChange={handleChange}>
                <SelectTrigger className={className}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All</SelectItem>
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
