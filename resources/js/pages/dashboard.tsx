import { TokenMenu } from '@/components/token-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, Clock, FileText, Monitor, Settings, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface TokenData {
    token: string;
    waktu: string | null;
    status: number;
}

export default function Dashboard() {
    const [currentToken, setCurrentToken] = useState<TokenData>({
        token: 'Loading...',
        waktu: null,
        status: 0,
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Shortcuts data
    const shortcuts = [
        { title: 'Kelola Jenis Ujian', href: 'master-data/jenis-ujian', description: 'Tambah dan edit jenis ujian', icon: FileText },
        { title: 'Kelola Peserta', href: 'master-data/peserta', description: 'Manajemen data peserta ujian', icon: Users },
        { title: 'Laporan Nilai', href: 'rekap-nilai', description: 'Melihat hasil dan keluaran nilai ujian', icon: CheckCircle },
        { title: 'Kelola Jadwal Ujian', href: 'penjadwalan', description: 'Melihat dan mengatur jadwal ujian', icon: Settings },
        { title: 'Kelola Event', href: 'master-data/event', description: 'Melihat event ujian yang sedang berjalan', icon: FileText },
        { title: 'Monitoring Ujian', href: 'monitoring-ujian', description: 'Mengelola dan memantau jalannya ujian', icon: Monitor },
    ];

    // Fetch current token on component mount
    useEffect(() => {
        fetchCurrentToken();

        // Update clock every second
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const fetchCurrentToken = async () => {
        try {
            const response = await fetch(route('token.current'));
            const data = await response.json();
            setCurrentToken(data);
        } catch (error) {
            console.error('Error fetching token:', error);
            toast.error('Gagal mengambil token');
        }
    };

    const generateNewToken = async () => {
        setIsGenerating(true);
        try {
            console.log('Generating new token...');

            // Gunakan GET request (tidak perlu CSRF)
            const response = await fetch(route('token.generate'), {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response:', data);

            if (data.success) {
                setCurrentToken({
                    token: data.token,
                    waktu: data.waktu,
                    status: 1,
                });
                fetchCurrentToken();
            } else {
                toast.error(data.message || 'Gagal memperbarui token');
            }
        } catch (error) {
            console.error('Error generating token:', error);
            toast.error('Gagal memperbarui token: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsGenerating(false);
        }
    };

    const copyTokenToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(currentToken.token);
            toast.success('Token berhasil disalin');
        } catch (error) {
            console.error('Error copying token:', error);
            toast.error('Gagal menyalin token');
        }
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('id-ID');
    };

    const formatCurrentTime = () => {
        return {
            time: currentTime.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
            date: currentTime.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="p-6">
                {/* Header dengan Jam dan Token */}
                <div className="mb-8 flex gap-4">
                    <div className="flex w-full rounded-lg border border-gray-200 bg-white p-6">
                        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Dashboard Title */}
                            <div className="flex flex-col justify-center">
                                <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                                <p className="text-gray-600">Selamat datang di sistem ujian online</p>
                            </div>
                            {/* Clock Section */}
                            <div className="flex items-center justify-end">
                                <div className="flex items-center gap-4 rounded-lg border border-blue-300 bg-gradient-to-r from-blue-50 via-green-100 to-blue-50 p-4 shadow-md transition-all duration-300">
                                    <div className="relative flex items-center justify-center">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-200 opacity-60"></span>
                                        <Clock className="h-8 w-8 text-blue-600 drop-shadow" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-mono text-3xl font-bold tracking-widest text-gray-900 drop-shadow-sm">
                                            {formatCurrentTime().time}
                                        </p>
                                        <p className="mt-1 text-xs font-medium text-gray-700">{formatCurrentTime().date}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Token Menu */}
                    <div className="flex items-start">
                        <TokenMenu
                            currentToken={currentToken}
                            isGenerating={isGenerating}
                            copyTokenToClipboard={copyTokenToClipboard}
                            generateNewToken={generateNewToken}
                            formatDateTime={formatDateTime}
                        />
                    </div>
                </div>

                {/* Shortcuts Section */}
                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Shortcuts</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {shortcuts.map((shortcut, index) => (
                            <Link
                                key={index}
                                href={shortcut.href}
                                className="group rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:border-blue-200 hover:shadow-md"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 transition-colors group-hover:bg-blue-100">
                                        <shortcut.icon className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <h3 className="mb-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                                    {shortcut.title}
                                </h3>
                                <p className="text-sm text-gray-600">{shortcut.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* New Help Section */}
                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">Bantuan</h2>
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <ul className="space-y-1 text-sm text-blue-700">
                            <li>
                                <a
                                    onClick={() => {
                                        router.visit('/dashboard/faq');
                                    }}
                                    className="cursor-pointer hover:underline"
                                >
                                    FAQ Ujian Online
                                </a>
                            </li>
                            <li>
                                <a href="/help" className="hover:underline">
                                    Panduan Penggunaan
                                </a>
                            </li>
                            <li>
                                <a href="mailto:support@example.com" className="hover:underline">
                                    Kontak Admin
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
