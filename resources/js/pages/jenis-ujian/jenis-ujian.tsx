import AppLayout from '@/layouts/app-layout';
import { PageFilter, PageProps, PaginatedResponse, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';

import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { CAlertDialog } from '@/components/c-alert-dialog';
import { ContentTitle } from '@/components/content-title';
import { CButtonIcon } from '@/components/ui/c-button';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Jenis Ujian',
        href: '/master-data/jenis-ujian',
    },
];

interface JenisUjian {
    id: number;
    kode: string;
    nama: string;
    type: string;
}

export default function JenisUjianManager() {
    const { data: jenisUjianData, filters, flash } = usePage<PageProps<JenisUjian>>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Jenis Ujian" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ContentTitle title="Data Jenis Ujian" showButton onButtonClick={() => router.visit(route('master-data.jenis-ujian.create'))} />
                <div className="mt-4 flex items-center justify-between">
                    <EntriesSelector currentValue={jenisUjianData.per_page} options={[10, 25, 50, 100]} routeName="master-data.jenis-ujian.manager" />
                    <SearchInputMenu defaultValue={filters.search} routeName="master-data.jenis-ujian.manager" />
                </div>
                <JenisUjianTable data={jenisUjianData} pageFilters={filters} />
            </div>
        </AppLayout>
    );
}

function JenisUjianTable({ data: jenisUjianData, pageFilters: filters }: { data: PaginatedResponse<JenisUjian>; pageFilters: PageFilter }) {
    const [open, setOpen] = useState(false);
    const [targetKode, setTargetKode] = useState<string | null>(null);

    const handleDelete = (kode: string) => {
        setTargetKode(kode);
        setOpen(true);
    };

    const confirmDelete = async () => {
        try {
            if (targetKode !== null) {
                router.delete(route('master-data.jenis-ujian.destroy', targetKode), {
                    preserveState: true,
                    preserveScroll: true,
                });
            }
        } catch {
            toast.error('Unexpected error occurred');
        } finally {
            setOpen(false);
        }
    };

    // Helper function to navigate with preserved search parameters
    const navigateToPage = (page: number) => {
        router.visit(route('master-data.jenis-ujian.manager'), {
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
            label: 'No',
            className: 'w-[100px] text-center',
            render: (jenisUjian: JenisUjian) => {
                const index = jenisUjianData.data.indexOf(jenisUjian);
                const no = (jenisUjianData.current_page - 1) * jenisUjianData.per_page + (index + 1);
                return <div className="text-center font-medium">{no}</div>;
            },
        },
        {
            label: 'Nama Jenis Ujian',
            className: 'w-[400px]',
            render: (jenisUjian: JenisUjian) => jenisUjian.nama,
        },
        {
            label: 'Action',
            className: 'w-[100px] text-center',
            render: (jenisUjian: JenisUjian) => (
                <div className="flex justify-center gap-2">
                    <CButtonIcon icon={Pencil} onClick={() => router.visit(route('master-data.jenis-ujian.edit', jenisUjian.kode))} />
                    <CButtonIcon icon={Trash2} type="danger" onClick={() => handleDelete(jenisUjian.kode)} />
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="flex flex-col gap-4">
                <CustomTable columns={columns} data={jenisUjianData.data} />

                <PaginationWrapper
                    currentPage={jenisUjianData.current_page}
                    lastPage={jenisUjianData.last_page}
                    perPage={jenisUjianData.per_page}
                    total={jenisUjianData.total}
                    onNavigate={navigateToPage}
                />
            </div>

            <CAlertDialog open={open} setOpen={setOpen} onContinue={confirmDelete} />
        </>
    );
}