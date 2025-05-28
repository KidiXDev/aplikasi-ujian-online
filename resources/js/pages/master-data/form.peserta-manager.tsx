import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { PasswordInput } from '@/components/c-password-input';
import { CButton } from '@/components/ui/c-button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    username: z.string().min(2, { message: 'Username must be at least 2 characters.' }),
    password: z
        .string()
        .optional()
        .refine((val) => !val || val.length >= 8, { message: 'Password must be at least 8 characters.' }),
    status: z.number().min(0, { message: 'Status is required.' }),
    jurusan: z.number().min(0, { message: 'Jurusan is required.' }),
    nis: z.string().min(5, { message: 'NIS must be at least 5 characters.' }),
    nama: z.string().min(2, { message: 'Nama must be at least 2 characters.' }),
});

export default function PesertaForm() {
    type PesertaType = {
        id?: number;
        username: string;
        nis: string;
        nama: string;
        status: number;
        jurusan: number;
    };
    const { peserta, jurusanList } = usePage<{ peserta: PesertaType; jurusanList: { id_jurusan: number; nama_jurusan: string }[] }>().props;
    const isEdit = !!peserta;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Peserta Manager',
            href: '/master-data/peserta',
        },
        {
            title: isEdit ? 'Edit' : 'Create',
            href: isEdit ? '/edit' : '/create',
        },
    ];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: peserta?.username ?? '',
            password: isEdit ? '' : 'password123',
            status: peserta?.status ?? 0,
            jurusan: peserta?.jurusan ?? 0,
            nis: peserta?.nis ?? '',
            nama: peserta?.nama ?? '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log('Submitting values:', values); // Log data yang dikirim
        if (isEdit) {
            const params = new URLSearchParams(window.location.search);
            const page = params.get('page') || 1;

            router.put(
                route('master-data.peserta.update', peserta.id),
                { ...values, page },
                {
                    preserveScroll: true,
                    // onSuccess tidak perlu router.visit lagi jika backend sudah redirect ke page yang benar
                    onSuccess: () => {},
                    onError: () => {
                        toast.error('Failed to update peserta.');
                    },
                },
            );
        } else {
            router.post(route('master-data.peserta.store'), values, {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Peserta created successfully!'); // Log jika berhasil
                },
                onError: () => {
                    // Log error jika gagal
                    toast.error('Failed to create peserta.');
                },
            });
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Data Peserta' : 'Tambah Data Peserta'} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="space-between flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{isEdit ? 'Edit Data' : 'Tambah Data'} Peserta</h1>
                    <CButton type="primary" className="md:w-24" onClick={() => router.visit(route('master-data.peserta.manager'))}>
                        Kembali
                    </CButton>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter username" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <PasswordInput placeholder="Enter password" {...field} />
                                    </FormControl>
                                    {isEdit && <p className="mt-1 text-xs text-gray-500">*kosongkan jika tidak ingin merubah password</p>}
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
                                        <Input placeholder="Enter nama" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="nis"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>NIS</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter NIS" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="jurusan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Jurusan</FormLabel>
                                    <FormControl>
                                        <Select value={field.value?.toString() ?? ''} onValueChange={(val) => field.onChange(parseInt(val))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih jurusan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {jurusanList?.map((j) => (
                                                    <SelectItem key={j.id_jurusan} value={j.id_jurusan.toString()}>
                                                        {j.nama_jurusan}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <FormControl>
                                        <Select value={field.value?.toString() ?? ''} onValueChange={(val) => field.onChange(parseInt(val))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Active</SelectItem>
                                                <SelectItem value="0">Non Active</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <CButton type="submit" className="bg-green-600 hover:bg-green-700 md:w-24">
                            Save
                        </CButton>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
