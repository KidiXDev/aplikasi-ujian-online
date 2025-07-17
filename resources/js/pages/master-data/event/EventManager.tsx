import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useEffect, useState, useMemo } from 'react';
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
    jumlah_part?: number;
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
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

const breadcrumbs = [{ title: 'Paket Soal', href: '/master-data/paket' }];

export default function EventManager() {
    const { props, url } = usePage<EventsPageProps>();
    const events = props.events;
    const data = events.data;
    const params = new URLSearchParams(url.split('?')[1] || '');

    // Handle flash messages
    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
        if (props.flash?.error) {
            toast.error(props.flash.error);
        }
    }, [props.flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Paket Soal" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ContentTitle
                    title="Paket Soal"
                    showButton
                    onButtonClick={() => router.visit(route('master-data.paket.create'))}
                />
                
                <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <EntriesSelector
                            currentValue={events.per_page}
                            options={[10, 25, 50, 100]}
                            routeName="master-data.paket.getEvent"
                            paramName="pages"
                            routeParams={{
                                search: params.get('search') || '',
                                status: params.get('status') || '',
                                sort: params.get('sort') || 'asc',
                            }}
                        />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <StatusFilter 
                            currentValue={params.get('status') || ''}
                            routeParams={{
                                search: params.get('search') || '',
                                pages: params.get('pages') || events.per_page.toString(),
                                sort: params.get('sort') || 'asc',
                            }}
                        />
                        
                        <SortFilter 
                            currentValue={params.get('sort') || 'asc'}
                            routeParams={{
                                search: params.get('search') || '',
                                pages: params.get('pages') || events.per_page.toString(),
                                status: params.get('status') || '',
                            }}
                        />
                        
                        <SearchInputMenu
                            defaultValue={params.get('search') || ''}
                            routeName="master-data.paket.getEvent"
                            paramName="search"
                            routeParams={{
                                pages: params.get('pages') || events.per_page.toString(),
                                status: params.get('status') || '',
                                sort: params.get('sort') || 'asc',
                            }}
                        />
                    </div>
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
        router.visit(route('master-data.paket.getEvent'), {
            data: {
                ...routeParams,
                status: status,
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="flex items-center gap-4">
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

// Sort Filter Component
function SortFilter({ 
    currentValue, 
    routeParams 
}: { 
    currentValue: string;
    routeParams: { [key: string]: string };
}) {
    const handleSortChange = (sort: string) => {
        router.visit(route('master-data.paket.getEvent'), {
            data: {
                ...routeParams,
                sort: sort,
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Urutkan:</label>
            <select
                value={currentValue}
                onChange={(e) => handleSortChange(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                <option value="asc">Terlama</option>
                <option value="desc">Terbaru</option>
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

    // Sort data based on query parameter
    const sortOrder = queryParams.get('sort') || 'asc';
    const sortedData = useMemo(() => {
        const sorted = [...tableData];
        return sorted.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.id_event - b.id_event; // Terkecil ke terbesar
            } else {
                return b.id_event - a.id_event; // Terbesar ke terkecil
            }
        });
    }, [tableData, sortOrder]);

    // Tambahkan nomor urut pada data yang sudah diurutkan
    const dataWithNumbers = sortedData.map((event, index) => ({
        ...event,
        nomor: ((events.current_page - 1) * events.per_page) + index + 1,
    }));

    const handleToggleStatus = (id: number) => {
        setTargetId(id);
        setActionType('toggle');
        setOpen(true);
    };

    const confirmAction = () => {
        if (!targetId) return;
        
        // Ambil parameter saat ini untuk mempertahankan filter
        const currentParams = {
            pages: queryParams.get('pages') || events.per_page.toString(),
            search: queryParams.get('search') || '',
            status: queryParams.get('status') || '',
            sort: queryParams.get('sort') || 'asc',
            page: queryParams.get('page') || '1'
        };
        
        if (actionType === 'delete') {
            router.delete(route('master-data.paket.destroy', targetId), {
                data: currentParams,
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Paket soal berhasil dihapus');
                    // Remove from local state
                    setTableData(prev => prev.filter(ev => ev.id_event !== targetId));
                },
                onError: () => {
                    toast.error('Gagal menghapus paket soal');
                },
            });
        } else {
            // Toggle status
            router.put(route('master-data.paket.updateStatus', targetId), currentParams, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Status paket soal berhasil diubah');
                    // Update local state
                    setTableData(prev =>
                        prev.map(ev => {
                            if (ev.id_event === targetId) {
                                return { ...ev, status: ev.status === 1 ? 0 : 1 };
                            }
                            return ev;
                        })
                    );
                    // Refresh halaman dengan parameter yang sama untuk mempertahankan filter
                    router.visit(route('master-data.paket.getEvent'), {
                        data: currentParams,
                        preserveScroll: true
                    });
                },
                onError: () => {
                    toast.error('Gagal mengubah status paket soal');
                },
            });
        }
        
        setOpen(false);
    };

    const columns = [
        {
            label: 'No',
            className: 'text-center w-[60px]',
            render: (event: typeof dataWithNumbers[0]) => (
                <div className="text-center font-medium">{event.nomor}</div>
            ),
        },
        {
            label: 'ID',
            className: 'text-center w-[100px]',
            render: (event: EventType) => (
                <div className="text-center font-medium">{event.id_event}</div>
            ),
        },
        {
            label: 'Nama Paket Soal',
            className: 'text-center w-[350px]',
            render: (event: EventType) => <div>{event.nama_event}</div>,
        },
        {
            label: 'Status',
            className: 'text-center w-[150px]',
            render: (event: EventType) => (
                <div className="flex justify-center">
                    <button
                        className={`px-4 py-2.5 rounded text-white font-semibold text-xs w-[110px] text-center transition-colors duration-200 ${
                            event.status === 1 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-red-600 hover:bg-red-700'
                        }`}
                        onClick={() => handleToggleStatus(event.id_event)}
                    >
                        {event.status === 1 ? 'Aktif' : 'Nonaktif'}
                    </button>
                </div>
            ),
        },
        {
            label: 'Jumlah Part',
            className: 'text-center w-[120px]',
            render: (event: EventType) => {
                const jumlahPart = event.jumlah_part || 0;
                return (
                    <div className="text-center">
                        <span 
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-help ${
                                jumlahPart > 0 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                            title={`Event ini memiliki ${jumlahPart} part/paket soal`}
                        >
                            {jumlahPart} Part
                        </span>
                    </div>
                );
            },
        },
        {
            label: 'Mulai Paket Soal',
            className: 'text-center w-[150px]',
            render: (event: EventType) => (
                <div className="text-center">
                    {event.mulai_event
                        ? new Date(event.mulai_event).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                          })
                        : '-'}
                </div>
            ),
        },
        {
            label: 'Akhir Paket Soal',
            className: 'text-center w-[150px]',
            render: (event: EventType) => (
                <div className="text-center">
                    {event.akhir_event
                        ? new Date(event.akhir_event).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                          })
                        : '-'}
                </div>
            ),
        },
        {
            label: 'Action',
            className: 'text-center w-[200px]',
            render: (event: EventType) => (
                <div className="flex justify-center gap-1">
                    <CButtonIcon
                        icon={List}
                        className="bg-yellow-500"
                        onClick={() => router.visit(`/master-data/part/${event.id_event}`)}
                    />
                    <CButtonIcon
                        icon={Pencil}
                        onClick={() =>
                            router.visit(route('master-data.paket.edit', event.id_event))
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
            <CustomTable columns={columns} data={dataWithNumbers} />
            <PaginationWrapper
                currentPage={events.current_page}
                lastPage={events.last_page}
                perPage={events.per_page}
                total={events.total}
                onNavigate={(page) => {
                    router.visit(
                        route('master-data.paket.getEvent', {
                            pages: queryParams.get('pages') || events.per_page.toString(),
                            search: queryParams.get('search') || '',
                            status: queryParams.get('status') || '',
                            sort: queryParams.get('sort') || 'asc',
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
