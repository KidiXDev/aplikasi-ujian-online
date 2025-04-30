import { Input } from '@/components/ui/input';
import { CButton } from '@/components/ui/c-button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import AppLayout from '@/layouts/app-layout';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Schema validation sesuai dengan kolom di model MBidang
const formSchema = z.object({
    kode: z.string().min(1, { message: 'Kode wajib diisi.' }).max(10),
    nama: z.string().min(2, { message: 'Nama minimal 2 karakter.' }).max(255),
});

export default function FormJenisUjian() {
    const { data } = usePage<{
        data: { kode?: string; nama?: string } | null;
    }>().props;

    const isEdit = !!data;

    const breadcrumbs = [
        { title: 'Jenis Ujian', href: '/master-data/jenis-ujian' },
        { title: isEdit ? 'Edit' : 'Create', href: '#' },
    ];

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kode: data?.kode ?? '',
            nama: data?.nama ?? '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (isEdit && data?.kode) {
            router.put(
                route('master-data.jenis-ujian.update', data.kode),
                values,
                {
                    preserveScroll: true,
                    onSuccess: () => toast.success('Data berhasil diubah!'),
                    onError: (errors) => {
                        Object.values(errors).forEach((err: any) => toast.error(err));
                    },
                }
            );
        } else {
            router.post(
                route('master-data.jenis-ujian.store'),
                values,
                {
                    preserveScroll: true,
                    onSuccess: () => toast.success('Data berhasil ditambahkan!'),
                    onError: (errors) => {
                        Object.values(errors).forEach((err: any) => toast.error(err));
                    },
                }
            );
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Jenis Ujian' : 'Create Jenis Ujian'} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{isEdit ? 'Edit' : 'Create'} Jenis Ujian</h1>
                    <CButton
                        type="primary"
                        onClick={() => router.visit(route('master-data.jenis-ujian.manager'))}
                    >
                        Back
                    </CButton>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="kode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kategori Ujian</FormLabel>
                                    <FormControl>
                                        <select
                                            {...field}
                                            className="w-full rounded-md border border-gray-300 p-2"
                                        >
                                            <option value="">Pilih Kategori</option>
                                            <option value="TOEFL">TOEFL</option>
                                            <option value="TOEIC">TOEIC</option>
                                            <option value="TEPPS">TEPPS</option>
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
                                        <Input placeholder="Contoh: Ujian Akhir Semester" {...field} />
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
