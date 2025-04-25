import { Plus } from 'lucide-react';
import React from 'react';
import { CButton } from './ui/c-button';

interface ContentTitleProps {
    title: string;
    buttonText?: string;
    buttonIcon?: React.ReactNode;
    buttonType?: 'primary' | 'danger';
    showButton?: boolean;
    onButtonClick?: () => void;
}

export function ContentTitle({
    title,
    buttonText = 'Add',
    buttonIcon = <Plus />,
    buttonType = 'primary',
    showButton = true,
    onButtonClick,
}: ContentTitleProps) {
    return (
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{title}</h1>
            {showButton && (
                <CButton type={buttonType} onClick={onButtonClick}>
                    <div className="flex items-center gap-1">
                        {buttonIcon}
                        {buttonText && <span>{buttonText}</span>}
                    </div>
                </CButton>
            )}
        </div>
    );
}
