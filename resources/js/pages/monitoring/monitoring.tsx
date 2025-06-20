import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { PageFilter, PaginatedResponse, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import React, { useEffect } from 'react';
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

interface Props {
    ujianList: PaginatedResponse<Ujian>;
    filters: PageFilter;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Monitoring({ ujianList, filters, flash }: Props) {
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Monitoring Ujian',
            href: '/monitoring-ujian',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Monitoring Ujian" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <ContentTitle title="Monitoring Ujian" showButton={false} />
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <EntriesSelector 
                        currentValue={ujianList.per_page} 
                        options={[10, 25, 50, 100]} 
                        routeName="monitoring.ujian" 
                    />
                    <SearchInputMenu 
                        defaultValue={filters.search} 
                        routeName="monitoring.ujian" 
                    />
                </div>

                <UjianTable data={ujianList} pageFilters={filters} />
            </div>
        </AppLayout>
    );
}


function UjianTable({ data: ujianList, pageFilters: filters }: { data: PaginatedResponse<Ujian>; pageFilters: PageFilter }) {
    // Sort data by newest date
    const sortedData = [...ujianList.data].sort((a, b) => {
        const dateA = new Date(a.tanggal_ujian);
        const dateB = new Date(b.tanggal_ujian);
        return dateB.getTime() - dateA.getTime(); // Sort by newest first
    });

    // Helper function to navigate with preserved search parameters
    const navigateToPage = (page: number) => {
        router.visit(route('monitoring.ujian'), {
            data: {
                page: page,
                search: filters.search,
                per_page: ujianList.per_page,
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns = [
        {
            label: 'Tipe Ujian',
            className: 'w-[150px] text-center',
            render: (ujian: Ujian) => ujian.tipe_ujian,
        },
        {
            label: 'Paket Ujian',
            className: 'w-[200px] text-center',
            render: (ujian: Ujian) => ujian.paket_ujian,
        },
        {
            label: 'Tanggal Ujian',
            className: 'w-[150px] text-center',
            render: (ujian: Ujian) => new Date(ujian.tanggal_ujian).toLocaleDateString('id-ID'),
        },
        {
            label: 'Mulai',
            className: 'w-[100px] text-center',
            render: (ujian: Ujian) => ujian.mulai,
        },
        {
            label: 'Selesai',
            className: 'w-[100px] text-center',
            render: (ujian: Ujian) => ujian.selesai,
        },
        {
            label: 'Kuota',
            className: 'w-[80px] text-center',
            render: (ujian: Ujian) => <div className="text-center">{ujian.kuota}</div>,
        },
        {
            label: 'Aksi',
            className: 'w-[80px] text-center',
            render: (ujian: Ujian) => (
                <div className="flex justify-center">
                    <Link href={route('monitoring.ujian.preview', ujian.id)}>
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
            <CustomTable columns={columns} data={sortedData} />

            <PaginationWrapper
                currentPage={ujianList.current_page}
                lastPage={ujianList.last_page}
                perPage={ujianList.per_page}
                total={ujianList.total}
                onNavigate={navigateToPage}
            />
        </div>
    );
}
