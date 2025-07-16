import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { ContentTitle } from '@/components/content-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    {
        title: 'Form',
        href: '#',
    },
];

// Interface untuk data kategori ujian
interface KategoriSoal {
    id: number;
    kategori: string;
}

// Props untuk komponen
interface FormKategoriUjianProps {
    isEdit: boolean;
    kategori: KategoriSoal | null;
}

export default function FormKategoriUjian({ isEdit, kategori }: FormKategoriUjianProps) {
    // Flash messages
    const { flash } = usePage<{
        flash: {
            success?: string;
            error?: string;
        };
    }>().props;

    // Form data
    const { data, setData, post, put, processing, errors, reset } = useForm({
        kategori: kategori?.kategori || '',
    });

    // Tampilkan flash message
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    // Handle submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();        if (isEdit && kategori) {
            put(route('master-data.kategori-soal.update', kategori.id), {
                onSuccess: () => {
                    toast.success('Kategori ujian berhasil diperbarui');
                    // Redirect dengan refresh data tapi preserve state lain
                    router.visit(route('master-data.kategori-soal.index'), {
                        only: ['data'],
                        preserveState: false,
                        preserveScroll: false,
                        replace: true
                    });
                },
                onError: () => {
                    toast.error('Gagal memperbarui kategori ujian');
                },
            });        } else {
            post(route('master-data.kategori-soal.store'), {
                onSuccess: () => {
                    toast.success('Kategori ujian berhasil ditambahkan');
                    // Redirect dengan refresh data tapi preserve state lain
                    router.visit(route('master-data.kategori-soal.index'), {
                        only: ['data'],
                        preserveState: false,
                        preserveScroll: false,
                        replace: true
                    });
                },
                onError: () => {
                    toast.error('Gagal menambahkan kategori ujian');
                },
            });
        }
    };

    // Handle batal
    const handleCancel = () => {
        reset();
        router.visit(route('master-data.kategori-soal.index'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Kategori Ujian' : 'Tambah Kategori Ujian'} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Judul halaman */}
                <ContentTitle 
                    title={isEdit ? 'Edit Kategori Ujian' : 'Tambah Kategori Ujian'} 
                />

                {/* Form */}
                <Card className="mx-auto w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>
                            {isEdit ? 'Edit Data Kategori Ujian' : 'Tambah Data Kategori Ujian'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Input Nama Kategori */}
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

                            {/* Tombol aksi */}
                            <div className="flex gap-4">
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    {processing 
                                        ? (isEdit ? 'Menyimpan...' : 'Menambahkan...') 
                                        : (isEdit ? 'Simpan Perubahan' : 'Tambah Kategori Ujian')
                                    }
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleCancel}
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    Batal
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
