import React from 'react';
import { router } from '@inertiajs/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface StatusFilterProps {
    currentValue?: string;
    routeName: string;
    routeParams?: Record<string, string | number>;
}

export function StatusFilter({ currentValue, routeName, routeParams = {} }: StatusFilterProps) {
    const handleStatusChange = (status: string) => {
        router.visit(route(routeName, routeParams), {
            data: {
                status: status === 'all' ? undefined : status,
                search: route().params.search,
                pages: route().params.pages,
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <Select value={currentValue || 'all'} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="finish">Finish</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
