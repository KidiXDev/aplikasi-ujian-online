import AppLayout from '@/layouts/app-layout';
import { PageFilter, PageProps, PaginatedResponse, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';

import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { CAlertDialog } from '@/components/c-alert-dialog';
import { ContentTitle } from '@/components/content-title';
import { CButton, CButtonIcon } from '@/components/ui/c-button';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Peserta',
        href: '/master-data/peserta',
    },
];

interface Peserta {
    id: number;
    username: string;
    password?: string; // Optional jika tidak digunakan di frontend
    status: number;
    jurusan: number;
    nis: string;
    nama: string;
    jurusan_ref?: {
        id_jurusan: number;
        nama_jurusan: string;
    };
}

export default function UserManager() {
    const { data: userData, filters, flash } = usePage<PageProps<Peserta>>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

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
                            onClick={() => router.visit(route('master-data.import.view'))}
                        >
                            Import
                        </CButton>
                    }
                />
                <div className="mt-4 flex items-center justify-between">
                    <EntriesSelector currentValue={userData.per_page} options={[10, 25, 50, 100]} routeName="master-data.peserta.manager" />
                    <SearchInputMenu defaultValue={filters.search} routeName="master-data.peserta.manager" />
                </div>
                <UserTable data={userData} pageFilters={filters} />
            </div>
        </AppLayout>
    );
}

// const RoleDecorator: React.FC<{ role: string }> = ({ role }) => {
//     switch (role) {
//         case 'super_admin':
//             return <span className="bg-button-danger mr-2 rounded p-2 text-white shadow">{role}</span>;
//         case 'admin':
//             return <span className="mr-2 rounded bg-yellow-500 p-2 text-white shadow">{role}</span>;
//         case 'dosen':
//             return <span className="mr-2 rounded bg-pink-500 p-2 text-white shadow">{role}</span>;
//         case 'peserta':
//             return <span className="mr-2 rounded bg-pink-500 p-2 text-white shadow">{role}</span>;
//         default:
//             return <span className="mr-2 text-white">{role}</span>;
//     }
// };

function UserTable({ data: userData, pageFilters: filters }: { data: PaginatedResponse<Peserta>; pageFilters: PageFilter }) {
    const [open, setOpen] = useState(false);
    const [targetId, setTargetId] = useState<number | null>(null);

    const handleToggleStatus = (peserta: Peserta) => {
        router.put(
            route('master-data.peserta.toggle-status', peserta.id),
            { status: peserta.status ? 0 : 1 },
            {
                preserveState: true,
                preserveScroll: true,
                // onSuccess: () => toast.success('Status berhasil diubah'),
                // onError: () => toast.error('Gagal mengubah status'),
            },
        );
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

    // Helper function to navigate with preserved search parameters
    const navigateToPage = (page: number) => {
        router.visit(route('master-data.peserta.manager'), {
            data: {
                page: page,
                search: filters.search,
                pages: filters.pages,
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns = [
        {
            label: 'No.',
            className: 'w-[100px] text-center',
            render: (peserta: Peserta) => {
                // Find the index of the current peserta in the data array
                const idx = userData.data.findIndex((item) => item.id === peserta.id);
                return <div className="text-center font-medium">{idx + 1}</div>;
            },
        },
        {
            label: 'NIS',
            className: 'w-[300px] text-center',
            render: (peserta: Peserta) => <div className="text-center">{peserta.nis}</div>,
        },

        {
            label: 'Nama',
            className: 'w-[400px] text-center',
            render: (peserta: Peserta) => peserta.nama,
        },

        {
            label: 'Jurusan',
            className: 'w-[300px] text-center',
            render: (peserta: Peserta) => {
                const jurusan = peserta.jurusan_ref?.nama_jurusan || '-';
                let color = 'bg-gray-400';
                if (jurusan === 'TOEFL Prediction') color = 'bg-yellow-500';
                else if (jurusan === 'TEPPS') color = 'bg-purple-600';

                return (
                    <div className="flex justify-center">
                        <span className={`${color} rounded p-2 text-white shadow`}>{jurusan}</span>
                    </div>
                );
            },
        },
        {
            label: 'Status',
            className: 'w-[150px] text-center',
            render: (peserta: Peserta) => (
                <div className="flex items-center justify-center">
                    <button
                        className={`rounded p-2 text-white shadow transition ${
                            peserta.status ? 'bg-green-600 hover:bg-green-700' : 'bg-button-danger hover:bg-red-700'
                        }`}
                        onClick={() => handleToggleStatus(peserta)}
                        title="Klik untuk ubah status"
                    >
                        {peserta.status ? 'Active' : 'Non Active'}
                    </button>
                </div>
            ),
        },
        {
            label: 'Action',
            className: 'w-[150px] text-center',
            render: (peserta: Peserta) => (
                <div className="flex justify-center gap-2">
                    <CButtonIcon icon={Pencil} onClick={() => router.visit(route('master-data.peserta.edit', peserta.id))} />
                    <CButtonIcon icon={Trash2} type="danger" onClick={() => handleDelete(peserta.id)} />
                </div>
            ),
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
        </>
    );
}
