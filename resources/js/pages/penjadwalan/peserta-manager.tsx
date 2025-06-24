import AppLayout from '@/layouts/app-layout';
import { PageFilter, PaginatedResponse, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { UserPlus, UserMinus, ArrowLeft, UserX, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { CAlertDialog } from '@/components/c-alert-dialog';
import { ContentTitle } from '@/components/content-title';
import { CButton, CButtonIcon } from '@/components/ui/c-button';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Calendar, Clock, BookOpen } from 'lucide-react';

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
    const { penjadwalan, data: pesertaData, jumlahTerdaftar, sisaKuota, filters, flash } = usePage<PageProps>().props;

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
                    <ContentTitle 
                        title="Peserta Ujian"
                        showButton={false}
                    />
                    <div className="flex items-center gap-2">
                        <CButton 
                            type="primary"
                            onClick={() => router.visit('/penjadwalan')}
                        >
                            <div className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </div>
                        </CButton>
                        <CButton 
                            type="primary"
                            onClick={() => router.visit(`/penjadwalan/${penjadwalan.id_penjadwalan}/peserta/add`)}
                        >
                            <div className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Tambah Peserta
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
                <div className="mt-4 flex items-center justify-between">
                    <EntriesSelector 
                        currentValue={pesertaData.per_page} 
                        options={[10, 25, 50, 100]} 
                        routeName="penjadwalan.peserta" 
                        routeParams={{ id_penjadwalan: penjadwalan.id_penjadwalan }}
                    />
                    <SearchInputMenu 
                        defaultValue={filters.search} 
                        routeName="penjadwalan.peserta"
                        routeParams={{ id_penjadwalan: penjadwalan.id_penjadwalan }}
                    />
                </div>

                {/* Participants Table */}
                <PesertaTable 
                    data={pesertaData} 
                    pageFilters={filters} 
                    penjadwalanId={penjadwalan.id_penjadwalan}
                    jumlahTerdaftar={jumlahTerdaftar}
                />
            </div>
        </AppLayout>
    );
}

function PesertaTable({ 
    data: pesertaData, 
    pageFilters: filters, 
    penjadwalanId,
    jumlahTerdaftar
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
            setSelectedPeserta(pesertaData.data.map(p => p.id));
        } else {
            setSelectedPeserta([]);
        }
    };

    const handleSelectPeserta = (pesertaId: number, checked: boolean) => {
        if (checked) {
            setSelectedPeserta(prev => [...prev, pesertaId]);
        } else {
            setSelectedPeserta(prev => prev.filter(id => id !== pesertaId));
        }
    };

    const navigateToPage = (page: number) => {
        router.visit(`/penjadwalan/${penjadwalanId}/peserta`, {
            data: {
                page: page,
                search: filters.search,
            },
            preserveState: false,
            preserveScroll: true,
        });
    };

    const isAllSelected = pesertaData.data.length > 0 && selectedPeserta.length === pesertaData.data.length;
    const isPartiallySelected = selectedPeserta.length > 0 && selectedPeserta.length < pesertaData.data.length;

    const getDialogContent = () => {
        if (bulkAction === 'clear-all') {
            return {
                title: 'Hapus Semua Peserta',
                description: `Apakah Anda yakin ingin menghapus semua ${jumlahTerdaftar} peserta dari ujian ini?`
            };
        } else if (bulkAction === 'remove-selected') {
            return {
                title: 'Hapus Peserta Terpilih',
                description: `Apakah Anda yakin ingin menghapus ${selectedPeserta.length} peserta terpilih dari ujian ini?`
            };
        } else {
            return {
                title: 'Keluarkan Peserta',
                description: `Apakah Anda yakin ingin mengeluarkan peserta "${targetPeserta?.nama}" dari ujian ini?`
            };
        }
    };

    const columns = [
        {
            label: (
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={isAllSelected}
                        indeterminate={isPartiallySelected}
                        onCheckedChange={handleSelectAll}
                    />
                    <span>Pilih</span>
                </div>
            ),
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
        {
            label: 'Aksi',
            className: 'w-[80px] text-center',
            render: (peserta: Peserta) => (
                <div className="flex justify-center">
                    <CButtonIcon
                        icon={UserMinus}
                        type="danger"
                        onClick={() => handleRemove(peserta)}
                    />
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="flex flex-col gap-4">
                {/* Bulk Actions Toolbar - Selalu tampil */}
                <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg">
                    <div className="flex-1">
                        <span className="text-sm text-gray-600">
                            {selectedPeserta.length > 0 ? (
                                <>
                                    <strong>{selectedPeserta.length}</strong> peserta terpilih dari <strong>{pesertaData.data.length}</strong> peserta di halaman ini
                                </>
                            ) : jumlahTerdaftar > 0 ? (
                                <>
                                    Total <strong>{jumlahTerdaftar}</strong> peserta terdaftar
                                </>
                            ) : (
                                <>
                                    Belum ada peserta terdaftar
                                </>
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleBulkAction('remove-selected')}
                            className="text-sm px-4 py-2 shadow transition-colors rounded border bg-red-500 hover:bg-red-600 text-white border-red-500 cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <Trash2 className="h-4 w-4" />
                                Hapus Terpilih ({selectedPeserta.length})
                            </div>
                        </button>
                        <button
                            onClick={() => handleBulkAction('clear-all')}
                            disabled={jumlahTerdaftar === 0}
                            className={`text-sm px-4 py-2 shadow transition-colors rounded border ${
                                jumlahTerdaftar === 0 
                                    ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' 
                                    : 'bg-red-100 hover:bg-red-200 text-red-700 border-red-300 cursor-pointer'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <UserX className="h-4 w-4" />
                                Hapus Semua ({jumlahTerdaftar})
                            </div>
                        </button>
                    </div>
                </div>

                <CustomTable columns={columns} data={pesertaData.data} />

                <PaginationWrapper
                    currentPage={pesertaData.current_page}
                    lastPage={pesertaData.last_page}
                    perPage={pesertaData.per_page}
                    total={pesertaData.total}
                    onNavigate={navigateToPage}
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