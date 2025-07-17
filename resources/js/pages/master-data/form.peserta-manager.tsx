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
    username: z.string().min(2, { message: 'Username must be at least 2 characters.' }).max(20, { message: 'Username max 20 characters.' }),
    password: z
        .string()
        .optional()
        .refine((val) => !val || val.length >= 8, { message: 'Password must be at least 8 characters.' })
        .refine((val) => !val || val.length <= 20, { message: 'Password max 20 characters.' }),
    status: z.number().min(0, { message: 'Status is required.' }),
    jurusan: z.number().min(0, { message: 'Jurusan is required.' }),
    filter: z.string().min(0, { message: 'Filter is required.' }).max(2, { message: 'Filter max 2 characters.' }),
    nis: z.string().min(5, { message: 'NIS must be at least 5 characters.' }).max(15, { message: 'NIS max 20 characters.' }),
    nama: z.string().min(2, { message: 'Nama must be at least 2 characters.' }).max(20, { message: 'Nama max 20 characters.' }),
});

export default function PesertaForm() {
    type PesertaType = {
        id?: number;
        username: string;
        nis: string;
        nama: string;
        status: number;
        jurusan: number;
        filter: string;
    };
    const { peserta, kategoriList } = usePage<{
        peserta: PesertaType;
        kategoriList: { id: number; kategori: string }[];
    }>().props;
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

    const defaultKategori = isEdit ? (peserta?.jurusan ?? 0) : (kategoriList?.[0]?.id ?? 0);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: peserta?.username ?? '',
            password: isEdit ? '' : 'password123',
            status: peserta?.status ?? 1,
            jurusan: defaultKategori,
            filter: peserta?.filter ?? '',
            nis: peserta?.nis ?? '',
            nama: peserta?.nama ?? '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (isEdit) {
            router.put(
                route('master-data.peserta.update', peserta.id),
                values,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Backend akan handle redirect dan highlight
                    },
                    onError: () => {
                        toast.error('Failed to update peserta.');
                    },
                },
            );
        } else {
            router.post(route('master-data.peserta.store'), values, {
                preserveScroll: true,
                onSuccess: () => {
                    // console.log('Peserta berhasil ditambahkan!');
                },
                onError: () => {
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
                                        <Input placeholder="Masukkan username" maxLength={20} {...field} />
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
                                        <PasswordInput placeholder="Masukkan password" maxLength={20} {...field} />
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
                                        <Input placeholder="Masukkan nama" maxLength={20} {...field} />
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
                                        <Input placeholder="Masukkan NIS" maxLength={15} {...field} />
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
                                    <FormLabel>Kategori</FormLabel>
                                    <FormControl>
                                        <Select value={field.value?.toString() ?? ''} onValueChange={(val) => field.onChange(parseInt(val))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {kategoriList?.map((k) => (
                                                    <SelectItem key={k.id} value={k.id.toString()}>
                                                        {k.kategori}
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
                            name="filter"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Filter</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Masukkan filter" maxLength={2} {...field} />
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
