import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Copy, FileText, Monitor, RefreshCw, Users, Calendar, Settings } from 'lucide-react';
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="p-6">
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

                {/* Dashboard Section */}
                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 min-h-[220px]">
                        {/* Tambah Ujian Card */}
                        <div className="rounded-lg border border-gray-200 bg-white p-8 flex flex-col items-center justify-center min-h-[180px]">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Tambah Ujian</h3>
                            <div className="flex items-center justify-center w-full">
                                <Link
                                    href="/penjadwalan"
                                    className="rounded-lg border border-gray-300 bg-gray-100 px-8 py-3 text-center font-medium text-gray-700 transition-colors hover:bg-gray-200 w-full max-w-xs"
                                >
                                    Tambah Ujian
                                </Link>
                            </div>
                        </div>

                        {/* Monitoring Ujian Card */}
                        <div className="rounded-lg border border-gray-200 bg-white p-8 flex flex-col items-center justify-center min-h-[180px]">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Monitoring Ujian</h3>
                            <div className="flex items-center justify-center w-full">
                                <Link
                                    href="/monitoring-ujian"
                                    className="rounded-lg border border-gray-300 bg-gray-100 px-8 py-3 text-center font-medium text-gray-700 transition-colors hover:bg-gray-200 w-full max-w-xs"
                                >
                                    Monitoring
                                </Link>
                            </div>
                        </div>

                        {/* Token Card - Updated */}
                        <div className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-8 min-h-[180px]">
                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Token Ujian</h3>
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                                            currentToken.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {currentToken.status === 1 ? 'Aktif' : 'Tidak Aktif'}
                                    </span>
                                </div>
                                <div className="mb-2 flex items-center justify-center">
                                    <span className="rounded-lg border border-gray-200 bg-gray-100 px-6 py-2 font-mono text-3xl font-bold tracking-widest select-all">
                                        {currentToken.token}
                                    </span>
                                </div>
                                <p className="mb-4 text-center text-xs text-gray-500">Diperbarui: {formatDateTime(currentToken.waktu)}</p>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    onClick={copyTokenToClipboard}
                                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                >
                                    <Copy className="h-3 w-3" />
                                    Salin
                                </button>
                                <button
                                    onClick={generateNewToken}
                                    disabled={isGenerating}
                                    className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:bg-gray-400"
                                >
                                    <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
                                    {isGenerating ? 'Generating...' : 'Buat Baru'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
