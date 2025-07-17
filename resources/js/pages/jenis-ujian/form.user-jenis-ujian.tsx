import { CButton } from '@/components/ui/c-button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Schema validation
const formSchema = z.object({
    type: z.string().min(1, { message: 'Kategori Ujian wajib dipilih.' }),
    nama: z.string().min(2, { message: 'Nama minimal 2 karakter.' }).max(255),
});

export default function FormJenisUjian() {
    const { user, kategoriOptions } = usePage<{ 
        user: { kode?: string; nama?: string; type?: string } | null;
        kategoriOptions: string[]; // Tambahkan type untuk kategoriOptions
    }>().props;

    const isEdit = !!user;

    const breadcrumbs = [
        { title: 'Jenis Ujian', href: '/master-data/jenis-ujian' },
        { title: isEdit ? 'Edit' : 'Create', href: '#' },
    ];

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: user?.type ?? '',
            nama: user?.nama ?? '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (isEdit && user?.kode) {
            router.put(route('master-data.jenis-ujian.update', user.kode), values, {
                preserveScroll: true,
                onSuccess: () => toast.success('Data berhasil diubah!'),
                onError: (errors: Record<string, string | string[]>) => {
                    Object.values(errors).forEach((err) => {
                        if (Array.isArray(err)) {
                            err.forEach((e) => toast.error(e));
                        } else {
                            toast.error(err);
                        }
                    });
                },
            });
        } else {
            router.post(route('master-data.jenis-ujian.store'), values, {
                preserveScroll: true,
                onSuccess: () => toast.success('Data berhasil ditambahkan!'),
                onError: (errors: Record<string, string | string[]>) => {
                    Object.values(errors).forEach((err) => {
                        if (Array.isArray(err)) {
                            err.forEach((e) => toast.error(e));
                        } else {
                            toast.error(err);
                        }
                    });
                },
            });
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Jenis Ujian' : 'Create Jenis Ujian'} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{isEdit ? 'Edit' : 'Create'} Jenis Ujian</h1>
                    <CButton type="primary" onClick={() => router.visit(route('master-data.jenis-ujian.manager'))}>
                        Back
                    </CButton>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kategori Ujian</FormLabel>
                                    <FormControl>
                                        <select {...field} className="w-full rounded-md border border-gray-300 p-2">
                                            <option value="">Pilih Kategori</option>
                                            {/* Render options dari database */}
                                            {kategoriOptions && kategoriOptions.map((kategori, index) => (
                                                <option key={index} value={kategori}>
                                                    {kategori}
                                                </option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nama"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: Listening Part 1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <CButton type="submit">{isEdit ? 'Update' : 'Save'}</CButton>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
