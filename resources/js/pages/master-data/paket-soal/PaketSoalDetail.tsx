import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CButton } from '@/components/ui/c-button';

const schema = z.object({
  nama_ujian: z.string(),
  event: z.string(),
  bidang: z.string()
});

export default function PaketSoalDetail() {
  const { paketSoal } = usePage().props as unknown as {
    paketSoal: {
      id_ujian: number | string;
      nama_ujian: string;
      event: string | number;
      bidang: string | number;
      total_soal?: number | string;
    };
    events: Array<{ id_event: string; nama_event: string }>;
    bidangs: Array<{ kode: string; nama: string }>;
  };

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      nama_ujian: paketSoal.nama_ujian ?? '',
      event: paketSoal.event?.toString() ?? '',
      bidang: paketSoal.bidang?.toString() ?? ''
    }
  });

  const breadcrumbs = [
    { title: 'Paket Soal', href: '/master-data/paket-soal' },
    { title: 'Detail', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Detail Paket Soal" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Detail Paket Soal</h1>
          <CButton type="primary" onClick={() => router.visit('/master-data/paket-soal')}>
            Kembali
          </CButton>
        </div>
        <Form {...form}>
          <form className="space-y-6 max-w-xl">

            {/* Event */}
            <FormItem className="min-w-0 w-full">
              <FormLabel>Event</FormLabel>
              <FormControl>
                <Input
                  value={paketSoal.event}
                  readOnly
                  className="w-full"
                  style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                  title={paketSoal.event?.toString()}
                />
              </FormControl>
            </FormItem>

            {/* Bidang */}
            <FormItem>
              <FormLabel>Nama Ujian</FormLabel>
              <FormControl>
                <Input value={paketSoal.bidang} readOnly className="w-full" />
              </FormControl>
            </FormItem>

            {/* Total Soal */}
            <FormItem>
              <FormLabel>Total Soal</FormLabel>
              <FormControl>
                <Input value={paketSoal.total_soal ?? '-'} readOnly className="w-full" />
              </FormControl>
            </FormItem>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
