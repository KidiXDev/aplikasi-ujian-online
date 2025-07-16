// Penjadwalan Form Page (migrated from exam-schedule/form.exam-manager.tsx)
import { CButton } from '@/components/ui/c-button';
// Type guard for penjadwalan with event
function hasEvent(obj: unknown): obj is { event: { nama_event: string } } {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'event' in obj &&
        typeof (obj as { event?: unknown }).event === 'object' &&
        (obj as { event?: unknown }).event !== null &&
        'nama_event' in (obj as { event: { nama_event?: unknown } }).event
    );
}
function hasKategoriSoal(obj: unknown): obj is { kategori_soal: { kategori: string } } {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'kategori_soal' in obj &&
        typeof (obj as { kategori_soal?: unknown }).kategori_soal === 'object' &&
        (obj as { kategori_soal?: unknown }).kategori_soal !== null &&
        'kategori' in (obj as { kategori_soal: { kategori?: unknown } }).kategori_soal
    );
}
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

interface Penjadwalan {
    id_penjadwalan: number;
    id_paket_ujian: number;
    tipe_ujian: number;  // Ubah ke number karena sekarang FK
    tanggal: string;
    waktu_mulai: string;
    waktu_selesai: string;
    kuota: number;
    jenis_ujian: number;
}

interface KategoriSoal {
    id: number;
    kategori: string;
}

interface Event {
    id_event: number;
    nama_event: string;
}

const formSchema = z.object({
    id_paket_ujian: z.number().min(1, 'Paket ujian is required'),
    tipe_ujian: z.number().min(1, 'Tipe ujian is required'),  // Ubah ke number
    tanggal: z.string().min(1, 'Tanggal is required'),
    waktu_mulai: z.string().min(1, 'Waktu mulai is required'),
    waktu_selesai: z.string().min(1, 'Waktu selesai is required'),
    kuota: z.number().min(1, 'Kuota is required'),
    jenis_ujian: z.number().min(0, 'Jenis ujian is required'),
});

export default function PenjadwalanForm() {
    const { penjadwalan, kategoriSoal, events } = usePage<{ 
        penjadwalan?: Penjadwalan; 
        kategoriSoal: KategoriSoal[];
        events: Event[];
    }>().props;
    
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
            tipe_ujian: penjadwalan?.tipe_ujian ?? 0,  // Default ke 0
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
                    preserveState: false, // Force fresh data load
                    onSuccess: () => {
                        toast.success('Jadwal ujian berhasil diperbarui');
                        router.visit(route('penjadwalan.index'), {
                            preserveState: false
                        });
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
                    preserveState: false, // Force fresh data load
                    onSuccess: () => {
                        toast.success('Jadwal ujian berhasil ditambahkan');
                        router.visit(route('penjadwalan.index'), {
                            preserveState: false
                        });
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
                {/* DEBUG JSON penjadwalan dihapus sesuai permintaan */}
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

                        {/* Paket Ujian (Event) - Static text in edit mode */}
                        <FormField
                            control={form.control}
                            name="id_paket_ujian"
                            render={({ field }) => {
                                // Cari nama event dari array events
                                let namaEvent = '';
                                if (field.value && events) {
                                    const found = events.find(e => e.id_event === field.value);
                                    if (found) {
                                        namaEvent = found.nama_event;
                                    } else if (hasEvent(penjadwalan)) {
                                        // Fallback ke relasi event jika ada
                                        namaEvent = penjadwalan.event.nama_event || '';
                                    }
                                }
                                return (
                                    <FormItem>
                                        <FormLabel>Paket Ujian</FormLabel>
                                        {isEdit ? (
                                            <div className="px-3 py-2 border rounded bg-muted">{namaEvent || '-'}</div>
                                        ) : (
                                            <Select
                                                value={field.value > 0 ? field.value.toString() : ""}
                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih Paket Ujian" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {events.map((event) => (
                                                        <SelectItem 
                                                            key={event.id_event} 
                                                            value={event.id_event.toString()}
                                                        >
                                                            {event.nama_event}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />

                        {/* Tipe Ujian (KategoriSoal) - Static text in edit mode */}
                        <FormField
                            control={form.control}
                            name="tipe_ujian"
                            render={({ field }) => {
                                // Cari nama kategori dari array kategoriSoal
                                let namaKategori = '';
                                if (field.value && kategoriSoal) {
                                    const found = kategoriSoal.find(k => k.id === field.value);
                                    if (found) {
                                        namaKategori = found.kategori;
                                    } else if (hasKategoriSoal(penjadwalan)) {
                                        // Fallback ke relasi kategori_soal jika ada
                                        namaKategori = penjadwalan.kategori_soal.kategori || '';
                                    }
                                }
                                return (
                                    <FormItem>
                                        <FormLabel>Tipe Ujian</FormLabel>
                                        {isEdit ? (
                                            <div className="px-3 py-2 border rounded bg-muted">{namaKategori || '-'}</div>
                                        ) : (
                                            <Select
                                                value={field.value > 0 ? field.value.toString() : ""}
                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih Tipe Ujian" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {kategoriSoal.map((kategori) => (
                                                        <SelectItem 
                                                            key={kategori.id} 
                                                            value={kategori.id.toString()}
                                                        >
                                                            {kategori.kategori}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
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
                            render={({ field }) => {
                                // Ambil jumlah peserta terdaftar jika edit
                                const jumlahTerdaftar = penjadwalan && (penjadwalan as any).jumlahTerdaftar ? (penjadwalan as any).jumlahTerdaftar : 0;
                                const handleKuotaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const value = parseInt(e.target.value);
                                    if (isEdit && jumlahTerdaftar > 0 && value < jumlahTerdaftar) {
                                        toast.error(`Kuota tidak boleh kurang dari jumlah peserta terdaftar (${jumlahTerdaftar}).`);
                                    }
                                    field.onChange(value);
                                };
                                return (
                                    <FormItem>
                                        <FormLabel>Kuota</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                placeholder="Masukkan kuota peserta" 
                                                {...field} 
                                                onChange={handleKuotaChange}
                                            />
                                        </FormControl>
                                        {isEdit && jumlahTerdaftar > 0 && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Minimal kuota: {jumlahTerdaftar} (jumlah peserta terdaftar)
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
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
