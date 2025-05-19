import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { paket, options } = usePage<{
    paket?: {
      id: number;
      kode_bidang: string;
      jenis_ujian: string;
      nama_paket_ujian: string;
      kategori_ujian: string;
      match_soal: Array<{ id: number; question: string; answer: string }>;
    } | null;
    options: Array<{
      kode: string;
      nama: string;
      type: string;
    }>;
  }>().props;

  const isEdit = !!paket;

  const formSchema = z.object({
    nama_paket_ujian: z.string().min(2, {
      message: 'Inputkan nama paket ujian',
    }),
    jenis_ujian: z.string().min(1, {
      message: 'Pilih jenis ujian',
    }),
    kategori_ujian: isEdit
      ? z.string().optional()
      : z.string().min(1, {
          message: 'Pilih kategori ujian',
        }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jenis_ujian: paket?.jenis_ujian ?? '',
      nama_paket_ujian: paket?.nama_paket_ujian ?? '',
      kategori_ujian: paket?.kategori_ujian ?? '',
    },
  });

  const [kategoriOptions, setKategoriOptions] = useState<Array<{ kode: string; value: string }>>([]);
  const [jenisOptions, setJenisOptions] = useState<Array<{ kode: string; value: string }>>([]);

  const kategori = form.watch('kategori_ujian');
  const jenis = form.watch('jenis_ujian');

  useEffect(() => {
    const kategoriSet = new Set<string>();
    const jenisSet = new Set<string>();

    const filteredJenis: Array<{ kode: string; value: string }> = [];
    const filteredKategori: Array<{ kode: string; value: string }> = [];

    for (const opt of options) {
      if (kategori && opt.type === kategori && !jenisSet.has(opt.nama)) {
        filteredJenis.push({ kode: opt.kode, value: opt.nama });
        jenisSet.add(opt.nama);
      }

      if (jenis && opt.nama === jenis && !kategoriSet.has(opt.type)) {
        filteredKategori.push({ kode: opt.kode, value: opt.type });
        kategoriSet.add(opt.type);
      }
    }

    if (!kategori) {
      for (const opt of options) {
        if (!kategoriSet.has(opt.type)) {
          filteredKategori.push({ kode: opt.kode, value: opt.type });
          kategoriSet.add(opt.type);
        }
      }
    }

    if (!jenis) {
      for (const opt of options) {
        if (!jenisSet.has(opt.nama)) {
          filteredJenis.push({ kode: opt.kode, value: opt.nama });
          jenisSet.add(opt.nama);
        }
      }
    }

    setJenisOptions(filteredJenis);
    setKategoriOptions(filteredKategori);
  }, [kategori, jenis, options]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const matched = options.find(
      (item) =>
        item.type === values.kategori_ujian &&
        item.nama === values.jenis_ujian
    );

    if (!matched) {
      toast.error('Kombinasi kategori dan jenis ujian tidak ditemukan.');
      return;
    }

    const payload = {
      ...values,
      kode_bidang: matched.kode,
    };

    if (isEdit) {
      router.put(route('master-data.paket-soal.update', paket.id), payload, {
        preserveScroll: true,
        onSuccess: () => toast.success('Paket ujian berhasil diperbarui!'),
        onError: (errors) => console.error('Error:', errors),
      });
    } else {
      router.post(route('master-data.paket-soal.store_data'), payload, {
        preserveScroll: true,
        onSuccess: () => toast.success('Paket ujian berhasil ditambahkan!'),
        onError: (errors) => console.error('Error:', errors),
      });
    }
  }

  const handleSaveAndNavigate = async () => {
    const values = form.getValues();

    const matched = options.find(
      (item) =>
        item.type === values.kategori_ujian &&
        item.nama === values.jenis_ujian
    );

    if (!matched) {
      toast.error('Kombinasi kategori dan jenis ujian tidak ditemukan.');
      return;
    }

    const payload = {
      ...values,
      kode_bidang: matched.kode,
    };

    if (isEdit) {
      router.visit(route('master-data.bank-soal-checkbox.edit', paket.id));
    } else {
      router.post(route('master-data.paket-soal.store_data'), payload, {
        preserveScroll: true,
        onSuccess: (page) => {
          const paketId = (page as { props: { paket?: { id: number } } }).props?.paket?.id;

          if (paketId) {
            router.visit(route('master-data.bank-soal-checkbox.edit', paketId));
          } else {
            toast.error('Gagal mendapatkan ID paket soal.');
          }
        },
        onError: (errors) => {
          console.error('Error:', errors);
          toast.error('Gagal menyimpan paket soal.');
        },
      });
    }
  };

  return (
    <AppLayout>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {isEdit ? 'Edit' : 'Create'} Paket Ujian
          </h1>
          <CButton
            type="primary"
            className="md:w-24"
            onClick={() => router.visit(route('master-data.paket-soal.manager'))}
          >
            Back
          </CButton>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            <FormField
              control={form.control}
              name="kategori_ujian"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori Ujian</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih kategori ujian" />
                      </SelectTrigger>
                      <SelectContent>
                        {kategoriOptions.map((kategori) => (
                          <SelectItem key={kategori.kode} value={kategori.value}>
                            {kategori.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih jenis ujian" />
                      </SelectTrigger>
                      <SelectContent>
                        {jenisOptions.map((jenis) => (
                          <SelectItem key={jenis.kode} value={jenis.value}>
                            {jenis.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nama_paket_ujian"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Paket Ujian</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama paket ujian" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CButton
              type="primary"
              onClick={handleSaveAndNavigate}
              className="bg-blue-500 text-white"
            >
              Pilih Soal
            </CButton>
            <CButton type="submit">Save</CButton>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
