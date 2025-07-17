import { ContentTitle } from '@/components/content-title';
import { Button } from '@/components/ui/button';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

interface Ujian {
    id?: number;
    tipe: string;
    paket: string;
    tanggal: string;
    mulai: string;
    selesai: string;
    kuota: number;
    status: string;
}

interface Props {
    initialData: {
        data: Ujian[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
    filters: {
        search: string;
        pages: number;
    };
}

const RekapNilai: React.FC<Props> = ({ initialData, filters }) => {
    // Breadcrumbs mirip monitoring
    const breadcrumbs = [{ title: 'Rekap Nilai', href: '/rekap-nilai' }];
    const [searchTerm] = useState<string>(filters.search);

    // Since we're using server-side pagination, we use the data directly from initialData
    // No need for local state management or client-side filtering/sorting
    const currentEntries = initialData.data;
    const currentPage = initialData.current_page;
    const entriesPerPage = initialData.per_page;

    // Navigation handlers - use router to navigate to different pages
    const paginate = (pageNumber: number) => {
        router.visit(route('rekap.nilai'), {
            data: {
                page: pageNumber,
                pages: entriesPerPage,
                search: searchTerm,
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Action handlers
    const handleActionClick = (ujian: Ujian) => {
        // Navigate to preview page
        if (ujian.id) {
            router.visit(route('rekap-nilai.preview', ujian.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rekap Nilai" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <ContentTitle title="Rekap Nilai" showButton={false} />
                </div>

                <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <EntriesSelector currentValue={entriesPerPage} options={[10, 25, 50]} routeName="rekap.nilai" />
                    <SearchInputMenu defaultValue={searchTerm} routeName="rekap.nilai" />
                </div>

                <div className="flex flex-col gap-4">
                    <CustomTable
                        columns={[
                            {
                                label: 'No',
                                className: 'w-[60px]',
                                render: (item: Ujian) => {
                                    const index = currentEntries.indexOf(item);
                                    return (currentPage - 1) * entriesPerPage + index + 1;
                                },
                            },

                            {
                                label: 'Tipe Ujian',
                                className: 'w-[150px]',
                                render: (item: Ujian) => item.tipe,
                            },
                            {
                                label: 'Paket Ujian',
                                className: 'w-[200px]',
                                render: (item: Ujian) => item.paket,
                            },
                            {
                                label: 'Tanggal',
                                className: 'w-[150px] text-center',
                                render: (item: Ujian) => item.tanggal,
                            },
                            {
                                label: 'Mulai',
                                className: 'w-[100px] text-center',
                                render: (item: Ujian) => item.mulai,
                            },
                            {
                                label: 'Selesai',
                                className: 'w-[100px] text-center',
                                render: (item: Ujian) => item.selesai,
                            },
                            {
                                label: 'Kuota',
                                className: 'w-[80px] text-center',
                                render: (item: Ujian) => item.kuota,
                            },
                            {
                                label: 'Status',
                                className: 'w-[100px] text-center',
                                render: (item: Ujian) => (
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            item.status === 'Finished'
                                                ? 'bg-green-100 text-green-800'
                                                : item.status === 'In Progress'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                ),
                            },
                            {
                                label: 'Preview',
                                className: 'w-[80px] text-center',
                                render: (item: Ujian) => (
                                    <Button variant="ghost" size="sm" onClick={() => handleActionClick(item)}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                ),
                            },
                        ]}
                        data={currentEntries}
                    />

                    <PaginationWrapper
                        currentPage={currentPage}
                        lastPage={initialData.last_page}
                        perPage={entriesPerPage}
                        total={initialData.total}
                        onNavigate={paginate}
                    />
                </div>
            </div>
        </AppLayout>
    );
};

export default RekapNilai;
