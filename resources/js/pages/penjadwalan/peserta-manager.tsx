import AppLayout from '@/layouts/app-layout';
import { PaginatedResponse, type BreadcrumbItem } from '@/types';

interface PageFilter {
    search?: string;
    page?: number;
    pages?: number;
    filter?: string;
    // Add more known filter fields here if needed
}
import { Head, router, usePage } from '@inertiajs/react';
import { BookOpen, Calendar, Clock, Trash2, UserMinus, UserPlus, Users, UserX } from 'lucide-react'; // Hapus ArrowLeft
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { CAlertDialog } from '@/components/c-alert-dialog';
import { ContentTitle } from '@/components/content-title';
import { Badge } from '@/components/ui/badge';
import { CButton, CButtonIcon } from '@/components/ui/c-button';
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
    [key: string]: unknown; // Add index signature for Inertia compatibility
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penjadwalan', href: '/penjadwalan' },
    { title: 'Peserta Ujian', href: '#' },
];

export default function PesertaManager() {
    const { penjadwalan, data: pesertaData, jumlahTerdaftar, sisaKuota, filters, filterOptions = [], flash } = usePage<PageProps>().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Peserta Ujian - ${penjadwalan.kode_jadwal}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <ContentTitle title="Peserta Ujian" showButton={false} />
                    <CButton onClick={() => router.visit('/penjadwalan')}>Kembali</CButton>
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
                    <div></div>
                <div className="flex items-center gap-3">
                    <select
                        className="border rounded px-2 py-1 text-sm"
                        value={filters.filter ?? ''}
                        onChange={e => {
                            router.visit(`/penjadwalan/${penjadwalan.id_penjadwalan}/peserta`, {
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
                        routeName="penjadwalan.peserta"
                        routeParams={{ id: penjadwalan.id_penjadwalan }}
                        placeholder="Cari peserta..."
                    />
                    <CButton type="primary" onClick={() => router.visit(`/penjadwalan/${penjadwalan.id_penjadwalan}/peserta/add`)}>
                        <UserPlus className="h-4 w-4" />
                        Tambah Peserta
                    </CButton>
                </div>
                </div>

                {/* Participants Table */}
                <PesertaTable data={pesertaData} pageFilters={filters} penjadwalanId={penjadwalan.id_penjadwalan} jumlahTerdaftar={jumlahTerdaftar} />
            </div>
        </AppLayout>
    );
}

function PesertaTable({
    data: pesertaData,
    pageFilters: filters,
    penjadwalanId,
    jumlahTerdaftar,
}: {
    data: PaginatedResponse<Peserta>;
    pageFilters: PageFilter;
    penjadwalanId: number;
    jumlahTerdaftar: number;
}) {
    const [open, setOpen] = useState(false);
    const [targetPeserta, setTargetPeserta] = useState<{ id: number; nama: string } | null>(null);
    const [selectedPeserta, setSelectedPeserta] = useState<number[]>([]);
    const [bulkAction, setBulkAction] = useState<'remove-selected' | 'clear-all' | null>(null);

    // Reset selected participants when page changes
    useEffect(() => {
        setSelectedPeserta([]);
    }, [pesertaData.current_page]);

    const handleRemove = (peserta: Peserta) => {
        setTargetPeserta({ id: peserta.id, nama: peserta.nama });
        setBulkAction(null);
        setOpen(true);
    };

    const handleBulkAction = (action: 'remove-selected' | 'clear-all') => {
        // Jika remove-selected tapi tidak ada yang dipilih, tampilkan peringatan
        if (action === 'remove-selected' && selectedPeserta.length === 0) {
            toast.warning('Silakan pilih peserta yang ingin dihapus terlebih dahulu');
            return;
        }

        setBulkAction(action);
        setTargetPeserta(null);
        setOpen(true);
    };

    const confirmAction = async () => {
        try {
            if (bulkAction === 'clear-all') {
                router.delete(`/penjadwalan/${penjadwalanId}/peserta/clear-all`, {
                    preserveState: false,
                    preserveScroll: false,
                });
            } else if (bulkAction === 'remove-selected' && selectedPeserta.length > 0) {
                router.delete(`/penjadwalan/${penjadwalanId}/peserta/remove-selected`, {
                    data: { peserta_ids: selectedPeserta },
                    preserveState: false,
                    preserveScroll: false,
                });
            } else if (targetPeserta !== null) {
                router.delete(`/penjadwalan/${penjadwalanId}/peserta/remove`, {
                    data: { peserta_id: targetPeserta.id },
                    preserveState: false,
                    preserveScroll: false,
                });
            }
        } catch {
            toast.error('Terjadi kesalahan yang tidak terduga');
        } finally {
            setOpen(false);
            setTargetPeserta(null);
            setBulkAction(null);
            setSelectedPeserta([]);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedPeserta(pesertaData.data.map((p) => p.id));
        } else {
            setSelectedPeserta([]);
        }
    };

    const handleSelectPeserta = (pesertaId: number, checked: boolean) => {
        if (checked) {
            setSelectedPeserta((prev) => [...prev, pesertaId]);
        } else {
            setSelectedPeserta((prev) => prev.filter((id) => id !== pesertaId));
        }
    };

    const navigateToPage = (page: number, entries?: number) => {
        router.visit(`/penjadwalan/${penjadwalanId}/peserta`, {
            data: {
                page: page,
                search: filters.search,
                pages: entries ?? pesertaData.per_page,
            },
            preserveState: false,
            preserveScroll: true,
        });
    };

    const isAllSelected = pesertaData.data.length > 0 && selectedPeserta.length === pesertaData.data.length;

    const getDialogContent = () => {
        if (bulkAction === 'clear-all') {
            return {
                title: 'Hapus Semua Peserta',
                description: `Apakah Anda yakin ingin menghapus semua ${jumlahTerdaftar} peserta dari ujian ini?`,
            };
        } else if (bulkAction === 'remove-selected') {
            return {
                title: 'Hapus Peserta Terpilih',
                description: `Apakah Anda yakin ingin menghapus ${selectedPeserta.length} peserta terpilih dari ujian ini?`,
            };
        } else {
            return {
                title: 'Keluarkan Peserta',
                description: `Apakah Anda yakin ingin mengeluarkan peserta "${targetPeserta?.nama}" dari ujian ini?`,
            };
        }
    };

    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [sortBy, setSortBy] = useState<string>('');

    const handleSort = (column: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortBy === column) {
            direction = sortDirection === 'asc' ? 'desc' : 'asc';
        }
        setSortBy(column);
        setSortDirection(direction);
        router.visit(`/penjadwalan/${penjadwalanId}/peserta`, {
            data: {
                ...filters,
                sort: column,
                direction,
            },
            preserveState: false,
            preserveScroll: true,
        });
    };

    const columns = [
        {
            label: 'No',
            className: 'w-[60px] text-center',
            render: (peserta: Peserta) => {
                const index = pesertaData.data.findIndex((s) => s.id === peserta.id);
                const rowNumber = (pesertaData.current_page - 1) * pesertaData.per_page + index + 1;
                return <div className="text-center font-medium">{rowNumber}</div>;
            },
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
                <Badge variant={peserta.status === 1 ? 'default' : 'secondary'}>{peserta.status === 1 ? 'Aktif' : 'Tidak Aktif'}</Badge>
            ),
        },
        {
            label: 'Filter',
            // Klik header kolom Filter untuk sort
            headerClassName: 'cursor-pointer select-none',
            className: 'cursor-pointer select-none',
            render: (peserta: Peserta & { filter?: string | number }) => (
                <span className="font-medium">{peserta.filter ?? '-'}</span>
            ),
            onHeaderClick: () => handleSort('filter'),
        },
        {
            label: 'Pilih',
            className: 'w-[100px]',
            render: (peserta: Peserta) => (
                <div className="flex justify-center">
                    <Checkbox
                        checked={selectedPeserta.includes(peserta.id)}
                        onCheckedChange={(checked) => handleSelectPeserta(peserta.id, Boolean(checked))}
                    />
                </div>
            ),
        },
        {
            label: 'Aksi',
            className: 'w-[80px] text-center',
            render: (peserta: Peserta) => (
                <div className="flex justify-center">
                    <CButtonIcon icon={UserMinus} type="danger" onClick={() => handleRemove(peserta)} />
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="flex flex-col gap-4">
                {/* Table Controls dengan Bulk Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <EntriesSelector
                            currentValue={pesertaData.per_page}
                            options={[10, 25, 50, 100]}
                            routeName="penjadwalan.peserta"
                            routeParams={{ id: penjadwalanId }}
                        />
                        <div className="flex items-center gap-2">
                            <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
                            <span className="text-sm text-gray-600">
                                Pilih Semua {selectedPeserta.length > 0 && `(${selectedPeserta.length} terpilih)`}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleBulkAction('remove-selected')}
                            disabled={selectedPeserta.length === 0}
                            className={`rounded border px-4 py-2 text-sm shadow transition-colors ${
                                selectedPeserta.length === 0
                                    ? 'cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400'
                                    : 'cursor-pointer border-red-500 bg-red-500 text-white hover:bg-red-600'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Trash2 className="h-4 w-4" />
                                Hapus Terpilih ({selectedPeserta.length})
                            </div>
                        </button>
                        <button
                            onClick={() => handleBulkAction('clear-all')}
                            disabled={jumlahTerdaftar === 0}
                            className={`rounded border px-4 py-2 text-sm shadow transition-colors ${
                                jumlahTerdaftar === 0
                                    ? 'cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400'
                                    : 'cursor-pointer border-red-300 bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <UserX className="h-4 w-4" />
                                Hapus Semua ({jumlahTerdaftar})
                            </div>
                        </button>
                    </div>
                </div>

                {pesertaData.data.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center">
                        {filters.search ? (
                            <div>
                                <p>Tidak ada peserta ditemukan dengan pencarian "{filters.search}"</p>
                                <p className="mt-1 text-sm">Coba ubah kata kunci pencarian atau hapus filter</p>
                            </div>
                        ) : (
                            <div>
                                <p>Belum ada peserta terdaftar dalam ujian ini</p>
                                <p className="mt-1 text-sm">Klik "Tambah Peserta" untuk menambahkan peserta ke ujian</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <CustomTable columns={columns} data={pesertaData.data} />
                )}
                <PaginationWrapper
                    currentPage={pesertaData.current_page}
                    lastPage={pesertaData.last_page}
                    perPage={pesertaData.per_page}
                    total={pesertaData.total}
                    onNavigate={(page) => navigateToPage(page)}
                />
            </div>

            <CAlertDialog
                open={open}
                setOpen={setOpen}
                onContinue={confirmAction}
                title={getDialogContent().title}
                description={getDialogContent().description}
            />
        </>
    );
}
