import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { PageFilter, PaginatedResponse, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { ContentTitle } from '@/components/content-title';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import { ChevronRight } from 'lucide-react';

// Define interfaces for data types
interface Ujian {
    id: number;
    tipe_ujian: string;
    paket_ujian: string;
    kelas_prodi: string;
    tanggal_ujian: string;
    mulai: string;
    selesai: string;
    kuota: number;
    tipe: string;
}

interface JadwalUjian {
    id_ujian: number;
    nama_ujian: string;
    kode_part: string;
    kode_kelas: string;
    id_penjadwalan: number;
}

interface Props {
    ujian: Ujian;
    jadwalUjianList: PaginatedResponse<JadwalUjian>;
    filters: PageFilter;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Preview({ ujian, jadwalUjianList, filters, flash }: Props) {
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Monitoring Ujian',
            href: '/monitoring-ujian',
        },
        {
            title: 'Preview',
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Preview ${ujian.paket_ujian}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ContentTitle
                    title="Preview Ujian"
                    showButton
                    showIcon={false}
                    buttonText="Kembali"
                    onButtonClick={() => router.visit(route('monitoring.ujian.index'))}
                />

                {/* Exam Info Card */}
                <div className="bg-card rounded-lg border p-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Tipe Ujian</p>
                            <p className="text-base font-semibold">{ujian.tipe_ujian}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Kelompok</p>
                            <p className="text-base font-semibold">{ujian.kelas_prodi}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Tanggal</p>
                            <p className="text-base font-semibold">{new Date(ujian.tanggal_ujian).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Waktu</p>
                            <p className="text-base font-semibold">
                                {ujian.mulai} - {ujian.selesai}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <EntriesSelector
                        currentValue={jadwalUjianList.per_page}
                        options={[10, 25, 50, 100]}
                        routeName="monitoring.ujian.preview"
                        routeParams={{ id: ujian.id }}
                    />
                    <SearchInputMenu defaultValue={filters.search} routeName="monitoring.ujian.preview" routeParams={{ id: ujian.id }} />
                </div>

                <JadwalUjianTable data={jadwalUjianList} ujianId={ujian.id} pageFilters={filters} />
            </div>
        </AppLayout>
    );
}

function JadwalUjianTable({
    data: jadwalUjianList,
    ujianId,
    pageFilters: filters,
}: {
    data: PaginatedResponse<JadwalUjian>;
    ujianId: number;
    pageFilters: PageFilter;
}) {
    // Helper function to navigate with preserved search parameters
    const navigateToPage = (page: number) => {
        router.visit(route('monitoring.ujian.preview', ujianId), {
            data: {
                page: page,
                search: filters.search,
                per_page: jadwalUjianList.per_page,
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns = [
        {
            label: 'No',
            className: 'w-[60px] text-center',
            render: (jadwal: JadwalUjian) => {
                const index = jadwalUjianList.data.findIndex((j) => j.id_ujian === jadwal.id_ujian);
                const rowNumber = (jadwalUjianList.current_page - 1) * jadwalUjianList.per_page + index + 1;
                return <div className="text-center font-medium">{rowNumber}</div>;
            },
        },
        {
            label: 'ID Ujian',
            className: 'w-[120px] text-center',
            render: (jadwal: JadwalUjian) => <div className="text-center font-mono text-sm">{jadwal.id_ujian}</div>,
        },
        {
            label: 'Nama Ujian',
            className: 'flex-1',
            render: (jadwal: JadwalUjian) => <div className="font-medium">{jadwal.nama_ujian || `Ujian ${jadwal.kode_part}`}</div>,
        },
        {
            label: 'Aksi',
            className: 'w-[80px] text-center',
            render: (jadwal: JadwalUjian) => (
                <div className="flex justify-center">
                    <Link
                        href={route('monitoring.ujian.detail', {
                            id: jadwal.id_penjadwalan,
                            exam_id: jadwal.id_ujian,
                        })}
                    >
                        <Button variant="ghost" size="sm">
                            <ChevronRight />
                        </Button>
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <CustomTable columns={columns} data={jadwalUjianList.data} />

            <PaginationWrapper
                currentPage={jadwalUjianList.current_page}
                lastPage={jadwalUjianList.last_page}
                perPage={jadwalUjianList.per_page}
                total={jadwalUjianList.total}
                onNavigate={navigateToPage}
            />
        </div>
    );
}
