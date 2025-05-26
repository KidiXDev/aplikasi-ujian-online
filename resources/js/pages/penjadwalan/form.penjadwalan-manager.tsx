// Penjadwalan Form Page (migrated from exam-schedule/form.exam-manager.tsx)
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

interface Penjadwalan {
    id_penjadwalan: number;
    id_paket_ujian: number;
    tipe_ujian: string;
    tanggal: string;
    waktu_mulai: string;
    waktu_selesai: string;
    kuota: number;
    jenis_ujian: number;
}

const formSchema = z.object({
    id_paket_ujian: z.number().min(1, 'Paket ujian is required'),
    tipe_ujian: z.string().min(1, 'Tipe ujian is required'),
    tanggal: z.string().min(1, 'Tanggal is required'),
    waktu_mulai: z.string().min(1, 'Waktu mulai is required'),
    waktu_selesai: z.string().min(1, 'Waktu selesai is required'),
    kuota: z.number().min(1, 'Kuota is required'),
    jenis_ujian: z.number().min(0, 'Jenis ujian is required'),
});

export default function PenjadwalanForm() {
    const { penjadwalan } = usePage<{ penjadwalan?: Penjadwalan }>().props;
    const isEdit = !!penjadwalan;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Jadwal Ujian',
            href: route('penjadwalan.index'),
        },
        {
            title: isEdit ? 'Edit' : 'Create',
            href: route(isEdit ? 'penjadwalan.edit' : 'penjadwalan.create', 
                  isEdit ? penjadwalan.id_penjadwalan : ''),
        },
    ];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id_paket_ujian: penjadwalan?.id_paket_ujian ?? 0,
            tipe_ujian: penjadwalan?.tipe_ujian ?? '',
            tanggal: penjadwalan?.tanggal ?? '',
            waktu_mulai: penjadwalan?.waktu_mulai ?? '',
            waktu_selesai: penjadwalan?.waktu_selesai ?? '',
            kuota: penjadwalan?.kuota ?? 0,
            jenis_ujian: penjadwalan?.jenis_ujian ?? 0,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (isEdit) {
            router.put(
                route('penjadwalan.update', penjadwalan.id_penjadwalan),
                values,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Jadwal ujian berhasil diperbarui');
                        router.visit(route('penjadwalan.index'));
                    },
                    onError: (errors) => {
                        Object.keys(errors).forEach(key => {
                            toast.error(errors[key]);
                        });
                    },
                },
            );
        } else {
            router.post(
                route('penjadwalan.store'),
                values,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Jadwal ujian berhasil ditambahkan');
                        router.visit(route('penjadwalan.index'));
                    },
                    onError: (errors) => {
                        Object.keys(errors).forEach(key => {
                            toast.error(errors[key]);
                        });
                    },
                },
            );
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Jadwal Ujian' : 'Create Jadwal Ujian'} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="space-between flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{isEdit ? 'Edit' : 'Create'} Jadwal Ujian</h1>
                    <CButton 
                        type="primary" 
                        className="md:w-24" 
                        onClick={() => router.visit(route('penjadwalan.index'))}
                    >
                        Kembali
                    </CButton>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="tipe_ujian"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipe Ujian</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter tipe ujian" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="id_paket_ujian"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Paket Ujian</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            placeholder="Enter paket ujian ID" 
                                            {...field} 
                                            onChange={e => field.onChange(parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tanggal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tanggal</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="waktu_mulai"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Waktu Mulai</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="waktu_selesai"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Waktu Selesai</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="kuota"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kuota</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Enter kuota" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="jenis_ujian"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Jenis Ujian</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Enter jenis ujian" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <CButton type="submit" className="w-full md:w-32">
                            {isEdit ? 'Update' : 'Create'}
                        </CButton>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
