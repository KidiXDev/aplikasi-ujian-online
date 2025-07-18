import AppLayout from '@/layouts/app-layout';
import { PaginatedResponse, type BreadcrumbItem } from '@/types';

interface PageFilter {
    search?: string;
    per_page?: number;
    page?: number;
    filter?: string; // Add this line to fix the error
}
import { Head, router, usePage } from '@inertiajs/react';
import { BookOpen, Calendar, Clock, UserPlus, Users } from 'lucide-react'; // Hapus ArrowLeft
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ContentTitle } from '@/components/content-title';
import { Badge } from '@/components/ui/badge';
import { CButton } from '@/components/ui/c-button';
import { CustomTable } from '@/components/ui/c-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';

interface Peserta {
    id: number;
    nama: string;
    nis: string;
    username: string;
    status: number;
    jurusan: number;
    filter?: string | number;
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
    filterOptions: (string | number)[];
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penjadwalan', href: '/penjadwalan' },
    { title: 'Peserta Ujian', href: '#' },
    { title: 'Tambah Peserta', href: '#' },
];

export default function AddPeserta() {
    const { penjadwalan, data: pesertaData, jumlahTerdaftar, sisaKuota, filters, filterOptions = [], flash } = usePage<PageProps>().props;

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
        setSelectedPeserta((prev) => (prev.includes(pesertaId) ? prev.filter((id) => id !== pesertaId) : [...prev, pesertaId]));
    };

    const handleSelectAll = () => {
        if (selectedPeserta.length === pesertaData.data.length && pesertaData.data.length > 0) {
            setSelectedPeserta([]);
        } else {
            setSelectedPeserta(pesertaData.data.map((p) => p.id));
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
        router.post(
            `/penjadwalan/${penjadwalan.id_penjadwalan}/peserta/add`,
            {
                peserta_ids: selectedPeserta,
            },
            {
                onFinish: () => setIsLoading(false),
                // Remove preserveState to force fresh data load
                preserveState: false,
                preserveScroll: false,
                onSuccess: () => {
                    // Tidak perlu pindah halaman, cukup refresh data atau tampilkan notifikasi
                    toast.success('Peserta berhasil ditambahkan!');
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tambah Peserta - ${penjadwalan.kode_jadwal}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header - like penjadwalan-manager */}
                <div className="flex items-center justify-between">
                    <ContentTitle title="Tambah Peserta Ujian" showButton={false} />
                    <CButton onClick={() => router.visit(`/penjadwalan/${penjadwalan.id_penjadwalan}/peserta`)}>
                        Kembali
                    </CButton>
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="text-muted-foreground h-4 w-4" />
                                <span className="text-sm">
                                    <span className="font-medium">Tanggal:</span> {new Date(penjadwalan.tanggal).toLocaleDateString('id-ID')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="text-muted-foreground h-4 w-4" />
                                <span className="text-sm">
                                    <span className="font-medium">Waktu:</span> {penjadwalan.waktu_mulai} - {penjadwalan.waktu_selesai}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="text-muted-foreground h-4 w-4" />
                                <span className="text-sm">
                                    <span className="font-medium">Peserta:</span> {jumlahTerdaftar}/{penjadwalan.kuota}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={sisaKuota > 0 ? 'default' : 'destructive'}>Sisa Kuota: {sisaKuota}</Badge>
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
                            routeParams={{ id: penjadwalan.id_penjadwalan }}
                        />
                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={selectedPeserta.length === pesertaData.data.length && pesertaData.data.length > 0}
                                onCheckedChange={handleSelectAll}
                                disabled={pesertaData.data.length === 0 || sisaKuota === 0}
                            />
                            <span className="text-muted-foreground text-sm">Pilih semua di halaman ini</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Dropdown filter */}
                        <select
                            className="border rounded px-2 py-1 text-sm"
                            value={filters.filter ?? ''}
                            onChange={e => {
                                router.visit(`/penjadwalan/${penjadwalan.id_penjadwalan}/peserta/add`, {
                                    data: {
                                        ...filters,
                                        filter: e.target.value || undefined,
                                        page: 1,
                                    },
                                    preserveState: false,
                                    preserveScroll: false,
                                });
                            }}
                        >
                            <option value="">Semua Filter</option>
                            {(filterOptions as (string | number)[]).map((opt: string | number) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <SearchInputMenu
                            defaultValue={filters.search}
                            routeName="penjadwalan.peserta.add"
                            routeParams={{ id: penjadwalan.id_penjadwalan }}
                            placeholder="Cari peserta tersedia..."
                        />
                        <CButton type="primary" onClick={handleAddPeserta} disabled={selectedPeserta.length === 0 || sisaKuota === 0 || isLoading}>
                            <UserPlus className="h-4 w-4" />
                            {isLoading ? 'Memproses...' : `Tambahkan (${selectedPeserta.length})`}
                        </CButton>
                    </div>
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
    isLoading,
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
                ...filters, // Kirim semua filter, search, sort, direction
                page: page,
                per_page: pesertaData.per_page,
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
            render: (peserta: Peserta) => <span className="font-medium">{peserta.nis}</span>,
        },
        {
            label: 'Nama Peserta',
            render: (peserta: Peserta) => peserta.nama,
        },
        {
            label: 'Status',
            render: (peserta: Peserta) => (
                <Badge variant={peserta.status === 1 ? 'default' : 'secondary'}>
                    {peserta.status === 1 ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
            ),
        },
        {
            label: 'Filter',
            render: (peserta: Peserta) => peserta.filter ?? '-',
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            {/* Table Controls dengan EntriesSelector */}
            {pesertaData.data.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center">
                    {filters.search ? (
                        <div>
                            <p>Tidak ada peserta ditemukan dengan pencarian "{filters.search}"</p>
                            <p className="text-sm mt-1">Coba ubah kata kunci pencarian atau hapus filter</p>
                        </div>
                    ) : (
                        <div>
                            <p>Semua peserta sudah terdaftar atau tidak ada peserta tersedia</p>
                            <p className="text-sm mt-1">Peserta yang sudah terdaftar tidak akan ditampilkan di sini</p>
                        </div>
                    )}
                </div>
            ) : (
                <CustomTable columns={columns} data={pesertaData.data} />
            )}

            {/* Show entries info & pagination di bawah tabel */}
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
