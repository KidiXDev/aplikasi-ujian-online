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
import { Head, usePage, router } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Validasi schema
const formSchema = z.object({
    nama_event: z.string().min(2).max(255),
    status: z.boolean(),
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

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Event', href: '/master-data/event' },
                { title: 'Detail', href: '#' },
            ]}
        >
            <Head title="Detail Event" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Detail Event</h1>
                    <CButton
                        type="primary"
                        onClick={() => router.visit('/master-data/event')}
                    >
                        Kembali
                    </CButton>
                </div>

                <Form {...form}>
                    <form className="space-y-4">
                        {/* Nama Event */}
                        <FormField
                            control={form.control}
                            name="nama_event"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Event</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled
                                            className="text-black bg-gray-100 cursor-not-allowed"
                                        />
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
                                        <Input
                                            value={field.value ? 'Aktif' : 'Tidak Aktif'}
                                            disabled
                                            className="text-black bg-gray-100 cursor-not-allowed"
                                        />
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
                                    <FormLabel>Mulai Event (opsional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            value={
                                                field.value
                                                    ? typeof field.value === 'string'
                                                        ? field.value
                                                        : field.value instanceof Date
                                                        ? field.value.toISOString().split('T')[0]
                                                        : ''
                                                    : ''
                                            }
                                            disabled
                                            className="text-black bg-gray-100 cursor-not-allowed"
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
                                    <FormLabel>Akhir Event (opsional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            value={
                                                field.value
                                                    ? typeof field.value === 'string'
                                                        ? field.value
                                                        : field.value instanceof Date
                                                        ? field.value.toISOString().split('T')[0]
                                                        : ''
                                                    : ''
                                            }
                                            disabled
                                            className="text-black bg-gray-100 cursor-not-allowed"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
