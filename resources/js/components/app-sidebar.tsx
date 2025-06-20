import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { MainNavItem, NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Book,
    CalendarClock,
    GraduationCap,
    Home,
    Monitor,
    Server,
    Settings,
    ShieldAlert,
    ShieldCheck,
    UserRound,
    UsersRound,
} from 'lucide-react';
import AppLogo from './app-logo';
import { NavFooter } from './nav-footer';
import { NavCollabsibleMain } from './nav-main';

const footerItem: NavItem[] = [
    {
        title: 'Repository',
        icon: Book,
        href: 'https://github.com/KidiXDev/aplikasi-ujian-online',
    },
    {
        title: 'Settings',
        icon: Settings,
        href: '/settings/profile',
    },
];

const items: MainNavItem[] = [
    {
        title: 'Dashboard',
        icon: Home,
        href: '/dashboard',
    },
    {
        title: 'Master Data',
        icon: Server,
        subitem: [
            {
                title: 'Peserta',
                href: '/master-data/peserta',
                icon: UserRound,
            },
            {
                title: 'Dosen',
                href: '/master-data/dosen',
                icon: UsersRound,
            },
            {
                title: 'Kategori Ujian',
                href: '/master-data/peserta',
                icon: Book,
            },
            {
                title: 'Jenis Ujian',
                href: '/master-data/jenis-ujian',
                icon: Book,
            },
            
            {
                title: 'Event',
                href: '/master-data/event',
                icon: Book,
            },
            {
                title: 'Paket Soal',
                href: '/master-data/paket-soal',
                icon: Book,
            },
            {
                title: 'Bank Soal',
                href: '/master-data/bank-soal',
                icon: Book,
            },
        ],
    },
    {
        title: 'User Management',
        icon: Server,
        subitem: [
            {
                title: 'User',
                href: '/user-management/user',
                icon: UserRound,
            },
            {
                title: 'Roles',
                href: '/user-management/roles',
                icon: ShieldCheck,
            },
            {
                title: 'Permissions',
                href: '/user-management/permissions',
                icon: ShieldAlert,
            },
        ],
    },
    {
        title: 'Jadwal Ujian',
        icon: CalendarClock,
        href: '/penjadwalan',
    },
    {
        title: 'Monitoring',
        icon: Monitor,
        href: '/monitoring-ujian',
    },
    {
        title: 'Rekap Nilai',
        icon: GraduationCap,
        href: '/rekap-nilai',
    },
];

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Repository',
//         href: 'https://github.com/laravel/react-starter-kit',
//         icon: Folder,
//     },
//     {
//         title: 'Documentation',
//         href: 'https://laravel.com/docs/starter-kits',
//         icon: BookOpen,
//     },
// ];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" defaultChecked variant="inset" className="shadow-xl shadow-black/50">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* <NavMain items={mainNavItems} label="Dashboard" /> */}
                <NavCollabsibleMain items={items} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                {/* <NavUser /> */}
                <NavFooter items={footerItem} />
            </SidebarFooter>
        </Sidebar>
    );
}
