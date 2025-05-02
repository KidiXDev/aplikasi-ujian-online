// Import yang diperlukan
import AppLayout from '@/layouts/app-layout';
import { PageProps, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Interface untuk data mata kuliah
interface Matakuliah {
  id_mk?: number;
  kode_mk: string;
  nama_mk: string;
  sks: number;
  semester: number;
  prodi: string;
  id_dosen?: number | null;
  prasyarat?: string | null;
}

// Interface untuk data dosen
interface Dosen {
  id: number;
  name: string;
}

// Objek default untuk matakuliah baru
const defaultMatakuliah: Matakuliah = {
  kode_mk: '',
  nama_mk: '',
  sks: 1,
  semester: 1,
  prodi: '',
  id_dosen: null,
  prasyarat: ''
};

// Schema validasi Zod untuk form matakuliah
const formSchema = z.object({
  kode_mk: z.string().min(1, { message: 'Kode mata kuliah wajib diisi' }).max(10, { message: 'Kode mata kuliah maksimal 10 karakter' }),
  nama_mk: z.string().min(2, { message: 'Nama mata kuliah wajib diisi minimal 2 karakter' }),
  sks: z.number().min(1, { message: 'SKS minimal 1' }),
  semester: z.number().min(1, { message: 'Semester minimal 1' }).max(8, { message: 'Semester maksimal 8' }),
  prodi: z.string().min(1, { message: 'Program studi wajib diisi' }),
  id_dosen: z.number().nullable(),
  prasyarat: z.string().nullable(),
});

export default function MatakuliahForm() {
  // Ambil data dari props dengan tipe data yang benar untuk dosen_list
  const { isEdit, matakuliah: serverMatakuliah, errors, flash, dosen_list = [] } = usePage<PageProps<{
    isEdit: boolean;
    matakuliah?: Partial<Matakuliah>;
    dosen_list: Dosen[];
  }>>().props;
  
  // Gabungkan data dari server dengan default untuk TypeScript safety
  const matakuliah = {
    ...defaultMatakuliah,
    ...(serverMatakuliah || {}),
  } as Matakuliah;

  // Setup breadcrumb untuk navigasi
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Manajemen Mata Kuliah',
      href: route('master-data.matakuliah.index'),
    },
    {
      title: isEdit ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah',
      href: isEdit ? route('master-data.matakuliah.edit', matakuliah.id_mk!) : route('master-data.matakuliah.create'),
    },
  ];

  // Inisialisasi form dengan react-hook-form dan zod resolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kode_mk: String(matakuliah.kode_mk || ''),
      nama_mk: matakuliah.nama_mk,
      sks: matakuliah.sks,
      semester: matakuliah.semester,
      prodi: matakuliah.prodi,
      id_dosen: matakuliah.id_dosen,
      prasyarat: matakuliah.prasyarat || '',
    },
  });

  // Tampilkan pesan flash
  useEffect(() => {
    if (flash.success) toast.success(flash.success);
    if (flash.error) toast.error(flash.error);
    
    // Tampilkan error dari Laravel validasi jika ada
    if (errors) {
      Object.entries(errors).forEach(([key, value]) => {
        form.setError(key as keyof typeof form.formState.errors, {
          type: 'manual',
          message: value as string,
        });
      });
    }
  }, [flash, errors, form]);

  // Handler submit form
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Memastikan kode_mk adalah string
    const formData = {
      ...values,
      kode_mk: String(values.kode_mk),
    };
    
    if (isEdit && matakuliah.id_mk) {
      // Update data
      router.put(route('master-data.matakuliah.update', matakuliah.id_mk), formData, {
        onError: (errors) => {
          console.error('Error:', errors);
        },
        preserveScroll: true,
      });
    } else {
      // Simpan data baru
      router.post(route('master-data.matakuliah.store'), formData, {
        onError: (errors) => {
          console.error('Error:', errors);
        },
        preserveScroll: true,
      });
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'} />

      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="kode_mk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Mata Kuliah</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Masukkan kode mata kuliah"
                          {...field}
                          value={String(field.value || '')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="nama_mk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Mata Kuliah</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Masukkan nama mata kuliah"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKS</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          placeholder="Masukkan jumlah SKS"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          max={8}
                          placeholder="Masukkan semester"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="prodi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program Studi</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Masukkan program studi"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="id_dosen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosen Pengampu</FormLabel>
                      <Select 
                        value={field.value?.toString() || undefined}
                        onValueChange={(value) => field.onChange(value === 'null' ? null : parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih dosen pengampu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Dosen</SelectLabel>
                            <SelectItem value="null">-- Tidak Ada --</SelectItem>
                            {Array.isArray(dosen_list) && dosen_list.map((dosen) => (
                              <SelectItem key={dosen.id} value={dosen.id.toString()}>
                                {dosen.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="prasyarat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prasyarat</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Masukkan prasyarat mata kuliah (opsional)"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-4">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {isEdit ? 'Update' : 'Simpan'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.visit(route('master-data.matakuliah.index'))}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}