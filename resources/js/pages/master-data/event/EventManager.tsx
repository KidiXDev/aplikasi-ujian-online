import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { List, Pencil} from 'lucide-react';
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
                    <div className="flex items-center gap-4">
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
                        
                        <StatusFilter 
                            currentValue={params.get('status') || ''}
                            routeParams={{
                                search: params.get('search') || '',
                                pages: params.get('pages') || events.per_page.toString(),
                            }}
                        />
                    </div>
                    
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

                <EventTable data={data} events={events} queryParams={params} />
            </div>
        </AppLayout>
    );
}

// Status Filter Component
function StatusFilter({ 
    currentValue, 
    routeParams 
}: { 
    currentValue: string;
    routeParams: { [key: string]: string };
}) {
    const handleStatusChange = (status: string) => {
        router.visit(route('master-data.event.getEvent'), {
            data: {
                ...routeParams,
                status: status,
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
                value={currentValue}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                <option value="">Semua Status</option>
                <option value="1">Aktif</option>
                <option value="0">Tidak Aktif</option>
            </select>
        </div>
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
    const [actionType, setActionType] = useState<'delete' | 'toggle'>('delete');
    const [tableData, setTableData] = useState<EventType[]>(data);

    useEffect(() => {
        setTableData(data);
    }, [data]);

    const handleToggleStatus = (id: number) => {
        setTargetId(id);
        setActionType('toggle');
        setOpen(true);
    };

    const confirmAction = () => {
        if (!targetId) return;
        
        if (actionType === 'delete') {
            router.delete(route('master-data.event.destroy', targetId), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Event berhasil dihapus');
                    // Remove from local state
                    setTableData(prev => prev.filter(ev => ev.id_event !== targetId));
                },
                onError: () => {
                    toast.error('Gagal menghapus event');
                },
            });
        } else {
            // Toggle status
            router.put(route('master-data.event.updateStatus', targetId), {}, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Update local state
                    setTableData(prev =>
                        prev.map(ev => {
                            if (ev.id_event === targetId) {
                                return { ...ev, status: ev.status === 1 ? 0 : 1 };
                            }
                            return ev;
                        })
                    );
                },
                onError: () => {
                    toast.error('Gagal mengubah status event');
                },
            });
        }
        
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
                        className={`px-3 py-1 rounded text-white font-semibold text-sm min-w-[100px] text-center transition-colors duration-200 ${
                            event.status === 1 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-red-600 hover:bg-red-700'
                        }`}
                        onClick={() => handleToggleStatus(event.id_event)}
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
            className: 'text-center w-[180px]',
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
                </div>
            ),
        },
    ];

    const getDialogContent = () => {
        switch (actionType) {
            case 'delete':
                return {
                    title: 'Hapus Event',
                    description: 'Apakah Anda yakin ingin menghapus event ini? Tindakan ini tidak dapat dibatalkan.'
                };
            case 'toggle':
                return {
                    title: 'Ubah Status Event',
                    description: 'Apakah Anda yakin ingin mengubah status event ini?'
                };
            default:
                return {
                    title: 'Konfirmasi',
                    description: 'Apakah Anda yakin ingin melanjutkan?'
                };
        }
    };

    const dialogContent = getDialogContent();

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
                            status: queryParams.get('status') || '',
                            page,
                        }),
                        { preserveScroll: true }
                    );
                }}
            />
            
            <CAlertDialog 
                open={open} 
                setOpen={setOpen} 
                onContinue={confirmAction}
                title={dialogContent.title}
                description={dialogContent.description}
            />
        </>
    );
}
