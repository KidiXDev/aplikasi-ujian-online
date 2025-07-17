import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Moon, Sun } from 'lucide-react';
import { HTMLAttributes, useState } from 'react';

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();
    const [showDarkModeDialog, setShowDarkModeDialog] = useState(false);

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
    ];

    const handleTabClick = (value: Appearance) => {
        if (value === 'dark') {
            setShowDarkModeDialog(true);
        } else {
            updateAppearance(value);
        }
    };

    return (
        <>
            <div className={cn('inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800', className)} {...props}>
                {tabs.map(({ value, icon: Icon, label }) => (
                    <button
                        key={value}
                        onClick={() => handleTabClick(value)}
                        className={cn(
                            'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                            appearance === value
                                ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                                : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                        )}
                    >
                        <Icon className="-ml-1 h-4 w-4" />
                        <span className="ml-1.5 text-sm">{label}</span>
                    </button>
                ))}
            </div>

            <Dialog open={showDarkModeDialog} onOpenChange={setShowDarkModeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Under Development</DialogTitle>
                        <DialogDescription>Dark mode is currently not supported</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowDarkModeDialog(false)}>OK</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
