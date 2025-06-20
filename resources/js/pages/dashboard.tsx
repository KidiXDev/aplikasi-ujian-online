import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Copy, FileText, Monitor, RefreshCw, Users } from 'lucide-react';
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

    // Mock data for stats
    const stats = [
        { title: 'peserta login', value: '150', icon: Users },
        { title: 'peserta soal ujian', value: '120', icon: FileText },
        { title: 'ujian berlangsung', value: '5', icon: CheckCircle },
        { title: 'ujian selesai', value: '25', icon: Monitor },
    ];

    // Mock data for exam history
    const examHistory = [
        {
            ujian: 'Matematika Dasar',
            kelas: 'X-1',
            kode: 'MTK001',
            peserta: 30,
            selesai: 28,
            jadwal: '2024-01-15 08:00',
            status: 'Selesai',
        },
        {
            ujian: 'Bahasa Indonesia',
            kelas: 'X-2',
            kode: 'BIN001',
            peserta: 32,
            selesai: 30,
            jadwal: '2024-01-15 10:00',
            status: 'Berlangsung',
        },
        {
            ujian: 'Fisika',
            kelas: 'XI-1',
            kode: 'FIS001',
            peserta: 28,
            selesai: 0,
            jadwal: '2024-01-16 08:00',
            status: 'Terjadwal',
        },
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
                {/* Stats Cards */}
                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">Dashboard</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                                        <stat.icon className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <h3 className="mb-1 text-2xl font-bold text-gray-900">{stat.value}</h3>
                                <p className="text-sm text-gray-600">{stat.title}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dashboard Section */}
                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Tambah Ujian Card */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Tambah Ujian</h3>
                            <div className="flex h-32 items-center justify-center">
                                <Link
                                    href="/penjadwalan"
                                    className="rounded-lg border border-gray-300 bg-gray-100 px-6 py-2 text-center font-medium text-gray-700 transition-colors hover:bg-gray-200"
                                >
                                    Tambah Ujian
                                </Link>
                            </div>
                        </div>

                        {/* Monitoring Ujian Card */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Monitoring Ujian</h3>
                            <div className="flex h-32 items-center justify-center">
                                <Link
                                    href="/monitoring-ujian"
                                    className="rounded-lg border border-gray-300 bg-gray-100 px-6 py-2 text-center font-medium text-gray-700 transition-colors hover:bg-gray-200"
                                >
                                    Monitoring
                                </Link>
                            </div>
                        </div>

                        {/* Token Card - Updated */}
                        <div className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-6">
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

                {/* Exam History Section */}
                <div>
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">Exam History</h2>
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200 bg-blue-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase">Ujian</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase">Kelas</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase">Kode</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase">Peserta</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase">Selesai</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase">Jadwal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {examHistory.map((exam, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{exam.ujian}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700">{exam.kelas}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700">{exam.kode}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700">{exam.peserta}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700">{exam.selesai}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700">{exam.jadwal}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        exam.status === 'Selesai'
                                                            ? 'bg-green-100 text-green-800'
                                                            : exam.status === 'Berlangsung'
                                                              ? 'bg-yellow-100 text-yellow-800'
                                                              : 'bg-blue-100 text-blue-800'
                                                    }`}
                                                >
                                                    {exam.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
