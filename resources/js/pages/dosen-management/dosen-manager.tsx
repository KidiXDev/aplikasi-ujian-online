import AppLayout from '@/layouts/app-layout';
import { PageFilter, PageProps, PaginatedResponse, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';

import { Pencil, Trash2, ChevronDown } from 'lucide-react';
import { Listbox } from '@headlessui/react';
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
    nip: string;
    nama: string;
    aktif: boolean;
    password?: string;
}

const statusOptions = [
    { label: 'Semua', value: '' },
    { label: 'Aktif', value: '1' },
    { label: 'Tidak Aktif', value: '0' },
];

export default function UserManager() {
    const { data: userData, filters, flash } = usePage<PageProps<Dosen>>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    // State untuk filter status
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    // Handler filter status
    const handleStatusChange = (selected: string) => {
        setSelectedStatus(selected);
        router.visit(route('master-data.dosen.manager'), {
            data: {
                ...filters,
                status: selected,
                page: 1,
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

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
                    <div className="flex items-center gap-2">
                    <EntriesSelector currentValue={userData.per_page} options={[10, 12, 25, 50, 100]} routeName="master-data.dosen.manager" />
                        {/* Filter Status */}
                        <div className="relative w-[150px]">
                            <Listbox value={selectedStatus} onChange={handleStatusChange}>
                                <div className="relative">
                                    <Listbox.Button className="flex w-full rounded-lg border border-gray-300 px-3 py-2 text-left text-sm text-gray-700">
                                        {statusOptions.find((o) => o.value === selectedStatus)?.label || 'Semua'}
                                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                        </span>
                                    </Listbox.Button>
                                    <Listbox.Options className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow">
                                        {statusOptions.map((option) => (
                                            <Listbox.Option
                                                key={option.value}
                                                value={option.value}
                                                className={({ active }) =>
                                                    `cursor-pointer px-4 py-2 text-sm ${
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                    }`
                                                }
                                            >
                                                {option.label}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </div>
                            </Listbox>
                    </div>
                </div>
                    <SearchInputMenu defaultValue={filters.search} routeName="master-data.dosen.manager" />
                </div>
                <UserTable data={userData} pageFilters={filters} />
            </div>
        </AppLayout>
    );
}


function UserTable({ data: userData, pageFilters: filters }: { data: PaginatedResponse<Dosen>; pageFilters: PageFilter }) {
    const [open, setOpen] = useState(false);
    const [targetId, setTargetId] = useState<string | null>(null);
    const [users, setUsers] = useState(userData.data);
    
    const [openToggle, setOpenToggle] = useState(false);
    const [toggleId, setToggleId] = useState<string | null>(null);

     // 🆕 State untuk custom title & description
    const [dialogTitle, setDialogTitle] = useState<string>('Are you sure?');
    const [dialogDescription, setDialogDescription] = useState<string>('This action cannot be undone.');
    
    useEffect(() => {
        setUsers(userData.data);
    }, [userData.data]);

    const handleDelete = (nip: string) => {
        setTargetId(nip);
        setOpen(true);
    };

    const confirmDelete = async () => {
        if (targetId !== null) {
            router.delete(route('master-data.dosen.destroy', targetId), {
                preserveState: true,
                preserveScroll: true,
            });
        }
        setOpen(false);
    };


    // Toggle Status
    const handleToggleConfirm = (nip: string) => {
        setToggleId(nip);
        setDialogTitle('Are you sure?');
        setDialogDescription("This action will change the selected user's status. You can revert this change at any time.")
        setOpenToggle(true);
    };

    const confirmToggle = async () => {
        if (toggleId !== null) {
            try {
                const res = await axios.put(route('master-data.dosen.toggle-status', toggleId));
                if (res.data.success) {
                    toast.success('Status berhasil diubah');
                    setUsers((prev) =>
                        prev.map((u) =>
                            u.nip === toggleId ? { ...u, aktif: res.data.aktif } : u
                        )
                    );
                } else {
                    toast.error('Gagal mengubah status');
                }
            } catch {
                toast.error('Gagal mengubah status');
            }
        }
        setOpenToggle(false);
    };

    // Pagination helper
    const navigateToPage = (page: number) => {
        router.visit(route('master-data.dosen.manager'), {
            data: {
                page: page,
                search: filters.search,
                status: filters.status,
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const numberedUsers = users.map((user, idx) => ({
        ...user,
        no: ((userData?.per_page ?? 10) * ((userData?.current_page ?? 1) - 1)) + idx + 1,
    }));

    const columns = [
        {
            label: 'No',
            className: 'w-[60px] text-center',
            render: (user: Dosen & { no?: number }) => (
                <div className="text-center">{user.no}</div>
            ),
        },
        {
            label: 'NIP',
            className: 'w-[150px] text-center',
            render: (user: Dosen) => user.nip,
        },
        {
            label: 'Nama',
            className: 'w-[400px]',
            render: (user: Dosen) => user.nama,
        },
        {
            label: 'Status',
            className: 'w-[150px] text-center',
            render: (user: Dosen) => (
                <div className="flex items-center justify-center">
                    <CButton
                        className={`rounded p-2 text-white shadow transition w-[100px] 
                            ${user.aktif ? 'bg-green-600 hover:bg-green-700' : 'bg-button-danger hover:bg-red-700'}`}
                        onClick={() => handleToggleConfirm(user.nip)}
                    >
                        {user.aktif ? 'Active' : 'Non Active'}
                    </CButton>
                </div>
            ),
        },
        
        {
            label: 'Action',
            className: 'w-[100px] text-center',
            render: (user: Dosen) => (
                <div className="flex justify-center gap-2">
                    <CButtonIcon icon={Pencil} onClick={() => router.visit(route('master-data.dosen.edit', user.nip))} />
                    <CButtonIcon icon={Trash2} type="danger" onClick={() => handleDelete(user.nip)} />
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="flex flex-col gap-4">
                <CustomTable columns={columns} data={numberedUsers} />

                <PaginationWrapper
                    currentPage={userData.current_page}
                    lastPage={userData.last_page}
                    perPage={userData.per_page}
                    total={userData.total}
                    onNavigate={navigateToPage}
                />
            </div>

            <CAlertDialog open={open} setOpen={setOpen} onContinue={confirmDelete} />

            {/* Toggle status with custom title & desc */}
            <CAlertDialog
                open={openToggle}
                setOpen={setOpenToggle}
                onContinue={confirmToggle}
                title={dialogTitle}
                description={dialogDescription}
            />
        </>
    );
}