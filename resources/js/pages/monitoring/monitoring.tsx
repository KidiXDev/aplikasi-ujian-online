import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { MonitoringPageFilter, PaginatedResponse, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { ContentTitle } from '@/components/content-title';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import { SortDropdown } from '@/components/ui/sort-dropdown';
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

interface ExamCategory {
    id: number;
    kategori: string;
}

interface Props {
    ujianList: PaginatedResponse<Ujian>;
    examCategories: ExamCategory[];
    filters: MonitoringPageFilter;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Monitoring({ ujianList, examCategories, filters, flash }: Props) {
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

                <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <EntriesSelector
                        currentValue={ujianList.per_page}
                        options={[10, 25, 50, 100]}
                        routeName="monitoring.ujian.index"
                        routeParams={{ page: ujianList.current_page }}
                    />
                    <div className="flex gap-4">
                        <FilterDropdown
                            label="Tipe Ujian"
                            currentValue={filters.tipe_ujian}
                            options={examCategories.map((category) => ({
                                value: category.kategori,
                                label: category.kategori,
                            }))}
                            routeName="monitoring.ujian.index"
                            paramName="tipe_ujian"
                            placeholder="Select Type"
                            className="w-36"
                        />

                        <SortDropdown
                            currentValue={filters.sort}
                            options={[
                                { value: 'newest', label: 'Newest First' },
                                { value: 'oldest', label: 'Oldest First' },
                                { value: 'kuota_asc', label: 'Kuota (Low to High)' },
                                { value: 'kuota_desc', label: 'Kuota (High to Low)' },
                            ]}
                            routeName="monitoring.ujian.index"
                            className="w-44"
                        />
                        <SearchInputMenu
                            defaultValue={filters.search}
                            routeName="monitoring.ujian.index"
                            routeParams={{ page: ujianList.current_page, per_page: ujianList.per_page, search: filters.search }}
                        />
                    </div>
                </div>

                <UjianTable data={ujianList} pageFilters={filters} />
            </div>
        </AppLayout>
    );
}

function UjianTable({ data: ujianList, pageFilters: filters }: { data: PaginatedResponse<Ujian>; pageFilters: MonitoringPageFilter }) {
    // Sort data based on the sort parameter
    const sortedData = [...ujianList.data].sort((a, b) => {
        switch (filters.sort) {
            case 'oldest':
                return new Date(a.tanggal_ujian).getTime() - new Date(b.tanggal_ujian).getTime();
            case 'tipe_ujian':
                return a.tipe_ujian.localeCompare(b.tipe_ujian);
            case 'kuota_asc':
                return a.kuota - b.kuota;
            case 'kuota_desc':
                return b.kuota - a.kuota;
            case 'newest':
            default:
                return new Date(b.tanggal_ujian).getTime() - new Date(a.tanggal_ujian).getTime();
        }
    });

    // Helper function to navigate with preserved search parameters
    const navigateToPage = (page: number) => {
        router.visit(route('monitoring.ujian.index'), {
            method: 'get',
            data: {
                page: page,
                search: filters.search,
                per_page: ujianList.per_page,
                tipe_ujian: filters.tipe_ujian,
                sort: filters.sort,
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns = [
        {
            label: 'No',
            className: 'w-[60px] text-center',
            render: (ujian: Ujian) => {
                const index = sortedData.findIndex((u) => u.id === ujian.id);
                const rowNumber = (ujianList.current_page - 1) * ujianList.per_page + index + 1;
                return <div className="text-center font-medium">{rowNumber}</div>;
            },
        },
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
