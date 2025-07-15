import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Copy, FileText, Monitor, RefreshCw, Users, Settings, Clock } from 'lucide-react';
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
        { title: 'Kelola Soal', href: 'master-data/paket-soal', description: 'Tambah dan edit soal ujian', icon: FileText },
        { title: 'Kelola Peserta', href: 'master-data/peserta', description: 'Manajemen data peserta ujian', icon: Users },
        { title: 'Laporan Nilai', href: 'rekap-nilai', description: 'Melihat hasil dan keluaran nilai ujian', icon: CheckCircle },
        { title: 'Kelola Ujian', href: 'penjadwalan', description: 'Melihat dan mengatur jadwal ujian', icon: Monitor },
        { title: 'Kelola Event', href: 'master-data/event', description: 'Melihat event ujian yang sedang berjalan', icon: FileText },
        { title: 'Monitoring Ujian', href: 'monitoring-ujian', description: 'Mengelola dan memantau jalannya ujian', icon: Settings },
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
                toast.success(data.message || 'Token berhasil diperbarui');
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
                second: '2-digit'
            }),
            date: currentTime.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="p-6">
                {/* Header dengan Jam */}
                <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                            <p className="text-gray-600">Selamat datang di sistem ujian online</p>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-green-200 border border-blue-200 p-4 shadow-sm">
                            <Clock className="h-6 w-6 text-black-600" />
                            <div className="text-center">
                                <p className="text-2xl text-gray-900 font-mono">{formatCurrentTime().time}</p>
                                <p className="text-xs text-gray-600 mt-1">{formatCurrentTime().date}</p>
                            </div>
                        </div>
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
                                className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md hover:border-blue-200 group"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                        <shortcut.icon className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <h3 className="mb-1 text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{shortcut.title}</h3>
                                <p className="text-sm text-gray-600">{shortcut.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Dashboard Section - Layout Diperbaiki */}
                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">Token Management</h2>
                    <div className="flex justify-center">
                        {/* Token Card - Layout Diperbaiki */}
                        <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                            <Copy className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Token Ujian</h3>
                                            <p className="text-sm text-gray-500">Token akses untuk peserta ujian</p>
                                        </div>
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            currentToken.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {currentToken.status === 1 ? 'Aktif' : 'Tidak Aktif'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="mb-4 text-center">
                                    <div className="mb-2 inline-block rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-8 py-4">
                                        <span className="font-mono text-4xl font-bold tracking-wider text-gray-800 select-all">
                                            {currentToken.token}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">Klik token untuk menyalin</p>
                                </div>
                                <div className="mb-4 rounded-lg bg-gray-50 p-3">
                                    <p className="text-center text-sm text-gray-600">
                                        Terakhir diperbarui: <span className="font-medium">{formatDateTime(currentToken.waktu)}</span>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={copyTokenToClipboard}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                    >
                                        <Copy className="h-4 w-4" />
                                        Salin Token
                                    </button>
                                    <button
                                        onClick={generateNewToken}
                                        disabled={isGenerating}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:bg-gray-400"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                                        {isGenerating ? 'Generating...' : 'Buat Baru'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
