import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { SharedData, type MainNavItem, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

export function NavMain({ items = [], label = 'Platform' }: { items: NavItem[]; label?: string }) {
    const page = usePage();

    // Helper function to check if current URL matches the item href
    const isActiveItem = (href: string) => {
        const currentPath = page.url.split('?')[0]; // Remove query parameters
        return currentPath === href;
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={Boolean(item.href && isActiveItem(item.href))} tooltip={{ children: item.title }}>
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

export function NavCollabsibleMain({ items, label = 'Dashboard' }: { items: MainNavItem[]; label?: string }) {
    const { auth } = usePage<SharedData>().props;
    const page = usePage();

    // Helper function to check if current URL matches the item href
    const isActiveItem = (href: string, hasSubItems: boolean = false, isStandaloneItem: boolean = false) => {
        if (!href) return false;

        const currentPath = page.url.split('?')[0].split('#')[0]; // Remove query parameters and hash

        // Normalize paths by removing trailing slashes
        const normalizedCurrent = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
        const normalizedHref = href.endsWith('/') ? href.slice(0, -1) : href;

        // For items with sub-items, only match exact path to avoid always being active
        if (hasSubItems) {
            return normalizedCurrent === normalizedHref;
        }

        // For standalone items (items without submenus), check if it's a root-level item like Dashboard
        if (isStandaloneItem) {
            // If it's a very short path (like /dashboard), use exact matching to prevent always being active
            const pathSegments = normalizedHref.split('/').filter(Boolean);
            if (pathSegments.length <= 1) {
                return normalizedCurrent === normalizedHref;
            }
        }

        // For sub-menu items and longer standalone paths, allow nested matching
        if (normalizedCurrent === normalizedHref) {
            return true;
        }

        // Check if current path starts with href followed by a forward slash
        return normalizedCurrent.startsWith(normalizedHref + '/');
    };

    // State to manage collapsible items
    const [collapsibleStates, setCollapsibleStates] = useState<Record<string, boolean>>({});
    const [isInitialized, setIsInitialized] = useState(false);

    // Load saved states from localStorage on component mount
    useEffect(() => {
        const savedStates = localStorage.getItem('sidebar-collapsible-states');
        if (savedStates) {
            try {
                setCollapsibleStates(JSON.parse(savedStates));
            } catch (error) {
                console.error('Failed to parse saved collapsible states:', error);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save states to localStorage whenever they change (but only after initialization)
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('sidebar-collapsible-states', JSON.stringify(collapsibleStates));
        }
    }, [collapsibleStates, isInitialized]);

    // Function to toggle collapsible state
    const toggleCollapsible = (itemTitle: string, newState: boolean) => {
        setCollapsibleStates((prev) => ({
            ...prev,
            [itemTitle]: newState,
        }));
    };

    const visibleItems = items.filter((item) => {
        if (item.title === 'User Management') {
            return auth.user?.roles?.includes('super_admin');
        }

        return true;
    });

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {visibleItems.map((item) => {
                    // Check if current URL matches any subitem using the same logic as isActiveItem
                    const isAutoOpen = item.subitem?.some((sub) => isActiveItem(sub.href, false, false)) ?? false;

                    // Get the current state for this item - use saved state if available, otherwise use auto-open logic
                    const isCollapsibleOpen = collapsibleStates[item.title] !== undefined ? collapsibleStates[item.title] : isAutoOpen;

                    // If there are sub-items
                    if (item.subitem && item.subitem.length > 0) {
                        return (
                            <Collapsible
                                key={`${item.title}-${isInitialized}`}
                                asChild
                                defaultOpen={isCollapsibleOpen}
                                onOpenChange={(newOpen) => toggleCollapsible(item.title, newOpen)}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip={item.title}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden transition-all">
                                        <SidebarMenuSub>
                                            {item.subitem.map((subItem) => {
                                                const isSubItemActive = isActiveItem(subItem.href, false, false);
                                                return (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton asChild isActive={isSubItemActive}>
                                                            <Link href={subItem.href} prefetch>
                                                                {subItem.icon && <subItem.icon />}
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    // If there are no sub-items, this is a standalone item
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild tooltip={item.title} isActive={Boolean(item.href && isActiveItem(item.href, false, true))}>
                                <Link href={item.href ?? '#'}>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
