import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { List, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { CAlertDialog } from '@/components/c-alert-dialog';
import { ContentTitle } from '@/components/content-title';
import { CButtonIcon } from '@/components/ui/c-button';
import { CustomTable } from '@/components/ui/c-table';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import { EntriesSelector } from '@/components/ui/entries-selector';

interface EventType {
    id_event: number;
    nama_event: string;
    status: number;
    mulai_event?: string;
    akhir_event?: string;
}

interface EventsData {
    data: EventType[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface EventsPageProps {
    events: EventsData;
    [key: string]: unknown;
}

const breadcrumbs = [{ title: 'Event', href: '/master-data/event' }];

export default function EventManager() {
    const { props, url } = usePage<EventsPageProps>();
    const events = props.events;
    const data = events.data;
    const params = new URLSearchParams(url.split('?')[1] || '');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Event" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ContentTitle
                    title="Paket Soal"
                    showButton
                    onButtonClick={() => router.visit(route('master-data.event.create'))}
                />
                <div className="mt-4 flex items-center justify-between gap-4">
    <EntriesSelector
        currentValue={events.per_page}
        options={[10, 25, 50]}
        routeName="master-data.event.getEvent"
        paramName="pages"
        routeParams={{
            search: params.get('search') || '',
            status: params.get('status') || '',
        }}
    />

    <div className="flex gap-2 items-center">
        <select
            className="rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            value={params.get('status') || ''}
            onChange={(e) => {
                router.visit(
                    route('master-data.event.getEvent', {
                        pages: params.get('pages') || events.per_page,
                        search: params.get('search') || '',
                        status: e.target.value,
                    }),
                    { preserveScroll: true, only: ['events'] }
                );
            }}
        >
            <option value="">Semua Status</option>
            <option value="1">Aktif</option>
            <option value="0">Tidak Aktif</option>
        </select>

        <SearchInputMenu
            defaultValue={params.get('search') || ''}
            routeName="master-data.event.getEvent"
            paramName="search"
            routeParams={{
                pages: params.get('pages') || events.per_page.toString(),
                status: params.get('status') || '',
            }}
        />
    </div>
</div>

                <EventTable data={data} events={events} queryParams={params} />
            </div>
        </AppLayout>
    );
}

function EventTable({
    data,
    events,
    queryParams,
}: {
    data: EventType[];
    events: EventsData;
    queryParams: URLSearchParams;
}) {
    const [open, setOpen] = useState(false);
    const [targetId, setTargetId] = useState<number | null>(null);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [statusTarget, setStatusTarget] = useState<{ id: number; status: number } | null>(null);
    const [tableData, setTableData] = useState<EventType[]>(data);

    useEffect(() => {
        setTableData(data);
    }, [data]);

    const handleDelete = (id: number) => {
        setTargetId(id);
        setOpen(true);
    };

    const confirmDelete = () => {
        if (!targetId) return;
        router.delete(route('master-data.event.destroy', targetId), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Event berhasil dihapus');
            },
            onError: () => {
                toast.error('Gagal menghapus event');
            },
        });
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
                    <button
                        className={`px-3 py-1 rounded text-white font-semibold text-sm min-w-[100px] text-center focus:outline-none transition-colors duration-200 ${
                            event.status === 1 ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                        }`}
                        onClick={() => {
                            setStatusTarget({ id: event.id_event, status: event.status });
                            setStatusDialogOpen(true);
                        }}
                    >
                        {event.status === 1 ? 'Aktif' : 'Tidak Aktif'}
                    </button>
                </div>
            ),
        },
        {
            label: 'Mulai Event',
            className: 'text-center w-[200px]',
            render: (event: EventType) => (
                <div className="text-center">
                    {event.mulai_event
                        ? new Date(event.mulai_event).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                          })
                        : '-'}
                </div>
            ),
        },
        {
            label: 'Akhir Event',
            className: 'text-center w-[200px]',
            render: (event: EventType) => (
                <div className="text-center">
                    {event.akhir_event
                        ? new Date(event.akhir_event).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                          })
                        : '-'}
                </div>
            ),
        },
        {
            label: 'Action',
            className: 'text-center w-[150px]',
            render: (event: EventType) => (
                <div className="flex justify-center gap-2">
                    <CButtonIcon
                        icon={List}
                        className="bg-yellow-500"
                        onClick={() => router.visit(`/master-data/paket-soal/${event.id_event}`)}
                    />
                    <CButtonIcon
                        icon={Pencil}
                        onClick={() =>
                            router.visit(route('master-data.event.edit', event.id_event))
                        }
                    />
                    <CButtonIcon
                        icon={Trash2}
                        type="danger"
                        onClick={() => handleDelete(event.id_event)}
                    />
                </div>
            ),
        },
    ];

    const confirmStatusChange = () => {
        if (!statusTarget) return;
        router.put(
            route('master-data.event.toggleStatus', statusTarget.id),
            { status: statusTarget.status === 1 ? 0 : 1 },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Status event berhasil diubah');
                    setTableData(prev =>
                        prev.map(ev =>
                            ev.id_event === statusTarget.id
                                ? { ...ev, status: statusTarget.status === 1 ? 0 : 1 }
                                : ev
                        )
                    );
                },
                onError: () => {
                    toast.error('Gagal mengubah status event');
                },
            }
        );
        setStatusDialogOpen(false);
        setStatusTarget(null);
    };

    return (
        <>
            <CustomTable columns={columns} data={tableData} />
            <PaginationWrapper
                currentPage={events.current_page}
                lastPage={events.last_page}
                perPage={events.per_page}
                total={events.total}
                onNavigate={(page) => {
                    router.visit(
                        route('master-data.event.getEvent', {
                            pages: queryParams.get('pages') || events.per_page,
                            search: queryParams.get('search') || '',
                            page,
                        }),
                        { preserveScroll: true, only: ['events'] }
                    );
                }}
            />
            <CAlertDialog open={open} setOpen={setOpen} onContinue={confirmDelete} />
            <CAlertDialog
                open={statusDialogOpen}
                setOpen={setStatusDialogOpen}
                onContinue={confirmStatusChange}
                title="Konfirmasi Ubah Status"
                description={`Apakah Anda yakin ingin mengubah status event menjadi ${
                    statusTarget?.status === 1 ? 'Tidak Aktif' : 'Aktif'
                }?`}
            />
        </>
    );
}
