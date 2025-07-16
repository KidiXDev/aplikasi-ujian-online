import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { MainNavItem, NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Book,
    CalendarClock,
    Github,
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
        icon: Github,
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
                href: '/dashboard/master-data/peserta',
                icon: UserRound,
            },
            {
                title: 'Dosen',
                href: '/dashboard/master-data/dosen',
                icon: UsersRound,
            },
            {
                title: 'Kategori Ujian',
                href: '/dashboard/master-data/kategori-soal',
                icon: Book,
            },
            {
                title: 'Jenis Ujian',
                href: '/dashboard/master-data/jenis-ujian',
                icon: Book,
            },
            {
                title: 'Bank Soal',
                href: '/dashboard/master-data/bank-soal',
                icon: Book,
            },
            {
                title: 'Paket Soal',
                href: '/dashboard/master-data/event',
                icon: Book,
            },
            // {
            //     title: 'Paket Soal',
            //     href: '/dashboard/master-data/paket-soal',
            //     icon: Book,
            // },
        ],
    },
    {
        title: 'User Management',
        icon: Server,
        subitem: [
            {
                title: 'User',
                href: '/dashboard/user-management/user',
                icon: UserRound,
            },
            {
                title: 'Roles',
                href: '/dashboard/user-management/roles',
                icon: ShieldCheck,
            },
            {
                title: 'Permissions',
                href: '/dashboard/user-management/permissions',
                icon: ShieldAlert,
            },
        ],
    },
    {
        title: 'Jadwal Ujian',
        icon: CalendarClock,
        href: '/dashboard/penjadwalan',
    },
    {
        title: 'Monitoring',
        icon: Monitor,
        href: '/dashboard/monitoring-ujian',
    },
    {
        title: 'Rekap Nilai',
        icon: GraduationCap,
        href: '/dashboard/rekap-nilai',
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
        <Sidebar collapsible="icon" defaultChecked={false} variant="inset" className="shadow-xl shadow-black/50">
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
