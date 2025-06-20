import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CButton } from '@/components/ui/c-button';

const formSchema = z.object({
  nama: z.string().min(2, { message: 'Nama ujian minimal 2 karakter.' }),
  event: z.string().min(1, { message: 'Wajib pilih event.' }),
  bidang: z.string().min(1, { message: 'Wajib pilih bidang.' }),
});

export default function CreatePaketSoal() {
  // Ambil data dari props inertia
  const { events = [], bidangs = [], edit = false, paket } = usePage().props as unknown as {
    events: { id_event: number; nama_event: string }[];
    bidangs: { kode: number; nama: string }[];
    edit?: boolean;
    paket?: {
      id_ujian: number;
      nama_ujian: string;
      id_event: number;
      kode_part: number;
    };
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: paket?.nama_ujian ?? '',
      event: paket?.id_event?.toString() ?? '',
      bidang: paket?.kode_part?.toString() ?? '',
    },
  });

  const breadcrumbs = [
    { title: 'Paket Soal', href: '/master-data/paket-soal' },
    { title: edit ? 'Edit' : 'Create', href: '#' },
  ];

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (edit && paket) {
      // Update
      router.put(`/master-data/paket-soal/${paket.id_ujian}`, {
        nama_ujian: values.nama,
        id_event: values.event,
        kode_part: values.bidang,
      }, {
        onSuccess: () => toast.success('Paket soal berhasil diupdate!'),
        onError: () => toast.error('Gagal update paket soal.'),
      });
    } else {
      // Create
      router.post('/master-data/paket-soal', {
        nama_ujian: values.nama,
        id_event: values.event,
        kode_part: values.bidang,
      }, {
        onSuccess: () => toast.success('Paket soal berhasil disimpan!'),
        onError: () => toast.error('Gagal menyimpan paket soal.'),
      });
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={edit ? "Edit Paket Soal" : "Buat Paket Soal"} />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{edit ? "Edit Paket Soal" : "Buat Paket Soal"}</h1>
          <CButton type="primary" onClick={() => router.visit('/master-data/paket-soal')}>
            Kembali
          </CButton>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Ujian</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: TOEFL Listening Paket 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full rounded-md border border-gray-300 p-2">
                      <option value="">Pilih Event</option>
                      {events.map(ev => (
                        <option key={ev.id_event} value={ev.id_event}>
                          {ev.nama_event}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bidang"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bidang</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full rounded-md border border-gray-300 p-2">
                      <option value="">Pilih Bidang</option>
                      {bidangs.map(bd => (
                        <option key={bd.kode} value={bd.kode}>
                          {bd.nama}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CButton type="submit">{edit ? "Update" : "Simpan"}</CButton>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
