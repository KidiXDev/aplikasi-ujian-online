// Import layout, types, helper & komponen custom yang dipake
import AppLayout from '@/layouts/app-layout';
import { PageProps, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';

import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner'; // Buat nampilin notifikasi toast

// Komponen-komponen custom
import { CAlertDialog } from '@/components/c-alert-dialog'; // Dialog konfirmasi hapus
import { ContentTitle } from '@/components/content-title'; // Judul halaman + tombol tambah
import { CButtonIcon } from '@/components/ui/c-button'; // Tombol icon edit/hapus
import { CustomTable } from '@/components/ui/c-table'; // Tabel custom
import { EntriesSelector } from '@/components/ui/entries-selector'; // Pilihan berapa data per halaman
import { PaginationWrapper } from '@/components/ui/pagination-wrapper'; // Navigasi halaman
import { SearchInputMenu } from '@/components/ui/search-input-menu'; // Pencarian

// Breadcrumb buat navigasi
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manajemen Mata Kuliah',
        href: route('master-data.matakuliah.index'), // Sesuaikan route
    },
];

// Interface tipe data mata kuliah
interface Matakuliah {
    id: number;
    kode: string;
    nama: string;
    sks: number;
    semester: number;
    prodi: string;
    id_dosen: number | null;
    nama_dosen: string;
    prasyarat: string;
}

export default function MataKuliahManager() {
    // Ambil props dari server (via inertia)
    const { data: mataData, filters, flash } = usePage<PageProps<Matakuliah>>().props;

    // State untuk dialog hapus
    const [open, setOpen] = useState(false);
    const [targetId, setTargetId] = useState<number | null>(null);

    // Nampilin flash message
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    // Klik tombol hapus
    const handleDelete = (id: number) => {
        setTargetId(id);
        setOpen(true); // Buka dialog konfirmasi
    };

    // Konfirmasi hapus
    const confirmDelete = async () => {
        try {
            if (targetId !== null) {
                // Route ke master-data.matakuliah.destroy (sesuai web.php di Laravel)
                router.delete(route('master-data.matakuliah.destroy', targetId), {
                    preserveState: true,
                    preserveScroll: true,
                });
            }
        } catch {
            toast.error('Gagal hapus data');
        } finally {
            setOpen(false); // Tutup dialog
        }
    };

    // Navigasi ke halaman lain (pagination)
    const navigateToPage = (page: number) => {
        router.visit(route('master-data.matakuliah.index'), {
            data: {
                page,
                search: filters.search, // Biar tetap nyimpen hasil pencarian
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Kolom tabel
    const columns = [
        {
            label: 'ID',
            className: 'w-[60px] text-center',
            render: (mk: Matakuliah) => <div className="text-center">{mk.id}</div>,
        },
        {
            label: 'Kode',
            render: (mk: Matakuliah) => mk.kode,
        },
        {
            label: 'Nama',
            render: (mk: Matakuliah) => mk.nama,
        },
        {
            label: 'SKS',
            className: 'text-center',
            render: (mk: Matakuliah) => <div className="text-center">{mk.sks}</div>,
        },
        {
            label: 'Semester',
            className: 'text-center',
            render: (mk: Matakuliah) => <div className="text-center">{mk.semester}</div>,
        },
        {
            label: 'Prodi',
            render: (mk: Matakuliah) => mk.prodi,
        },
        {
            label: 'Dosen',
            render: (mk: Matakuliah) => (
                <div>
                    {mk.nama_dosen !== '-' ? (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">{mk.nama_dosen}</span>
                    ) : (
                        <span className="text-gray-500">-</span>
                    )}
                </div>
            ),
        },
        {
            label: 'Prasyarat',
            render: (mk: Matakuliah) => <div>{mk.prasyarat !== '-' ? mk.prasyarat : <span className="text-gray-500">-</span>}</div>,
        },
        {
            label: 'Aksi', // Edit & Hapus
            className: 'text-center w-[120px]',
            render: (mk: Matakuliah) => (
                <div className="flex justify-center gap-2">
                    {/* Route ke master-data.matakuliah.edit */}
                    <CButtonIcon icon={Pencil} onClick={() => router.visit(route('master-data.matakuliah.edit', mk.id))} />
                    {/* Tampilkan dialog konfirmasi hapus */}
                    <CButtonIcon icon={Trash2} type="danger" onClick={() => handleDelete(mk.id)} />
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Mata Kuliah" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Judul + tombol tambah */}
                <ContentTitle title="Mata Kuliah" showButton onButtonClick={() => router.visit(route('master-data.matakuliah.create'))} />

                {/* Selector jumlah data + search */}
                <div className="mt-4 flex items-center justify-between">
                    <EntriesSelector currentValue={mataData.per_page} options={[10, 25, 50, 100]} routeName="master-data.matakuliah.index" />
                    <SearchInputMenu defaultValue={filters.search} routeName="master-data.matakuliah.index" />
                </div>

                {/* Tabel data + pagination */}
                <div className="flex flex-col gap-4">
                    <CustomTable columns={columns} data={mataData.data} />
                    <PaginationWrapper
                        currentPage={mataData.current_page}
                        lastPage={mataData.last_page}
                        perPage={mataData.per_page}
                        total={mataData.total}
                        onNavigate={navigateToPage}
                    />
                </div>
            </div>

            {/* Dialog konfirmasi hapus */}
            <CAlertDialog open={open} setOpen={setOpen} onContinue={confirmDelete} />
        </AppLayout>
    );
}
