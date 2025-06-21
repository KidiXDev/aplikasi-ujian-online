import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Interface untuk data kategori soal
interface KategoriSoal {
    id?: number;
    kategori: string;
}

// Schema validasi dengan Zod
const formSchema = z.object({
    kategori: z.string().min(1, 'Nama kategori wajib diisi').max(100, 'Nama kategori maksimal 100 karakter'),
});

export default function FormKategoriSoal() {    // Ambil data dari props Inertia
    const { isEdit, kategori, flash } = usePage().props as unknown as {
        isEdit: boolean;
        kategori: KategoriSoal | null;
        flash: {
            success?: string;
            error?: string;
        };
    };

    // Breadcrumb navigation
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Master Data',
            href: '#',
        },
        {
            title: 'Kategori Soal',
            href: route('master-data.kategori-soal.index'),
        },
        {
            title: isEdit ? 'Edit Kategori Soal' : 'Tambah Kategori Soal',
            href: '#',
        },
    ];

    // Setup form dengan react-hook-form dan zod
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kategori: kategori?.kategori ?? '',
        },
    });

    // Handle flash messages
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    // Submit handler
    function onSubmit(values: z.infer<typeof formSchema>) {
        if (isEdit && kategori) {
            // Update kategori soal
            router.put(route('master-data.kategori-soal.update', kategori.id), values, {
                preserveScroll: true,
                onSuccess: () => toast.success('Kategori soal berhasil diperbarui!'),
                onError: (errors) => console.error('Error:', errors),
            });
        } else {
            // Create new kategori soal
            router.post(route('master-data.kategori-soal.store'), values, {
                preserveScroll: true,
                onSuccess: () => toast.success('Kategori soal berhasil ditambahkan!'),
                onError: (errors) => console.error('Error:', errors),
            });
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Kategori Soal' : 'Tambah Kategori Soal'} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card className="mx-auto w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>{isEdit ? 'Edit Kategori Soal' : 'Tambah Kategori Soal'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Nama Kategori */}
                                <FormField
                                    control={form.control}
                                    name="kategori"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Kategori Soal *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Masukkan nama kategori soal (contoh: TEPPS, TOEFL)" 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Tombol Submit dan Kembali */}
                                <div className="flex items-center gap-4 pt-4">
                                    <Button type="submit" className="w-32">
                                        {isEdit ? 'Update' : 'Simpan'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(route('master-data.kategori-soal.index'))}
                                        className="w-32"
                                    >
                                        Kembali
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
