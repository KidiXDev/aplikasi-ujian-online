import { LucideIcon } from "lucide-react";
import clsx from "clsx";
import { Button } from "./button";

type CButtonProps = {
    type?: "primary" | "danger" | "success" | "submit" | "button";
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    href?: string;
    download?: boolean;
};

export function CButton(props: CButtonProps) {
    const {
        type,
        className,
        children,
        onClick,
        disabled,
        href,
        download,
        ...rest
    } = props;

    const baseClass = clsx(
        type === "danger"
            ? "bg-button-danger hover:bg-[#720508] bg-sidebar-ring2 cursor-pointer text-white shadow transition-colors rounded p-2"
            : type === "success"
            ? "bg-green-600 hover:bg-green-700 cursor-pointer text-white shadow transition-colors rounded p-2"
            : "bg-button-primary cursor-pointer text-white shadow hover:bg-[#475873] transition-colors rounded p-2",
        className
    );

    // Jika ada href, render <a> agar bisa untuk download/link
    if (href) {
        return (
            <a
                href={href}
                download={download}
                className={baseClass}
                style={{ display: "inline-block", textDecoration: "none" }}
                {...rest}
            >
                {children}
            </a>
        );
    }

    // Default: render <Button>
    return (
        <Button
            type={
                type === "submit"
                    ? "submit"
                    : type === "button"
                    ? "button"
                    : "button"
            }
            onClick={onClick}
            disabled={disabled}
            className={baseClass}
            {...rest}
        >
            {children}
        </Button>
    );
}

export function CButtonIcon(props: {
    icon: LucideIcon;
    type?: "primary" | "danger";
    className?: string;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={props.onClick}
            className={clsx(
                props.type === "danger"
                    ? "bg-button-danger hover:bg-[#720508] bg-sidebar-ring2 cursor-pointer rounded p-2 text-white shadow transition-colors"
                    : "bg-button-primary cursor-pointer rounded p-2 text-white shadow hover:bg-[#475873] transition-colors",
                props.className
            )}
        >
            <props.icon className="h-4 w-4" />
        </button>
    );
}