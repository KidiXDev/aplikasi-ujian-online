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

interface Event {
    id_event: number;
    nama_event: string;
    mulai_event: string;
    akhir_event: string;
    create_event: string;
    status: number;
}
//da

const formSchema = z.object({
    nama_event: z.string().min(1, 'Nama event is required'),
    mulai_event: z.string().min(1, 'Tanggal mulai is required'),
    akhir_event: z.string().min(1, 'Tanggal akhir is required'),
    create_event: z.string().min(1, 'Tanggal pembuatan is required'),
    status: z.coerce.number().min(0, 'Status is required'),
});

export default function EventForm() {
    const { event } = usePage<{ event?: Event }>().props;
    const isEdit = !!event;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Master Data',
            href: '/master-data',
        },
        {
            title: 'Event',
            href: route('master-data.event.index'),
        },
        {
            title: isEdit ? 'Edit' : 'Create',
            href: route(isEdit ? 'master-data.event.edit' : 'master-data.event.create', isEdit ? event.id_event : ''),
        },
    ];

    // Format dates for the form
    const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Returns "YYYY-MM-DD"
    };

    const today = new Date().toISOString().split('T')[0];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nama_event: event?.nama_event ?? '',
            mulai_event: event ? formatDateForInput(event.mulai_event) : today,
            akhir_event: event ? formatDateForInput(event.akhir_event) : today,
            create_event: event ? formatDateForInput(event.create_event) : today,
            status: event?.status ?? 1,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (isEdit) {
            router.put(route('master-data.event.update', event.id_event), values, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Event berhasil diperbarui');
                    router.visit(route('master-data.event.index'));
                },
                onError: (errors) => {
                    Object.keys(errors).forEach((key) => {
                        toast.error(errors[key]);
                    });
                },
            });
        } else {
            router.post(route('master-data.event.store'), values, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Event berhasil ditambahkan');
                    router.visit(route('master-data.event.index'));
                },
                onError: (errors) => {
                    Object.keys(errors).forEach((key) => {
                        toast.error(errors[key]);
                    });
                },
            });
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Event' : 'Create Event'} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="space-between flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{isEdit ? 'Edit' : 'Create'} Event</h1>
                    <CButton type="primary" className="md:w-24" onClick={() => router.visit(route('master-data.event.index'))}>
                        Kembali
                    </CButton>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="nama_event"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Event</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Masukkan nama event" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="mulai_event"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tanggal Mulai</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="akhir_event"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tanggal Akhir</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="create_event"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tanggal Pembuatan</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
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
                                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1">Aktif</SelectItem>
                                            <SelectItem value="0">Tidak Aktif</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <CButton type="submit">{isEdit ? 'Update' : 'Create'}</CButton>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
