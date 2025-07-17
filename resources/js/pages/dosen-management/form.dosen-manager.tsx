import { PasswordInput } from '@/components/c-password-input';
import { CButton } from '@/components/ui/c-button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface Dosen {
    nip: string;
    nama: string;
    aktif: boolean;
}

const formSchema = z.object({
    nip: z.string().min(2, { message: 'NIP minimal 2 karakter.' }),
    nama: z.string().min(2, { message: 'Nama minimal 2 karakter.' }),
    password: z.string().optional().refine((val) => !val || val.length >= 8, { message: 'Password minimal 8 karakter.' }),
    aktif: z.boolean(),
});

export default function FormDosenManager() {
    const { dosen } = usePage<{ dosen: Dosen | null }>().props;
    const isEdit = !!dosen;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dosen Manager', href: route('master-data.dosen.manager') }, // gunakan route name ke daftar dosen
        { title: isEdit ? 'Edit' : 'Create', href: isEdit ? '/edit' : '/create' },
    ];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nip: dosen?.nip ?? '',
            nama: dosen?.nama ?? '',
            password: '',
            aktif: !!dosen?.aktif,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (isEdit) {
            router.put(
                route('master-data.dosen.update', dosen?.nip),
                {
                    nip: values.nip,
                    nama: values.nama,
                    password: values.password,
                    aktif: values.aktif,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => toast.success('Dosen berhasil diedit'),
                    onError: (errors) => {
                        if (errors.nip) toast.error(errors.nip);
                        if (errors.nama) toast.error(errors.nama);
                        if (errors.password) toast.error(errors.password);
                    },
                }
            );
        } else {
            router.post(
                route('master-data.dosen.store'),
                {
                    nip: values.nip,
                    nama: values.nama,
                    password: values.password,
                    aktif: values.aktif,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => toast.success('Dosen berhasil ditambahkan'),
                    onError: (errors) => {
                        if (errors.nip) toast.error(errors.nip);
                        if (errors.nama) toast.error(errors.nama);
                        if (errors.password) toast.error(errors.password);
                    },
                }
            );
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Dosen' : 'Tambah Dosen'} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{isEdit ? 'Edit' : 'Tambah'} Data Dosen</h1>
                    <CButton type="primary" className="md:w-24" onClick={() => router.visit(route('master-data.dosen.manager'))}>
                        Kembali
                    </CButton>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="nip"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>NIP</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Masukkan NIP" {...field} />
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
                                        <Input placeholder="Masukkan Nama" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {!isEdit && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <PasswordInput placeholder="Password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="aktif"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value ? 'true' : 'false'}
                                            onValueChange={(value: string) => field.onChange(value === 'true')}
                                        >
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Active</SelectItem>
                                                <SelectItem value="false">Non Active</SelectItem>
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
