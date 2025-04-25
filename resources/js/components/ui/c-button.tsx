import { LucideIcon } from "lucide-react";
import clsx from "clsx";
import { Button } from "./button";

export function CButton(props: {
    type?: "primary" | "danger" | "submit";
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
}) {
    return (
        <Button
            type={props.type === "submit" ? "submit" : "button"}
            onClick={props.type === "submit" ? undefined : props.onClick}
            className={clsx(
                props.type === "danger"
                    ? "bg-button-danger hover:bg-[#720508] bg-sidebar-ring2 cursor-pointer text-white shadow transition-colors"
                    : "bg-button-primary cursor-pointer text-white shadow hover:bg-[#475873] transition-colors",
                props.className
            )}
        >
            {props.children}
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