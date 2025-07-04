import AppLayout from '@/layouts/app-layout';
import { PageFilter, PageProps, PaginatedResponse, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';

import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

import { CAlertDialog } from '@/components/c-alert-dialog';
import { ContentTitle } from '@/components/content-title';
import { CButton, CButtonIcon } from '@/components/ui/c-button';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dosen Manager',
        href: '/user-management/dosen',
    },
];

interface Dosen {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
    dosen: {
        nip: string;
        aktif: boolean;
    };
}

export default function UserManager() {
    const { data: userData, filters, flash } = usePage<PageProps<Dosen>>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dosen Manager" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ContentTitle
                    title="Data Dosen"
                    showButton
                    onButtonClick={() => router.visit(route('master-data.dosen.create'))}
                    extraButtons={
                        <CButton
                            className="bg-green-600 px-4 text-white shadow"
                            type="success"
                            onClick={() => router.visit(route('master-data.import-dosen.view'))}
                        >
                            Import
                        </CButton>
                    }
                />
                <div className="mt-4 flex items-center justify-between">
                    <EntriesSelector currentValue={userData.per_page} options={[10, 12, 25, 50, 100]} routeName="master-data.dosen.manager" />
                    <SearchInputMenu defaultValue={filters.search} routeName="master-data.dosen.manager" />
                </div>
                <UserTable data={userData} pageFilters={filters} />
            </div>
        </AppLayout>
    );
}


function UserTable({ data: userData, pageFilters: filters }: { data: PaginatedResponse<Dosen>; pageFilters: PageFilter }) {
    const [open, setOpen] = useState(false);
    const [targetId, setTargetId] = useState<number | null>(null);
    const [users, setUsers] = useState(userData.data);

    useEffect(() => {
        setUsers(userData.data);
    }, [userData.data]);

    const handleDelete = (id: number) => {
        setTargetId(id);
        setOpen(true);
    };

    const confirmDelete = async () => {
        try {
            if (targetId !== null) {
                router.delete(route('master-data.dosen.destroy', targetId), {
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
        router.visit(route('master-data.dosen.manager'), {
            data: {
                page: page,
                search: filters.search,
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleToggleStatus = async (user: Dosen) => {
        try {
            const res = await axios.put(route('master-data.dosen.toggle-status', user.id));
            if (res.data.success) {
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === user.id
                            ? { ...u, dosen: { ...u.dosen, aktif: res.data.aktif } }
                            : u
                    )
                );
            }
        } catch {
            toast.error('Gagal mengubah status');
        }
    };

    const columns = [
        {
            label: 'No',
            className: 'w-[60px] text-center',
            render: (user: Dosen) => {
                const idx = users.findIndex(u => u.id === user.id);
                return (
                    <div className="text-center">
                        {(userData.per_page * (userData.current_page - 1)) + idx + 1}
                    </div>
                );
            },
        },
        {
            label: 'ID',
            className: 'w-[100px] text-center',
            render: (user: Dosen) => <div className="text-center font-medium">{user.id}</div>,
        },
        {
            label: 'NIP',
            render: (user: Dosen) => user.dosen?.nip,
        },
        {
            label: 'Nama',
            className: 'w-[400px]',
            render: (user: Dosen) => user.name,
        },
        {
            label: 'Email',
            className: 'w-[400px]',
            render: (user: Dosen) => user.email,
        },
        {
            label: 'Status',
            className: 'w-[150px] text-center',
            render: (user: Dosen) => (
                <div className="flex items-center justify-center">
                    <CButton
                        className={`rounded p-2 text-white shadow transition w-[100px] 
                            ${user.dosen?.aktif ? 'bg-green-600 hover:bg-green-700' : 'bg-button-danger hover:bg-red-700'}`}
                        onClick={async () => {
                            try {
                                await handleToggleStatus(user);
                                toast.success('Status berhasil diubah');
                            } catch {
                                toast.error('Gagal mengubah status');
                            }
                        }}
                    >
                        {user.dosen?.aktif ? 'Active' : 'Non Active'}
                    </CButton>
                </div>
            ),
        },
        {
            label: 'Roles',
            className: 'w-[150px] text-center',
            render: (user: Dosen) => (
                <div className="flex flex-wrap justify-center gap-1">
                    {user.roles.map((r) => (
                        <CButton
                            key={r.name}
                            className={
                                (r.name === 'super_admin'
                                    ? 'bg-red-700'
                                    : r.name === 'admin'
                                    ? 'bg-yellow-500'
                                    : r.name === 'dosen'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-400') +
                                ' px-2 py-1 text-sm text-white shadow !opacity-100'
                            }
                            disabled
                        >
                            {r.name}
                        </CButton>
                    ))}
                </div>
            ),
        },

        {
            label: 'Action',
            className: 'w-[100px] text-center',
            render: (user: Dosen) => (
                <div className="flex justify-center gap-2">
                    <CButtonIcon icon={Pencil} onClick={() => router.visit(route('master-data.dosen.edit', user.id))} />
                    <CButtonIcon icon={Trash2} type="danger" onClick={() => handleDelete(user.id)} />
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="flex flex-col gap-4">
                <CustomTable columns={columns} data={users} />

                <PaginationWrapper
                    currentPage={userData.current_page}
                    lastPage={userData.last_page}
                    perPage={userData.per_page}
                    total={userData.total}
                    onNavigate={navigateToPage}
                />
            </div>

            <CAlertDialog open={open} setOpen={setOpen} onContinue={confirmDelete} />
        </>
    );
}
