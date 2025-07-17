import { CButton } from '@/components/ui/c-button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Validasi schema
const formSchema = z.object({
    nama_event: z.string().min(2, { message: 'Nama event minimal 2 karakter.' }).max(255),
    status: z.boolean({ required_error: 'Status wajib dipilih.' }),
    event_mulai: z.coerce.date().optional().nullable(),
    event_akhir: z.coerce.date().optional().nullable(),
});

export default function FormEvent() {
    const { event } = usePage<{
        event: {
            id_event?: string;
            nama_event?: string;
            status?: 'aktif' | 'tidak-aktif';
            event_mulai?: string | Date;
            event_akhir?: string | Date;
        } | null;
    }>().props;

    const isEdit = !!event;

    const breadcrumbs = [
        { title: 'Event', href: '/master-data/event' },
        { title: isEdit ? 'Edit' : 'Create', href: '#' },
    ];

    const form = useForm<{
        nama_event: string;
        status: boolean;
        event_mulai?: Date | null;
        event_akhir?: Date | null;
    }>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nama_event: event?.nama_event ?? '',
            status:
                event?.status === 'aktif'
                    ? true
                    : event?.status === 'tidak-aktif'
                    ? false
                    : true,
            event_mulai: event?.event_mulai ? new Date(event.event_mulai) : undefined,
            event_akhir: event?.event_akhir ? new Date(event.event_akhir) : undefined,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (isEdit && event?.id_event) {
            router.put(route('master-data.event.update', event.id_event), values, {
                preserveScroll: true,
                onError: handleErrors,
            });
        } else {
            router.post(route('master-data.event.store'), values, {
                preserveScroll: true,
                onError: handleErrors,
            });
        }
    }

    function handleErrors(errors: Record<string, string | string[]>) {
        Object.values(errors).forEach((err) => {
            if (Array.isArray(err)) {
                err.forEach((e) => toast.error(e));
            } else {
                toast.error(err);
            }
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Paket Soal' : 'Tambah Paket Soal'} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{isEdit ? 'Edit' : 'Buat'} Paket Soal</h1>
                    <CButton
                        type="primary"
                        onClick={() => router.visit(route('master-data.event.getEvent'))}
                    >
                        Kembali
                    </CButton>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nama_event"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Paket</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: Tryout Nasional" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Status */}
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <FormControl>
                                        <select
                                            name={field.name}
                                            ref={field.ref}
                                            value={field.value ? 'true' : 'false'}
                                            onChange={e => field.onChange(e.target.value === 'true')}
                                            onBlur={field.onBlur}
                                            className="w-full rounded-md border border-gray-300 p-2"
                                        >
                                            <option value="true">Aktif</option>
                                            <option value="false">Tidak Aktif</option>
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="event_mulai"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mulai Paket Soal (opsional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="event_akhir"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Akhir Paket Soal (opsional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <CButton type="submit">{isEdit ? 'Simpan' : 'Save'}</CButton>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
