import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { CButton } from '@/components/ui/c-button';

const formSchema = z.object({
  event: z.string().min(1, { message: 'Wajib pilih event.' }),
  bidang: z.string().min(1, { message: 'Wajib pilih bidang.' }),
});

export default function CreatePaketSoal() {
  const { 
    bidangs = [], 
    edit = false, 
    paket,
    selectedEventId,
    selectedEvent 
  } = usePage().props as unknown as {
    events: { id_event: number; nama_event: string }[];
    bidangs: { kode: number; nama: string }[];
    edit?: boolean;
    paket?: {
      id_ujian: number;
      id_event: number;
      kode_part: number;
    };
    selectedEventId?: number;
    selectedEvent?: { id_event: number; nama_event: string };
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      event: selectedEventId?.toString() || paket?.id_event?.toString() || '',
      bidang: paket?.kode_part?.toString() || '',
    },
  });

  const breadcrumbs = [
    { title: 'Event', href: '/master-data/event' },
    { title: 'Paket Soal', href: '/master-data/paket-soal' },
    { title: edit ? 'Edit' : 'Create', href: '#' },
  ];

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload = {
      id_event: values.event,
      kode_part: values.bidang,
    };

    if (edit && paket) {
      router.put(`/master-data/paket-soal/${paket.id_ujian}`, payload, {
        onSuccess: () => toast.success('Paket soal berhasil diupdate!'),
        onError: () => toast.error('Gagal update paket soal.'),
      });
    } else {
      // Jika ada selectedEventId, gunakan route store_id
      if (selectedEventId) {
        router.post(`/master-data/paket-soal/${selectedEventId}`, payload, {
          onSuccess: () => {
            toast.success('Paket soal berhasil disimpan!');
            form.reset();
          },
          onError: () => toast.error('Gagal menyimpan paket soal.'),
        });
      } else {
        // Jika tidak ada selectedEventId, gunakan route store biasa
        router.post('/master-data/paket-soal', payload, {
          onSuccess: () => {
            toast.success('Paket soal berhasil disimpan!');
            form.reset();
          },
          onError: () => toast.error('Gagal menyimpan paket soal.'),
        });
      }
    }
  };

  const handleBack = () => {
    if (selectedEventId) {
      // Jika ada selectedEventId, kembali ke paket soal berdasarkan event
      router.visit(route('master-data.paket-soal.show-by-event', selectedEventId));
    } else {
      // Jika tidak ada selectedEventId, kembali ke index paket soal
      router.visit(route('master-data.paket-soal.index'));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={edit ? "Edit Part" : "Buat Part"} />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{edit ? "Edit Part" : "Buat Part"}</h1>
          <CButton type="primary" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </CButton>
        </div>

        {/* Info Event yang dipilih */}
        {selectedEventId && selectedEvent && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Event Dipilih:</h3>
            <p className="text-blue-700">
              <strong>{selectedEvent.nama_event}</strong>
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
            {/* Bidang */}
            <FormField
              control={form.control}
              name="bidang"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Part</FormLabel>
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

            <div className="flex gap-3">
              <CButton type="button" onClick={handleBack}>
                Batal
              </CButton>
              <CButton type="submit">
                {edit ? "Update" : "Simpan"}
              </CButton>
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
