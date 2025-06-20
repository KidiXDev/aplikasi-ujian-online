import { ContentTitle } from '@/components/content-title';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { PageFilter, PaginatedResponse } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { CButtonIcon } from '@/components/ui/c-button';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import { StatusFilter } from '@/components/ui/status-filter';
import { usePolling } from '@/hooks/use-polling';
import { Seconds } from '@/lib/calculator';

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

interface Student {
    id: number;
    name: string;
    completedQuestions: number;
    totalQuestions: number;
    status: 'active' | 'finish';
    nilai?: number;
}

interface Stats {
    total_students: number;
    active_students: number;
    finished_students: number;
}

interface Props {
    ujian: Ujian;
    studentsData: PaginatedResponse<Student>;
    stats: Stats;
    filters: PageFilter;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Detail({ ujian, studentsData, stats, filters, flash }: Props) {
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Polling for updates every 3 seconds
    usePolling({
        interval: Seconds(3),
        onlyKeys: ['studentsData', 'stats'],
        key: ujian.id,
    });

    const breadcrumbs = [
        {
            title: 'Monitoring Ujian',
            href: '/monitoring-ujian',
        },
        {
            title: 'Preview',
            href: `/monitoring-ujian/${ujian.id}/preview`,
        },
        {
            title: 'Detail',
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail ${ujian.paket_ujian}`} />

            <div className="flex flex-col gap-4 p-4">
                <ContentTitle
                    title="Detail Ujian"
                    showButton
                    showIcon={false}
                    buttonText="Kembali"
                    onButtonClick={() => router.visit(route('monitoring.ujian.preview', ujian.id))}
                />
                <Card className="flex flex-col gap-4 p-4">
                    <CardHeader>
                        <CardTitle className="text-2xl">{ujian.paket_ujian}</CardTitle>
                        <CardDescription>{ujian.tipe_ujian}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex w-full gap-2">
                            <StatCard title="Total" value={stats.total_students.toString()} />
                            <StatCard title="Active" value={stats.active_students.toString()} />
                            <StatCard title="Finished" value={stats.finished_students.toString()} />
                            <StatCard
                                title="Not Started"
                                value={(stats.total_students - stats.active_students - stats.finished_students).toString()}
                            />
                        </div>
                    </CardContent>
                    <CardFooter />
                </Card>
                <div className="mt-4">
                    <div className="mb-4 flex items-center justify-between">
                        <EntriesSelector
                            currentValue={studentsData.per_page}
                            options={[10, 25, 50, 100]}
                            routeName="monitoring.ujian.detail"
                            routeParams={{ id: ujian.id }}
                        />
                        <div className="flex items-center gap-4">
                            <StatusFilter currentValue={filters.status} routeName="monitoring.ujian.detail" routeParams={{ id: ujian.id }} />
                            <SearchInputMenu defaultValue={filters.search} routeName="monitoring.ujian.detail" routeParams={{ id: ujian.id }} />
                        </div>
                    </div>
                    {studentsData && studentsData.data && studentsData.data.length > 0 ? (
                        <StudentTable data={studentsData} ujianId={ujian.id} pageFilters={filters} />
                    ) : (
                        <div className="mt-4 text-center text-gray-500">No Participants took the exam</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

// Status badge component
const StatusBadge: React.FC<{ status: 'active' | 'finish' }> = ({ status }) => {
    switch (status) {
        case 'active':
            return <span className="rounded bg-green-500 p-2 text-white shadow">Active</span>;
        case 'finish':
            return <span className="rounded bg-blue-500 p-2 text-white shadow">Finish</span>;
        default:
            return <span className="rounded bg-gray-500 p-2 text-white shadow">{status}</span>;
    }
};

function StudentTable({
    data: studentsData,
    ujianId,
    pageFilters: filters,
}: {
    data: PaginatedResponse<Student>;
    ujianId: number;
    pageFilters: PageFilter;
}) {
    // Helper function to navigate with preserved search parameters
    const navigateToPage = (page: number) => {
        router.visit(route('monitoring.ujian.detail', ujianId), {
            data: {
                page: page,
                search: filters.search,
                status: filters.status,
                pages: studentsData.per_page,
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns = [
        {
            label: 'No',
            className: 'w-[80px] text-center',
            render: (student: Student) => {
                const index = studentsData.data.indexOf(student);
                const no = (studentsData.current_page - 1) * studentsData.per_page + (index + 1);
                return <div className="text-center font-medium">{no}</div>;
            },
        },
        {
            label: 'Nama',
            className: 'w-[300px]',
            render: (student: Student) => student.name,
        },
        {
            label: 'Soal',
            className: 'w-[150px]',
            render: (student: Student) => `${student.completedQuestions}/${student.totalQuestions}`,
        },
        {
            label: 'Status',
            className: 'w-[150px]',
            render: (student: Student) => <StatusBadge status={student.status} />,
        },
        {
            label: 'Action',
            className: 'w-[100px] text-center',
            render: () => (
                <div className="flex justify-center">
                    <CButtonIcon
                        icon={Trash2}
                        type="danger"
                        className="cursor-not-allowed opacity-50"
                        onClick={() => {
                            toast.info('Delete functionality is currently disabled');
                        }}
                    />
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="flex flex-col gap-4">
                <CustomTable columns={columns} data={studentsData.data} />

                <PaginationWrapper
                    currentPage={studentsData.current_page}
                    lastPage={studentsData.last_page}
                    perPage={studentsData.per_page}
                    total={studentsData.total}
                    onNavigate={navigateToPage}
                />
            </div>
        </>
    );
}
