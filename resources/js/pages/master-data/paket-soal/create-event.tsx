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
});

export default function FormEvent() {
    const { event } = usePage<{
        event: { id_event?: string; nama_event?: string; status?: 'aktif' | 'tidak-aktif' } | null;
    }>().props;

    const isEdit = !!event;

    const breadcrumbs = [
        { title: 'Event', href: '/master-data/event' },
        { title: isEdit ? 'Edit' : 'Create', href: '#' },
    ];

    const form = useForm<{
        nama_event: string;
        status: boolean;
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
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (isEdit && event?.id_event) {
            router.put(route('master-data.event.update', event.id_event), values, {
                preserveScroll: true,
                onSuccess: () => toast.success('Event berhasil diubah!'),
                onError: handleErrors,
            });
        } else {
            router.post(route('master-data.event.store'), values, {
                preserveScroll: true,
                onSuccess: () => toast.success('Event berhasil ditambahkan!'),
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
            <Head title={isEdit ? 'Edit Event' : 'Create Event'} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{isEdit ? 'Edit' : 'Create'} Event</h1>
                    <CButton type="primary" onClick={() => router.visit(route('master-data.event.index'))}>
                        Back
                    </CButton>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nama_event"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Event</FormLabel>
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

                        <CButton type="submit">{isEdit ? 'Update' : 'Save'}</CButton>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
