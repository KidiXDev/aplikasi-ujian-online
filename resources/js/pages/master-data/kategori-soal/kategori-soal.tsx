import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

import { CAlertDialog } from '@/components/c-alert-dialog';
import { ContentTitle } from '@/components/content-title';
import { CButtonIcon } from '@/components/ui/c-button';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import { type BreadcrumbItem } from '@/types';

// Breadcrumb untuk navigasi
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Master Data',
        href: '#',
    },
    {
        title: 'Kategori Ujian',
        href: route('master-data.kategori-soal.index'),
    },
];

// Interface untuk data kategori ujian
interface KategoriSoal {
    id: number;
    kategori: string;
}

export default function KategoriUjianManager() {
    // Ambil props dari server (via inertia)
    const { data: kategoriData, filters, flash } = usePage().props as unknown as {
        data: {
            data: KategoriSoal[];
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
        filters: {
            search: string | null;
            pages: number;
        };
        flash: {
            success?: string;
            error?: string;
        };
    };

    // State untuk dialog hapus
    const [open, setOpen] = useState(false);
    const [targetId, setTargetId] = useState<number | null>(null);

    // Tampilkan flash message
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    // Klik tombol hapus
    const handleDelete = (id: number) => {
        setTargetId(id);
        setOpen(true);
    };

    // Konfirmasi hapus
    const confirmDelete = async () => {
        try {
            if (targetId !== null) {
                router.delete(route('master-data.kategori-soal.destroy', targetId), {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        // Data akan otomatis terupdate karena preserveState
                        setOpen(false);
                        setTargetId(null);
                    },
                    onError: () => {
                        toast.error('Gagal hapus data kategori ujian');
                        setOpen(false);
                    }
                });
            }
        } catch {
            toast.error('Gagal hapus data');
            setOpen(false);
        }
    };

    // Navigasi ke halaman lain (pagination)
    const navigateToPage = (page: number) => {
        router.visit(route('master-data.kategori-soal.index'), {
            data: {
                page,
                search: filters.search,
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Kolom tabel
    const columns = [
        {
            label: 'ID',
            className: 'w-[80px] text-center',
            render: (kategori: KategoriSoal) => (
                <div className="text-center font-medium">{kategori.id}</div>
            ),
        },
        {
            label: 'Nama Kategori',
            render: (kategori: KategoriSoal) => (
                <div className="font-medium">{kategori.kategori}</div>
            ),
        },
        {
            label: 'Aksi',
            className: 'text-center w-[120px]',
            render: (kategori: KategoriSoal) => (
                <div className="flex justify-center gap-2">
                    <CButtonIcon 
                        icon={Pencil} 
                        onClick={() => router.visit(route('master-data.kategori-soal.edit', kategori.id))} 
                    />
                    <CButtonIcon 
                        icon={Trash2} 
                        type="danger" 
                        onClick={() => handleDelete(kategori.id)} 
                    />
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Kategori Ujian" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Judul + tombol tambah */}
                <ContentTitle 
                    title="Kategori Ujian" 
                    showButton 
                    onButtonClick={() => router.visit(route('master-data.kategori-soal.create'))} 
                />

                {/* Selector jumlah data + search */}
                <div className="mt-4 flex items-center justify-between">
                    <EntriesSelector 
                        currentValue={kategoriData.per_page} 
                        options={[10, 25, 50, 100]} 
                        routeName="master-data.kategori-soal.index" 
                    />                    <SearchInputMenu 
                        defaultValue={filters.search || undefined} 
                        routeName="master-data.kategori-soal.index" 
                    />
                </div>

                {/* Tabel data + pagination */}
                <div className="flex flex-col gap-4">
                    <CustomTable columns={columns} data={kategoriData.data} />
                    <PaginationWrapper
                        currentPage={kategoriData.current_page}
                        lastPage={kategoriData.last_page}
                        perPage={kategoriData.per_page}
                        total={kategoriData.total}
                        onNavigate={navigateToPage}
                    />
                </div>
            </div>

            {/* Dialog konfirmasi hapus */}
            <CAlertDialog open={open} setOpen={setOpen} onContinue={confirmDelete} />
        </AppLayout>
    );
}
