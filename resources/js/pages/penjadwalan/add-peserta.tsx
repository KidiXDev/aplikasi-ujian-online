import AppLayout from '@/layouts/app-layout';
import { PageFilter, PaginatedResponse, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { UserPlus, ArrowLeft, Users, Calendar, Clock, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ContentTitle } from '@/components/content-title';
import { CButton } from '@/components/ui/c-button';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface Peserta {
    id: number;
    nama: string;
    nis: string;
    username: string;
    status: number;
    jurusan: number;
    jurusan_ref?: {
        id_jurusan: number;
        nama_jurusan: string;
    };
}

interface JadwalUjian {
    id_ujian: number;
    nama_ujian: string;
    kode_kelas?: string;
    id_event: number;
    id_penjadwalan: number;
}

interface Penjadwalan {
    id_penjadwalan: number;
    kode_jadwal: string;
    tanggal: string;
    waktu_mulai: string;
    waktu_selesai: string;
    kuota: number;
    tipe_ujian: string;
    event: {
        id_event: number;
        nama_event: string;
    };
}

interface PageProps {
    penjadwalan: Penjadwalan;
    jadwalUjian: JadwalUjian;
    data: PaginatedResponse<Peserta>;
    jumlahTerdaftar: number;
    sisaKuota: number;
    filters: PageFilter;
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown; // Add index signature for compatibility with Inertia PageProps
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penjadwalan', href: '/penjadwalan' },
    { title: 'Peserta Ujian', href: '#' },
    { title: 'Tambah Peserta', href: '#' },
];

export default function AddPeserta() {
    const { penjadwalan, data: pesertaData, jumlahTerdaftar, sisaKuota, filters, flash } = usePage<PageProps>().props;
    
    const [selectedPeserta, setSelectedPeserta] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
            setSelectedPeserta([]);
        }
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSelectPeserta = (pesertaId: number) => {
        setSelectedPeserta(prev => 
            prev.includes(pesertaId) 
                ? prev.filter(id => id !== pesertaId)
                : [...prev, pesertaId]
        );
    };

    const handleSelectAll = () => {
        if (selectedPeserta.length === pesertaData.data.length && pesertaData.data.length > 0) {
            setSelectedPeserta([]);
        } else {
            setSelectedPeserta(pesertaData.data.map(p => p.id));
        }
    };

    const handleAddPeserta = () => {
        if (selectedPeserta.length === 0) {
            toast.error('Pilih peserta yang akan ditambahkan ke ujian.');
            return;
        }

        if (selectedPeserta.length > sisaKuota) {
            toast.error(`Kuota tidak mencukupi. Sisa kuota: ${sisaKuota} peserta.`);
            return;
        }

        setIsLoading(true);
        router.post(`/penjadwalan/${penjadwalan.id_penjadwalan}/peserta/add`, {
            peserta_ids: selectedPeserta
        }, {
            onFinish: () => setIsLoading(false),
            // Remove preserveState to force fresh data load
            preserveState: false,
            preserveScroll: false,
            onSuccess: () => {
                // Force navigation to peserta page without preserving state
                router.visit(`/penjadwalan/${penjadwalan.id_penjadwalan}/peserta`, {
                    preserveState: false,
                    preserveScroll: false,
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tambah Peserta - ${penjadwalan.kode_jadwal}`} />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header - like penjadwalan-manager */}
                <div className="flex items-center justify-between">
                    <ContentTitle 
                        title="Tambah Peserta Ujian"
                        showButton={false}
                    />
                    <div className="flex items-center gap-2">
                        <CButton 
                            type="primary"
                            onClick={() => router.visit(`/penjadwalan/${penjadwalan.id_penjadwalan}/peserta`)}
                        >
                            <div className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </div>
                        </CButton>
                        <CButton 
                            type="primary"
                            onClick={handleAddPeserta}
                            disabled={selectedPeserta.length === 0 || sisaKuota === 0 || isLoading}
                        >
                            <div className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                {isLoading ? 'Memproses...' : `Tambahkan (${selectedPeserta.length})`}
                            </div>
                        </CButton>
                    </div>
                </div>

                {/* Schedule Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Informasi Ujian
                        </CardTitle>
                        <CardDescription>
                            {penjadwalan.event.nama_event} - {penjadwalan.tipe_ujian}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    <span className="font-medium">Tanggal:</span> {new Date(penjadwalan.tanggal).toLocaleDateString('id-ID')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    <span className="font-medium">Waktu:</span> {penjadwalan.waktu_mulai} - {penjadwalan.waktu_selesai}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    <span className="font-medium">Peserta:</span> {jumlahTerdaftar}/{penjadwalan.kuota}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={sisaKuota > 0 ? "default" : "destructive"}>
                                    Sisa Kuota: {sisaKuota}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <EntriesSelector 
                            currentValue={pesertaData.per_page} 
                            options={[10, 25, 50, 100]} 
                            routeName="penjadwalan.peserta.add" 
                            routeParams={{ id_penjadwalan: penjadwalan.id_penjadwalan }}
                        />
                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={selectedPeserta.length === pesertaData.data.length && pesertaData.data.length > 0}
                                onCheckedChange={handleSelectAll}
                                disabled={pesertaData.data.length === 0 || sisaKuota === 0}
                            />
                            <span className="text-sm text-muted-foreground">
                                Pilih semua di halaman ini
                            </span>
                        </div>
                    </div>
                    <SearchInputMenu 
                        defaultValue={filters.search} 
                        routeName="penjadwalan.peserta.add"
                        routeParams={{ id_penjadwalan: penjadwalan.id_penjadwalan }}
                    />
                </div>

                {/* Available Participants Table */}
                <AddPesertaTable 
                    data={pesertaData} 
                    pageFilters={filters} 
                    penjadwalanId={penjadwalan.id_penjadwalan}
                    selectedPeserta={selectedPeserta}
                    onSelectPeserta={handleSelectPeserta}
                    sisaKuota={sisaKuota}
                    isLoading={isLoading}
                />
            </div>
        </AppLayout>
    );
}

function AddPesertaTable({ 
    data: pesertaData, 
    pageFilters: filters, 
    penjadwalanId,
    selectedPeserta,
    onSelectPeserta,
    sisaKuota,
    isLoading
}: { 
    data: PaginatedResponse<Peserta>; 
    pageFilters: PageFilter;
    penjadwalanId: number;
    selectedPeserta: number[];
    onSelectPeserta: (id: number) => void;
    sisaKuota: number;
    isLoading: boolean;
}) {
    const navigateToPage = (page: number) => {
        router.visit(`/penjadwalan/${penjadwalanId}/peserta/add`, {
            data: {
                page: page,
                search: filters.search,
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns = [
        {
            label: '',
            className: 'w-[50px]',
            render: (peserta: Peserta) => (
                <Checkbox
                    checked={selectedPeserta.includes(peserta.id)}
                    onCheckedChange={() => onSelectPeserta(peserta.id)}
                    disabled={isLoading || sisaKuota === 0}
                />
            ),
        },
        {
            label: 'NIS',
            render: (peserta: Peserta) => (
                <span className="font-medium">{peserta.nis}</span>
            ),
        },
        {
            label: 'Nama Peserta',
            render: (peserta: Peserta) => peserta.nama,
        },
        {
            label: 'Status',
            render: (peserta: Peserta) => (
                <Badge variant={peserta.status === 1 ? "default" : "secondary"}>
                    {peserta.status === 1 ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            {pesertaData.data.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    {filters.search ? 'Tidak ada peserta yang ditemukan' : 'Semua peserta sudah terdaftar atau tidak ada peserta tersedia'}
                </div>
            ) : (
                <CustomTable columns={columns} data={pesertaData.data} />
            )}

            <PaginationWrapper
                currentPage={pesertaData.current_page}
                lastPage={pesertaData.last_page}
                perPage={pesertaData.per_page}
                total={pesertaData.total}
                onNavigate={navigateToPage}
            />
        </div>
    );
}