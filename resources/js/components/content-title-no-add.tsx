import React from 'react';

interface ContentTitleProps {
    title: string;
    buttonText?: string;
    buttonIcon?: React.ReactNode;
    buttonType?: 'primary' | 'danger';
    showButton?: boolean;
    onButtonClick?: () => void;
}

export function ContentTitleNoadd({ title }: ContentTitleProps) {
    return (
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{title}</h1>
        </div>
    );
}
