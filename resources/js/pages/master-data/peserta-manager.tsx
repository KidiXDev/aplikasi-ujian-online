import AppLayout from '@/layouts/app-layout';
import { PageFilter, PageProps, PaginatedResponse, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';

import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { CAlertDialog } from '@/components/c-alert-dialog';
import { ContentTitle } from '@/components/content-title';
import { CButton, CButtonIcon } from '@/components/ui/c-button';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import { Select } from '@/components/ui/select';
import { SortDropdown } from '@/components/ui/sort-dropdown';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Peserta Manager',
        href: '/master-data/peserta',
    },
];

interface Peserta {
    id: number;
    username: string;
    password?: string;
    status: number;
    jurusan: number;
    nis: string;
    nama: string;
    filter: number;
    kategori_ref?: {
        id: number;
        kategori: string;
    };
}

interface PesertaPageFilter extends PageFilter {
    filter?: number;
    sort?: string;
    direction?: string;
}

export default function UserManager() {
    const {
        data: userData,
        filters,
        flash,
        filterOptions,
    } = usePage<
        PageProps<Peserta> & {
            filterOptions: number[];
            filters: PesertaPageFilter;
        }
    >().props;

    // Perbaiki useEffect untuk menghindari infinite loop
    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash.success, flash.error]); // Tambahkan dependency yang spesifik

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Peserta Manager" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ContentTitle
                    title="Data Peserta"
                    showButton
                    onButtonClick={() => router.visit(route('master-data.peserta.create'))}
                    extraButtons={
                        <CButton
                            className="bg-green-600 px-4 text-white shadow"
                            type="success"
                            onClick={() => router.visit(route('master-data.peserta.import.view'))}
                        >
                            Import
                        </CButton>
                    }
                />
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <EntriesSelector currentValue={userData.per_page} options={[10, 25, 50, 100]} routeName="master-data.peserta.manager" />
                    </div>

                    <div className="flex items-center gap-4">
                        <FilterDropdown
                            label="Filter"
                            currentValue={filters.filter ? String(filters.filter) : undefined}
                            options={
                                filterOptions?.map((filter) => ({
                                    value: String(filter),
                                    label: String(filter),
                                })) || []
                            }
                            routeName="master-data.peserta.manager"
                            paramName="filter"
                            placeholder="Pilih Filter"
                            className="w-32"
                        />

                        <SortDropdown
                            currentValue={filters.sort || 'newest'}
                            options={[
                                { value: 'newest', label: 'Newest First' },
                                { value: 'oldest', label: 'Oldest First' },
                            ]}
                            routeName="master-data.peserta.manager"
                            className="w-32"
                        />

                        <SearchInputMenu defaultValue={filters.search} routeName="master-data.peserta.manager" />
                    </div>
                </div>

                <UserTable data={userData} pageFilters={filters} />
            </div>
        </AppLayout>
    );
}

function UserTable({ data: userData, pageFilters: filters }: { data: PaginatedResponse<Peserta>; pageFilters: PesertaPageFilter }) {
    const [open, setOpen] = useState(false);
    const [targetId, setTargetId] = useState<number | null>(null);
    const [toggleOpen, setToggleOpen] = useState(false);
    const [targetPeserta, setTargetPeserta] = useState<Peserta | null>(null);
    
    // Tambahkan state untuk highlight
    const flash = (usePage().props as any).flash ?? {};
    const highlightId = flash.highlight_id as number | undefined;

    const AVAILABLE_COLORS = ['bg-blue-500', 'bg-yellow-500', 'bg-purple-600', 'bg-indigo-500', 'bg-orange-500'];
    const kategoriColorCache = new Map<string, string>();

    const getKategoriColor = (kategori: string): string => {
        if (!kategori || kategori.trim() === '-' || kategori.trim() === '') {
            return 'bg-gray-400';
        }

        const normalized = kategori.trim().toLowerCase();

        if (kategoriColorCache.has(normalized)) {
            return kategoriColorCache.get(normalized)!;
        }

        let hash = 0;
        for (let i = 0; i < normalized.length; i++) {
            hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
        }

        const colorIndex = Math.abs(hash) % AVAILABLE_COLORS.length;
        const selectedColor = AVAILABLE_COLORS[colorIndex];

        kategoriColorCache.set(normalized, selectedColor);
        return selectedColor;
    };

    const handleToggleStatus = (peserta: Peserta) => {
        setTargetPeserta(peserta);
        setToggleOpen(true);
    };

    const confirmToggleStatus = async () => {
        try {
            if (targetPeserta !== null) {
                router.put(
                    route('master-data.peserta.toggle-status', targetPeserta.id),
                    { status: targetPeserta.status ? 0 : 1 },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        onSuccess: () => {
                            // Jangan reload, biarkan Inertia handle update
                        },
                        onError: () => toast.error('Gagal mengubah status'),
                    },
                );
            }
        } catch {
            toast.error('Unexpected error occurred');
        } finally {
            setToggleOpen(false);
            setTargetPeserta(null);
        }
    };

    const handleDelete = (id: number) => {
        setTargetId(id);
        setOpen(true);
    };

    const confirmDelete = async () => {
        try {
            if (targetId !== null) {
                router.delete(route('master-data.peserta.destroy', targetId), {
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

    const navigateToPage = useCallback((page: number) => {
        const currentParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(currentParams);

        router.visit(route('master-data.peserta.manager'), {
            data: {
                ...params,
                page: page,
            },
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    const columns = [
        {
            label: 'No.',
            className: 'w-[100px] text-center',
            render: (peserta: Peserta) => {
                const currentPage = userData.current_page;
                const perPage = userData.per_page;
                const index = userData.data.findIndex((item) => item.id === peserta.id);
                const nomor = (currentPage - 1) * perPage + index + 1;
                // Tambahkan highlight untuk baris yang baru diedit
                const isHighlighted = highlightId === peserta.id;
                return (
                    <div className={`text-center font-medium ${isHighlighted ? 'bg-yellow-100' : ''}`}>
                        {nomor}
                    </div>
                );
            },
        },
        {
            label: 'NIS',
            className: 'w-[300px] text-center',
            render: (peserta: Peserta) => {
                const isHighlighted = highlightId === peserta.id;
                return (
                    <div className={`text-center ${isHighlighted ? 'bg-yellow-100' : ''}`}>
                        {peserta.nis}
                    </div>
                );
            },
        },
        {
            label: 'Nama',
            className: 'w-[400px] text-center',
            render: (peserta: Peserta) => {
                const isHighlighted = highlightId === peserta.id;
                return (
                    <div className={`${isHighlighted ? 'bg-yellow-100' : ''}`}>
                        {peserta.nama}
                    </div>
                );
            },
        },
        {
            label: 'Kategori',
            className: 'w-[300px] text-center',
            render: (peserta: Peserta) => {
                const kategori = peserta.kategori_ref?.kategori || '-';
                const color = getKategoriColor(kategori);
                const isHighlighted = highlightId === peserta.id;

                return (
                    <div className={`flex justify-center ${isHighlighted ? 'bg-yellow-100' : ''}`}>
                        <span className={`${color} rounded p-2 text-white shadow`}>{kategori}</span>
                    </div>
                );
            },
        },
        {
            label: 'Status',
            className: 'w-[150px] text-center',
            render: (peserta: Peserta) => {
                const isHighlighted = highlightId === peserta.id;
                return (
                    <div className={`flex items-center justify-center ${isHighlighted ? 'bg-yellow-100' : ''}`}>
                        <button
                            className={`w-[100px] rounded p-2 text-white shadow transition ${
                                peserta.status ? 'bg-green-600 hover:bg-green-700' : 'bg-button-danger hover:bg-red-700'
                            }`}
                            onClick={() => handleToggleStatus(peserta)}
                        >
                            {peserta.status ? 'Active' : 'Non Active'}
                        </button>
                    </div>
                );
            },
        },
        {
            label: 'Action',
            className: 'w-[150px] text-center',
            render: (peserta: Peserta) => {
                const isHighlighted = highlightId === peserta.id;
                return (
                    <div className={`flex justify-center gap-2 ${isHighlighted ? 'bg-yellow-100' : ''}`}>
                        <CButtonIcon icon={Pencil} onClick={() => router.visit(route('master-data.peserta.edit', peserta.id))} />
                        <CButtonIcon icon={Trash2} type="danger" onClick={() => handleDelete(peserta.id)} />
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <div className="flex flex-col gap-4">
                <CustomTable columns={columns} data={userData.data} />

                <PaginationWrapper
                    currentPage={userData.current_page}
                    lastPage={userData.last_page}
                    perPage={userData.per_page}
                    total={userData.total}
                    onNavigate={navigateToPage}
                />
            </div>

            <CAlertDialog
                open={open}
                setOpen={setOpen}
                onContinue={confirmDelete}
                title="Hapus Peserta?"
                description="Data peserta yang dihapus tidak dapat dikembalikan. Apakah kamu yakin ingin melanjutkan?"
            />

            <CAlertDialog
                open={toggleOpen}
                setOpen={setToggleOpen}
                onContinue={confirmToggleStatus}
                title="Ubah Status Peserta?"
                description={
                    targetPeserta
                        ? `Apakah kamu yakin ingin mengubah status peserta "${targetPeserta.nama}" menjadi ${targetPeserta.status ? 'Non Active' : 'Active'}?`
                        : 'Apakah kamu yakin ingin mengubah status peserta ini?'
                }
            />
        </>
    );
}
