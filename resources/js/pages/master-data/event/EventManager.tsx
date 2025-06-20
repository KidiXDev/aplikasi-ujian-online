import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { List, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { CAlertDialog } from '@/components/c-alert-dialog';
import { ContentTitle } from '@/components/content-title';
import { CButtonIcon } from '@/components/ui/c-button';
import { CustomTable } from '@/components/ui/c-table';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { router } from '@inertiajs/react';

const breadcrumbs = [{ title: 'Event', href: '/master-data/event' }];

interface EventType {
    id_event: number;
    nama_event: string;
    status: number;
}

export default function EventManager() {
    // Ambil data events dari props inertia, fallback ke array kosong jika undefined/null
    const { events } = (usePage().props as unknown) as { events?: EventType[] };
    const safeEvents = events ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Event" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ContentTitle
                    title="Data Event"
                    showButton
                    onButtonClick={() => router.visit(route('master-data.event.create'))}
                />
                <div className="mt-4 flex items-center justify-between">
                    <EntriesSelector currentValue={10} options={[10, 25, 50]} routeName="#" />
                    <SearchInputMenu defaultValue={''} routeName="#" />
                </div>
                <EventTable data={safeEvents} />
            </div>
        </AppLayout>
    );
}

function EventTable({ data }: { data: EventType[] }) {
    const [open, setOpen] = useState(false);
    const [targetId, setTargetId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setTargetId(id);
        setOpen(true);
    };

    const confirmDelete = () => {
        toast.success(`Event dengan ID ${targetId} berhasil dihapus`);
        setOpen(false);
    };

    const columns = [
        {
            label: 'ID',
            className: 'text-center w-[100px]',
            render: (event: EventType) => (
                <div className="text-center font-medium">{event.id_event}</div>
            ),
        },
        {
            label: 'Nama Event',
            className: 'text-left w-[400px]',
            render: (event: EventType) => <div>{event.nama_event}</div>,
        },
        {
            label: 'Status',
            className: 'text-center w-[200px]',
            render: (event: EventType) => (
                <div className="flex justify-center">
                    <span
                        className={`px-3 py-1 rounded text-white font-semibold text-sm ${
                            event.status === 1 ? 'bg-green-600' : 'bg-red-600'
                        }`}
                    >
                        {event.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                </div>
            ),
        },
        {
            label: 'Action',
            className: 'text-center w-[150px]',
            render: (event: EventType) => (
                <div className="flex justify-center gap-2">
                    <CButtonIcon icon={List} className="bg-yellow-500" onClick={() => alert(`Detail event ${event.id_event}`)} />
                    <CButtonIcon icon={Pencil} onClick={() => window.location.href = route('master-data.event.edit', event.id_event)} />
                    <CButtonIcon icon={Trash2} type="danger" onClick={() => handleDelete(event.id_event)} />
                </div>
            ),
        },
    ];

    return (
        <>
            <CustomTable columns={columns} data={data} />
            <PaginationWrapper currentPage={1} lastPage={1} perPage={10} total={data ? data.length : 0} onNavigate={() => {}} />
            <CAlertDialog open={open} setOpen={setOpen} onContinue={confirmDelete} />
        </>
    );
}
