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
        title: 'Master Data',
        href: '/master-data',
    },
    {
        title: 'Event',
        href: '/master-data/event',
    },
];

type Event = {
    id_event: number;
    nama_event: string;
    mulai_event: string;
    akhir_event: string;
    create_event: string;
    status: number;
};

export default function EventManager() {
    const { data: eventData, filters, flash } = usePage<PageProps<Event>>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Event Manager" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ContentTitle title="Event Manager" showButton onButtonClick={() => router.visit(route('master-data.event.create'))} />
                <div className="mt-4 flex items-center justify-between">
                    <EntriesSelector currentValue={eventData.per_page} options={[10, 25, 50, 100]} routeName="master-data.event.index" />
                    <SearchInputMenu defaultValue={filters.search} routeName="master-data.event.index" />
                </div>
                <EventTable data={eventData} pageFilters={filters} />
            </div>
        </AppLayout>
    );
}

function EventTable({ data: eventData, pageFilters: filters }: { data: PaginatedResponse<Event>; pageFilters: PageFilter }) {
    const [open, setOpen] = useState(false);
    const [targetId, setTargetId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setTargetId(id);
        setOpen(true);
    };

    const confirmDelete = async () => {
        try {
            if (targetId !== null) {
                router.delete(route('master-data.event.destroy', targetId), {
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

    const navigateToPage = (page: number) => {
        router.visit(route('master-data.event.index'), {
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
            label: 'Nama Event',
            render: (event: Event) => event.nama_event,
        },
        {
            label: 'Mulai Event',
            render: (event: Event) => new Date(event.mulai_event).toLocaleDateString('id-ID'),
        },
        {
            label: 'Akhir Event',
            render: (event: Event) => new Date(event.akhir_event).toLocaleDateString('id-ID'),
        },
        {
            label: 'Tanggal Dibuat',
            render: (event: Event) => new Date(event.create_event).toLocaleDateString('id-ID'),
        },
        {
            label: 'Status',
            render: (event: Event) => (event.status === 1 ? 'Aktif' : 'Tidak Aktif'),
        },
        {
            label: 'Aksi',
            className: 'w-[100px] text-center',
            render: (event: Event) => (
                <div className="flex justify-center gap-2">
                    <CButtonIcon icon={Pencil} onClick={() => router.visit(route('master-data.event.edit', event.id_event))} />
                    <CButtonIcon icon={Trash2} type="danger" onClick={() => handleDelete(event.id_event)} />
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="flex flex-col gap-4">
                <CustomTable columns={columns} data={eventData.data} />

                <PaginationWrapper
                    currentPage={eventData.current_page}
                    lastPage={eventData.last_page}
                    perPage={eventData.per_page}
                    total={eventData.total}
                    onNavigate={navigateToPage}
                />
            </div>

            <CAlertDialog open={open} setOpen={setOpen} onContinue={confirmDelete} />
        </>
    );
}
