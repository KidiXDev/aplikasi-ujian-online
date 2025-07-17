import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';

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
  const [searchBidang, setSearchBidang] = useState('');
  
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

  // Filter bidang berdasarkan pencarian
  const filteredBidangs = useMemo(() => {
    if (!searchBidang) return bidangs;
    return bidangs.filter(bidang => 
      bidang.nama.toLowerCase().includes(searchBidang.toLowerCase())
    );
  }, [bidangs, searchBidang]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      event: selectedEventId?.toString() || paket?.id_event?.toString() || '',
      bidang: paket?.kode_part?.toString() || '',
    },
  });

  const breadcrumbs = [
    { title: 'Paket Soal', href: '/master-data/paket' },
    { title: 'Part', href: `/master-data/part/${selectedEventId}` },
    { title: edit ? 'Edit' : 'Create', href: '#' },
  ];

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload = {
      id_event: values.event,
      kode_part: values.bidang,
    };

    if (edit && paket) {
      router.put(`/master-data/part/${paket.id_ujian}`, payload, {
        onSuccess: () => toast.success('Paket soal berhasil diupdate!'),
        onError: () => toast.error('Gagal update paket soal.'),
      });
    } else {
      // Jika ada selectedEventId, gunakan route store_id
      if (selectedEventId) {
        router.post(`/master-data/part/${selectedEventId}`, payload, {
          onSuccess: () => {
            toast.success('Paket soal berhasil disimpan!');
            form.reset();
            setSearchBidang(''); // Reset search bidang
          },
          onError: () => toast.error('Gagal menyimpan paket soal.'),
        });
      } else {
        // Jika tidak ada selectedEventId, gunakan route store biasa
        router.post('/master-data/part', payload, {
          onSuccess: () => {
            toast.success('Paket soal berhasil disimpan!');
            form.reset();
            setSearchBidang(''); // Reset search bidang
          },
          onError: () => toast.error('Gagal menyimpan paket soal.'),
        });
      }
    }
  };

  const handleBack = () => {
    if (selectedEventId) {
      // Jika ada selectedEventId, kembali ke paket soal berdasarkan event
      router.visit(route('master-data.part.show-by-event', selectedEventId));
    } else {
      // Jika tidak ada selectedEventId, kembali ke index paket soal
      router.visit(route('master-data.part.index'));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={edit ? "Edit Paket Soal" : "Tambah Part"} />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {edit ? "Edit Paket Soal" : "Tambah Part dari Paket Soal"} {selectedEvent?.nama_event}
          </h1>
          <CButton type="primary" onClick={handleBack} className="px-8 py-2">
            Kembali
          </CButton>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Search Bidang */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari Bidang
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchBidang}
                    onChange={(e) => setSearchBidang(e.target.value)}
                    placeholder="Ketik nama bidang untuk mencari..."
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    autoFocus
                  />
                  {searchBidang && (
                    <button
                      type="button"
                      onClick={() => setSearchBidang('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
                
                {/* Search Results Info */}
                {searchBidang && (
                  <div className="mt-2 text-sm text-gray-500">
                    Ditemukan <span className="font-medium text-blue-600">{filteredBidangs.length}</span> dari {bidangs.length} bidang
                  </div>
                )}
              </div>

              {/* Bidang Selection */}
              <FormField
                control={form.control}
                name="bidang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Pilih Paket Soal
                    </FormLabel>
                    <FormControl>
                      <select 
                        {...field} 
                        className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        size={Math.min(filteredBidangs.length + 1, 12)}
                        style={{ height: 'auto' }}
                      >
                        <option value="" disabled className="text-gray-500">
                          {filteredBidangs.length === 0 ? 'Tidak ada bidang tersedia' : 'Pilih Bidang'}
                        </option>
                        {filteredBidangs.map((bd, index) => (
                          <option key={bd.kode} value={bd.kode} className="py-1">
                            {index + 1}. {bd.nama}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                    
                    {/* Info jika tidak ada hasil pencarian */}
                    {searchBidang && filteredBidangs.length === 0 && (
                      <div className="mt-2 text-sm text-amber-600">
                        Tidak ada bidang yang cocok dengan pencarian "<strong>{searchBidang}</strong>"
                      </div>
                    )}
                    
                    {/* Helper text */}
                    <div className="mt-2 text-sm text-gray-500">
                      Gunakan kolom pencarian di atas untuk mempermudah mencari bidang
                    </div>
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <CButton 
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
                >
                  {edit ? "Update" : "Simpan"}
                </CButton>
              </div>
            </form>
          </Form>
        </div>
      </AppLayout>
    );
  }
