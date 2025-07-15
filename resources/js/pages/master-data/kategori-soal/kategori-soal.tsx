import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';

import { CAlertDialog } from '@/components/c-alert-dialog';
import { ContentTitle } from '@/components/content-title';
import { CButtonIcon } from '@/components/ui/c-button';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';

/**
 * =======================================================================
 * KATEGORI UJIAN MANAGER - HALAMAN UTAMA DENGAN DIALOG FORM
 * =======================================================================
 * 
 * PENJELASAN NON-TEKNIS:
 * Halaman ini menampilkan daftar kategori ujian dengan fitur:
 * 1. Tabel daftar kategori dengan pagination dan search
 * 2. Dialog popup untuk tambah/edit kategori (tidak pindah halaman)
 * 3. Konfirmasi hapus kategori
 * 4. Otomatis refresh data setelah operasi CRUD
 * 
 * PENJELASAN TEKNIS:
 * - Menggunakan Shadcn UI Dialog untuk form tambah/edit
 * - Inertia.js untuk komunikasi dengan backend
 * - Real-time updates tanpa reload halaman
 * - Form validation dengan error handling
 * 
 * FITUR DIALOG:
 * - Tambah: Dialog kosong untuk kategori baru
 * - Edit: Dialog terisi data kategori yang dipilih
 * - Responsive dan user-friendly
 * 
 * =======================================================================
 */

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
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [targetId, setTargetId] = useState<number | null>(null);

    // State untuk dialog form (tambah/edit)
    const [formOpen, setFormOpen] = useState(false);
    const [editData, setEditData] = useState<KategoriSoal | null>(null);

    // Form data menggunakan useForm dari Inertia
    const { data, setData, post, put, processing, errors, reset } = useForm({
        kategori: '',
    });

    // Tampilkan flash message
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    // Buka dialog tambah kategori baru
    const handleAdd = () => {
        setEditData(null);
        reset();
        setFormOpen(true);
    };

    // Buka dialog edit kategori
    const handleEdit = (kategori: KategoriSoal) => {
        setEditData(kategori);
        setData('kategori', kategori.kategori);
        setFormOpen(true);
    };

    // Klik tombol hapus
    const handleDelete = (id: number) => {
        setTargetId(id);
        setDeleteOpen(true);
    };

    // Submit form (tambah/edit)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editData) {
            // Edit kategori
            put(route('master-data.kategori-soal.update', editData.id), {
                onSuccess: () => {
                    toast.success('Kategori ujian berhasil diperbarui');
                    setFormOpen(false);
                    reset();
                },
                onError: () => {
                    toast.error('Gagal memperbarui kategori ujian');
                },
            });
        } else {
            // Tambah kategori baru
            post(route('master-data.kategori-soal.store'), {
                onSuccess: () => {
                    toast.success('Kategori ujian berhasil ditambahkan');
                    setFormOpen(false);
                    reset();
                },
                onError: () => {
                    toast.error('Gagal menambahkan kategori ujian');
                },
            });
        }
    };

    // Konfirmasi hapus
    const confirmDelete = async () => {
        try {
            if (targetId !== null) {
                router.delete(route('master-data.kategori-soal.destroy', targetId), {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setDeleteOpen(false);
                        setTargetId(null);
                    },
                    onError: () => {
                        toast.error('Gagal hapus data kategori ujian');
                        setDeleteOpen(false);
                    }
                });
            }
        } catch {
            toast.error('Gagal hapus data');
            setDeleteOpen(false);
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
                        onClick={() => handleEdit(kategori)} 
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
                <div className="flex items-center justify-between">
                    <ContentTitle title="Kategori Ujian" />
                    <Button onClick={handleAdd} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Kategori Ujian
                    </Button>
                </div>

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

            {/* Dialog Form Tambah/Edit */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editData ? 'Edit Kategori Ujian' : 'Tambah Kategori Ujian'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="kategori">
                                Nama Kategori Ujian <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="kategori"
                                type="text"
                                value={data.kategori}
                                onChange={(e) => setData('kategori', e.target.value)}
                                placeholder="Masukkan nama kategori ujian"
                                className={errors.kategori ? 'border-red-500' : ''}
                            />
                            {errors.kategori && (
                                <p className="text-sm text-red-500">{errors.kategori}</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setFormOpen(false)}
                                disabled={processing}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing 
                                    ? (editData ? 'Menyimpan...' : 'Menambahkan...') 
                                    : (editData ? 'Simpan' : 'Tambah')
                                }
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog konfirmasi hapus */}
            <CAlertDialog open={deleteOpen} setOpen={setDeleteOpen} onContinue={confirmDelete} />
        </AppLayout>
    );
}
