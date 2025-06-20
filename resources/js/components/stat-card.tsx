import clsx from 'clsx';
import { LucideIcon, User } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    className?: string;
}

export const StatCard = ({ title, value, icon: Icon = User, className }: StatCardProps) => {
    return (
        <div className={clsx('flex flex-1 items-center rounded-xl border p-4 transition-shadow duration-300 hover:shadow-lg', className)}>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-300">
                <Icon className="h-8 w-8" />
            </div>
            <div className="ml-4 flex flex-col">
                <span className="text-sm">{title}</span>
                <span className="text-2xl font-bold">{value}</span>
            </div>
        </div>
    );
};
